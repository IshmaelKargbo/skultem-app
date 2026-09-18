<script setup lang="ts">
// query carries the current term/level/class/subject filters so switching tabs never loses the
// selection - see useAcademicReportFilters.
const props = defineProps<{
  query: string
}>()

const items = computed(() => {
  const suffix = props.query ? `?${props.query}` : ''
  return [
    { label: 'Overview', to: `/analytics/academic-reports${suffix}`, icon: 'i-lucide-layout-dashboard', exact: true },
    { label: 'Classes', to: `/analytics/academic-reports/classes${suffix}`, icon: 'i-lucide-school' },
    { label: 'Subjects', to: `/analytics/academic-reports/subjects${suffix}`, icon: 'i-lucide-book-open' },
    { label: 'Students', to: `/analytics/academic-reports/students${suffix}`, icon: 'i-lucide-users' },
    { label: 'Attention', to: `/analytics/academic-reports/attention${suffix}`, icon: 'i-lucide-alert-triangle' },
    { label: 'Completion', to: `/analytics/academic-reports/completion${suffix}`, icon: 'i-lucide-clipboard-check' },
    { label: 'Trends', to: `/analytics/academic-reports/trends${suffix}`, icon: 'i-lucide-line-chart' }
  ]
})
</script>

<template>
  <TabMobile class="md:hidden" :tabs="items" />
  <Tab class="hidden md:block" :tabs="items" />
</template>
