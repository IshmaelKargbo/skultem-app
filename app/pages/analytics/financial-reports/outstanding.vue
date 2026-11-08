<template>
  <div class="px-4 md:px-6 space-y-3">
    <GuideBar topic="fin-report-outstanding" />
    <ReportHeader :show-filter="false" />
    <UCard data-guide="fr-outstanding-chart">
      <WidgetFeeCollectionClass title="Outstanding Fees by Class" />
    </UCard>
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
