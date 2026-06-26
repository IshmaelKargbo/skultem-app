<template>
    <TimetableRoleAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <TimetableRoleTeacher v-if="can([Role.TEACHER])" />
    <TimetableRoleParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>