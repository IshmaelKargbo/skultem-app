<template>
    <SystemAdminDashboard v-if="onAdminPortal" />
    <template v-else>
        <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL])" />
        <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
        <div v-if="can(Role.LIBRARIAN)" class="px-4 md:px-6 space-y-3">
            <LibrarySectionNav />
            <LibraryDashboard />
        </div>
        <div v-if="can(Role.NURSE)" class="px-4 md:px-6 space-y-3">
            <HealthCareSectionNav />
            <HealthCareDashboard />
        </div>
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PRINCIPAL, Role.OWNER, Role.PARENT, Role.ACCOUNTANT, Role.LIBRARIAN, Role.NURSE, Role.TEACHER, Role.SYSTEM_ADMIN]
})
</script>
