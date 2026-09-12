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
  { label: 'Materials', to: '/material', icon: MATERIAL_ICON, exact: true },
  { label: 'Supplies', to: '/material/supply', icon: CURRICULUM_GROUP_ICON },
  { label: 'Category', to: '/material/category', icon: CATEGORY_ICON }
]
</script>
