<template>
  <div class="px-4 md:px-6 space-y-3">
    <GuideBar topic="fin-report-revenue" />
    <ReportHeader :show-filter="false" />
    <div class="grid md:grid-cols-2 grid-cols-1 gap-5">
      <UCard data-guide="fr-revenue-class">
        <WidgetRevenueClass />
      </UCard>
      <UCard data-guide="fr-revenue-trend">
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
  role: [Role.ACCOUNTANT, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR]
})
</script>
