<template>
  <TabMobile class="md:hidden" :tabs="tabs" />
  <Tab class="hidden md:block" :tabs="tabs" />
</template>

<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
}

const items: NavItem[] = [
  { label: 'Dashboard', to: '/library', icon: LIBRARY_ICON, exact: true },
  { label: 'Books', to: '/library/books', icon: BOOK_ICON },
  { label: 'Issue / Return', to: '/library/issue', icon: ISSUE_BOOK_ICON },
  { label: 'Categories', to: '/library/categories', icon: BOOK_CATEGORY_ICON },
  { label: 'Attendance', to: '/library/attendance', icon: LIBRARY_ATTENDANCE_ICON },
  { label: 'Settings', to: '/library/settings', icon: TIMETABLE_SETTINGS_ICON }
]

// Settings and Attendance are for the people who run the library, not teachers.
const { canManage, canViewAttendance } = useLibraryAccess()
const tabs = computed(() => items.filter(i =>
  (i.to !== '/library/settings' || canManage.value) && (i.to !== '/library/attendance' || canViewAttendance.value)))
</script>
