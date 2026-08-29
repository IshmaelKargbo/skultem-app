<template>
    <div class="space-y-4">
        <TransactionFilters v-if="showFilter" :selected="selected ?? defaultSelected" :emit-only="emitOnly"
            @apply="onApply" />

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <UCard class="cursor-pointer transition-colors hover:bg-muted/40" :ui="{ body: 'p-4 sm:p-5' }"
                @click="download('class')">
                <div class="flex items-start gap-3">
                    <UBadge variant="subtle" color="primary" size="xl" class="p-1.5 shrink-0"
                        :icon="downloading === 'class' ? 'i-lucide-loader-circle animate-spin' : REPORT_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Revenue by Class</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard class="cursor-pointer transition-colors hover:bg-muted/40" :ui="{ body: 'p-4 sm:p-5' }"
                @click="download('term')">
                <div class="flex items-start gap-3">
                    <UBadge color="info" variant="subtle" size="xl" class="p-1.5 shrink-0"
                        :icon="downloading === 'term' ? 'i-lucide-loader-circle animate-spin' : IMPROVED_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Revenue by Term</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard class="cursor-pointer transition-colors hover:bg-muted/40" :ui="{ body: 'p-4 sm:p-5' }"
                @click="download('outstanding')">
                <div class="flex items-start gap-3">
                    <UBadge color="error" variant="subtle" size="xl" class="p-1.5 shrink-0"
                        :icon="downloading === 'outstanding' ? 'i-lucide-loader-circle animate-spin' : PAYMENT_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Outstanding Fees</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard class="cursor-pointer transition-colors hover:bg-muted/40" :ui="{ body: 'p-4 sm:p-5' }"
                @click="download('profit-loss')">
                <div class="flex items-start gap-3">
                    <UBadge variant="subtle" color="success" size="xl" class="p-1.5 shrink-0"
                        :icon="downloading === 'profit-loss' ? 'i-lucide-loader-circle animate-spin' : STUDENT_FEES_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Profit & Loss</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
        </div>
        <div>
            <TabMobile class="md:hidden" :tabs="[
                  { label: 'Revenue Analysis', to: '/analytics/financial-reports', exact: true },
                { label: 'Outstanding Fees', to: '/analytics/financial-reports/outstanding' },
                { label: 'Expense Report', to: '/analytics/financial-reports/expense' },
                { label: 'Payment History', to: '/analytics/financial-reports/history' },
                { label: 'Profit & Loss', to: '/analytics/financial-reports/profit-loss' }
            ]" />
            <Tab class="hidden md:flex" :tabs="[
                { label: 'Revenue Analysis', to: '/analytics/financial-reports', exact: true },
                { label: 'Outstanding Fees', to: '/analytics/financial-reports/outstanding' },
                { label: 'Expense Report', to: '/analytics/financial-reports/expense' },
                { label: 'Payment History', to: '/analytics/financial-reports/history' },
                { label: 'Profit & Loss', to: '/analytics/financial-reports/profit-loss' }
            ]" />
        </div>

    </div>
</template>

<script setup lang="ts">
// The filter bar is generic - a page whose data isn't the transactions entity (fees, expenses,
// payments, ...) passes its own `selected` (entity + the fields that actually exist on it)
// instead of inheriting the transactions-shaped default below. `emitOnly` controls what applying
// a filter does: true (the default) just emits `apply` for the page to act on itself; false lets
// TransactionFilters drive the shared report store directly (for a page that lists report rows,
// like Payment History, rather than feeding a chart).
const { showFilter = true, selected = undefined, emitOnly = true } = defineProps<{
    showFilter?: boolean
    selected?: ReportSelectPayload
    emitOnly?: boolean
}>()
const emit = defineEmits<{ apply: [{ entity: string, filters: any[] }] }>()

const equalSelectOperators = (options: Option[] = []): ReportOperator[] => [
    { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options }
]

const instantOperators: ReportOperator[] = [
    { name: "Equals (=)", operator: "EQUALS", type: "instant", input: "date" },
    { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "instant", input: "date" },
    { name: "After (>)", operator: "GREATER_THAN", type: "instant", input: "date" },
    { name: "Before (<)", operator: "LESS_THAN", type: "instant", input: "date" },
    { name: "Between (↔)", operator: "BETWEEN", type: "instant", input: "date-range" },
]

// Default when a page doesn't supply its own `selected` - same filterable fields (and filter
// concept) as /transactions, since most financial-reports widgets are built from that entity.
const defaultSelected = ref<ReportSelectPayload>({
    entity: "transactions",
    filters: [
        { field: "createdAt", label: "Date", operators: instantOperators },
        { field: "direction", label: "Direction", operators: equalSelectOperators(directionOptions) },
        { field: "type", label: "Type", operators: equalSelectOperators(typeOptions) },
        { field: "referenceType", label: "Reference", operators: equalSelectOperators(referenceTypeOptions) }
    ]
})

const appliedFilters = ref<any[]>([])

function onApply(payload: { entity: string, filters: any[] }) {
    appliedFilters.value = payload.filters
    emit('apply', payload)
}

