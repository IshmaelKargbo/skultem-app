<template>
  <div class="p-4 sm:p-6 lg:p-7 h-full space-y-4 sm:space-y-5 overflow-y-auto">
    <ReportHeader />
    <div class="grid md:grid-cols-2 grid-cols-1 gap-5">
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
  role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
