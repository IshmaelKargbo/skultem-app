<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useMaterialSaleStore()
const { format } = useMoney()

const { records: data, loading, meta, summary } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

// filterValue, when present, makes the metric a shortcut into that status tab - "Paid, Not
// Collected" has no dedicated tab button of its own, so this is the only way to reach it besides
// typing the URL.
const metrics = computed(() => [
    {
        label: 'Total Sales',
        value: summary.value?.totalSales ?? 0,
        icon: SALE_ICON,
        color: 'neutral' as const,
        isReady: !!summary.value
    },
    {
        label: 'Awaiting Settlement',
        value: summary.value?.pendingSettlement ?? 0,
        icon: PENDING_ICON,
        color: 'warning' as const,
        isReady: !!summary.value,
        filterValue: 'PENDING_SUPPLY'
    },
    {
        label: 'Paid, Not Collected',
        value: summary.value?.paidAwaitingPickup ?? 0,
        icon: 'i-lucide-bell-ring',
        color: 'info' as const,
        subtle: 'Needs chasing',
        subtileColor: 'info' as const,
        isReady: !!summary.value,
        filterValue: 'PAID_PENDING'
    },
    {
        label: 'Collected',
        value: format(summary.value?.totalCollected ?? 0),
        icon: CREDIT_ICON,
        color: 'success' as const,
        isReady: !!summary.value
    },
    {
        label: 'Outstanding',
        value: format(summary.value?.totalOutstanding ?? 0),
        icon: OUTSTANDING_ICON,
        color: 'error' as const,
        isReady: !!summary.value
    }
])

function onMetricClick(metric: { filterValue?: string }) {
    if (metric.filterValue) status.value = metric.filterValue
}

const value = ref(route.query.search as string || '')
const search = ref(value.value)

const paymentModal = ref(false)
const fulfillModal = ref(false)
const cancelModal = ref(false)
const selected = ref<MaterialSale>()

function openPayment(sale: MaterialSale) {
    selected.value = sale
    paymentModal.value = true
}

function openFulfill(sale: MaterialSale) {
    selected.value = sale
    fulfillModal.value = true
}

function openCancel(sale: MaterialSale) {
    selected.value = sale
    cancelModal.value = true
}

// 'PAID_PENDING' isn't a real MaterialSale.Status - it's a sentinel this page alone understands,
// meaning "paid (fully or partially) but not yet collected". See fetchRecord(), which routes it to
// the backend's dedicated paidPending filter instead of sending it as a status value the API (or
// statusColorMap, keyed by a row's own real status) would never recognize.
const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Awaiting Settlement', value: 'PENDING_SUPPLY' },
    { label: 'Paid, Not Collected', value: 'PAID_PENDING' },
    { label: 'Fulfilled', value: 'FULFILLED' },
    { label: 'Cancelled', value: 'CANCELLED' }
]

const statusColorMap: Record<string, 'success' | 'warning' | 'neutral'> = {
    PENDING_SUPPLY: 'warning',
    FULFILLED: 'success',
    CANCELLED: 'neutral'
}

const paymentStatusColorMap: Record<string, 'success' | 'warning' | 'error'> = {
    PAID: 'success',
    PARTIAL: 'warning',
    UNPAID: 'error'
}

const columns = [
    { accessorKey: 'buyer', header: 'Buyer' },
    { accessorKey: 'material', header: 'Material' },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'totalAmount', header: 'Total' },
    { accessorKey: 'balance', header: 'Balance' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'createdAt', header: 'Date' },
    { id: 'actions', meta: { class: { td: 'text-right' } } }
]

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: val => updateQuery({ page: val })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: val => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

// `statusOverride`, when passed, is used in place of `status.value` - the status computed's
// getter reads route.query.status, which router.replace() (see updateQuery) hasn't actually
// updated yet the instant a tab click calls this synchronously afterwards. Without the override,
// that reads the tab that was active *before* this click, one click behind.
async function fetchRecord(statusOverride?: string) {
    const currentStatus = statusOverride !== undefined ? statusOverride : status.value
    const isPaidPending = currentStatus === 'PAID_PENDING'
    await store.fetchAll(
        page.value,
        size.value,
        search.value,
        isPaidPending ? undefined : currentStatus || undefined,
        isPaidPending || undefined
    )
}

const status = computed<string>({
    get: () => (route.query.status as string) || '',
    set: (val) => {
        const alreadyOnPage1 = page.value === 1
        updateQuery({ status: val || undefined, page: 1 })
        if (alreadyOnPage1) fetchRecord(val)
    }
})

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => { search.value = val }, 500)
})

