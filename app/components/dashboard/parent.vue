<template>
    <div class="p-5 space-y-5">
        <UCard>
            <USelectMenu placeholder="Select Student" />
        </UCard>
        <div class="grid grid-cols-4 gap-5">
            <Metric v-for="item in reports" :key="item.id" :record="item" />
        </div>
        <div class="grid grid-cols-2 gap-5">
            <UCard>
                <p>Grade Trend</p>
            </UCard>
            <UCard>
                <p>Performance by Subject</p>
            </UCard>
            <UCard>
                <div>
                    <p>Student Information</p>
                    <div class="mt-1">
                        <div class="justify-between flex border-b py-2 border-gray-200">
                            <p class="text-muted">Class:</p>
                            <p>Grade 8-A</p>
                        </div>
                        <div class="justify-between flex border-b py-2 border-gray-200">
                            <p class="text-muted">Class Teacher:</p>
                            <p>Dr. John Smith</p>
                        </div>
                        <div class="justify-between flex border-b py-2 border-gray-200">
                            <p class="text-muted">Total Students:</p>
                            <p>28</p>
                        </div>
                        <div class="justify-between flex py-2 border-gray-200">
                            <p class="text-muted">Class Rank:</p>
                            <p>5th</p>
                        </div>
                    </div>
                </div>
            </UCard>
            <UCard>
                <div>
                    <p>Recent Updates</p>
                </div>
            </UCard>
        </div>
        <UCard>
            <div class="grid grid-cols-4 gap-3">
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="GRADES_ICON" />
                        <p>View Grade</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
                        <p>Check Attendance</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="PAYMENT_ICON" />
                        <p>Fee</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="HISTORY_ICON" />
                        <p>Download Report</p>
                    </div>
                </UButton>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const reports = [
    {
        id: '1',
        label: 'Term Average',
        icon: STUDENT_ICON,
        value: '87%',
        subtle: '+2% from last term',
        isReady: true,
        color: "success"
    },
    {
        id: '1',
        label: 'Attendance Rate',
        icon: ATTENDANCE_ICON,
        value: '96%',
        subtle: 'This term',
        isReady: true,
        color: "info"
    },
    {
        id: '1',
        label: 'Fee Balance',
        icon: PAYMENT_ICON,
        value: 'NLE 0',
        subtle: 'All Paid',
        isReady: true,
        color: "error"
    },
    {
        id: '1',
        label: 'Upcoming Events',
        icon: DOWNLOAD_ICON,
        value: '3',
        subtle: 'This Month',
        isReady: true,
        color: "warning"
    }
]
onMounted(() => {
    useAppStore().setTitle('Dashboard')
    document.title = "Dashboard | Skultem"
})
</script>