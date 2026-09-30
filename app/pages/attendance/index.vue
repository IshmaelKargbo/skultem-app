<template>
    <AttendanceAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" />
    <AttendanceTeacher v-if="can([Role.TEACHER])" />
    <AttendanceParent v-if="can([Role.PARENT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
