<template>
  <div class="p-7 h-full space-y-5 overflow-y-auto">
    <ReportHeader />
    <div class="grid grid-cols-2 gap-5">
      <UCard>
        <WidgetRevenueClass />
      </UCard>
      <UCard>
        <WidgetMonthlyRevenueTrend />
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Reports')
  document.title = 'Reports | Skultem'
})

definePageMeta({
  role: [Role.ACCOUNTANT]
})
</script>