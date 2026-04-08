<template>
    <div id="attendance-scroll" class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading class="hidden md:flex" title="Attendance" subtitle="Track class attendance and export reports" />
        <AttendanceReport />
        <AttendanceTeacherMark class="hidden md:block" />
        <AttendanceHistory class="hidden md:block" />
        <AttendanceTeacherMark class="md:hidden" />
        <AttendanceHistory class="md:hidden" />
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
