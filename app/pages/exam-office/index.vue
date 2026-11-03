<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Exam Office" subtitle="Grade submissions, approvals, results and the exam timetable." />
    <GradesSectionNav />
    <ExamOfficeDashboard />
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  useAppStore().setTitle('Exam Office')
  document.title = 'Exam Office | Skultem'
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
