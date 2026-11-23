<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useMaterialSaleStore()
const { format } = useMoney()

const { summary } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const metrics = computed(() => [
    {
        label: 'Total Sales',
        value: summary.value?.totalSales ?? 0,
        icon: SALE_ICON,
        color: 'neutral' as const,
        isReady: !!summary.value
    },
    {
        label: 'Not Collected',
        value: summary.value?.paidAwaitingPickup ?? 0,
        icon: 'i-lucide-bell-ring',
        color: 'info' as const,
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
    { accessorKey: 'createdAt', header: 'Date' }
]

const status = computed<string>({
    get: () => (route.query.status as string) || '',
    set: (val) => updateQuery({ status: val || undefined })
})

// One scrolling list: the next sales load as the end comes into view. "Paid, not collected" is its own filter on the
// server, not a status.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
    useInfiniteList<MaterialSale>((page, size) => {
        const isPaidPending = status.value === 'PAID_PENDING'
        return MaterialSaleApi().getAll(page, size, search.value, isPaidPending ? undefined : status.value || undefined,
            isPaidPending || undefined) as any
    })

watch(status, () => reload())

// After a sale is created, paid, fulfilled or cancelled: the list again, and the totals above it.
function fetchRecord() {
    reload()
    store.fetchSummary()
}

// A row opens the sale's details, where its actions are.
const detailOpen = ref(false)
function openSale(sale: MaterialSale) {
    selected.value = sale
    detailOpen.value = true
}
function fromDetail(action: (sale: MaterialSale) => void) {
    const sale = selected.value
    if (!sale) return
    detailOpen.value = false
    action(sale)
}

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => { search.value = val }, 500)
})

watch(search, () => {
    updateQuery({ search: search.value || undefined })
    reload()
})

function buyerName(sale: MaterialSale) {
    return sale.student ? `${sale.student.givenNames} ${sale.student.familyName}` : sale.customerName
}

function isPaidAwaitingPickup(sale: MaterialSale) {
    return sale.status === 'PENDING_SUPPLY' && sale.paymentStatus !== 'UNPAID'
}

onMounted(async () => {
    // Old links may still carry ?page= / ?size=; the list starts at the top now.
    if (route.query.page || route.query.size) {
        const { page: _page, size: _size, ...rest } = route.query
        router.replace({ query: rest })
    }

    reload()
    store.fetchSummary()
    useAppStore().setTitle('Material Sales')
    document.title = 'Sales | Materials | Skultem'
})

