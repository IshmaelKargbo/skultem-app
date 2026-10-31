<template>
  <TabMobile class="md:hidden" :tabs="tabs" />
  <Tab class="hidden md:block" :tabs="tabs" />
</template>

<script setup lang="ts">
// The Health Care section's pages. Settings are shown to the nurse too, read-only (docs/HEALTH_CARE.md P-3).
const tabs = [
  { label: 'Dashboard', to: '/health-care', icon: HEALTH_CARE_ICON, exact: true },
  { label: 'Visits', to: '/health-care/visits', icon: HEALTH_CARE_VISITS_ICON },
  { label: 'Reports', to: '/health-care/reports', icon: HEALTH_CARE_REPORT_ICON },
  { label: 'Settings', to: '/health-care/settings', icon: HEALTH_CARE_SETTINGS_ICON }
]
</script>
