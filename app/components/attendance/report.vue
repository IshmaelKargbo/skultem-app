<template>
    <div class="grid grid-cols-5 gap-5" v-if="report">
        <UCard>
            <div class="space-y-1">
                <p class="text-2xl font-semibold text-success">{{ report.present || 0 }}</p>
                <p class="text-mute text-xs">Present</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-2xl font-semibold text-error">{{ report.absent || 0 }}</p>
                <p class="text-mute text-xs">Absent</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-2xl text-warning font-semibold">{{ report.late || 0 }}</p>
                <p class="text-mute text-xs">Late</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-2xl text-info font-semibold">{{ report.excused || 0 }}</p>
                <p class="text-mute text-xs">Excused</p>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-2xl text-info font-semibold">{{ (report.rate || 0).toFixed(2) }}%</p>
                <p class="text-mute text-xs">Attendance Rate</p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const { report } = storeToRefs(useAttendanceStore())
</script>