watch(search, () => {
    const alreadyOnPage1 = page.value === 1
    updateQuery({ search: search.value || undefined, page: 1 })
    if (alreadyOnPage1) fetchRecord()
})

watch(page, () => fetchRecord())

function buyerName(sale: MaterialSale) {
    return sale.student ? `${sale.student.givenNames} ${sale.student.familyName}` : sale.customerName
}

// Money's already been collected but the item hasn't - flagged everywhere the row shows up
// (not just the dedicated tab above), so it's never something you'd only notice by switching tabs.
function isPaidAwaitingPickup(sale: MaterialSale) {
    return sale.status === 'PENDING_SUPPLY' && sale.paymentStatus !== 'UNPAID'
}

onMounted(async () => {
    if (!route.query.page || !route.query.size) {
        updateQuery({ page: page.value, search: search.value || undefined })
    }

    await Promise.all([fetchRecord(), store.fetchSummary()])
    useAppStore().setTitle('Material Sales')
    document.title = 'Sales | Materials | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-4">
        <MaterialSectionNav />

        <!-- Summary -->
        <div class="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
            <Metric
                v-for="metric in metrics"
                :key="metric.label"
                :record="metric"
                :class="[metric.filterValue ? 'cursor-pointer transition-colors hover:border-info' : '', status === metric.filterValue ? 'ring-1 ring-info' : '']"
                @click="onMetricClick(metric)"
            />
        </div>

        <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-3 md:gap-0">
                    <div class="flex  border-b p-4 border-default flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-1 space-x-3">
                            <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by buyer or material"
                                class="w-full" />
                            <MaterialSaleCreate @success="fetchRecord" />
                        </div>
                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="flex gap-2 px-4 py-3 overflow-x-auto">
                        <UButton v-for="tab in statusTabs" :key="tab.value" size="xs"
                            :variant="status === tab.value ? 'solid' : 'soft'"
                            :color="status === tab.value ? 'primary' : 'neutral'" @click="status = tab.value">
                            {{ tab.label }}
                        </UButton>
                    </div>
                </div>
            </template>

            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-3 py-14">
                        <div
                            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon :name="SALE_ICON" class="text-3xl text-gray-400" />
                        </div>

                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">No sales found</p>
                            <p class="text-sm text-gray-500">Material sales will appear here once recorded.</p>
                        </div>
                    </div>
                </template>

                <template #buyer-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <UAvatar v-if="row.original.student" :alt="`${row.original.student.givenNames} ${row.original.student.familyName}`" size="lg" :src="row.original.student.photo"
                            loading="lazy" />
                        <UIcon v-else name="i-lucide-user-round" class="size-8 text-muted" />

                        <div class="space-y-0.5">
                            <p class="font-medium">{{ buyerName(row.original) }}</p>
                            <p v-if="row.original.student" class="text-xs text-muted">
                                {{ row.original.student.admissionNumber }}
                            </p>
                            <p v-else class="text-xs text-muted">Walk-in</p>
                        </div>
                    </div>
                </template>

                <template #material-cell="{ row }">
                    <div class="space-y-0.5">
                        <p>{{ row.original.material.name }}</p>
                        <p class="text-xs text-muted">{{ row.original.material.category.name }}</p>
                    </div>
                </template>

                <template #totalAmount-cell="{ row }">
                    <p class="font-medium">{{ format(row.original.totalAmount) }}</p>
                </template>

                <template #balance-cell="{ row }">
                    <UBadge :color="paymentStatusColorMap[row.original.paymentStatus]" variant="soft">
                        {{ row.original.balance > 0 ? format(row.original.balance) : clean(row.original.paymentStatus)
                        }}
                    </UBadge>
                </template>

                <template #status-cell="{ row }">
                    <div class="flex items-center gap-1.5">
                        <UBadge :color="statusColorMap[row.original.status]" variant="soft">
                            {{ row.original.status === 'PENDING_SUPPLY' ? 'Settle Later' : clean(row.original.status) }}
                        </UBadge>
                        <UIcon
                            v-if="isPaidAwaitingPickup(row.original)"
                            name="i-lucide-bell-ring"
                            class="size-4 text-info"
                            title="Paid - not yet collected"
                        />
                    </div>
                </template>

                <template #createdAt-cell="{ row }">
                    <p class="text-sm text-gray-500">{{ formatDateTime(row.original.createdAt) }}</p>
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex justify-end gap-1">
                        <UButton v-if="row.original.status !== 'CANCELLED' && row.original.balance > 0" size="xs"
                            variant="ghost" icon="i-lucide-hand-coins" title="Record Payment"
                            @click="openPayment(row.original)" />
                        <UButton v-if="row.original.status === 'PENDING_SUPPLY'" size="xs" color="success"
                            variant="ghost" :icon="FULFILL_ICON" title="Fulfill" @click="openFulfill(row.original)" />
                        <UButton v-if="row.original.status === 'PENDING_SUPPLY'" size="xs" color="error" variant="ghost"
                            :icon="CANCEL_ICON" title="Cancel" @click="openCancel(row.original)" />
                    </div>
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
                                <USkeleton class="h-3 w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <UCard v-else-if="!loading && !data?.length"
                    class="rounded-2xl border border-default shadow-sm col-span-full" :ui="{ body: 'p-4' }">
                    <div class="flex flex-col items-center gap-3 py-14">
                        <div
                            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon :name="SALE_ICON" class="text-3xl text-gray-400" />
                        </div>
                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">No sales found</p>
                            <p class="text-sm text-gray-500">Material sales will appear here once recorded.</p>
                        </div>
                    </div>
                </UCard>

                <template v-else>
                    <UCard v-for="item in data" :key="item.id" class="rounded-2xl border border-default shadow-sm"
                        :ui="{ body: 'p-4' }">
                        <div class="space-y-4">
                            <div
                                class="flex items-center justify-between gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
                                <div class="flex min-w-0 items-center gap-3">
                                    <UAvatar v-if="item.student" size="lg" :src="item.student.photo" loading="lazy"
                                        class="shrink-0 ring-2 ring-primary/10" />
                                    <UIcon v-else name="i-lucide-user-round" class="size-9 text-muted shrink-0" />

                                    <div class="min-w-0">
                                        <h3 class="truncate text-sm font-semibold text-highlighted">{{ buyerName(item)
                                            }}</h3>
                                        <p class="text-xs text-muted">{{ item.student ? item.student.admissionNumber :
                                            'Walk-in customer' }}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-1.5 shrink-0">
                                    <UIcon
                                        v-if="isPaidAwaitingPickup(item)"
                                        name="i-lucide-bell-ring"
                                        class="size-4 text-info"
                                        title="Paid - not yet collected"
                                    />
                                    <UBadge size="sm" variant="soft" :color="statusColorMap[item.status]">
                                        {{ item.status === 'PENDING_SUPPLY' ? 'Settle Later' : clean(item.status) }}
                                    </UBadge>
                                </div>
                            </div>

                            <div
                                class="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary-50 dark:bg-primary-500/10 p-4">
                                <div
                                    class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/10">
                                    <UIcon name="i-lucide-package" class="size-5 text-primary" />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-semibold text-highlighted">{{ item.quantity }}× {{
                                        item.material.name }}</p>
                                    <p class="truncate text-xs text-muted">{{ format(item.unitPrice) }} each</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="rounded-2xl border border-default bg-gray-50 dark:bg-gray-600 p-3.5">
                                    <p class="text-xs font-medium text-muted">Total</p>
                                    <p class="mt-2 text-lg font-bold text-highlighted">{{ format(item.totalAmount) }}
                                    </p>
                                </div>
                                <div class="rounded-2xl border p-3.5"
                                    :class="item.balance > 0 ? 'border-error/10 bg-error-50 dark:bg-error-500/10' : 'border-success/10 bg-success-50 dark:bg-success-500/10'">
                                    <p class="text-xs font-medium text-muted">Balance</p>
                                    <p class="mt-2 text-lg font-bold"
                                        :class="item.balance > 0 ? 'text-error' : 'text-success'">
                                        {{ format(item.balance) }}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center justify-between border-t border-default pt-4">
                                <p class="text-xs text-muted">{{ formatDateTime(item.createdAt) }}</p>

                                <div class="flex gap-1">
                                    <UButton v-if="item.status !== 'CANCELLED' && item.balance > 0" size="xs"
                                        variant="ghost" icon="i-lucide-hand-coins" @click="openPayment(item)" />
                                    <UButton v-if="item.status === 'PENDING_SUPPLY'" size="xs" color="success"
                                        variant="ghost" :icon="FULFILL_ICON" @click="openFulfill(item)" />
                                    <UButton v-if="item.status === 'PENDING_SUPPLY'" size="xs" color="error"
                                        variant="ghost" :icon="CANCEL_ICON" @click="openCancel(item)" />
                                </div>
                            </div>
                        </div>
                    </UCard>
                </template>
            </div>

            <MaterialSaleRecordPayment v-if="selected" v-model:open="paymentModal" :sale="selected" />
            <MaterialSaleFulfillPrompt v-if="selected" v-model:open="fulfillModal" :sale="selected" />
            <MaterialSaleCancelPrompt v-if="selected" v-model:open="cancelModal" :sale="selected" />

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
