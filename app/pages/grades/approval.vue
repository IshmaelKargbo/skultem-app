<template>
  <GradesApprovalAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN])" />
  <GradesApprovalTeacher v-if="can([Role.TEACHER])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR]
})
</script>
