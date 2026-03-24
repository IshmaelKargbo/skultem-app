<template>
    <div class="grid gap-5 grid-cols-3">
        <Metric :record="{
            label: 'Total Revenue (This Term)',
            value: totalRevenue,
            subtle: '+12.5%',
            isReady: isReady,
            icon: 'fe:line-chart',
            color: 'success',
            subtileColor: 'success'
        }" />
        <Metric :record="{
            label: 'Total Revenue (This Month)',
            value: monthRevenue,
            subtle: '+12.5%',
            isReady: isReady,
            icon: ATTENDANCE_ICON,
            color: 'info',
            subtileColor: 'success'
        }" />
        <Metric :record="{
            label: 'Outstanding Fees',
            value: balance,
            subtle: '-5.3%',
            isReady: isReady,
            icon: 'ph:user-list',
            color: 'error',
            subtileColor: 'success'
        }" />
    </div>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { format } = useMoney()

const totalRevenue = ref("0.00")
const monthRevenue = ref("0.00")
const balance = ref("0.00")
const isReady = ref(false)

async function fetchRecord() {
    isReady.value = false
    try {
        const now = new Date()

        // Start of the month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        // End of the month (last day)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const [res, monthlys, payments] = await Promise.all([
            store.runAnalytic({
                entity: "payments",
                title: "Total Revenue (This Term)",
                filters: [],
                metrics: [
                    {
                        name: "Revenue",
                        aggregation: "sum",
                        field: "amount"
                    }
                ],
                chartType: "bar"
            }),
            store.runAnalytic({
                entity: "payments",
                title: "Total Revenue (This Month)",
                filters: [
                    {
                        field: "paidAt",
                        value: startOfMonth.toISOString().slice(0, 10),
                        valueTo: endOfMonth.toISOString().slice(0, 10),
                        operator: "BETWEEN",
                        type: "instant"
                    }
                ],
                metrics: [
                    {
                        name: "Monthly",
                        aggregation: "sum",
                        field: "amount"
                    }
                ],
                chartType: "bar"
            }),
            store.runAnalytic({
                entity: "fees",
                title: "Outstanding Fees",
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
                    },
                    {
                        name: "Total",
                        aggregation: "sum",
                        field: "amount",
                    }
                ],
                chartType: "bar"
            })
        ])
        const widget = res?.datasets ?? []

        const revenueDataset = widget.find((e: any) => e.label == 'Revenue')
        totalRevenue.value = format(revenueDataset.data[0] || 0)

        const monthlyDataset = monthlys?.datasets ?? []

        const monthlyRow = monthlyDataset.find((e: any) => e.label == 'Monthly')
        totalRevenue.value = format(monthlyRow.data[0] || 0)

        monthRevenue.value = format(revenueDataset.data[0] || 0)


        const datasets = payments?.datasets ?? []

        const paid = datasets.find((e: any) => e.label === "Paid")
        const partial = datasets.find((e: any) => e.label === "Partial")
        const total = datasets.find((e: any) => e.label === "Total")


        const totalPaid =
            Number(paid?.data?.[0] ?? 0) +
            Number(partial?.data?.[0] ?? 0)

        balance.value = format(Number(total?.data?.[0] ?? 0) - totalPaid)

        isReady.value = true
    } catch (err) {
        console.error("Failed to load revenue data", err)
    }
}

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>