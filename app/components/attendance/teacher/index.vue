<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Attendance" subtitle="Track class attendance and export reports" />
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
