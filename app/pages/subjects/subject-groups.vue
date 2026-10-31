<script setup lang="ts">
import type { FilterField } from "~/components/filter/Drawer.vue";
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const { can } = useAuth();
const store = useSubjectGroupStore();
const clazzStore = useClassStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const { success, error: toastError } = useNotify();

// Same roles the backend allows to edit/delete a subject group.
const canManage = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]));

const editRecord = ref<SubjectGroup | null>(null);
const editOpen = ref(false);
const deleteTarget = ref<SubjectGroup | null>(null);
const deleteOpen = ref(false);

function rowActions(group: SubjectGroup) {
    return [
        [{ label: "Edit", icon: EDIT_ICON, onSelect: () => { editRecord.value = group; editOpen.value = true; } }],
        [{ label: "Delete", icon: "i-lucide-trash-2", color: "error" as const, onSelect: () => { deleteTarget.value = group; deleteOpen.value = true; } }],
    ];
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await store.remove(deleteTarget.value.id);
        success(`${deleteTarget.value.name} deleted`);
        // Deleting the last group on a page leaves it empty, so step back a page.
        if (data.value.length === 1 && page.value > 1) page.value = page.value - 1;
        else await fetchRecord();
    } catch (err: any) {
        toastError(err?.message || "Subject group could not be deleted");
        throw err;
    }
}

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const columns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "className",
        header: "Class",
    },
    {
        accessorKey: "streamName",
        header: "Stream",
    },
    {
        accessorKey: "totalSelection",
        header: "Select",
    },
    {
        id: "actions",
        meta: { class: { td: "text-right" } },
        cell: ({ row }: { row: Row<SubjectGroup> }) => {
            if (!canManage.value) return null;
            return h(UDropdownMenu, { items: rowActions(row.original), content: { align: "end" } }, {
                default: () => h(UButton, {
                    icon: "i-lucide-ellipsis-vertical",
                    color: "neutral",
                    size: "sm",
                    variant: "ghost",
                    "aria-label": "Subject group actions",
                }),
            });
        },
    },
];

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
    get: () => Number(route.query.size ?? runtimeConf().limit),
    set: (val) => updateQuery({ size: val }),
});

const classId = ref(String(route.query.classId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

const sortOptions = [
    { label: "Name (A-Z)", value: "name:asc" },
    { label: "Name (Z-A)", value: "name:desc" },
    { label: "Newest First", value: "createdAt:desc" },
    { label: "Oldest First", value: "createdAt:asc" },
];
const DEFAULT_SORT = "name:asc";
const sort = ref(String(route.query.sort ?? DEFAULT_SORT));
const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);


// Class and sort live in the shared filter drawer (same as the class list).
const filters = computed<Record<string, string>>({
    get: () => ({ classId: classId.value, sort: sort.value }),
    set: (v) => {
        classId.value = v.classId ?? "";
        sort.value = v.sort || DEFAULT_SORT;
    },
});
const filterFields = computed<FilterField[]>(() => [
    { key: "classId", label: "Class", type: "select", options: classOptions.value, placeholder: "All Classes" },
    { key: "sort", label: "Sort by", type: "select", options: sortOptions, default: DEFAULT_SORT, required: true },
]);

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        search.value = val;
    }, 350);
});

watch(
    () => page.value,
    () => {
        nextTick(() => {
            scrollContainer?.value?.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });

        fetchRecord();
    },
    { immediate: true }
);

watch([classId, search, sort], () => {
    updateQuery({
        classId: classId.value || undefined,
        search: search.value || undefined,
        sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
        page: 1,
    })

    if (page.value === 1) fetchRecord();
});

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } });
}

async function fetchRecord() {
    await store.fetchAll(page.value, size.value, classId.value || undefined, search.value || undefined,
        sortBy.value, sortDirection.value);
}

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    clazzStore.fetchAll(0, 0);
    useAppStore().setTitle('Subject Groups');
    document.title = 'Subject Groups | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="space-y-3 px-4 md:px-6">
        <SubjectSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex px-4 py-3 items-center justify-between gap-2">
                    <div class="flex flex-1 items-center gap-2">
                        <SubjectGroupAdd v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" @saved="fetchRecord" />
                        <div class="flex flex-1 items-center gap-2">
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name..." class="flex-1" />
                            <FilterDrawer v-model="filters" :fields="filterFields" title="Filter subject groups" description="Narrow the list by class or change the sort" />
                        </div>
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" class="md:block hidden" :columns="columns" :data="data" :loading="loading">
                <template #empty>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No subject groups found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #totalSelection-cell="{ row }">
                    <UBadge :label="row.original.totalSelection" variant="outline" icon="mdi:select-multiple"
                        color="neutral" />
                </template>
            </UTable>

            <div class="md:p-4 md:space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-center gap-3">
                            <USkeleton class="size-10 shrink-0 rounded-full" />

                            <div class="min-w-0 flex-1 space-y-2">
                                <USkeleton class="h-4 w-36 rounded-md" />
                                <USkeleton class="h-3 w-28 rounded-md" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Data -->
                <template v-else-if="data?.length">
                    <div v-for="item in data" :key="item.id"
                        class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <UAvatar icon="i-lucide-folder-tree" />

                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-bold text-highlighted">
                                        {{ item.name }}
                                    </h3>

                                    <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                                        <span class="truncate">{{ item.className || "No class assigned" }}</span>

                                        <template v-if="item.streamName">
                                            <span class="shrink-0">•</span>
                                            <span class="shrink-0">{{ item.streamName }}</span>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <div class="flex shrink-0 items-center gap-2 self-center">
                                <UBadge variant="outline" icon="mdi:select-multiple" color="neutral"
                                    :label="`${item.totalSelection || 0}`" />
                                <UDropdownMenu v-if="canManage" :items="rowActions(item)" :content="{ align: 'end' }">
                                    <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                                        aria-label="Subject group actions" />
                                </UDropdownMenu>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-folder-tree" class="mb-3 size-10 text-gray-400" />

                        <h3 class="font-semibold">No subject groups</h3>

                        <p class="text-sm text-gray-500">Create your first subject group to organize subjects by
                            stream or class.</p>
                    </div>
                </template>
            </div>

            <template #footer>
                <div v-if="!loading" class="flex justify-between items-center">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>

        <SubjectGroupEdit v-model:open="editOpen" :record="editRecord" @saved="fetchRecord" />

        <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Subject Group"
            :item-name="deleteTarget.name" :on-confirm="confirmDelete"
            description="This removes the subject group. A group that still has class or stream subjects in it can't be deleted - move those subjects out of the group first." />
    </div>
</template>