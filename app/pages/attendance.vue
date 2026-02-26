<template>
    <div class="p-5 space-y-5">
        <AttendanceReport />
        <AttendanceMark />
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
</script>