<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = usePendingPickupStore()
const { records: data, loading, meta } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const sourceColorMap: Record<string, 'info' | 'primary'> = {
    SUPPLY: 'primary',
    SALE: 'info'
}

const sourceLabelMap: Record<string, string> = {
    SUPPLY: 'Fee Supply',
    SALE: 'Sale'
}

const paymentStatusColorMap: Record<string, 'success' | 'warning' | 'error'> = {
    PAID: 'success',
    PARTIAL: 'warning',
    UNPAID: 'error'
}

const columns = [
    { accessorKey: 'buyer', header: 'Buyer' },
    { accessorKey: 'material', header: 'Material' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'quantity', header: 'Owed' },
    { accessorKey: 'paymentStatus', header: 'Payment' },
    { accessorKey: 'since', header: 'Since' }
]

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecord() {
    await store.fetchAll(page.value, size.value)
}

watch(page, () => fetchRecord())

function remaining(item: PendingPickup) {
    return item.quantity - item.collectedQuantity
}

onMounted(async () => {
    if (!route.query.page || !route.query.size) {
        updateQuery({ page: page.value })
    }

    await fetchRecord()
    useAppStore().setTitle('Pending Pickups')
    document.title = 'Pending Pickups | Materials | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-4">
        <MaterialSectionNav />

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p class="font-medium">Everyone still owed a material</p>
                        <p class="text-xs text-muted">
                            Combines fee-entitled supplies and sold-but-not-yet-handed-over items into one list.
                        </p>
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-3 py-14">
                        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon :name="PENDING_PICKUP_ICON" class="text-3xl text-gray-400" />
                        </div>
                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">Nothing pending</p>
                            <p class="text-sm text-gray-500">Everyone's collected what they're owed.</p>
                        </div>
                    </div>
                </template>

                <template #buyer-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <UAvatar v-if="row.original.buyerPhoto" size="lg" :src="row.original.buyerPhoto" loading="lazy" />
                        <UIcon v-else name="i-lucide-user-round" class="size-8 text-muted" />
                        <div class="space-y-0.5">
                            <p class="font-medium">{{ row.original.buyerName }}</p>
                            <p v-if="row.original.admissionNumber" class="text-xs text-muted">
                                {{ row.original.admissionNumber }}
                            </p>
                            <p v-else class="text-xs text-muted">Walk-in</p>
                        </div>
                    </div>
                </template>

                <template #material-cell="{ row }">
                    <div class="space-y-0.5">
                        <p>{{ row.original.materialName }}</p>
                        <p class="text-xs text-muted">{{ row.original.categoryName }}</p>
                    </div>
                </template>

                <template #source-cell="{ row }">
                    <UBadge :color="sourceColorMap[row.original.source]" variant="soft">
                        {{ sourceLabelMap[row.original.source] }}
                    </UBadge>
                </template>

                <template #quantity-cell="{ row }">
                    <p class="font-medium">
                        {{ remaining(row.original) }}
                        <span v-if="row.original.collectedQuantity > 0" class="text-xs text-muted">
                            of {{ row.original.quantity }}
                        </span>
                    </p>
                </template>

                <template #paymentStatus-cell="{ row }">
                    <UBadge :color="paymentStatusColorMap[row.original.paymentStatus] ?? 'neutral'" variant="soft">
                        {{ clean(row.original.paymentStatus) }}
                    </UBadge>
                </template>

                <template #since-cell="{ row }">
                    <p class="text-sm text-gray-500">{{ formatDateTime(row.original.since) }}</p>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <!-- Mobile / Card view -->
            <div class="p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <div v-if="loading" class="space-y-4 col-span-full">
                    <div v-for="i in 5" :key="i"
                        class="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div class="flex gap-3">
                            <USkeleton class="h-14 w-14 rounded-2xl" />
                            <div class="flex-1 space-y-3">
                                <USkeleton class="h-4 w-40" />
                                <USkeleton class="h-3 w-28" />
                            </div>
                        </div>
                    </div>
                </div>

                <UCard v-else-if="!loading && !data?.length"
                    class="rounded-2xl border border-default shadow-sm col-span-full" :ui="{ body: 'p-4' }">
                    <div class="flex flex-col items-center gap-3 py-14">
                        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon :name="PENDING_PICKUP_ICON" class="text-3xl text-gray-400" />
                        </div>
                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">Nothing pending</p>
                            <p class="text-sm text-gray-500">Everyone's collected what they're owed.</p>
                        </div>
                    </div>
                </UCard>

                <template v-else>
                    <UCard v-for="item in data" :key="`${item.source}-${item.id}`"
                        class="rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-4' }">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <UAvatar v-if="item.buyerPhoto" size="lg" :src="item.buyerPhoto" loading="lazy"
                                        class="shrink-0" />
                                    <UIcon v-else name="i-lucide-user-round" class="size-9 text-muted shrink-0" />
                                    <div class="min-w-0">
                                        <h3 class="truncate text-sm font-semibold text-highlighted">{{ item.buyerName }}</h3>
                                        <p class="text-xs text-muted">{{ item.admissionNumber || 'Walk-in customer' }}</p>
                                    </div>
                                </div>
                                <UBadge size="sm" variant="soft" :color="sourceColorMap[item.source]">
                                    {{ sourceLabelMap[item.source] }}
                                </UBadge>
                            </div>

                            <div class="flex items-center justify-between rounded-2xl border border-default bg-gray-50 dark:bg-gray-900 p-3">
                                <div>
                                    <p class="text-sm font-medium text-highlighted">{{ item.materialName }}</p>
                                    <p class="text-xs text-muted">{{ item.categoryName }}</p>
                                </div>
                                <p class="text-lg font-bold text-highlighted">
                                    {{ remaining(item) }}
                                    <span v-if="item.collectedQuantity > 0" class="text-xs font-normal text-muted">
                                        / {{ item.quantity }}
                                    </span>
                                </p>
                            </div>

                            <div class="flex items-center justify-between">
                                <UBadge :color="paymentStatusColorMap[item.paymentStatus] ?? 'neutral'" variant="soft" size="sm">
                                    {{ clean(item.paymentStatus) }}
                                </UBadge>
                                <p class="text-xs text-muted">{{ formatDateTime(item.since) }}</p>
                            </div>
                        </div>
                    </UCard>
                </template>
            </div>

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
