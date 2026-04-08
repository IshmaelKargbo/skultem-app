<template>
    <div class="grid md:gap-5 gap-3 md:grid-cols-4 grid-cols-2 space-y-0 w-full">
        <Metric class="col-span-2 md:col-span-1" :record="{
            value: report?.totalStudents,
            color: 'success',
            icon: ATTENDANCE_ICON,
            isReady: !isLoading,
            label: 'Total Students',
            subtle: `+ ${report?.studentGrowth} from last month`
        }" />
        <Metric :record="{
            value: report?.totalTeachers,
            color: 'info',
            icon: TEACHER_ICON,
            isReady: !isLoading,
            label: 'Total Teachers',
            subtle: 'All departments'
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
            subtle: `+${report?.revenueGrowthPercent}% from last month`
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

onMounted(async () => await fetchRecord())
</script>