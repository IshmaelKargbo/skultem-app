<template>
    <SystemAdminDashboard v-if="onAdminPortal" />
    <template v-else>
        <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL])" />
        <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
        <div v-if="can(Role.LIBRARIAN)" class="px-4 md:px-6 space-y-3">
            <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />
            <LibrarySectionNav />
            <LibraryDashboard />
        </div>
        <div v-if="can(Role.NURSE)" class="px-4 md:px-6 space-y-3">
            <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />
            <HealthCareSectionNav />
            <HealthCareDashboard />
        </div>
        <div v-if="can(Role.EXAM_OFFICER)" class="px-4 md:px-6 space-y-3">
            <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />
            <GradesSectionNav />
            <ExamOfficeDashboard />
        </div>
        <DashboardTeacher v-if="can(Role.TEACHER)" />
        <DashboardParent v-if="can(Role.PARENT)" />
    </template>
</template>
<script setup lang="ts">
const { can } = useAuth()
const { isInstalled } = useModules()
const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

if (!onAdminPortal && can(Role.SYSTEM_ADMIN)) {
    await navigateTo(adminPortalUrl(useRequestURL()), { external: true })
}

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PRINCIPAL, Role.OWNER, Role.PARENT, Role.ACCOUNTANT, Role.LIBRARIAN, Role.NURSE, Role.EXAM_OFFICER, Role.TEACHER, Role.SYSTEM_ADMIN]
})
</script>
