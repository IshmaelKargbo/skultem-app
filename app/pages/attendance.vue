<template>
    <AttendanceAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
    <AttendanceTeacher v-if="can([Role.TEACHER])" />
    <AttendanceParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
