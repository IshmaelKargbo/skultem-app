<template>
  <TabMobile class="md:hidden" :tabs="tabs" />
  <Tab class="hidden md:block" :tabs="tabs" />
</template>

<script setup lang="ts">
// Library Attendance's own screens. Visits and class sessions are separate records and stay on separate tabs.
const tabs = [
  { label: 'Library Visits', to: '/library/attendance', icon: CHECK_IN_ICON, exact: true },
  { label: 'Class Sessions', to: '/library/attendance/sessions', icon: LIBRARY_SESSION_ICON },
  { label: 'Reports', to: '/library/attendance/reports', icon: LIBRARY_REPORT_ICON }
]
</script>
