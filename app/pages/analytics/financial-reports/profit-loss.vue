<template>
  <div class="p-4 sm:p-6 lg:p-7 h-full space-y-4 sm:space-y-5 overflow-y-auto">
    <ReportHeader :show-filter="false" />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Metric :record="{
        icon: TOTAL_REVENUE,
        color: 'success',
        label: 'Total Revenue',
        value: format(totals.revenue),
        isReady
      }" />
      <Metric :record="{
        icon: TOTAL_EXPENSES,
        color: 'error',
        label: 'Total Expenses',
        value: format(totals.expenses),
        isReady
      }" />
      <Metric :record="{
        icon: TOTAL_PROFIT,
        color: 'info',
        label: 'Total Profit',
        value: format(totals.profit),
        isReady
      }" />
    </div>
    <UCard>
      <WidgetProfitLossSummary @totals="onTotals" />
    </UCard>
  </div>
</template>

<script lang="ts" setup>
const { format } = useMoney()

const isReady = ref(false)
const totals = ref({ revenue: 0, expenses: 0, profit: 0 })

function onTotals(value: { revenue: number, expenses: number, profit: number }) {
  totals.value = value
  isReady.value = true
}

onMounted(() => {
  useAppStore().setTitle('Reports')
  document.title = 'Reports | Skultem'
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
