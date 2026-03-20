<template>
  <GradesAdmin v-if="can([Role.SCHOOL_ADMIN, Role.TEACHER])" />
  <GradesParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const {can} = useAuth()
</script>
