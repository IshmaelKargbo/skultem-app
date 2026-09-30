<template>
  <LeaderboardTeacher v-if="can([Role.TEACHER])" />
  <LeaderboardAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

definePageMeta({
  role: [Role.TEACHER, Role.PROPRIETOR, Role.ADMIN, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>