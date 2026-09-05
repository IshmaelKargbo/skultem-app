<template>
  <LeaderboardTeacher v-if="can([Role.TEACHER])" />
  <LeaderboardAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

// Missing entirely before - matches the LeaderboardTeacher/LeaderboardAdmin branches
// above, so any other role landed here with no guard at all.
definePageMeta({
  role: [Role.TEACHER, Role.PROPRIETOR, Role.ADMIN, Role.OWNER]
})
</script>