// Only the date filter translates to the fees entity (Revenue by Class / Outstanding Fees run
// against fees, not transactions) - direction/type/reference don't exist there.
const dateOnlyFilter = computed(() => {
    const dateFilter = appliedFilters.value.find(f => f.field === 'createdAt')
    return dateFilter ? [dateFilter] : []
})

const widgetStore = useWidgetStore()
const downloading = ref<string | null>(null)

const monthOrder: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
}

// The chart-shaped {labels, datasets} response common to every /widget/run bar/line chart -
// pulled out into rows of [label, ...seriesValues] for a CSV, in the order the series were asked
// for (so a caller can label its own columns without guessing datasets[] order).
function toRows(widget: any, seriesNames: string[]): [string, ...number[]][] {
    if (!widget) return []

    if (Array.isArray(widget)) {
        return widget.map((r: any) => [String(r[Object.keys(r)[0]] ?? ''), ...seriesNames.map(n => Number(r[n] ?? 0))])
    }

    const labels: string[] = widget.labels ?? []
    const series = seriesNames.map(name => widget.datasets?.find((d: any) => d.label === name)?.data ?? [])

    return labels.map((label, i) => [label, ...series.map(s => Number(s[i] ?? 0))])
}

async function downloadClassRevenue() {
    const res = await widgetStore.runAnalytic({
        entity: "fees",
        title: "Revenue by Class",
        filters: dateOnlyFilter.value,
        metrics: [
            { field: "amount", aggregation: "sum", name: "Paid", tags: { groupBy: "clazz", field: "status", value: "Paid" } },
            { field: "amountPaid", aggregation: "sum", name: "Partial", tags: { groupBy: "clazz", field: "status", value: "Partial" } },
            { field: "amount", aggregation: "sum", name: "Unpaid", tags: { groupBy: "clazz", field: "status", value: "Pending" } },
        ],
        chartType: "bar",
    })

    const rows = toRows(res?.data ?? res, ["Paid", "Partial", "Unpaid"])
        .map(([clazz, paid, partial, unpaid]) => [clazz, paid + partial, unpaid])

    downloadCsv("revenue-by-class", ["Class", "Paid", "Unpaid"], rows)
}

async function downloadTermRevenue() {
    const res = await widgetStore.runAnalytic({
        entity: "transactions",
        title: "Revenue by Term",
        filters: appliedFilters.value,
        metrics: [
            { field: "amount", aggregation: "sum", name: "Revenue", tags: { field: "direction", value: "CREDIT", groupBy: "term" } },
        ],
        chartType: "bar",
    })

    const rows = toRows(res?.data ?? res, ["Revenue"])
    downloadCsv("revenue-by-term", ["Term", "Revenue"], rows)
}

async function downloadOutstanding() {
    const res = await widgetStore.runAnalytic({
        entity: "fees",
        title: "Outstanding Fees by Class",
        filters: dateOnlyFilter.value,
        metrics: [
            { field: "amount", aggregation: "sum", name: "Unpaid", tags: { groupBy: "clazz", field: "status", value: "Pending" } },
            { field: "amountPaid", aggregation: "sum", name: "Partial", tags: { groupBy: "clazz", field: "status", value: "Partial" } },
        ],
        chartType: "bar",
    })

    const rows = toRows(res?.data ?? res, ["Unpaid", "Partial"])
        .map(([clazz, unpaid, partial]) => [clazz, unpaid + partial])

    downloadCsv("outstanding-fees-by-class", ["Class", "Outstanding"], rows)
}

async function downloadProfitLoss() {
    const res = await widgetStore.runAnalytic({
        entity: "transactions",
        title: "Monthly Profit & Loss",
        filters: appliedFilters.value,
        metrics: [
            { field: "amount", aggregation: "sum", name: "Revenue", tags: { field: "direction", value: "CREDIT", groupBy: "createdAt", interval: "month" } },
            { field: "amount", aggregation: "sum", name: "Expenses", tags: { field: "direction", value: "DEBIT", groupBy: "createdAt", interval: "month" } },
            { field: "amount", aggregation: "sum", name: "Profit", tags: { groupBy: "createdAt", interval: "month" } },
        ],
        chartType: "line",
    })

    const widget = res?.data ?? res
    const rows = toRows(widget, ["Revenue", "Expenses", "Profit"])
        .map(([month, ...values]) => [clean(String(month)), ...values])
        .sort((a, b) => (monthOrder[a[0] as string] || 0) - (monthOrder[b[0] as string] || 0))

    downloadCsv("profit-and-loss", ["Month", "Revenue", "Expenses", "Profit"], rows)
}

const downloaders: Record<string, () => Promise<void>> = {
    'class': downloadClassRevenue,
    'term': downloadTermRevenue,
    'outstanding': downloadOutstanding,
    'profit-loss': downloadProfitLoss,
}

async function download(key: string) {
    if (downloading.value) return

    downloading.value = key
    try {
        await downloaders[key]?.()
    } catch (error: any) {
        useNotify().error(error?.message || 'Failed to download report')
    } finally {
        downloading.value = null
    }
}
</script>
