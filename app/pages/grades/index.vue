<template>
  <GradesAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
  <GradesTeacher v-if="can([Role.TEACHER])" />
  <GradesParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const {can} = useAuth()
</script>
