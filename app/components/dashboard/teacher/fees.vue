<template>
    <Metric :record="{
        label: 'Fee\'s Balance',
        color: 'primary',
        value: `${balance}`,
        isReady: isReady,
        icon: FEE_STRUCTURE_ICON,
        subtle: 'Outstanding Balance'
    }" />
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { id } = defineProps<{
    id: string
}>()

const { format } = useMoney()
const isReady = ref(false)
const balance = ref("0.0")

async function fetchRecord() {
    if (id == "" || id == null) return

    const [payments] = await Promise.all([
        store.runAnalytic({
            entity: "fees",
            title: "Fee Paid",
            filters: [
                {
                    field: "student.id",
                    value: id,
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
                },
                {
                    name: "Total",
                    aggregation: "sum",
                    field: "amount",
                }
            ],
            chartType: "bar"
        }, 1, 10),
    ])

    const datasets = payments?.datasets ?? []

    const paid = datasets.find((e: any) => e.label === "Paid")
    const partial = datasets.find((e: any) => e.label === "Partial")
    const total = datasets.find((e: any) => e.label === "Total")

    const totalPaid =
        Number(paid?.data?.[0] ?? 0) +
        Number(partial?.data?.[0] ?? 0)

    balance.value = format(Number(total?.data?.[0] ?? 0) - totalPaid)

    isReady.value = true
}

watch(() => id, async () => {
    await fetchRecord()
}, { immediate: true })
</script>