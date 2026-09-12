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
  { label: 'Management', to: '/athletic-house', icon: ATHLETIC_ICON, exact: true },
  { label: 'House', to: '/athletic-house/house', icon: CATEGORY_ICON }
]
</script>
