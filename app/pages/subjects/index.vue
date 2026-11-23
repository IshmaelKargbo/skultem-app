<template>
    <div class="space-y-3 px-4 md:px-6">
        <div data-guide="subj-tabs"><SubjectSectionNav /></div>
        <GuideBar topic="admin-subjects" />
        <UCard data-guide="adm-list" :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex px-4 py-3 items-center justify-between gap-2">
                    <div class="flex flex-1 items-center gap-2">
                        <div data-guide="subj-add"><SubjectAdd v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" @saved="fetchRecords" /></div>
                        <div class="flex flex-1 items-center gap-2">
                            <UInput data-guide="adm-search" v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name or code" class="flex-1" />
                            <FilterDrawer v-model="filters" :fields="filterFields" title="Filter subjects" description="Change how subjects are sorted" />
                        </div>
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading"
                :ui="{ tr: canEdit ? 'cursor-pointer' : '' }" @select="(_e: Event, row: any) => openSubject(row.original)">
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
                    <div v-for="value in data" :key="value.id" @click="openSubject(value)"
                        class="border-b md:border md:rounded-2xl border-default p-3" :class="{ 'cursor-pointer': canEdit }">
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

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="subjects" :error="listError" @retry="loadMore" />
            </div>
        </UCard>

        <SubjectEdit v-model:open="editState" :record="editRcord" can-delete @saved="fetchRecords"
            @delete="(subject) => { deleteTarget = subject; deleteOpen = true; }" />

        <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Subject"
            :item-name="deleteTarget.name" :on-confirm="confirmDelete"
            description="This removes the subject from your catalog. A subject still used by a class, stream, teacher or student can't be deleted." />
    </div>
</template>
<script setup lang="ts">
import type { FilterField } from "~/components/filter/Drawer.vue";

const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();
const { can } = useAuth();

const editRcord = ref<Subject | null>(null);
const editState = ref(false);

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
];

const store = useSubjectStore();

const deleteTarget = ref<Subject | null>(null);
const deleteOpen = ref(false);

// A row opens the subject's edit form (for those who can change subjects); Delete is in that form.
function openSubject(subject: Subject) {
    if (!canEdit.value) return;
    editRcord.value = subject;
    editState.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await store.remove(deleteTarget.value.id);
        success(`${deleteTarget.value.name} deleted`);
        // Taken out of the list in place, so the list doesn't jump back to the top.
        const id = deleteTarget.value.id;
        data.value = data.value.filter(s => s.id !== id);
        if (meta.value) meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 1) - 1) };
    } catch (err: any) {
        toastError(err?.message || "Subject could not be deleted");
        throw err;
    }
}
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

// One scrolling list: the next subjects load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } = useInfiniteList<Subject>(
    (page, size) => SubjectApi().getAll(page, size, search.value || undefined, sortBy.value, sortDirection.value) as any
);

// After adding or editing a subject: load the list again from the top.
const fetchRecords = () => reload();

// A new search or sort mirrors itself into the URL (for a shareable link/refresh) and starts the list again.
watch([search, sort], () => {
    updateQuery({
        search: search.value || undefined,
        sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    });
    reload();
});

onMounted(() => {
    // Old links may still carry ?page= / ?size=; the list starts at the top now.
    if (route.query.page || route.query.size) {
        const { page: _page, size: _size, ...rest } = route.query;
        router.replace({ query: rest });
    }
    reload();

    useAppStore().setTitle("Subjects");
    document.title = "Subjects | Skultem";
});

onBeforeUnmount(() => clearTimeout(searchTimer));

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN],
})
</script>
