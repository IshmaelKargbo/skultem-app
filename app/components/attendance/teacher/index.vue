<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading class="hidden md:flex" title="Attendance" subtitle="Track class attendance and export reports" />
        <AttendanceReport />
        <AttendanceTeacherMark class="hidden md:block" />
        <AttendanceHistory class="hidden md:block" />
        <TabMobile class="md:hidden" :tabs="tabs">
            <template #mark-data>
                <AttendanceTeacherMark />
            </template>
            <template #history-data>
                <AttendanceHistory />
            </template>
        </TabMobile>
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

const tabs = [
    { key: 'mark', label: 'Mark' },
    { key: 'history', label: 'History' }
]

definePageMeta({
    role: [Role.ADMIN, Role.TEACHER, Role.PARENT]
})
</script>
