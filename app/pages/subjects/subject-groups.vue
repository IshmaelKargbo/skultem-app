<script setup lang="ts">
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const { can } = useAuth();
const store = useSubjectGroupStore();
const clazzStore = useClassStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const editRcord = ref<SubjectGroup | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
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
        meta: {
            class: {
                td: "text-right",
            },
        },
        cell: ({ row }) => {
            return h(
                UDropdownMenu,
                {
                    content: {
                        align: "end",
                    },
                    size: "sm",
                    items: getRowItems(row),
                    "aria-label": "Actions dropdown",
                },
                () =>
                    h(UButton, {
                        icon: "i-lucide-ellipsis-vertical",
                        color: "neutral",
                        size: "sm",
                        variant: "ghost",
                        "aria-label": "Actions dropdown",
                    })
            );
        },
    },
];

function getRowItems(row: Row<SubjectGroup>) {
    return [
        {
            label: "Edit Record",
            icon: "i-lucide-edit",
            onClick: () => {
                editState.value = true;
                editRcord.value = row.original;
            },
        },
        {
            label: "Delete Record",
            icon: "i-lucide-trash",
        },
    ];
}

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
    get: () => Number(route.query.size ?? runtimeConf().limit),
    set: (val) => updateQuery({ size: val }),
});

const filterState = ref(false);

function toggleFilter() {
    filterState.value = !filterState.value;
}

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const classId = ref(String(route.query.classId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
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

const hasActiveFilters = computed(() => !!classId.value || !!search.value || sort.value !== DEFAULT_SORT);

function resetFilters() {
    classId.value = "";
    searchInput.value = "";
    search.value = "";
    sort.value = DEFAULT_SORT;
}

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

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
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
    loading.value = true;
    await store.fetchAll(page.value, size.value, classId.value || undefined, search.value || undefined,
        sortBy.value, sortDirection.value);
    loading.value = false;
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<template>
    <div class="space-y-4 px-4 md:px-6">
        <SubjectSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex px-4 py-3 items-center justify-between gap-3">
                        <div class="space-x-2 flex flex-1 items-center">
                            <SubjectGroupAdd v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
                        </div>

                        <div>
                            <TableViewToggle v-model="view" />
                            <UButton @click="toggleFilter" :icon="!filterState ? FILTER_ICON : CLOSE_ICON"
                                variant="outline" :color="!filterState ? 'info' : 'error'" class="md:hidden" />
                        </div>
                    </div>

                    <div class="border-t hidden p-4 border-default md:flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-4">
                            <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                                placeholder="All Classes" clear />
                            <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                                placeholder="Sort by" />
                            <div class="flex space-x-1 sm:col-span-2">
                                <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name..."
                                    class="flex-1" />
                                <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
                                    :disabled="!hasActiveFilters" @click="resetFilters" />
                            </div>
                        </div>
                        <div class="hidden md:block">
                            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                                :disabled="!hasActiveFilters" @click="resetFilters" />
                        </div>
                    </div>
                    <div v-if="filterState"
                        class="border-t md:hidden p-4 border-default flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-4">
                            <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                                placeholder="All Classes" clear />
                            <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                                placeholder="Sort by" />
                            <div class="flex space-x-1 sm:col-span-2">
                                <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name..."
                                    class="flex-1" />
                                <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
                                    :disabled="!hasActiveFilters" @click="resetFilters" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <UTable v-if="view === 'table'" class="md:block hidden" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No sections found.</p>
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
                                <UButton v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" :icon="EDIT_ICON"
                                    color="warning" variant="ghost" size="sm" aria-label="Edit subject group"
                                    @click="editState = true; editRcord = item" />
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
    </div>
</template>