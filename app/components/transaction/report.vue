<template>
  <div class="grid gap-5 grid-cols-3">
    <Metric v-for="metric in metrics" :key="metric.label" :record="metric" />
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(true)
const store = useWidgetStore()
const { format } = useMoney()

type LedgerReportDTO = {
  totalDebit: number
  totalCredit: number
  netBalance: number
}

const report = ref<LedgerReportDTO>({
  totalDebit: 0,
  totalCredit: 0,
  netBalance: 0
})

const metrics = computed(() => [
  {
    label: "Total Debit",
    value: format(report.value.totalDebit),
    icon: DEBIT_ICON,
    color: "error",
    subtle: "Cash outflow",
    isReady: !isLoading.value
  },
  {
    label: "Total Credit",
    value: format(report.value.totalCredit),
    icon: CREDIT_ICON,
    color: "success",
    subtle: "Cash inflow",
    isReady: !isLoading.value
  },
  {
    label: "Transactions Ledger",
    value: format(report.value.netBalance),
    icon: NET_ICON,
    color: "info",
    subtle: "Net cash position",
    isReady: !isLoading.value
  }
])

async function fetchRecord() {
  isLoading.value = true

  const res = await store.runAnalytic(
    {
      entity: "transactions",
      title: "Transaction Ledger",
      filters: [],
      metrics: [
        { field: "amount", aggregation: "sum", name: "Debit", tags: { value: "DEBIT", field: "direction" } },
        { field: "amount", aggregation: "sum", name: "Credit", tags: { value: "CREDIT", field: "direction" } }
      ],
      chartType: "bar"
    },
    0,
    0
  )

  const datasets = res?.data?.datasets || []

  const debit = datasets.find((d: any) => d.label === "Debit")?.data?.[0] || 0
  const credit = datasets.find((d: any) => d.label === "Credit")?.data?.[0] || 0

  report.value = {
    totalDebit: debit,
    totalCredit: credit,
    netBalance: credit - debit
  }

  isLoading.value = false
}

defineExpose({
  fetchRecord
})

onMounted(fetchRecord)
</script>