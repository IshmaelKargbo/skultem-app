<template>
  <div class="grid grid-cols-3 gap-5">
    <Metric :record="{
      label: 'Total Expenses',
      value: report.totalExpenses,
      icon: TOTAL_EXPENSES,
      isReady: !isLoading,
      subtle: 'Number of expense transactions',
      color: 'neutral'
    }" />

    <Metric :record="{
      label: 'Total Expenses Amount',
      value: report.total,
      icon: EXPENSES_ICON,
      isReady: !isLoading,
      subtle: 'Total amount spent by the school',
      color: 'error'
    }" />

    <Metric :record="{
      label: 'Current Balance',
      value: report.balance,
      icon: NET_ICON,
      isReady: !isLoading,
      subtle: 'Remaining school funds after expenses',
      color: 'primary'
    }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useWidgetStore()
const { format } = useMoney()

type ExpenseReport = {
  totalExpenses: number
  balance: string
  total: string
}

const isLoading = ref(true)

const report = ref<ExpenseReport>({
  totalExpenses: 0,
  balance: "NLE 0.00",
  total: "NLE 0.00"
})

async function fetchRecord() {
  try {
    isLoading.value = true

    const res = await store.runAnalytic(
      {
        entity: "transactions",
        title: "Expense Summary",
        filters: [],
        metrics: [
          {
            field: "amount",
            aggregation: "sum",
            name: "Debit",
            tags: { field: "direction", value: "DEBIT" }
          },
          {
            field: "amount",
            aggregation: "sum",
            name: "Credit",
            tags: { field: "direction", value: "CREDIT" }
          },
          {
            aggregation: "count",
            name: "Count",
            tags: { field: "direction", value: "DEBIT" }
          }
        ],
        chartType: "number"
      },
      0,
      0
    )

    const datasets = res?.data?.datasets || []

    const debit = datasets.find((d: any) => d.label === "Debit")?.data?.[0] || 0
    const credit = datasets.find((d: any) => d.label === "Credit")?.data?.[0] || 0
    const count = datasets.find((d: any) => d.label === "Count")?.data?.[0] || 0

    report.value.totalExpenses = count
    report.value.balance = format(credit - debit)
    report.value.total = format(debit)

  } catch (err) {
    console.error("Failed to fetch expense report", err)
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  fetchRecord
})

onMounted(fetchRecord)
</script>