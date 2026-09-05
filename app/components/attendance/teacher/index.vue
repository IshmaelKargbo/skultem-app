<template>
    <div id="attendance-scroll" class="px-4 space-y-4 md:space-x-6">
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
