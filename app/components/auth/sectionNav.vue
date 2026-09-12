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
  { label: 'Users', to: '/auth', icon: USERS_ICON, exact: true },
  { label: 'Audits', to: '/auth/audits', icon: AUDIT_ICON },
  { label: 'Sessions', to: '/auth/sessions', icon: SESSIONS_ICON }
]
</script>
