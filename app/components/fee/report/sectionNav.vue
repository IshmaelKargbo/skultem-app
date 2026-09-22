<template>
  <TabMobile class="md:hidden" :tabs="items" />
  <Tab class="hidden md:block" :tabs="items" />
</template>

<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
}

const items: NavItem[] = [
  { label: 'Dashboard', to: '/fees-payment/reports', icon: 'i-lucide-layout-dashboard', exact: true },
  { label: 'Term Summary', to: '/fees-payment/reports/term-summary', icon: 'i-lucide-calendar-range' },
  { label: 'Student Balances', to: '/fees-payment/reports/student-balances', icon: 'i-lucide-users' },
  { label: 'Outstanding', to: '/fees-payment/reports/outstanding', icon: 'i-lucide-alert-triangle' },
  { label: 'Daily Collection', to: '/fees-payment/reports/daily-collection', icon: 'i-lucide-banknote' },
  { label: 'Payment History', to: '/fees-payment/reports/payment-history', icon: 'i-lucide-history' },
  { label: 'Payment Methods', to: '/fees-payment/reports/payment-methods', icon: 'i-lucide-wallet' },
]
</script>
