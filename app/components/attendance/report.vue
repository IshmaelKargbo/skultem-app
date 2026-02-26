<template>
    <div class="grid grid-cols-5 gap-5">
        <UCard>
            <div class="space-y-1">
                <p class="text-3xl text-success-500">{{ report.present || 0 }}</p>
                <p class="text-mute">Present</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-3xl text-error-500">{{ report.absent || 0 }}</p>
                <p class="text-mute">Absent</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-3xl text-warning-500">{{ report.late || 0 }}</p>
                <p class="text-mute">Late</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-3xl text-info-500">{{ report.excused || 0 }}</p>
                <p class="text-mute">Excused</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-3xl text-info-500">{{ (report.rate || 0).toFixed(2) }}%</p>
                <p class="text-mute">Attendance Rate</p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const { report } = storeToRefs(useAttendanceStore())
</script>