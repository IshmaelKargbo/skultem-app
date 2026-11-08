<template>
    <SystemAdminDashboard v-if="onAdminPortal" />
    <template v-else>
        <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL])" />
        <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
        <div v-if="can(Role.LIBRARIAN)" class="px-4 md:px-6 space-y-3">
            <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />
            <div data-guide="lib-tabs"><LibrarySectionNav /></div>
            <GuideBar topic="lib-dashboard" />
            <LibraryDashboard />
        </div>
        <div v-if="can(Role.NURSE)" class="px-4 md:px-6 space-y-3">
            <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />
            <div data-guide="hc-tabs"><HealthCareSectionNav /></div>
            <GuideBar topic="nurse-dashboard" />
            <HealthCareDashboard />
        </div>
        <div v-if="can(Role.EXAM_OFFICER)" class="px-4 md:px-6 space-y-3">
            <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />
            <div class="flex justify-end"><GuideButton guide="exam-office-overview" /><HelpButton topic="exam-office-overview" /></div>
            <div data-guide="grades-tabs"><GradesSectionNav /></div>
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
