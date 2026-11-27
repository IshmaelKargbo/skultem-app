<template>
    <div class="grid gap-3 lg:grid-cols-4 grid-cols-2 space-y-0 w-full">
        <Metric class="col-span-2 md:col-span-1" :record="{
            value: report?.totalStudents,
            color: 'success',
            icon: ATTENDANCE_ICON,
            isReady: !isLoading,
            label: 'Total Students',
            subtle: growthText(report?.studentGrowth, ' this month', ' new')
        }" />
        <Metric :record="{
            value: report?.totalTeachers,
            color: 'info',
            icon: TEACHER_ICON,
            isReady: !isLoading,
            label: 'Total Teachers',
            subtle: 'Active teaching staff'
        }" />
        <Metric :record="{
            value: report?.activeYear,
            color: 'primary',
            icon: ATTENDANCE_ICON,
            isReady: !isLoading,
            label: 'Active Year',
            subtle: `${report?.activeTerm} Active`
        }" />
        <Metric class="col-span-2 md:col-span-1" :record="{
            value: format(report?.monthlyRevenue || 0),
            color: 'error',
            icon: PAYMENT_ICON,
            isReady: !isLoading,
            label: 'Monthly Revenue',
            subtle: growthText(report?.revenueGrowthPercent, '% vs last month')
        }" />
    </div>
</template>

<script setup lang="ts">
const isLoading = ref(true)
const { format } = useMoney()

const store = useDashboardStore();

const report = ref<AdminDashboardReport>()

async function fetchRecord() {
    isLoading.value = true
    const res = await store.fetchAdminReport()
    if (res == null) return
    report.value = res
    isLoading.value = false
}

// "+12 new this month", "-40% vs last month", "No change" - the sign comes from the number, never a fixed "+".
function growthText(value: number | string | null | undefined, suffix: string, noun = '') {
    const n = Number(value ?? 0)
    if (!Number.isFinite(n) || n === 0) return suffix.includes('%') ? 'Same as last month' : 'None new this month'
    const shown = Number.isInteger(n) ? String(Math.abs(n)) : Math.abs(n).toFixed(1)
    return `${n > 0 ? '+' : '-'}${shown}${noun}${suffix}`
}

onMounted(async () => await fetchRecord())
</script>