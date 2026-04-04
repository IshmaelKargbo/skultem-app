<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading class="hidden md:flex" title="Attendance" subtitle="Track class attendance and export reports" />
        <AttendanceReport />
        <AttendanceTeacherMark />
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
