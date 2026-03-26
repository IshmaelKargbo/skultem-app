<template>
    <div class="grid gap-5 grid-cols-4">
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
const widgetStore = useWidgetStore()
const { loading } = storeToRefs(widgetStore)
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
    const [studentRes, paymentRes, pendingRes] = await Promise.all([
        widgetStore.runAnalytic({
            entity: "students",
            title: "Total Student",
            filters: [],
            metrics: [
                {
                    name: "Total",
                    aggregation: "count"
                }
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
    const studentsDatasets = studentRes?.data?.datasets ?? []

    const paid = paidDatasets.find((e: any) => e.label === "Paid")
    const totalStudentRow = studentsDatasets.find((e: any) => e.label === "Total")
    const partial = paidDatasets.find((e: any) => e.label === "Partial")

    const pendingPartial = pendingDatasets.find((e: any) => e.label === "Partial")
    const pendingPaid = pendingDatasets.find((e: any) => e.label === "Paid")
    const pendingTotal = pendingDatasets.find((e: any) => e.label === "Total")

    const pendingPaidTotal = Number(pendingPaid?.data?.[0] ?? 0) + Number(pendingPartial?.data?.[0] ?? 0)
    const expectedAmount =  Number(pendingTotal?.data?.[0] ?? 0)
    const totalPending = Number(pendingTotal?.data?.[0] ?? 0) - pendingPaidTotal
    const totalStudent = Number(totalStudentRow?.data?.[0] ?? 0)

    const totalPaid =
        Number(paid?.data?.[0] ?? 0) +
        Number(partial?.data?.[0] ?? 0)

    report.value = {
        students: totalStudent.toString(),
        collected: format(totalPaid),
        expected: format(expectedAmount),
        outstanding: format(totalPending)
    }
}

onMounted(async () => await fetchRecord())
</script>