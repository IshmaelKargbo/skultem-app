<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Class Library Sessions')
    document.title = 'Class Sessions | Library | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="lib-tabs"><LibrarySectionNav /></div>
        <GuideBar topic="lib-sessions" />
        <div data-guide="lib-att-tabs"><LibraryAttendanceNav /></div>
        <div data-guide="lib-att-stats"><LibraryAttendanceOverview /></div>
        <div data-guide="adm-list"><LibraryAttendanceSessions /></div>
    </div>
</template>
