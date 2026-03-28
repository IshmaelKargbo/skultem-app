<template>
    <div class="p-7 space-y-5">
        <DashboardAdminReport />
        <UCard>
            <div class="grid gap-5 grid-cols-4">
                <UButton to="/students" color="info" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="STUDENT_ICON" />
                        <p>Add Student</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="primary" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="TEACHER_ICON" />
                        <p>Add Teacher</p>
                    </div>
                </UButton>
                <UButton to="/classes" color="success" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="CLASS_ICON" />
                        <p>Add Class</p>
                    </div>
                </UButton>
                <UButton to="/curriculums" color="error" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="SUBJECT_ICON" />
                        <p>Add Subject</p>
                    </div>
                </UButton>
            </div>
        </UCard>
        <div class="grid gap-5 grid-cols-2">
            <UCard>
                <DashboardAdminRevenue />
            </UCard>
            <UCard>
                <DashboardAdminWeeklyAttendance />
            </UCard>
        </div>
        <div class="grid gap-5 grid-cols-2">
            <UCard>
                <WidgetClassPerformance />
            </UCard>
            <DashboardAdminActivity />
        </div>
    </div>
</template>

<script setup lang="ts">
const { format } = useMoney()

onMounted(() => {
    useAppStore().setTitle('Dashboard')
    document.title = "Dashboard | Skultem"
})
</script>