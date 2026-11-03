<template>
  <template v-if="items.length > 1">
    <TabMobile class="md:hidden" :tabs="items" />
    <Tab class="hidden md:block" :tabs="items" />
  </template>
</template>

<script setup lang="ts">
// The one tab bar for Grades & Exams: entering grades, the exam office's tracking, approval, the exam timetable,
// the broadsheet and the assessment cycle are steps of the same job, so every page in it shows the same tabs
// (each person sees the ones they can use).
const { can } = useAuth()
const { isClassMaster, ensureLoaded } = useClassMaster()
const { load, routesTo, routing } = useGradeApproval()

interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
  roles: Role[]
  // Only for a teacher who is a class master in a part of the school where class masters approve.
  classMasterApprover?: boolean
}

const MANAGEMENT = [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]

const allItems: NavItem[] = [
  { label: 'Overview', to: '/exam-office', icon: 'i-lucide-layout-dashboard', exact: true, roles: EXAM_OFFICE_ROLES },
  { label: 'Grade Entry', to: '/grades', icon: GRADES_ASSIGN_ICON, exact: true, roles: [...MANAGEMENT, Role.TEACHER] },
  { label: 'Submissions', to: '/exam-office/submissions', icon: 'i-lucide-list-checks', roles: EXAM_OFFICE_ROLES },
  { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON, roles: EXAM_OFFICE_ROLES },
  { label: 'Grade Approval', to: '/grades/approval', icon: GRADES_APPROVAL_ICON, roles: [Role.TEACHER], classMasterApprover: true },
  { label: 'Exam Timetable', to: '/exam-office/timetable', icon: 'i-lucide-calendar-clock', roles: [...EXAM_OFFICE_ROLES, Role.TEACHER] },
  { label: 'Broadsheet', to: '/exam-office/broadsheet', icon: 'i-lucide-sheet', roles: EXAM_OFFICE_ROLES },
  { label: 'Assessment Cycle', to: '/academics/assessment-cycle', icon: 'i-lucide-refresh-cw', roles: EXAM_OFFICE_ROLES },
]

const items = computed(() => {
  const seen = new Set<string>()
  return allItems.filter((item) => {
    if (!can(item.roles)) return false
    // A teacher sees approval only as a class master, and only while class masters approve somewhere (until the
    // routing has loaded, keep it so the tabs don't jump).
    if (item.classMasterApprover && (!isClassMaster.value || (routing.value && !routesTo('CLASS_MASTER')))) return false
    // Someone with both a management role and a teacher role gets each page once.
    if (seen.has(item.to)) return false
    seen.add(item.to)
    return true
  })
})

onMounted(() => {
  load()
  if (can(Role.TEACHER)) ensureLoaded()
})
</script>
