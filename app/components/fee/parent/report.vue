<script lang="ts" setup>
const { student } = defineProps<{
    student: string
}>()

const widgetStore = useWidgetStore()
const { loading } = storeToRefs(widgetStore)
const { format } = useMoney()

const report = ref<{
    paid: string
    pending: string
    overdue: string
}>({
    paid: "0",
    pending: "0",
    overdue: "0"
})

async function fetchRecord() {
    if (!student) return

    const today = new Date().toISOString().split("T")[0]

    const [payments, pendingRes, overdueRes] = await Promise.all([
        widgetStore.runAnalytic({
            entity: "fees",
            title: "Fee Paid",
            filters: [
                {
                    field: "student.id",
                    value: student,
                    operator: "EQUALS",
                    type: "select"
                }
            ],
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
            filters: [
                {
                    field: "student.id",
                    value: student,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: "fee.dueDate",
                    value: today,
                    operator: "GREATER_THAN_OR_EQUAL",
                    type: "date"
                }
            ],
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

        widgetStore.runAnalytic({
            entity: "fees",
            title: "Overdue Fees",
            filters: [
                {
                    field: "student.id",
                    value: student,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: "fee.dueDate",
                    value: today,
                    operator: "LESS_THAN",
                    type: "date"
                }
            ],
            metrics: [
                {
                    name: "Overdue",
                    aggregation: "sum",
                    field: "amount",
                    tags: { field: "status", value: "Pending" }
                }
            ],
            chartType: "bar"
        }, 1, 10)
    ])

    const paidDatasets = payments?.data?.datasets ?? []
    const pendingDatasets = pendingRes?.data?.datasets ?? []
    const overdueDatasets = overdueRes?.data?.datasets ?? []

    const paid = paidDatasets.find((e: any) => e.label === "Paid")
    const partial = paidDatasets.find((e: any) => e.label === "Partial")

    const pendingPartial = pendingDatasets.find((e: any) => e.label === "Partial")
    const pendingPaid = pendingDatasets.find((e: any) => e.label === "Paid")
    const pendingTotal = pendingDatasets.find((e: any) => e.label === "Total")

    const pendingPaidTotal = Number(pendingPaid?.data?.[0] ?? 0) + Number(pendingPartial?.data?.[0] ?? 0)
    const totalPending = Number(pendingTotal?.data?.[0] ?? 0) - pendingPaidTotal

    const overdue = overdueDatasets.find((e: any) => e.label === "Overdue")

    const totalPaid =
        Number(paid?.data?.[0] ?? 0) +
        Number(partial?.data?.[0] ?? 0)

    report.value = {
        paid: format(totalPaid),
        pending: format(Number(totalPending)),
        overdue: format(Number(overdue?.data?.[0] ?? 0))
    }
}

watch(() => student, fetchRecord, { immediate: true })
</script>
<template>
    <div class="grid gap-3 grid-cols-3">
        <Metric :record="{
            label: 'Total Paid',
            icon: PAYMENT_ICON,
            value: report?.paid,
            isReady: !loading,
            color: 'success',
            subtle: 'This academic year'
        }" />
        <Metric :record="{
            label: 'Pending',
            icon: PENDING_ICON,
            value: report?.pending,
            isReady: !loading,
            color: 'info',
            subtle: 'Upcoming payments'
        }" />
        <Metric :record="{
            label: 'Due Amount',
            icon: OVERDUE_ICON,
            value: report?.overdue,
            isReady: !loading,
            color: 'error',
            subtle: 'Requires attention'
        }" />
    </div>
</template>
