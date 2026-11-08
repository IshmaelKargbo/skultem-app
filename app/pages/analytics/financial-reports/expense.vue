<template>
  <div class="px-4 md:px-6 space-y-3">
    <GuideBar topic="fin-report-expense" />
    <ReportHeader :show-filter="false" />
    <UCard data-guide="fr-expense-chart">
      <WidgetExpenseCategory />
    </UCard>
  </div>
</template>

<script lang="ts" setup>
onMounted(() => {
  useAppStore().setTitle('Reports')
  document.title = 'Reports | Skultem'
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
