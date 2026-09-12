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
  { label: 'Expenses', to: '/expenses', icon: EXPENSES_ICON, exact: true },
  { label: 'Category', to: '/expenses/category', icon: CATEGORY_ICON }
]
</script>
