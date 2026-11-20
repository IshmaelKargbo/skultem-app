<script setup lang="ts">
// Older links (/gradebook/<class section>) open the grade book page on that class.
const route = useRoute()
await navigateTo({ path: '/gradebook', query: { ...route.query, session: String(route.params.sessionId) } }, { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.EXAM_OFFICER, Role.TEACHER]
})
</script>

<template>
  <div />
</template>
