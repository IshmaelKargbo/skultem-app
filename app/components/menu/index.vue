<template>
  <UCard class="h-full flex flex-col" :ui="{
    body: 'flex-1 overflow-y-auto sm:p-0',
    footer: 'sm:p-5',
    header: 'sm:p-5'
  }">
    <!-- Header (fixed height) -->
    <template #header>
      <div class="flex items-center">
        <NuxtLink to="/" class="block dark:hidden">
          <img src="/menu-dark.svg" alt="Skultem" class="h-7" />
        </NuxtLink>

        <NuxtLink to="/" class="hidden dark:block">
          <img src="/menu-light.svg" alt="Skultem" class="h-7" />
        </NuxtLink>
      </div>
    </template>

    <!-- Scrollable Body -->
    <div class="h-full overflow-y-auto p-5">
      <ul class="space-y-2">
        <li v-for="item in visibleNavItems" :key="item.label + (item.to ?? '')">
          <MenuItem :label="item.label" :to="item.to" :exact="item.exact" :subNavs="item.subNavs">
            <template #icon>
              <UIcon class="w-5 h-5" :name="item.icon" />
            </template>

            <template v-if="item.subNavs" #subNav="{ subNavs, isActiveSub }">
              <div class="flex flex-col space-y-1">
                <NuxtLink v-for="nav in subNavs.filter((n: SubNavItem) => !n.roles || can(n.roles))" :key="nav.to"
                  :to="nav.to" :exact="nav.exact"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                  :class="isActiveSub(nav)
                    ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-200'
                    : 'text-gray-700 dark:text-gray-300'">
                  <UIcon v-if="nav.icon" :name="nav.icon" class="w-4 h-4 shrink-0" />
                  <span>{{ nav.label }}</span>
                </NuxtLink>
              </div>
            </template>
          </MenuItem>
        </li>
      </ul>
    </div>
    <template #footer>
      <MenuNoticeBoard />
    </template>
  </UCard>
</template>

<script setup lang="ts">
interface SubNavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
  roles?: Role[]
}

interface NavItem {
  label: string
  to?: string
  icon: string
  exact?: boolean
  roles?: Role[]
  subNavs?: SubNavItem[]
}

const { can } = useAuth()
const { isClassMaster, ensureLoaded: ensureClassMasterLoaded } = useClassMaster()

