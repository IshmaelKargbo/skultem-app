<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const view = ref<"table" | "card">("table")

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

const search = computed<string>({
    get: () => String(route.query.search ?? ''),
    set: (value) => updateQuery({ search: value || undefined, page: 1 }),
})

const sortOptions = [
    { label: "Name (A-Z)", value: "user.givenName:asc" },
    { label: "Name (Z-A)", value: "user.givenName:desc" },
    { label: "Newest First", value: "createdAt:desc" },
    { label: "Oldest First", value: "createdAt:asc" },
]
const DEFAULT_SORT = "createdAt:desc"
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(":")[0])
const sortDirection = computed(() => sort.value.split(":")[1])

const hasActiveFilters = computed(() => !!search.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
    searchInput.value = ''
    sort.value = DEFAULT_SORT
    updateQuery({ search: undefined, sort: undefined, page: 1 })
}

const searchInput = ref(search.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        search.value = val
    }, 350)
})

watch(sort, () => {
    updateQuery({ sort: sort.value === DEFAULT_SORT ? undefined : sort.value, page: 1 })
})

const store = useParentStore();
const { records: data, meta, loading } = storeToRefs(store);

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted",
}

const STATUS_COLORS: Record<string, any> = {
    ACTIVE: "success",
    INACTIVE: "warning",
    DELETED: "error",
}

// Kept to 5 columns, same as the students/teachers tables - a wider set (the old separate Phone/
// Street/City/Status columns) overflowed the card at normal widths and forced UTable's built-in
// horizontal scrollbar. Status still shows on the mobile card below, same as those tables.
const columns = [
    {
        accessorKey: "name",
        header: "Guardian",
    },
    {
        accessorKey: "students",
        header: "Students",
    },
    {
        accessorKey: "phone",
        header: "Contact",
    },
    {
        accessorKey: "city",
        header: "Address",
    },
    {
        id: "actions",
        meta: { class: { td: "text-right" } },
    },
]

const addEmailTarget = ref<Parent | null>(null)

function openAddEmail(parent: Parent) {
    addEmailTarget.value = parent
}

const page = computed<number>({
    get: () => Number(route.query.page || 1),
    set: (value) => {
        updateQuery({
            page: value,
        });
    },
})

const size = ref(runtimeConf().limit);
const filterState = ref(false)

function toggleFilter() {
    filterState.value = !filterState.value
}

async function fetchRecords() {
    try {
        loading.value = true;

        await store.fetchAll(page.value, size.value, search.value || undefined, sortBy.value, sortDirection.value);
    } catch (error) {
        console.error("Failed to fetch parents:", error);
    } finally {
        loading.value = false;
    }
}

watch(
    [page, size],
    async () => {
        await fetchRecords();
    },
    {
        immediate: true,
    }
);

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        updateQuery({
            page: page.value,
        });
    }

    useAppStore().setTitle('All Parents')
    document.title = 'Parents | Skultem'
});

watch(
    [() => search.value, () => sort.value],
    async () => {
        await fetchRecords()
    },
)
</script>
<template>
    <div class="px-4 sm:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex px-4 py-3 items-center justify-between gap-3">
                        <h2 class="text-sm font-semibold text-highlighted">Parents</h2>

                        <div>
                            <TableViewToggle v-model="view" />
                            <UButton @click="toggleFilter" :icon="!filterState ? FILTER_ICON : CLOSE_ICON"
                                variant="outline" :color="!filterState ? 'info' : 'error'" class="md:hidden" />
                        </div>
                    </div>

                    <div class="border-t hidden p-4 border-default md:flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <USelectMenu class="w-full" v-model="sort" value-key="value" label-key="label"
                                :items="sortOptions" placeholder="Sort by" />
                            <div class="flex space-x-1 sm:col-span-2">
                                <UInput v-model="searchInput" :icon="SEARCH_ICON"
                                    placeholder="Search by name, email or phone" class="flex-1" />
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
                        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <USelectMenu class="w-full" v-model="sort" value-key="value" label-key="label"
                                :items="sortOptions" placeholder="Sort by" />
                            <div class="flex space-x-1 sm:col-span-2">
                                <UInput v-model="searchInput" :icon="SEARCH_ICON"
                                    placeholder="Search by name, email or phone" class="flex-1" />
                                <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
                                    :disabled="!hasActiveFilters" @click="resetFilters" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                        <p class="text-sm text-gray-500">No parents found</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <UAvatar icon="i-lucide-user" />

                        <div>
                            <p>{{ row.original.name }}</p>
                            <p v-if="row.original.email" class="text-xs text-muted">{{ row.original.email }}</p>
                            <UBadge v-else size="xs" variant="subtle" color="warning" label="No Email" />
                        </div>
                    </div>
                </template>
                <template #students-cell="{ row }">
                    <UBadge :label="`${row.original.students} Students`" variant="outline" />
                </template>
                <template #phone-cell="{ row }">
                    <p>{{ row.original.phone }}</p>
                </template>
                <template #city-cell="{ row }">
                    <div>
                        <p>{{ row.original.city }}</p>
                        <p class="text-xs text-muted">{{ row.original.street }}</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex justify-end">
                        <UButton v-if="!row.original.email" @click="openAddEmail(row.original)" size="sm"
                            variant="ghost" color="warning" label="Add Email" :icon="EMAIL_ICON" />
                    </div>
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

                <template v-else-if="data?.length">
                    <div v-for="parent in data" :key="parent.id" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-bold text-highlighted">
                                        {{ parent.name }}
                                    </h3>

                                    <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                                        <span v-if="parent.email" class="truncate">{{ parent.email }}</span>
                                        <UBadge v-else size="xs" variant="subtle" color="warning" label="No Email"
                                            class="shrink-0" />

                                        <span class="shrink-0">•</span>

                                        <span class="shrink-0">{{ parent.students }} Student{{ parent.students === 1 ? "" : "s" }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex shrink-0 flex-col items-end gap-1.5">
                                <UBadge :label="STATUS_LABELS[parent.status]" :color="STATUS_COLORS[parent.status]"
                                    variant="subtle" size="sm" />
                                <UButton v-if="!parent.email" @click="openAddEmail(parent)" size="xs" variant="ghost"
                                    color="warning" label="Add Email" :icon="EMAIL_ICON" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                        <h3 class="font-semibold">No Parents Found</h3>

                        <p class="text-sm text-gray-500">There are no parents to show yet.</p>
                    </div>
                </template>
            </div>
            <!-- Footer -->
            <template #footer>
                <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta?.size || 10"
                        :items-per-page="meta?.size || 10" :total="meta?.total || 0" show-edges />
                </div>
            </template>
        </UCard>

        <ParentAddEmail v-if="addEmailTarget" :open="!!addEmailTarget" :parent-id="addEmailTarget.id"
            :parent-name="addEmailTarget.name" @update:open="(v) => { if (!v) addEmailTarget = null }" />
    </div>
</template>
