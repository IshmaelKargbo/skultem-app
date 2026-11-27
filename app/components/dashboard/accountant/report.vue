<template>
    <div class="grid gap-5 md:grid-cols-3 grid-cols-2">
        <Metric :record="{
            label: 'Collected This Year',
            value: format(summary?.totalCollected ?? 0),
            subtle: summary ? `${rate}% of ${format(summary.totalExpected)} expected` : '',
            isReady: isReady,
            icon: 'fe:line-chart',
            color: 'success',
            subtileColor: 'success'
        }" />
        <Metric :record="{
            label: 'Collected This Month',
            value: format(month?.totalCollected ?? 0),
            subtle: month ? `${month.paymentCount} payment${month.paymentCount === 1 ? '' : 's'} since ${monthStartLabel}` : '',
            isReady: isReady,
            icon: ATTENDANCE_ICON,
            color: 'info',
            subtileColor: 'info'
        }" />
        <Metric class="col-span-2 md:col-span-1" :record="{
            label: 'Outstanding Fees',
            value: format(summary?.totalOutstanding ?? 0),
            subtle: summary ? `${summary.studentsWithBalance + summary.studentsNoPayment} student${summary.studentsWithBalance + summary.studentsNoPayment === 1 ? '' : 's'} still owe` : '',
            isReady: isReady,
            icon: 'ph:user-list',
            color: 'error',
            subtileColor: 'error'
        }" />
    </div>
</template>

<script setup lang="ts">
// The school's own money this academic year - the same figures as the Fees reports: no Skultem platform fee (it isn't
// the school's), expected net of discounts, outstanding added up fee by fee. Nothing here is a made-up trend.
const { format } = useMoney()

const summary = ref<FeeDashboardSummary | null>(null)
const month = ref<{ totalCollected: number, paymentCount: number } | null>(null)
const isReady = ref(false)

const rate = computed(() => Number(summary.value?.collectionRate ?? 0).toFixed(1))

// "YYYY-MM-DD" for the 1st of this month and today, in the viewer's own calendar (not UTC).
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
const monthStartLabel = monthStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

async function fetchRecord() {
    isReady.value = false
    try {
        const [dash, collected] = await Promise.all([
            FeeReportApi().getDashboard().catch(() => null),
            FeeReportApi().getDailyCollection(iso(monthStart), iso(now)).catch(() => null)
        ])
        summary.value = dash ?? null
        month.value = collected ? { totalCollected: Number(collected.totalCollected ?? 0), paymentCount: collected.paymentCount ?? 0 } : null
    } finally {
        isReady.value = true
    }
}

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>
