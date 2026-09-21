<template>
  <UCard class="h-full flex flex-col" :ui="{
    body: 'flex-1 overflow-y-auto sm:p-0',
    footer: 'sm:p-3',
    header: 'sm:p-3'
  }">
    <!-- Header (fixed height) -->
    <template #header>
      <NuxtLink to="/" class="flex min-w-0 items-center gap-2">
        <img v-if="school?.logo" :src="school.logo" :alt="school.name || 'School logo'"
          class="h-9 w-9 shrink-0 rounded-lg object-contain" />

        <template v-else>
          <img src="/menu-dark.svg" alt="Skultem" class="h-7 shrink-0 block dark:hidden" />
          <img src="/menu-light.svg" alt="Skultem" class="h-7 shrink-0 hidden dark:block" />
        </template>

        <div v-if="onAdminPortal" class="min-w-0">
          <p class="truncate font-display text-base font-semibold leading-tight text-highlighted">
            Skultem
          </p>
          <p class="truncate text-xs leading-tight text-muted">System Admin</p>
        </div>

        <div v-else-if="school?.logo" class="min-w-0">
          <p class="truncate font-display text-base font-semibold leading-tight text-highlighted">
            {{ school.name }}
          </p>
          <p v-if="school?.motto" class="truncate text-xs italic leading-tight text-muted">
            {{ school.motto }}
          </p>
        </div>
      </NuxtLink>
    </template>

    <!-- Scrollable Body -->
    <div class="h-full overflow-y-auto p-4">
      <div v-for="section in menuSections" :key="section.id" class="mb-5 last:mb-0">
        <!-- Two levels: a tier title ("Essentials", "Modules") on the first section of each tier, then
             the subgroup label. Both are left out when there's nothing to tell apart (the admin
             portal), so that stays a plain list. -->
        <p v-if="section.tier"
          class="mb-3 px-3 text-xs font-bold uppercase tracking-[0.18em] text-highlighted">
          {{ section.tier }}
        </p>

        <p v-if="section.label"
          class="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {{ section.label }}
          <span class="h-px flex-1 bg-default" />
        </p>

      <ul class="space-y-2">
        <li v-for="item in section.items" :key="item.label + (item.to ?? '')">
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
    </div>
    <template #footer>
      <MenuNoticeBoard />
    </template>
  </UCard>
</template>

<script setup lang="ts">
const { school, hydrateFromCache } = useSchoolInfo()
hydrateFromCache()

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
  adminPortalOnly?: boolean
}

const { can } = useAuth()
const { isPathAvailable } = useModules()
const moduleStore = useModuleStore()
const { isClassMaster, ensureLoaded: ensureClassMasterLoaded } = useClassMaster()
const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

