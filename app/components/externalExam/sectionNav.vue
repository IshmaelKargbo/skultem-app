<template>
  <TabMobile class="md:hidden" :tabs="items" />
  <Tab class="hidden md:block" :tabs="items" />
</template>

<script setup lang="ts">
// The External Exams module's own tabs: the exam classes and their results, the exams with their grade scales,
// and the print designs (one general design for every exam, and any exam's own).
const items = [
  { label: 'Exam Classes', to: '/external-exams', icon: 'i-lucide-award', exact: true },
  { label: 'Exams & Grading', to: '/external-exams/exams', icon: 'i-lucide-list-checks' },
  { label: 'Print Designs', to: '/external-exams/designs', icon: 'i-lucide-layout-template' },
  { label: 'Data Links', to: '/external-exams/data-links', icon: 'i-lucide-link' }
]
</script>
