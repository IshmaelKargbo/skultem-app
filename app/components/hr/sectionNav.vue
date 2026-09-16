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
  { label: 'Overview', to: '/hr', icon: 'i-lucide-layout-dashboard', exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Mark Attendance', to: '/hr/teacher-attendance', icon: ATTENDANCE_ICON, exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Daily Register', to: '/hr/teacher-attendance/daily-register', icon: DAILY_REGISTER_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Monthly Summary', to: '/hr/teacher-attendance/monthly-summary', icon: MONTHLY_SUMMARY_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Term Summary', to: '/hr/teacher-attendance/term-summary', icon: TERM_SUMMARY_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Management Reports', to: '/hr/teacher-attendance/management-reports', icon: INSPECTION_REPORT_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Clock In / Out', to: '/hr/teacher-attendance/clock-in', icon: 'i-lucide-log-in', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER] },
  { label: 'Leave', to: '/hr/leave', icon: LAYERS_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
