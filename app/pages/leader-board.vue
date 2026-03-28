<template>
  <LeaderboardTeacher v-if="can([Role.TEACHER])" />
  <LeaderboardAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>