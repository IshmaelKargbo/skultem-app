<template>
  <div class="px-4 md:px-6 space-y-4">
    <ReportHeader :show-filter="false" />
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
