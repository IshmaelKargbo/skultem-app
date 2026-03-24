<template>
    <AttendanceTeacher v-if="can([Role.SCHOOL_ADMIN, Role.TEACHER])" />
    <AttendanceParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
