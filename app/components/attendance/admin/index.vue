<template>
    <div id="attendance-scroll" class="px-4 md:px-6 space-y-3">
        <GuideBar topic="admin-attendance" />
        <div data-guide="att-summary"><AttendanceReport /></div>
        <AttendanceAdminMark />
        <div data-guide="att-history"><AttendanceHistory /></div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Attendance')
    document.title = 'Attendance | Skultem'
})

onUnmounted(() => {
    useAttendanceStore().cleanUp()
})

definePageMeta({
    role: [Role.ADMIN, Role.TEACHER, Role.PARENT]
})
</script>
