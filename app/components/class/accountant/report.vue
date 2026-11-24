<template>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric :record="{
            label: 'Total Classes',
            value: report.classes,
            icon: CLASS_ICON,
            isReady: !loading,
            subtle: 'Active academic classes',
            color: 'info'
        }" />

        <Metric :record="{
            label: 'Total Students',
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
            subtle: 'Total fees expected'
        }" />

        <Metric :record="{
            label: 'Avg Collection Rate',
            value: report.collectedRate,
            icon: RATE_ICON,
            isReady: !loading,
            color: 'success',
            subtle: 'Percentage of expected fees collected'
        }" />
    </div>
</template>

<script lang="ts" setup>
const loading = ref(true)
const { format } = useMoney()

const report = ref<{
    classes: string
    students: string
    expected: string
    outstanding: string
    collectedRate: string
}>({
    classes: "0",
    students: "0",
    expected: "0",
    outstanding: "0",
    collectedRate: "0%"
})

async function fetchRecord() {
    loading.value = true
    // Counts are the totals of the same lists shown below (a 1-row page is enough to get them). Money comes from the
    // same summary as the Fees reports: this academic year, net of discounts, without the
    // Skultem platform fee (that isn't the school's money), and outstanding added up fee by fee.
    const [studentRes, classRes, money] = await Promise.all([
        StudentApi().getAll('', 1, 1).catch(() => null),
        ClassApi().getAllClassSessions(1, 1).catch(() => null),
        FeeReportApi().getDashboard().catch(() => null)
    ])

    const students = Number(studentRes?.meta?.total ?? 0)
    const classes = Number(classRes?.meta?.total ?? 0)

    report.value = {
        classes: classes.toString(),
        students: students.toString(),
        expected: format(money?.totalExpected ?? 0),
        outstanding: format(money?.totalOutstanding ?? 0),
        collectedRate: `${(money?.collectionRate ?? 0).toFixed(1)}%`
    }
    loading.value = false
}

onMounted(fetchRecord)
</script>
