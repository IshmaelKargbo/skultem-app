<template>
    <div class="px-4 md:px-6 space-y-3">
        <DashboardWelcome />
        <DashboardTeacherClockInOut v-if="canClockIn && isInstalled(ModuleKey.STAFF_HR)" />
        <GuideBar topic="admin-dashboard" />
        <div data-guide="adm-dash-stats"><DashboardAdminReport /></div>
        <UCard data-guide="adm-dash-quick">
            <div class="grid gap-3 md:grid-cols-4 grid-cols-2">
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
        <div data-guide="adm-dash-charts" class="grid gap-3 md:grid-cols-2">
            <UCard>
                <DashboardAdminRevenue />
            </UCard>
            <UCard>
                <DashboardAdminWeeklyAttendance />
            </UCard>
        </div>
        <UCard data-guide="adm-dash-attention">
            <DashboardAdminAttention />
        </UCard>
        <UCard data-guide="adm-dash-staff" v-if="isInstalled(ModuleKey.STAFF_HR)">
            <DashboardAdminStaffAttendance />
        </UCard>
        <!-- The school calendar sits beside recent activity; the class average runs full width along the bottom. -->
        <div data-guide="adm-dash-calendar" class="grid md:grid-cols-2 gap-3">
            <DashboardAdminEventCalendar />
            <DashboardAdminActivity />
        </div>
        <UCard data-guide="adm-dash-class">
            <WidgetClassPerformance />
        </UCard>
    </div>
</template>

<script setup lang="ts">
const { isInstalled } = useModules()
const { can } = useAuth()
// Owner, proprietor and principal share this dashboard but don't clock in; admin does.
// Everyone on this dashboard except the owner (see CLOCK_IN_ROLES).
const canClockIn = computed(() => can(CLOCK_IN_ROLES))

onMounted(() => {
    useAppStore().setTitle('Dashboard')
    document.title = "Dashboard | Skultem"
})
</script>
