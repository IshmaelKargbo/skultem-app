<template>
    <div class="p-5 space-y-5">
        <DashboardAdminReport />
        <UCard>
            <p class="text-base">Quick Actions</p>
            <div class="mt-5 grid gap-5 grid-cols-4">
                <UButton to="/students" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="outline">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" name="prime:plus" />
                        <p>Add Student</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="outline">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" name="prime:plus" />
                        <p>Add Teacher</p>
                    </div>
                </UButton>
                <UButton to="/classes" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="outline">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" name="prime:plus" />
                        <p>Add Class</p>
                    </div>
                </UButton>
                <UButton to="/curriculums" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="outline">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" name="prime:plus" />
                        <p>Add Subject</p>
                    </div>
                </UButton>
            </div>
        </UCard>
        <div class="grid gap-5 grid-cols-2">
            <UCard>
                <DashboardAdminEnrollment />
            </UCard>
            <UCard>
                <DashboardAdminWeeklyAttendance />
            </UCard>
        </div>
        <div class="grid gap-5 grid-cols-2">
            <UCard>
                <DashboardAdminRevenue />
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