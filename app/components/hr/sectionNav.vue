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
  { label: 'Teacher Attendance', to: '/hr/teacher-attendance', icon: ATTENDANCE_ICON, exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Clock In / Out', to: '/hr/teacher-attendance/clock-in', icon: 'i-lucide-log-in', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER] },
  { label: 'Leave', to: '/hr/leave', icon: LAYERS_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
