<template>
  <GradesAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
  <GradesTeacher v-if="can([Role.TEACHER])" />
  <GradesParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const {can} = useAuth()

// Missing entirely before - matches the GradesAdmin/GradesTeacher/GradesParent branches
// above, so any other role landed here with no guard at all.
definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT]
})
</script>
