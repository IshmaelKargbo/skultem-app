<template>
  <template v-if="items.length > 1">
    <TabMobile class="md:hidden" :tabs="items" />
    <Tab class="hidden md:block" :tabs="items" />
  </template>
</template>

<script setup lang="ts">
const { can } = useAuth()

interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
  roles: Role[]
}

const allItems: NavItem[] = [
  { label: 'Report Cards', to: '/report-cards', icon: REPORT_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT] },
  // Only admins generate; class teachers review and approve on Report Cards.
  { label: 'Generate', to: '/report-cards/generate', icon: GENERATE_ICON, roles: [Role.ADMIN, Role.SUPER_ADMIN] },
  { label: 'Design', to: '/report-cards/templates', icon: SETTINGS_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },
  { label: 'Data Links', to: '/report-cards/data-links', icon: 'i-lucide-link', roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