onMounted(() => {
  ensureClassMasterLoaded()
})

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', exact: true, icon: DASHBOARD_ICON },

  {
    label: 'Attendance', to: '/attendance', icon: ATTENDANCE_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER, Role.PARENT]
  },

  { label: 'Grade', to: '/grades', icon: GRADES_ICON, roles: [Role.TEACHER] },

  {
    label: 'Timetable', to: '/timetable', icon: TIMETABLE_ICON,
    roles: [Role.TEACHER, Role.PARENT]
  },

  { label: 'Behaviours', to: '/behaviours', icon: BEHAVIOUR_ICON, roles: [Role.TEACHER] },

  { label: 'Performance', to: '/performance', icon: PERFORMANCE_ICON, roles: [Role.PARENT] },

  {
    label: 'Students', to: '/students', icon: STUDENT_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT]
  },

  {
    label: 'Teachers', to: '/teachers', icon: TEACHER_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
  },

  {
    label: 'Classes', to: '/classes', icon: CLASS_ICON,
    roles: [Role.ACCOUNTANT,]
  },

  {
    label: 'Subjects', to: '/subjects', icon: SUBJECT_ICON,
    roles: [Role.TEACHER,]
  },

  {
    label: 'Parents', to: '/parents', icon: PARENT_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT]
  },
  {
    label: 'Curriculums', to: '/curriculums', icon: CURRICULUM_ICON,
    roles: [Role.TEACHER]
  },
  {
    label: 'Classes', icon: CLASS_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR],
    subNavs: [
      { label: 'Classes', to: '/classes', icon: CLASS_ICON, exact: true },
      { label: 'Sections', to: '/classes/sections', icon: LAYERS_ICON },
      { label: 'Streams', to: '/classes/streams', icon: CURRICULUM_STREAM_ICON },
    ]
  },
  {
    label: 'Subjects', icon: SUBJECT_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR],
    subNavs: [
      { label: 'Subjects', to: '/subjects', icon: SUBJECT_ICON, exact: true },
      { label: 'Teacher Assignment', to: '/subjects/teacher-assignment', icon: TEACHER_ICON },
      { label: 'Subject Groups', to: '/subjects/subject-groups', icon: CURRICULUM_GROUP_ICON },
      { label: 'Class Subjects', to: '/subjects/class-subjects', icon: BOOK_OPEN_ICON },
      { label: 'Stream Subjects', to: '/subjects/stream-subjects', icon: BOOK_OPEN_ICON },
    ]
  },
  {
    label: 'Grades', icon: GRADES_ASSIGN_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Grades', to: '/grades', icon: GRADES_ASSIGN_ICON, exact: true },
      { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON },
    ]
  },

  {
    label: 'Behaviours', icon: BEHAVIOUR_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Behaviours', to: '/behaviours', icon: BEHAVIOUR_ICON, exact: true },
      { label: 'Category', to: '/behaviours/category', icon: CATEGORY_ICON },
    ]
  },

  {
    label: 'Curriculums', icon: SCHEME_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Scheme of Work', to: '/curriculums', icon: SCHEME_ICON, exact: true },
      {
        label: 'Teacher Progress', to: '/curriculums/teacher-progress', icon: TEACHER_ICON,
        roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
      },
    ]
  },

  {
    label: 'Timetable', icon: TIMETABLE_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Timetable', to: '/timetable', icon: TIMETABLE_ICON, exact: true },
      { label: 'Settings', to: '/timetable/setting', icon: TIMETABLE_SETTINGS_ICON },
    ]
  },

  {
    label: 'Communicate', icon: COMMUNICATE_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT],
    subNavs: [
      { label: 'Notice Board', to: '/communicate', icon: NOTICE_ICON, exact: true },
      { label: 'Events & Holidays', to: '/communicate/events', icon: EVENT_ICON },
      { label: 'Notifications', to: '/communicate/notifications', icon: BELL_ICON },
      {
        label: 'Compose Broadcast', to: '/communicate/broadcast', icon: BROADCAST_ICON, exact: true,
        roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
      },
      {
        label: 'Broadcast History', to: '/communicate/broadcast/history', icon: BROADCAST_HISTORY_ICON,
        roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
      },
    ]
  },

  {
    label: 'ID Cards', icon: ID_CARD_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'ID Cards', to: '/id-cards', icon: ID_CARD_ICON, exact: true },
      { label: 'Card Design', to: '/id-cards/settings', icon: SETTINGS_ICON },
    ]
  },

  {
    label: 'Report Cards', icon: REPORT_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Report Cards', to: '/report-cards', icon: REPORT_ICON, exact: true },
      { label: 'Generate', to: '/report-cards/generate', icon: GENERATE_ICON },
      { label: 'Design', to: '/report-cards/templates', icon: SETTINGS_ICON },
    ]
  },

  { label: 'Fees', to: '/fees', icon: PAYMENT_ICON, roles: [Role.PARENT, Role.TEACHER] },

  {
    label: 'Fees & Payments', icon: PAYMENT_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT],
    subNavs: [
      { label: 'Fees', to: '/fees-payment', icon: STUDENT_FEES_ICON, exact: true },
      { label: 'Payments', to: '/fees-payment/pay', icon: PAYMENT_ICON },
      { label: 'Discounts', to: '/fees-payment/discounts', icon: DISCOUNT_ICON },
      { label: 'Structures', to: '/fees-payment/structure', icon: FEE_STRUCTURE_ICON },
      { label: 'Category', to: '/fees-payment/category', icon: CATEGORY_ICON },
      {
        label: 'Receipt Design', to: '/fees-payment/receipt-design', icon: SETTINGS_ICON,
        roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
      },
    ]
  },

  {
    label: 'Expenses', icon: EXPENSES_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT],
    subNavs: [
      { label: 'Expenses', to: '/expenses', icon: EXPENSES_ICON, exact: true },
      { label: 'Category', to: '/expenses/category', icon: CATEGORY_ICON },
    ]
  },

  {
    label: 'Transactions', icon: TRANSACTION_ICON,
    roles: [Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT],
    subNavs: [
      { label: 'Transactions', to: '/transactions/', icon: LEDGER_ICON, exact: true },
      { label: 'Student Ledger', to: '/transactions/student-ledger', icon: LEDGER_ICON },
    ]
  },

  {
    label: 'Analytics', icon: REPORT_ICON,
    roles: [Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT],
    subNavs: [
      // { label: 'Reports', to: '/analytics', icon: REPORT_ICON, exact: true },
      { label: 'Financial Reports', to: '/analytics/financial-reports', icon: SCHEME_ICON },
    ]
  },

  {
    label: 'Analytics', icon: SCHEME_ICON, roles: [Role.ADMIN],
    subNavs: [
      { label: 'Reports', to: '/analytics/', icon: REPORT_ICON },
    ]
  },

  {
    label: 'System Admin', icon: 'i-lucide-shield-check', roles: [Role.SYSTEM_ADMIN],
    subNavs: [
      // Each school's platform fee is set from its row in the Dashboard's schools table now
      // (see SystemAdminPlatformFeeModal) - no longer a single global amount with its own page.
      { label: 'Dashboard', to: '/system-admin', icon: 'i-lucide-layout-dashboard', exact: true },
      { label: 'Users', to: '/system-admin/users', icon: USERS_ICON },
    ]
  },
  {
    // HR and Payroll used to be two separate nav sections with a lot of overlap (staff,
    // payroll summary, leave). Merged into one "Payroll" section - Teacher Attendance and
    // Leave still live at their original /hr/* routes, just grouped here now.
    // Top-level group is visible to teachers/accountants too (for self-service Clock In/Out and
    // Leave below), but most sub-items are still admin-only - each one carries its own roles
    // override for that. Leave gets an explicit override now too, so adding Accountant up here
    // for Clock In/Out doesn't also silently change who could already see Leave.
    label: 'Payroll', icon: 'i-lucide-wallet', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER],
    subNavs: [
      { label: 'Overview', to: '/payroll', icon: 'i-lucide-layout-dashboard', exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Salary Structure', to: '/payroll/salaries', icon: 'i-lucide-banknote', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Payroll Runs', to: '/payroll/runs', icon: 'i-lucide-history', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Payslip Design', to: '/payroll/payslip-design', icon: 'i-lucide-palette', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Teacher Attendance', to: '/hr/teacher-attendance', icon: ATTENDANCE_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Clock In / Out', to: '/hr/teacher-attendance/clock-in', icon: 'i-lucide-log-in', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER] },
      { label: 'Leave', to: '/hr/leave', icon: LAYERS_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
      { label: 'Payslips', to: '/payroll/history', icon: 'i-lucide-receipt', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
    ]
  },
  {
    label: 'Athletic House', icon: ATHLETIC_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT],
    subNavs: [
      { label: 'Management', to: '/athletic-house', icon: ATHLETIC_ICON, exact: true },
      { label: 'House', to: '/athletic-house/house', icon: CATEGORY_ICON },
    ]
  },
  {
    label: 'Materials & Supplies', icon: MATERIAL_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Materials', to: '/material', icon: MATERIAL_ICON, exact: true },
      { label: 'Supplies', to: '/material/supply', icon: CURRICULUM_GROUP_ICON },
      { label: 'Category', to: '/material/category', icon: CATEGORY_ICON },
    ]
  },

  {
    label: 'Academics', icon: ACADEMIC_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Academic Year', to: '/academics', icon: CALANDA_ICON, exact: true },
      { label: 'Terms', to: '/academics/terms', icon: TERM_ICON },
      { label: 'Template', to: '/academics/assessment-templates', icon: TEMPLATE_ICON },
      { label: 'Academic Cycle', to: '/academics/assessment-cycle', icon: CYCLE_ICON },
      { label: 'Grade Scale', to: '/academics/grade-scale', icon: GRADE_ICON },
      { label: 'Promotions', to: '/academics/promotions', icon: PROMOTE_STUDENTS_ICON },
    ]
  },
  {
    label: 'Auth', icon: AUTH_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Users', to: '/auth', icon: USERS_ICON, exact: true },
      { label: 'Audits', to: '/auth/audits', icon: AUDIT_ICON },
      { label: 'Sessions', to: '/auth/sessions', icon: SESSIONS_ICON },
    ]
  },
]

const visibleNavItems = computed(() =>
  navItems
    .filter((item) => !item.roles || can(item.roles))
    .map((item) => {
      // Only a class master has anything to approve - a subject-only teacher's "Grade" link
      // stays a single shortcut to grade entry, not a group with an always-empty approval list.
      if (item.label === 'Grade' && item.to === '/grades' && can(Role.TEACHER) && isClassMaster.value) {
        return {
          label: 'Grade',
          icon: item.icon,
          roles: item.roles,
          subNavs: [
            { label: 'Grade Assignment', to: '/grades', icon: GRADES_ICON, exact: true },
            { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON },
          ]
        }
      }
      return item
    })
)
</script>
