<template>
    <div id="attendance-scroll" class="p-4 md:px-6 overflow-y-auto h-full md:space-y-5 space-y-3">
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