onMounted(() => {
  ensureClassMasterLoaded()
})

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', exact: true, icon: DASHBOARD_ICON },

  {
    label: 'Attendance', icon: ATTENDANCE_ICON,
    roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER],
    subNavs: [
      { label: 'Mark Attendance', to: '/attendance', icon: ATTENDANCE_ICON, exact: true },
      { label: 'Daily Register', to: '/attendance/daily-register', icon: DAILY_REGISTER_ICON },
      {
        label: 'Monthly Summary', to: '/attendance/monthly-summary', icon: MONTHLY_SUMMARY_ICON,
        roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
      },
      {
        label: 'Term Summary', to: '/attendance/term-summary', icon: TERM_SUMMARY_ICON,
        roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
      },
      {
        label: 'Class Summary', to: '/attendance/class-summary', icon: CLASS_SUMMARY_ICON,
        roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
      },
      {
        label: 'Inspection Reports', to: '/attendance/inspection-reports', icon: INSPECTION_REPORT_ICON,
        roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
      },
      {
        label: 'Weekly Attendance by Gender', to: '/attendance/weekly-gender', icon: 'i-lucide-venus-and-mars',
        roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
      },
    ]
  },
  { label: 'Attendance', to: '/attendance', icon: ATTENDANCE_ICON, roles: [Role.PARENT] },

  { label: 'Grade', to: '/grades', icon: GRADES_ICON, roles: [Role.TEACHER] },

  {
    label: 'Timetable', to: '/timetable', icon: TIMETABLE_ICON,
    roles: [Role.TEACHER, Role.PARENT]
  },

  { label: 'Behaviours', to: '/behaviours', icon: BEHAVIOUR_ICON, roles: [Role.TEACHER] },

  { label: 'Performance', to: '/performance', icon: PERFORMANCE_ICON, roles: [Role.PARENT] },

  { label: 'Report Cards', to: '/report-cards', icon: REPORT_ICON, roles: [Role.PARENT] },

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
    roles: [Role.ACCOUNTANT, Role.TEACHER,]
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
    roles: [Role.TEACHER, Role.PARENT]
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
      { label: 'Class Subjects', to: '/subjects/class-subjects', icon: BOOK_OPEN_ICON }
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
    roles: [Role.PROPRIETOR, Role.OWNER, Role.ACCOUNTANT],
    subNavs: [
      { label: 'Fees', to: '/fees-payment', icon: STUDENT_FEES_ICON, exact: true },
      { label: 'Payments', to: '/fees-payment/pay', icon: PAYMENT_ICON },
      { label: 'Discounts', to: '/fees-payment/discounts', icon: DISCOUNT_ICON },
      { label: 'Structures', to: '/fees-payment/structure', icon: FEE_STRUCTURE_ICON },
      { label: 'Category', to: '/fees-payment/category', icon: CATEGORY_ICON },
      {
        label: 'Receipt Design', to: '/fees-payment/receipt-design', icon: SETTINGS_ICON,
        roles: [Role.PROPRIETOR, Role.OWNER]
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
      { label: 'Platform Fee', to: '/transactions/platform-fee', icon: PLATFORM_ICON },
    ]
  },

  {
    label: 'Analytics', icon: REPORT_ICON,
    roles: [Role.ACCOUNTANT],
    subNavs: [
      { label: 'Financial Reports', to: '/analytics/financial-reports', icon: SCHEME_ICON },
    ]
  },

  {
    label: 'Analytics', icon: REPORT_ICON,
    roles: [Role.PROPRIETOR, Role.OWNER],
    subNavs: [
      { label: 'Reports', to: '/analytics', icon: REPORT_ICON, exact: true },
      { label: 'Financial Reports', to: '/analytics/financial-reports', icon: SCHEME_ICON },
      { label: 'Academic Reports', to: '/analytics/academic-reports', icon: 'i-lucide-bar-chart-3' },
      { label: 'Demographics', to: '/analytics/demographics', icon: 'i-lucide-users-round' },
    ]
  },

  {
    label: 'Analytics', icon: SCHEME_ICON, roles: [Role.ADMIN],
    subNavs: [
      { label: 'Reports', to: '/analytics/', icon: REPORT_ICON },
      { label: 'Academic Reports', to: '/analytics/academic-reports', icon: 'i-lucide-bar-chart-3' },
      { label: 'Demographics', to: '/analytics/demographics', icon: 'i-lucide-users-round' },
    ]
  },

  {
    label: 'Schools', to: '/schools', icon: SCHOOL_ICON,
    roles: [Role.SYSTEM_ADMIN], adminPortalOnly: true
  },
  {
    label: 'Academic Calendar', to: '/calendar', icon: 'i-lucide-calendar-range',
    roles: [Role.SYSTEM_ADMIN], adminPortalOnly: true
  },
  {
    label: 'Admins', to: '/users', icon: USERS_ICON,
    roles: [Role.SYSTEM_ADMIN], adminPortalOnly: true
  },
  {
    label: 'Payroll', icon: 'i-lucide-wallet', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER],
    subNavs: [
      { label: 'Overview', to: '/payroll', icon: 'i-lucide-layout-dashboard', exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Salary Structure', to: '/payroll/salaries', icon: 'i-lucide-banknote', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Salary Templates', to: '/payroll/salary-templates', icon: 'i-lucide-layout-template', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Payroll Runs', to: '/payroll/runs', icon: 'i-lucide-history', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Payslip Design', to: '/payroll/payslip-design', icon: 'i-lucide-palette', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Payslips', to: '/payroll/history', icon: 'i-lucide-receipt', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
    ]
  },
    {
    label: 'Human Resource', icon: 'i-lucide-wallet', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER],
    subNavs: [
      { label: 'Overview', to: '/hr', icon: 'i-lucide-layout-dashboard', exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Mark Attendance', to: '/hr/teacher-attendance', icon: ATTENDANCE_ICON, exact: true, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Daily Register', to: '/hr/teacher-attendance/daily-register', icon: DAILY_REGISTER_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Monthly Summary', to: '/hr/teacher-attendance/monthly-summary', icon: MONTHLY_SUMMARY_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Term Summary', to: '/hr/teacher-attendance/term-summary', icon: TERM_SUMMARY_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Management Reports', to: '/hr/teacher-attendance/management-reports', icon: INSPECTION_REPORT_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR] },
      { label: 'Clock In / Out', to: '/hr/teacher-attendance/clock-in', icon: 'i-lucide-log-in', roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER] },
      { label: 'Leave', to: '/hr/leave', icon: LAYERS_ICON, roles: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER] },
    ]
  },
  {
    label: 'Athletic House', icon: ATHLETIC_ICON,
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER],
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
      { label: 'Sales', to: '/material/sales', icon: SALE_ICON },
      { label: 'Supplies', to: '/material/supply', icon: CURRICULUM_GROUP_ICON },
      { label: 'Pending Pickups', to: '/material/pending-pickups', icon: PENDING_PICKUP_ICON },
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
  {
    label: 'Modules', to: '/modules', icon: 'i-lucide-blocks',
    roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
  },
]

