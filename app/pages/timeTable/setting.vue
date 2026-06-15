<template>
   <div class="grid md:grid-cols-2 gap-6 mt-6">
     <UCard class="">
        <template #header>
            <div class="flex items-center gap-3">
                <UIcon name="i-lucide-clock-3" class="size-5 text-primary" />
                <div>
                    <h3 class="font-semibold">School Timing</h3>
                    <p class="text-sm text-muted">
                        Set the overall school schedule
                    </p>
                </div>
            </div>
        </template>

        <div class="grid gap-6 md:grid-cols-2">
            <UFormField label="School Starts">
                <UInput v-model="settings.startTime" type="time" />
            </UFormField>

            <UFormField label="School Ends">
                <UInput v-model="settings.endTime" type="time" />
            </UFormField>

            <UFormField label="Period Duration (mins)">
                <UInputNumber v-model="settings.periodDuration" />
            </UFormField>

            <UFormField label="Break Duration (mins)">
                <UInputNumber v-model="settings.breakDuration" />
            </UFormField>

            <UFormField label="Lunch Duration (mins)">
                <UInputNumber v-model="settings.lunchDuration" />
            </UFormField>

            <UFormField label="Periods Per Day">
                <UInputNumber v-model="settings.periodsPerDay" />
            </UFormField>
        </div>
    </UCard>
    <UCard>
        <template #header>
            <div class="flex items-center gap-3">
                <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
                <div>
                    <h3 class="font-semibold">Working Days</h3>
                    <p class="text-sm text-muted">
                        Choose days classes are held
                    </p>
                </div>
            </div>
        </template>

        <div class="space-y-3">
            <div v-for="day in workingDays" :key="day.name"
                class="flex items-center justify-between rounded-xl border p-4">
                <div>
                    <p class="font-medium">
                        {{ day.name }}
                    </p>

                    <p class="text-sm text-muted">
                        {{ settings.startTime }} - {{ settings.endTime }}
                    </p>
                </div>

                <USwitch v-model="day.enabled" />
            </div>
        </div>
    </UCard>
    <UCard>
        <template #header>
            <div class="flex items-center gap-3">
                <UIcon name="i-lucide-wand-sparkles" class="size-5 text-primary" />
                <div>
                    <h3 class="font-semibold">
                        Auto-Assignment Rules
                    </h3>

                    <p class="text-sm text-muted">
                        Control automatic scheduling
                    </p>
                </div>
            </div>
        </template>

        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">
                        Prevent Teacher Conflicts
                    </p>
                    <p class="text-sm text-muted">
                        Avoid assigning a teacher twice at the same time.
                    </p>
                </div>

                <USwitch v-model="settings.preventConflicts" />
            </div>

            <UDivider />

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">
                        Balance Subjects
                    </p>

                    <p class="text-sm text-muted">
                        Spread subjects evenly throughout the week.
                    </p>
                </div>

                <USwitch v-model="settings.balanceSubjects" />
            </div>

            <UDivider />

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">
                        Prefer Morning Sessions
                    </p>

                    <p class="text-sm text-muted">
                        Schedule key subjects early.
                    </p>
                </div>

                <USwitch v-model="settings.preferMorning" />
            </div>
        </div>
    </UCard>
    <UCard>
        <template #header>
            <div class="flex items-center gap-3">
                <UIcon name="i-lucide-bell" class="size-5 text-primary" />

                <div>
                    <h3 class="font-semibold">
                        Notifications
                    </h3>

                    <p class="text-sm text-muted">
                        Notify users about timetable changes
                    </p>
                </div>
            </div>
        </template>

        <div class="space-y-4">

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">
                        Notify Teachers
                    </p>
                </div>

                <USwitch v-model="settings.notifyTeachers" />
            </div>

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">
                        Notify Students
                    </p>
                </div>

                <USwitch v-model="settings.notifyStudents" />
            </div>

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">
                        Email Alerts
                    </p>
                </div>

                <USwitch v-model="settings.emailAlerts" />
            </div>

        </div>
    </UCard>
   </div>
</template>
<script setup lang="ts">
const settings = reactive({
    startTime: '09:00',
    endTime: '15:15',
    periodDuration: 45,
    breakDuration: 15,
    lunchDuration: 45,
    periodsPerDay: 7,

    preventConflicts: true,
    balanceSubjects: true,
    preferMorning: false,

    notifyTeachers: true,
    notifyStudents: true,
    emailAlerts: false
})

const workingDays = ref([
    { name: 'Monday', enabled: true },
    { name: 'Tuesday', enabled: true },
    { name: 'Wednesday', enabled: true },
    { name: 'Thursday', enabled: true },
    { name: 'Friday', enabled: true }
])
</script>