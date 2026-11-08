<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Library Attendance Reports')
    document.title = 'Attendance Reports | Library | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="lib-tabs"><LibrarySectionNav /></div>
        <GuideBar topic="lib-att-reports" />
        <div data-guide="lib-att-tabs"><LibraryAttendanceNav /></div>
        <div data-guide="lib-main"><LibraryAttendanceReports /></div>
    </div>
</template>
