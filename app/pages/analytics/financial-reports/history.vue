<template>
  <div class="p-4 sm:p-6 lg:p-7 h-full space-y-4 sm:space-y-5 overflow-y-auto">
    <ReportHeader />
    <ReportAccountantTable />
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
