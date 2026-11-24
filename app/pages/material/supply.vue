<script setup lang="ts">
const route = useRoute()
const router = useRouter()



const value = ref(route.query.search as string || '')
const search = ref(value.value)

const columns = [
    {
        accessorKey: 'student',
        header: 'Student'
    },
    {
        accessorKey: 'material',
        header: 'Material'
    },
    {
        accessorKey: 'qty',
        header: 'Qty'
    },
    {
        accessorKey: 'collectedQty',
        header: 'Collected'
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        accessorKey: 'collectedOn',
        header: 'Date'
    }
]

// One scrolling list: the next supplies load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
    useInfiniteList<any>((page, size) => MaterialApi().getAllSupply(page, size, search.value) as any)

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        search.value = val
    }, 500)
})

watch(search, () => {
    router.replace({ query: { ...route.query, search: search.value || undefined } })
    reload()
})

onMounted(async () => {
    // Old links may still carry ?page= / ?size=; the list starts at the top now.
    if (route.query.page || route.query.size) {
        const { page: _page, size: _size, ...rest } = route.query
        router.replace({ query: rest })
    }
    reload()
    useAppStore().setTitle('Material Supplies')
    document.title = 'Supplies | Materials | Skultem'
})

onBeforeUnmount(() => clearTimeout(timeout))

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="mat-tabs"><MaterialSectionNav /></div>
        <GuideBar topic="admin-material-supply" />
        <UCard data-guide="adm-list" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex-1 flex space-x-3 items-center">
                        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by student or material" />
                        <div data-guide="mat-supply-add"><MaterialSupplyGive @success="reload" /></div>
                    </div>
                </div>
            </template>

            <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty>
                    <div class="flex flex-col items-center gap-3 py-14">
                        <div
                            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon name="ph:books-light" class="text-3xl text-gray-400" />
                        </div>

                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">
                                No supply found
                            </p>

                            <p class="text-sm text-gray-500">
                                Material supply records will appear here.
                            </p>
                        </div>
                    </div>
                </template>

                <template #student-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <UAvatar v-if="row.original.student" size="lg" :src="row.original.student.photo" loading="lazy" />
                        <UIcon v-else name="i-lucide-user-round" class="size-8 text-muted" />

                        <div class="space-y-0.5">
                            <p v-if="row.original.student" class="font-medium">
                                {{ row.original.student.givenNames }}
                                {{ row.original.student.familyName }}
                            </p>
                            <p v-else class="font-medium">{{ row.original.customerName }}</p>

                            <p class="text-xs text-muted">
                                {{ row.original.student ? row.original.student.admissionNumber : 'Walk-in' }}
                            </p>
                        </div>
                    </div>
                </template>

                <template #material-cell="{ row }">
                    <div class="space-y-0.5">
                        <p>{{ row.original.material.name }}</p>

                        <p class="text-xs text-muted">
                            {{ row.original.material.category.name }}
                        </p>
                    </div>
                </template>

                <template #status-cell="{ row }">
                    <UBadge :color="row.original.status === 'COLLECTED' ? 'success' : 'warning'" variant="soft">
                        {{ clean(row.original.status) }}
                    </UBadge>
                </template>

                <template #collectedOn-cell="{ row }">
                    <p>
                        {{
                            row.original.collectedOn
                                ? formatDateTime(row.original.collectedOn)
                        : '-'
                        }}
                    </p>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <!-- Mobile -->
            <div class="md:hidden">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i"
                        class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="space-y-2">
                                <USkeleton class="h-4 w-32" />
                                <USkeleton class="h-3 w-28" />
                            </div>

                            <div class="space-y-2">
                                <div class="flex justify-end">
                                    <USkeleton class="h-4 w-16" />
                                </div>
                                <div class="flex justify-end">
                                    <USkeleton class="h-6 w-24 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Records -->
                <template v-else-if="data?.length">
                    <div v-for="item in data" :key="item.id"
                        class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-gray-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                                <h3 class="truncate text-sm font-semibold">
                                    {{ item.student ? `${item.student.givenNames} ${item.student.familyName}` :
                                        item.customerName }}
                                </h3>
                                <div class="flex items-center gap-2 text-xs text-muted">
                                    <p class="truncate">{{ item.material.name }}</p>
                                    <p>·</p>
                                    <p>{{ item.student ? item.student.admissionNumber : 'Walk-in' }}</p>
                                </div>
                            </div>

                            <div class="shrink-0 space-y-1 text-right">
                                <p class="text-sm font-bold">{{ item.collectedQty }} / {{ item.qty }}</p>
                                <UBadge size="sm" variant="soft" :color="item.status === 'COLLECTED' ? 'success' : 'warning'"
                                    :icon="item.status === 'COLLECTED' ? 'i-lucide-check' : 'i-lucide-clock-3'"
                                    :label="clean(item.status)" />
                            </div>
                        </div>

                        <div class="mt-2 flex items-center justify-between">
                            <p class="text-xs text-muted">
                                {{ item.collectedOn ? formatDateTime(item.collectedOn) : 'Not collected yet' }}
                            </p>

                            <UBadge v-if="item.collectedQty >= item.qty" color="success" variant="soft" size="xs">
                                Complete
                            </UBadge>
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="flex flex-col items-center py-16">
                        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                            <UIcon name="ph:books-light" class="size-10 text-muted" />
                        </div>

                        <h3 class="mt-4 text-sm font-semibold">
                            No supply found
                        </h3>

                        <p class="mt-1 text-sm text-muted">
                            Material supply records will appear here.
                        </p>
                    </div>
                </template>
            </div>

            <!-- Card view -->

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="supplies" :error="listError" @retry="loadMore" />
            </div>
        </UCard>
    </div>
</template>