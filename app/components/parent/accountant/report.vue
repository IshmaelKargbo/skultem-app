<template>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <Metric :record="{
            label: 'Total Parents',
            value: report.parents,
            icon: PARENT_ICON,
            isReady: !loading,
            subtle: 'Parents linked to students',
            color: 'info'
        }" />
        <Metric :record="{
            label: 'Total Children',
            value: report.students,
            icon: STUDENT_ICON,
            isReady: !loading,
            color: 'primary',
            subtle: 'All enrolled students'
        }" />
        <Metric :record="{
            label: 'Total Expected',
            value: report.expected,
            icon: COLLETED_ICON,
            isReady: !loading,
            color: 'error',
            subtle: 'Total fees expected from parents'
        }" />
        <Metric :record="{
            label: 'Total Collected',
            value: report.collected,
            icon: OUTSTANDING_ICON,
            isReady: !loading,
            color: 'success',
            subtle: 'Payments received from parents'
        }" />
    </div>
</template>
<script lang="ts" setup>
const loading = ref(true)
const { format } = useMoney()

const report = ref<{
    parents: string
    students: string
    expected: string
    outstanding: string
    collected: string
}>({
    parents: "0",
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
    const [studentRes, parentRes, money] = await Promise.all([
        StudentApi().getAll('', 1, 1).catch(() => null),
        ParentApi().getAll(1, 1).catch(() => null),
        FeeReportApi().getDashboard().catch(() => null)
    ])

    const students = Number(studentRes?.meta?.total ?? 0)
    const parents = Number(parentRes?.meta?.total ?? 0)

    report.value = {
        parents: parents.toString(),
        students: students.toString(),
        collected: format(money?.totalCollected ?? 0),
        expected: format(money?.totalExpected ?? 0),
        outstanding: format(money?.totalOutstanding ?? 0)
    }
    loading.value = false
}

onMounted(async () => await fetchRecord())
</script>
