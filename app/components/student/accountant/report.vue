<template>
    <div class="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
        <Metric :record="{
            label: 'Total Students',
            value: report.students,
            icon: STUDENT_ICON,
            isReady: !loading,
            subtle: 'Currently enrolled students',
            color: 'info'
        }" />
        <Metric :record="{
            label: 'Expected Fees',
            value: report.expected,
            icon: PAYMENT_ICON,
            isReady: !loading,
            color: 'primary',
            subtle: 'Total payable fees this term'
        }" />
        <Metric :record="{
            label: 'Collected',
            value: report.collected,
            icon: COLLETED_ICON,
            isReady: !loading,
            color: 'success',
            subtle: 'Payments received this term'
        }" />
        <Metric :record="{
            label: 'Outstanding',
            value: report.outstanding,
            icon: OUTSTANDING_ICON,
            isReady: !loading,
            color: 'error',
            subtle: 'Unpaid fees for the current term'
        }" />
    </div>
</template>
<script lang="ts" setup>
const loading = ref(true)
const { format } = useMoney()

const report = ref<{
    students: string
    expected: string
    outstanding: string
    collected: string
}>({
    students: "0",
    expected: "0",
    collected: "0",
    outstanding: "0"
})

async function fetchRecord() {
    loading.value = true
    // Counts are the totals of the same lists shown below (a 1-row page is enough to get them). Money comes from the
    // same summary as the Fees reports: this academic year, net of discounts, without the
    // Skultem platform fee (that isn't the school's money), and outstanding added up fee by fee.
    const [studentRes, money] = await Promise.all([
        StudentApi().getAll('', 1, 1).catch(() => null),
        FeeReportApi().getDashboard().catch(() => null)
    ])

    const students = Number(studentRes?.meta?.total ?? 0)

    report.value = {
        students: students.toString(),
        collected: format(money?.totalCollected ?? 0),
        expected: format(money?.totalExpected ?? 0),
        outstanding: format(money?.totalOutstanding ?? 0)
    }
    loading.value = false
}

onMounted(async () => await fetchRecord())
</script>
