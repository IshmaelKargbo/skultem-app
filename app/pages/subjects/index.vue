<template>
    <div class="space-y-4 px-4 md:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex px-4 py-3 justify-between items-center gap-3">
                        <div class="flex space-x-3 flex-1">
                            <SubjectAdd />
                        </div>

                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name or code"
                                class="col-span-2" />
                            <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                                placeholder="Sort by" />
                        </div>
                        <div>
                            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                                :disabled="!hasActiveFilters" @click="resetFilters" />
                        </div>
                    </div>
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No stream subject found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>
            <!-- Mobile -->
            <div
                :class="view === 'table' ? 'md:hidden' : 'p-4 grid grid-cols-1 space-y-4 gap-x-4 md:grid-cols-2 lg:grid-cols-3'">
                <UCard v-for="value in data" :key="value.id" :ui="{ body: 'sm:p-0 p-0' }">
                    <!-- Header -->
                    <div class="border-b border-default p-3">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex min-w-0 items-center gap-4">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <UIcon :name="SUBJECT_ICON" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-semibold text-highlighted">
                                        {{ value.name }}
                                    </h3>
                                    <p class="text-xs-base text-muted">{{ value.code }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-3">
                        <div class="rounded-xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
                            <p class="line-clamp-3 text-sm leading-6 text-highlighted">
                                {{ value.description || "No description available for this subject." }}
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>
            <template v-if="data.length == 0">
                <UCard>
                    <div class="flex flex-col items-center justify-center py-16">
                        <UIcon name="i-lucide-book-open" class="mb-4 size-12 text-muted" />

                        <h3 class="font-semibold">No subjects found</h3>

                        <p class="mt-1 text-sm text-muted">No records are available.</p>
                    </div>
                </UCard>
            </template>

            <template #footer>
                <div class="flex items-center justify-between">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>
    </div>
</template>
<script setup lang="ts">
import { nextTick } from "vue";

const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();

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

const hasActiveFilters = computed(() => !!search.value || sort.value !== DEFAULT_SORT);

function resetFilters() {
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

function updateQuery(query: Record<string, any>) {
    router.replace({
        query: {
            ...route.query,
            ...query,
        },
    });
}

async function fetchRecords() {
    try {
        loading.value = true;

        await store.fetchAll(page.value, size.value, search.value || undefined, sortBy.value, sortDirection.value);
    } finally {
        loading.value = false;
    }
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER],
})
</script>