const visibleNavItems = computed(() =>
  navItems
    // The admin subdomain itself says this is the system-admin console, so show its items outright
    // (plus the role-less Dashboard) rather than depending on the signed-in role resolving - a
    // school's own subdomain keeps the normal per-role filtering, minus the admin-only items.
    .filter((item) => onAdminPortal
      ? item.adminPortalOnly || !item.roles
      : (!item.roles || can(item.roles)) && !item.adminPortalOnly)
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
    // Hide whatever belongs to a module this school hasn't installed (see utils/modules.ts) - a
    // link for its own page, or just the sub-links of a group; a group left empty disappears.
    .map((item) => {
      if (item.subNavs) {
        const subNavs = item.subNavs.filter((nav) => isPathAvailable(nav.to))
        return subNavs.length ? { ...item, subNavs } : null
      }
      return !item.to || isPathAvailable(item.to) ? item : null
    })
    .filter((item): item is NavItem => item !== null)
)

// --- Grouping ------------------------------------------------------------------------------------
// Two tiers. "Essentials" - what every school has - is split into subgroups by purpose (People,
// Classroom, Finance, ...). Below it, "Modules" gathers the items that belong to an installable
// module (see utils/modules.ts) under a heading per category (Academics, Finance, ...). A group
// mixing modules and core pages (Communicate, Academics) stays in Essentials.

// Essentials subgroups, matched by menu label. Anything unmatched (Auth, Modules) lands in the
// Administration subgroup that follows them.
const ESSENTIAL_GROUPS: { id: string, label: string, items: string[] }[] = [
  { id: 'overview', label: '', items: ['Dashboard'] },
  { id: 'people', label: 'People', items: ['Students', 'Teachers', 'Parents'] },
  { id: 'classroom', label: 'Classroom', items: ['Attendance', 'Classes', 'Subjects', 'Academics'] },
  { id: 'finance', label: 'Finance', items: ['Fees', 'Fees & Payments', 'Transactions'] },
  { id: 'reports', label: 'Reports', items: ['Analytics'] },
  { id: 'communication', label: 'Communication', items: ['Communicate'] },
]

// The module a whole menu item (or group) belongs to, if all of it does.
function moduleInfoFor(item: NavItem) {
  const paths = item.subNavs ? item.subNavs.map((nav) => nav.to) : item.to ? [item.to] : []
  const key = moduleForPaths(paths)
  return key ? moduleStore.modules.find((m) => m.key === key) : undefined
}

type MenuSection = { id: string, tier: string, label: string, items: NavItem[] }

const menuSections = computed<MenuSection[]>(() => {
  const items = visibleNavItems.value

  // The admin portal has nothing to group - a plain list.
  if (onAdminPortal) {
    return [{ id: 'all', tier: '', label: '', items }]
  }

  const essentials: NavItem[] = []
  const byCategory = new Map<string, NavItem[]>()

  for (const item of items) {
    const info = moduleInfoFor(item)
    if (!info) {
      essentials.push(item)
    } else {
      byCategory.set(info.category, [...(byCategory.get(info.category) ?? []), item])
    }
  }

  const known = new Set(ESSENTIAL_GROUPS.flatMap((group) => group.items))
  const essentialSections: MenuSection[] = [
    ...ESSENTIAL_GROUPS.map((group) => ({
      id: group.id,
      tier: '',
      label: group.label,
      items: essentials.filter((item) => group.items.includes(item.label)),
    })),
    {
      id: 'administration',
      tier: '',
      label: 'Administration',
      items: essentials.filter((item) => !known.has(item.label)),
    },
  ].filter((section) => section.items.length)

  // The "Essentials" / "Modules" titles only mean something once there are modules to set apart.
  const hasModules = byCategory.size > 0
  if (hasModules && essentialSections[0]) essentialSections[0].tier = 'Essentials'

  const moduleSections: MenuSection[] = []
  // Categories in the order the catalog lists them.
  for (const category of new Set(moduleStore.modules.map((m) => m.category))) {
    const categoryItems = byCategory.get(category)
    if (!categoryItems) continue

    moduleSections.push({
      id: category,
      tier: moduleSections.length ? '' : 'Modules',
      label: moduleStore.modules.find((m) => m.category === category)?.categoryLabel ?? category,
      items: categoryItems,
    })
  }

  return [...essentialSections, ...moduleSections]
})
</script>
