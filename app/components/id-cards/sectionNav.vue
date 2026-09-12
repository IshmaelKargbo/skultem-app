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
  { label: 'ID Cards', to: '/id-cards', icon: ID_CARD_ICON, exact: true },
  { label: 'Card Design', to: '/id-cards/settings', icon: SETTINGS_ICON }
]
</script>
