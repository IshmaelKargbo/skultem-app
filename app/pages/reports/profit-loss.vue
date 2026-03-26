<template>
  <div class="p-7 h-full space-y-5 overflow-y-auto">
    <div class="flex justify-between items-center border-gray-200">
      <div class="space-y-1">
        <p class="text-2xl font-semibold">Financial Reports</p>
        <p class="text-mute">Comprehensive financial analytics and reports</p>
      </div>
    </div>
    <UCard>
      <div class="flex space-x-5">
        <UInput type="date" />
        <UInput type="date" />
        <USelectMenu placeholder="Select Type" />
        <USelectMenu placeholder="Select Class" />
        <USelectMenu placeholder="Select Term" />
      </div>
    </UCard>
    <div class="grid gap-3 grid-cols-4">
      <UCard>
        <div class="flex space-x-3 items-center">
          <UAvatar class="bg-info-50 border border-info-200" :icon="REPORT_ICON" size="2xl" />
          <div class="space-y-0.5">
            <p class="text-xs text-mute">Revenue by Class</p>
            <p>Download Report</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex space-x-3 items-center">
          <UAvatar class="bg-success-50 border border-success-200" :icon="IMPROVED_ICON" size="2xl" />
          <div class="space-y-0.5">
            <p class="text-xs text-mute">Revenue by Term</p>
            <p>Download Report</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex space-x-3 items-center">
          <UAvatar class="bg-error-50 border border-error-200" :icon="PAYMENT_ICON" size="2xl" />
          <div class="space-y-0.5">
            <p class="text-xs text-mute">Outstanding Fees</p>
            <p>Download Report</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex space-x-3 items-center">
          <UAvatar class="bg-purple-50 border border-purple-200" :icon="STUDENT_FEES_ICON" size="2xl" />
          <div class="space-y-0.5">
            <p class="text-xs text-mute">Profit & Loss</p>
            <p>Download Report</p>
          </div>
        </div>
      </UCard>
    </div>
    <Tab :tabs="[
      { label: 'Revenue Analysis', to: '/reports', exact: true },
      { label: 'Outstanding Fees', to: '/reports/outstanding' },
      { label: 'Expense Report', to: '/reports/expense' },
      { label: 'Payment History', to: '/reports/history' },
      { label: 'Profit & Loss', to: '/reports/profit-loss' }
    ]" />
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