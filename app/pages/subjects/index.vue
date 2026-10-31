<template>
    <div class="space-y-3 px-4 md:px-6">
        <SubjectSectionNav />
        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex px-4 py-3 items-center justify-between gap-2">
                    <div class="flex flex-1 items-center gap-2">
                        <SubjectAdd v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" @saved="fetchRecords" />
                        <div class="flex flex-1 items-center gap-2">
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name or code" class="flex-1" />
                            <FilterDrawer v-model="filters" :fields="filterFields" title="Filter subjects" description="Change how subjects are sorted" />
                        </div>
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No subjects found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>
            <!-- Mobile -->
            <div class="md:p-4 md:space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-center gap-3">
                            <USkeleton class="size-10 shrink-0 rounded-full" />

                            <div class="min-w-0 flex-1 space-y-2">
                                <USkeleton class="h-4 w-36 rounded-md" />
                                <USkeleton class="h-3 w-24 rounded-md" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Data -->
                <template v-else-if="data?.length">
                    <div v-for="value in data" :key="value.id" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-bold text-highlighted">
                                        {{ value.name }}
                                    </h3>

                                    <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                                        <span class="shrink-0">{{ value.code }}</span>
                                        <span class="shrink-0">•</span>
                                        <span class="truncate">
                                            {{ value.description || "No description available" }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <UDropdownMenu v-if="canEdit" :items="rowActions(value)" :content="{ align: 'end' }">
                                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                                    class="shrink-0" aria-label="Subject actions" />
                            </UDropdownMenu>
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-book-open" class="mb-3 size-10 text-gray-400" />

                        <h3 class="font-semibold">No subjects found</h3>

                        <p class="text-sm text-gray-500">No records are available.</p>
                    </div>
                </template>
            </div>

            <template #footer>
                <div class="flex items-center justify-between flex-col md:flex-row space-y-2 md:space-y-0">
                    <Showing :meta="meta" />
                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>

        <SubjectEdit v-model:open="editState" :record="editRcord" @saved="fetchRecords" />

        <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Subject"
            :item-name="deleteTarget.name" :on-confirm="confirmDelete"
            description="This removes the subject from your catalog. A subject still used by a class, stream, teacher or student can't be deleted." />
    </div>
</template>
<script setup lang="ts">
import type { FilterField } from "~/components/filter/Drawer.vue";
import { nextTick } from "vue";
import type { Row } from "@tanstack/vue-table";

const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();
const { can } = useAuth();

const editRcord = ref<Subject | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const { success, error: toastError } = useNotify();

const canEdit = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]));

const columns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        id: "actions",
        meta: {
            class: {
                td: "text-right",
            },
        },
        cell: ({ row }: { row: Row<Subject> }) => {
            if (!canEdit.value) return null

            return h(UDropdownMenu, { items: rowActions(row.original), content: { align: "end" } }, {
                default: () => h(UButton, {
                    icon: "i-lucide-ellipsis-vertical",
                    color: "neutral",
                    size: "sm",
                    variant: "ghost",
                    "aria-label": "Subject actions",
                }),
            });
        },
    },
];

const store = useSubjectStore();

// Edit and delete live in one actions menu per subject.
const deleteTarget = ref<Subject | null>(null);
const deleteOpen = ref(false);

function rowActions(subject: Subject) {
    return [
        [{ label: "Edit", icon: EDIT_ICON, onSelect: () => { editRcord.value = subject; editState.value = true; } }],
        [{ label: "Delete", icon: "i-lucide-trash-2", color: "error" as const, onSelect: () => { deleteTarget.value = subject; deleteOpen.value = true; } }],
    ];
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await store.remove(deleteTarget.value.id);
        success(`${deleteTarget.value.name} deleted`);
        // The last subject on a page leaves it empty, so step back a page.
        if (data.value.length === 1 && page.value > 1) page.value = page.value - 1;
        else await fetchRecords();
    } catch (err: any) {
        toastError(err?.message || "Subject could not be deleted");
        throw err;
    }
}
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");
const page = computed<number>({
    get: () => Number(route.query.page ?? 1),

    set: (value) => {
        updateQuery({
            page: value,
        });
    },
});

const size = computed<number>({
    get: () => Number(route.query.size ?? 9),

    set: (value) => {
        updateQuery({
            size: value,
        });
    },
});

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "typing does nothing". These still seed from the URL on load and push back to it (see the
// watch below) so a direct link/refresh keeps the search, but the URL is a mirror, not the
// source of truth.
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
const sortOptions = [
    { label: "Name (A-Z)", value: "name:asc" },
    { label: "Name (Z-A)", value: "name:desc" },
    { label: "Code (A-Z)", value: "code:asc" },
    { label: "Code (Z-A)", value: "code:desc" },
    { label: "Newest First", value: "createdAt:desc" },
    { label: "Oldest First", value: "createdAt:asc" },
];
const DEFAULT_SORT = "name:asc";
const sort = ref(String(route.query.sort ?? DEFAULT_SORT));
const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);


// The sort lives in the shared filter drawer (same as the class list); the page keeps its own refs.
const filters = computed<Record<string, string>>({
    get: () => ({ sort: sort.value }),
    set: (v) => { sort.value = v.sort || DEFAULT_SORT },
});
const filterFields = computed<FilterField[]>(() => [
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

function updateQuery(query: Record<string, any>) {
    router.replace({
        query: {
            ...route.query,
            ...query,
        },
    });
}

async function fetchRecords() {
    await store.fetchAll(page.value, size.value, search.value || undefined, sortBy.value, sortDirection.value);
}

watch(
    [page, size],
    async () => {
        nextTick(() => {
            scrollContainer?.value?.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });

        await fetchRecords();
    },
    {
        immediate: true,
    }
)

// Setting a filter also resets the page to 1 and mirrors it into the URL (for a shareable
// link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([search, sort], () => {
    updateQuery({
        search: search.value || undefined,
        sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
        page: 1,
    });

    if (page.value === 1) fetchRecords();
});

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        updateQuery({
            page: page.value,
        })
    }

    useAppStore().setTitle("Subjects");
    document.title = "Subjects | Skultem";
});

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN],
})
</script>
