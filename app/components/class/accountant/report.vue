<template>
    <div class="grid gap-5 grid-cols-4">
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
const widgetStore = useWidgetStore()
const { loading } = storeToRefs(widgetStore)
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

    const [studentRes, classRes, paymentRes, pendingRes] = await Promise.all([
        widgetStore.runAnalytic({
            entity: "students",
            title: "Total Student",
            filters: [],
            metrics: [
                { name: "Total", aggregation: "count" }
            ],
            chartType: "bar"
        }, 1, 10),

        widgetStore.runAnalytic({
            entity: "classes",
            title: "Total Class",
            filters: [],
            metrics: [
                { name: "Total", aggregation: "count" }
            ],
            chartType: "bar"
        }, 1, 10),

        widgetStore.runAnalytic({
            entity: "fees",
            title: "Fee Paid",
            filters: [],
            metrics: [
                {
                    name: "Paid",
                    aggregation: "sum",
                    field: "amountPaid",
                    tags: { field: "status", value: "Paid" }
                },
                {
                    name: "Partial",
                    aggregation: "sum",
                    field: "amountPaid",
                    tags: { field: "status", value: "Partial" }
                }
            ],
            chartType: "bar"
        }, 1, 10),

        widgetStore.runAnalytic({
            entity: "fees",
            title: "Pending Fees",
            filters: [],
            metrics: [
                {
                    name: "Paid",
                    aggregation: "sum",
                    field: "amount",
                    tags: { field: "status", value: "Paid" }
                },
                {
                    name: "Partial",
                    aggregation: "sum",
                    field: "amountPaid",
                    tags: { field: "status", value: "Partial" }
                },
                {
                    name: "Total",
                    aggregation: "sum",
                    field: "amount"
                }
            ],
            chartType: "bar"
        }, 1, 10),
    ])

    const paidDatasets = paymentRes?.data?.datasets ?? []
    const pendingDatasets = pendingRes?.data?.datasets ?? []
    const classDatasets = classRes?.data?.datasets ?? []
    const studentsDatasets = studentRes?.data?.datasets ?? []

    const paid = paidDatasets.find((e:any) => e.label === "Paid")
    const partial = paidDatasets.find((e:any) => e.label === "Partial")

    const totalStudentRow = studentsDatasets.find((e:any) => e.label === "Total")
    const totalClassRow = classDatasets.find((e:any) => e.label === "Total")

    const pendingPartial = pendingDatasets.find((e:any) => e.label === "Partial")
    const pendingPaid = pendingDatasets.find((e:any) => e.label === "Paid")
    const pendingTotal = pendingDatasets.find((e:any) => e.label === "Total")

    const totalStudent = Number(totalStudentRow?.data?.[0] ?? 0)
    const totalClass = Number(totalClassRow?.data?.[0] ?? 0)

    const totalPaid =
        Number(paid?.data?.[0] ?? 0) +
        Number(partial?.data?.[0] ?? 0)

    const pendingPaidTotal =
        Number(pendingPaid?.data?.[0] ?? 0) +
        Number(pendingPartial?.data?.[0] ?? 0)

    const expectedAmount = Number(pendingTotal?.data?.[0] ?? 0)

    const totalPending = expectedAmount - pendingPaidTotal

    // Collection Rate Calculation
    const collectionRate =
        expectedAmount > 0
            ? ((totalPaid / expectedAmount) * 100).toFixed(1)
            : "0"

    report.value = {
        classes: totalClass.toString(),
        students: totalStudent.toString(),
        expected: format(expectedAmount),
        outstanding: format(totalPending),
        collectedRate: `${collectionRate}%`
    }
}

onMounted(fetchRecord)
</script>