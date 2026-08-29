<template>
  <div class="px-4 md:px-6 space-y-4">
    <ReportHeader :show-filter="false" />
    <UCard>
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
  role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
