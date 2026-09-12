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

// Spans both /payroll/* and /hr/* routes - matches the sidebar's single "Payroll" group exactly,
// role-for-role against each page's own definePageMeta.
const allItems: NavItem[] = [
  { label: 'Overview', to: '/payroll', icon: 'i-lucide-layout-dashboard', exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Salary Structure', to: '/payroll/salaries', icon: 'i-lucide-banknote', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Salary Templates', to: '/payroll/salary-templates', icon: 'i-lucide-layout-template', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Payroll Runs', to: '/payroll/runs', icon: 'i-lucide-history', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Payslip Design', to: '/payroll/payslip-design', icon: 'i-lucide-palette', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Teacher Attendance', to: '/hr/teacher-attendance', icon: ATTENDANCE_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
  { label: 'Clock In / Out', to: '/hr/teacher-attendance/clock-in', icon: 'i-lucide-log-in', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER] },
  { label: 'Leave', to: '/hr/leave', icon: LAYERS_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
  { label: 'Payslips', to: '/payroll/history', icon: 'i-lucide-receipt', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] }
]

const items = computed(() => allItems.filter(item => can(item.roles)))
</script>
