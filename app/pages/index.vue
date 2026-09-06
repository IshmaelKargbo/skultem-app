<template>
    <SystemAdminDashboard v-if="onAdminPortal" />
    <template v-else>
        <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
        <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
        <DashboardTeacher v-if="can(Role.TEACHER)" />
        <DashboardParent v-if="can(Role.PARENT)" />
    </template>
</template>
<script setup lang="ts">
const { can } = useAuth()

const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

if (!onAdminPortal && can(Role.SYSTEM_ADMIN)) {
    await navigateTo(adminPortalUrl(useRequestURL()), { external: true })
}

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PARENT, Role.ACCOUNTANT, Role.TEACHER, Role.SYSTEM_ADMIN]
})
</script>
