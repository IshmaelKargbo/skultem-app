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
  { label: 'Transactions', to: '/transactions', icon: LEDGER_ICON, exact: true },
  { label: 'Student Ledger', to: '/transactions/student-ledger', icon: LEDGER_ICON }
]
</script>
