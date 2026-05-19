<template>
  <LeaderboardTeacher v-if="can([Role.TEACHER])" />
  <LeaderboardAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>