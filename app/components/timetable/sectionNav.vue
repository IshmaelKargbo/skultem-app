<template>
  <!-- Shown even with one tab, so the Timetable pages always look the same. -->
  <template v-if="items.length">
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
  { label: 'Timetable', to: '/timetable', icon: TIMETABLE_ICON, exact: true, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT] },
  // A class's month as weeks, a few subjects each school day (built for nursery classes, works for any).
  { label: 'Weekly plan', to: '/timetable/weekly-plan', icon: 'i-lucide-calendar-range', roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT] },
  { label: 'Settings', to: '/timetable/setting', icon: TIMETABLE_SETTINGS_ICON, roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN] },
  { label: 'Design', to: '/timetable/design', icon: 'i-lucide-palette', roles: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN] }
]

// A class runs on the normal timetable or a weekly plan, never both.
const route = useRoute()
const { types, load, typeOfSession, selected } = useClassTimetableTypes()
onMounted(() => { load().catch(() => null) })

// The tabs follow the class picked: one on a weekly plan gets Weekly plan (and Settings, Design) and no Timetable -
// it has none; any other class gets Timetable (Weekly plan only while you're on that page).
const showsPage = (to: string) => {
  const weeklyPicked = !!selected.value && !!types.value && typeOfSession(selected.value) === 'WEEKLY_PLAN'
  if (to === '/timetable') return !weeklyPicked
  if (to === '/timetable/weekly-plan') return weeklyPicked || route.path === to
  return true
}

const items = computed(() => allItems.filter(item => can(item.roles) && showsPage(item.to)))
</script>
