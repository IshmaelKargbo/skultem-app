<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <div class="flex justify-between items-center">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Attendance</p>
                <p class="text-mute">Track class attendance and export reports</p>
            </div>
        </div>
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

definePageMeta({
    role: [Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT]
})
</script>
