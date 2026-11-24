<script setup lang="ts">
const route = useRoute()
const router = useRouter()


function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

const search = computed<string>({
    get: () => String(route.query.search ?? ''),
    set: (value) => updateQuery({ search: value || undefined }),
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

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(() => (sort.value !== DEFAULT_SORT ? 1 : 0))

const searchInput = ref(search.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        search.value = val
    }, 350)
})

watch(sort, () => {
    updateQuery({ sort: sort.value === DEFAULT_SORT ? undefined : sort.value })
})

// One scrolling list: the next parents load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } = useInfiniteList<Parent>(
    (page, size) => ParentApi().getAll(page, size, search.value || undefined, sortBy.value, sortDirection.value) as any
)

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
]

// Edit, add email, give login and delete live on the parent's own page (pages/parents/[id].vue) - clicking a row
// opens it.
const parentLink = (parent: Parent) => `/parents/${parent.id}`

onMounted(() => {
    // Old links may still carry ?page= / ?size=; the list starts at the top now.
    if (route.query.page || route.query.size) {
        const { page: _page, size: _size, ...rest } = route.query
        router.replace({ query: rest })
    }
    reload()

    useAppStore().setTitle('All Parents')
    document.title = 'Parents | Skultem'
});

watch([() => search.value, () => sort.value], () => reload())

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>
<template>
    <div class="px-4 sm:px-6">
        <GuideBar class="mb-3" topic="admin-parents" />
        <UCard data-guide="adm-list" :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex px-4 py-3 gap-2 items-center justify-between">
                    <div data-guide="adm-search" class="flex-1 border-default flex items-center gap-2">
                        <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name, email or phone"
                            class="flex-1" />
                        <ParentFilterDrawer v-model:sort="sort" :sort-options="sortOptions"
                            :active-count="activeFilterCount" :default-sort="DEFAULT_SORT" />
                    </div>
                </div>
            </template>
            <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading"
                :ui="{ tr: 'cursor-pointer group' }" @select="(_e: Event, row: any) => navigateTo(parentLink(row.original))">
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                        <p class="text-sm text-gray-500">No parents found</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <UAvatar icon="i-lucide-user" />

                        <div>
                            <p class="font-medium group-hover:text-primary group-hover:underline">{{ row.original.name }}</p>
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
            </UTable>
            <div class="md:p-4 md:space-y-4 md:hidden">
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
                    <NuxtLink v-for="parent in data" :key="parent.id" :to="parentLink(parent)"
                        class="block border-b md:border md:rounded-2xl border-default p-3 transition-colors hover:bg-elevated/50">
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

                                        <span class="shrink-0">{{ parent.students }} Student{{ parent.students === 1 ?
                                            "" : "s" }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex shrink-0 items-center gap-1.5">
                                <UBadge :label="STATUS_LABELS[parent.status]" :color="STATUS_COLORS[parent.status]"
                                    variant="subtle" size="sm" />
                                <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
                            </div>
                        </div>
                    </NuxtLink>
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
            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="parents" :error="listError" @retry="loadMore" />
            </div>
        </UCard>

    </div>
</template>
