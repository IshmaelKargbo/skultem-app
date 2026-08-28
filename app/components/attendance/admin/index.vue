<template>
    <div id="attendance-scroll" class="px-4 md:px-6 space-y-4">
        <Heading title="Attendance" subtitle="Track class attendance and export reports" />
        <AttendanceReport />
        <AttendanceAdminMark />
        <AttendanceHistory />
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
