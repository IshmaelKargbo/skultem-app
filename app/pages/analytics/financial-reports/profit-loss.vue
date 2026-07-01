<template>
  <div class="p-4 sm:p-6 lg:p-7 h-full space-y-4 sm:space-y-5 overflow-y-auto">
    <ReportHeader />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Metric :record="{
        icon: TOTAL_REVENUE,
        color: 'success',
        label: 'Total Revenue',
        value: 'NLE 250,000',
        isReady: true
      }" />
      <Metric :record="{
        icon: TOTAL_EXPENSES,
        color: 'error',
        label: 'Total Expenses',
        value: 'NLE 250,000',
        isReady: true
      }" />
      <Metric :record="{
        icon: TOTAL_PROFIT,
        color: 'info',
        label: 'Total Profit',
        value: 'NLE 250,000',
        isReady: true
      }" />
    </div>
    <UCard>
      <WidgetProfitLossSummary />
    </UCard>
  </div>
</template>

<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Reports')
  document.title = 'Reports | Skultem'
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
