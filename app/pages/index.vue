<template>
    <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
    <DashboardTeacher v-if="can(Role.TEACHER)" />
    <DashboardParent v-if="can(Role.PARENT)" />
</template>
<script setup lang="ts">
const { can } = useAuth()

if (can(Role.SYSTEM_ADMIN)) {
    await navigateTo('/system-admin')
}

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PARENT, Role.ACCOUNTANT, Role.TEACHER, Role.SYSTEM_ADMIN]
})
</script>