onBeforeUnmount(() => clearTimeout(timeout))

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="mat-tabs"><MaterialSectionNav /></div>
        <!-- Summary -->
        <div class="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
            <Metric
                v-for="metric in metrics"
                :key="metric.label"
                :record="metric"
                :class="[metric.filterValue ? 'cursor-pointer transition-colors hover:border-info' : '', status === metric.filterValue ? 'ring-1 ring-info' : '']"
                @click="onMetricClick(metric)"
            />
        </div>

        <GuideBar topic="admin-material-sales" />
        <UCard data-guide="adm-list" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-3 md:gap-0">
                    <div class="flex  border-b p-4 border-default flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-1 space-x-3">
                            <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by buyer or material"
                                class="w-full" />
                            <div data-guide="mat-sale-add"><MaterialSaleCreate @success="fetchRecord" /></div>
                        </div>
                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="flex gap-2 px-4 py-3 overflow-x-auto">
                        <UButton data-guide="mat-sale-status" v-for="tab in statusTabs" :key="tab.value" size="xs"
                            :variant="status === tab.value ? 'solid' : 'soft'"
                            :color="status === tab.value ? 'primary' : 'neutral'" @click="() => { status = tab.value }">
                            {{ tab.label }}
                        </UButton>
                    </div>
                </div>
            </template>

            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading"
                :ui="{ tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => openSale(row.original)">
                <template #empty>
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


                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <!-- Mobile -->
            <div v-if="view === 'table'" class="md:hidden">
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
                    <div v-for="item in data" :key="item.id" role="button" tabindex="0" @click="openSale(item)"
                        @keydown.enter="openSale(item)"
                        class="cursor-pointer border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                                <h3 class="truncate text-sm font-semibold">{{ buyerName(item) }}</h3>
                                <div class="flex items-center gap-2 text-xs text-muted">
                                    <p class="truncate">{{ item.quantity }}× {{ item.material.name }}</p>
                                    <p>·</p>
                                    <p>{{ formatDate(item.createdAt) }}</p>
                                </div>
                            </div>

                            <div class="shrink-0 space-y-1 text-right">
                                <p class="text-sm font-bold">{{ format(item.totalAmount) }}</p>
                                <div class="flex items-center justify-end gap-2">
                                    <UIcon v-if="isPaidAwaitingPickup(item)" name="i-lucide-bell-ring"
                                        class="size-4 text-info" title="Paid - not yet collected" />
                                    <p class="text-sm font-bold" :class="item.balance > 0 ? 'text-error' : 'text-success'">
                                        {{ item.balance > 0 ? format(item.balance) : clean(item.paymentStatus) }}
                                    </p>
                                    <UBadge size="sm" variant="soft" :color="statusColorMap[item.status]"
                                        :label="item.status === 'PENDING_SUPPLY' ? 'Settle Later' : clean(item.status)" />
                                </div>
                            </div>
                        </div>

                        <p class="mt-2 text-xs text-muted">
                            {{ item.student ? item.student.admissionNumber : 'Walk-in customer' }}
                        </p>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="flex flex-col items-center py-16">
                        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                            <UIcon :name="SALE_ICON" class="size-10 text-muted" />
                        </div>

                        <h3 class="mt-4 text-sm font-semibold">
                            No sales found
                        </h3>

                        <p class="mt-1 text-sm text-muted">
                            Material sales will appear here once recorded.
                        </p>
                    </div>
                </template>
            </div>

            <!-- Card view -->
            <div v-else class="p-4 grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3">
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
                    <UCard v-for="item in data" :key="item.id"
                        class="cursor-pointer rounded-2xl border border-default shadow-sm hover:ring-primary/40"
                        :ui="{ body: 'p-4' }" role="button" tabindex="0" @click="openSale(item)"
                        @keydown.enter="openSale(item)">
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

                            <p class="border-t border-default pt-4 text-xs text-muted">{{ formatDateTime(item.createdAt) }}</p>
                        </div>
                    </UCard>
                </template>
            </div>

            <MaterialSaleRecordPayment v-if="selected" v-model:open="paymentModal" :sale="selected" @done="fetchRecord" />
            <MaterialSaleFulfillPrompt v-if="selected" v-model:open="fulfillModal" :sale="selected" @done="fetchRecord" />
            <MaterialSaleCancelPrompt v-if="selected" v-model:open="cancelModal" :sale="selected" @done="fetchRecord" />

            <!-- A sale row opens this: what was sold, and what can still be done with it. -->
            <UModal v-model:open="detailOpen">
                <template #content>
                    <UCard v-if="selected">
                        <template #header>
                            <div class="flex items-center justify-between gap-3">
                                <div class="min-w-0">
                                    <h3 class="truncate text-lg font-semibold">{{ buyerName(selected) }}</h3>
                                    <p class="text-xs text-muted">
                                        {{ selected.student ? selected.student.admissionNumber : 'Walk-in customer' }}
                                    </p>
                                </div>
                                <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" aria-label="Close"
                                    @click="detailOpen = false" />
                            </div>
                        </template>
                        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                            <dt class="text-muted">Item</dt>
                            <dd>{{ selected.quantity }}× {{ selected.material.name }}
                                <span class="text-muted">({{ format(selected.unitPrice) }} each)</span></dd>
                            <dt class="text-muted">Total</dt>
                            <dd class="font-semibold">{{ format(selected.totalAmount) }}</dd>
                            <dt class="text-muted">Balance</dt>
                            <dd class="font-semibold" :class="selected.balance > 0 ? 'text-error' : 'text-success'">
                                {{ format(selected.balance) }}</dd>
                            <dt class="text-muted">Status</dt>
                            <dd>
                                <UBadge size="sm" variant="soft" :color="statusColorMap[selected.status]"
                                    :label="selected.status === 'PENDING_SUPPLY' ? 'Settle Later' : clean(selected.status)" />
                                <span v-if="isPaidAwaitingPickup(selected)" class="ml-2 text-xs text-info">Paid - not yet
                                    collected</span>
                            </dd>
                            <dt class="text-muted">Date</dt>
                            <dd>{{ formatDateTime(selected.createdAt) }}</dd>
                        </dl>
                        <template v-if="selected.status !== 'CANCELLED' && (selected.balance > 0 || selected.status === 'PENDING_SUPPLY')" #footer>
                            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <UButton v-if="selected.balance > 0" label="Record payment" icon="i-lucide-hand-coins"
                                    variant="soft" @click="fromDetail(openPayment)" />
                                <UButton v-if="selected.status === 'PENDING_SUPPLY'" label="Fulfill" :icon="FULFILL_ICON"
                                    color="success" variant="soft" @click="fromDetail(openFulfill)" />
                                <UButton v-if="selected.status === 'PENDING_SUPPLY'" class="sm:ml-auto" label="Cancel sale"
                                    :icon="CANCEL_ICON" color="error" variant="soft" @click="fromDetail(openCancel)" />
                            </div>
                        </template>
                    </UCard>
                </template>
            </UModal>

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="sales" :error="listError" @retry="loadMore" />
            </div>
        </UCard>
    </div>
</template>
