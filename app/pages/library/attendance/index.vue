<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Library Attendance')
    document.title = 'Attendance | Library | Skultem'
})

definePageMeta({
    // Not teachers (docs/LIBRARY_ATTENDANCE.md P-1). Who can record or follow up: useLibraryAccess.
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="lib-tabs"><LibrarySectionNav /></div>
        <GuideBar topic="lib-visits" />
        <div data-guide="lib-att-tabs"><LibraryAttendanceNav /></div>
        <div data-guide="lib-att-stats"><LibraryAttendanceOverview /></div>
        <div data-guide="adm-list"><LibraryAttendanceVisits /></div>
    </div>
</template>
