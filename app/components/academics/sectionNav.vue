<template>
  <TabMobile class="md:hidden" :tabs="items" />
  <Tab class="hidden md:block" :tabs="items" />
</template>

<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
}

const items: NavItem[] = [
  { label: 'Academic Year', to: '/academics', icon: CALANDA_ICON, exact: true },
  { label: 'Terms', to: '/academics/terms', icon: TERM_ICON },
  { label: 'Template', to: '/academics/assessment-templates', icon: TEMPLATE_ICON },
  { label: 'Academic Cycle', to: '/academics/assessment-cycle', icon: CYCLE_ICON },
  { label: 'Grade Scale', to: '/academics/grade-scale', icon: GRADE_ICON },
  { label: 'Promotions', to: '/academics/promotions', icon: PROMOTE_STUDENTS_ICON }
]
</script>
