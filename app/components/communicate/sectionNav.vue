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
  { label: 'Notice Board', to: '/communicate', icon: NOTICE_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT] },
  { label: 'Events & Holidays', to: '/communicate/events', icon: EVENT_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT] },
  { label: 'Notifications', to: '/communicate/notifications', icon: BELL_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT] },
  { label: 'Compose Broadcast', to: '/communicate/broadcast', icon: BROADCAST_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER] },
  { label: 'Broadcast History', to: '/communicate/broadcast/history', icon: BROADCAST_HISTORY_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
