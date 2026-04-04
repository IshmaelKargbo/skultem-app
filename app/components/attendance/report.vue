<template>
    <div class="grid md:grid-cols-5 grid-cols-2 md:gap-5 gap-3" v-if="report">
        <Metric :record="{
            label: 'Present',
            color: 'success',
            value: report.present || '0',
            subtle: 'On Time Attendance',
            isReady: !loading,
            icon: ATTENDANCE_PRESENT_ICON
        }" />
        <Metric :record="{
            label: 'Absent',
            color: 'error',
            subtle: 'Not Present Today',
            value: report.absent || '0',
            isReady: !loading,
            icon: ATTENDANCE_ABSENT_ICON
        }" />
        <Metric :record="{
            label: 'Late',
            color: 'warning',
            value: report.late || '0',
            isReady: !loading,
            subtle: 'Students Arrived Late',
            icon: ATTENDANCE_LATE_ICON
        }" />
        <Metric :record="{
            label: 'Excused',
            color: 'info',
            value: report.excused || '0',
            isReady: !loading,
            subtle: 'Authorized Absence',
            icon: ATTENDANCE_EXCUSED_ICON
        }" />
        <Metric class="col-span-2 md:col-span-1" :record="{
            label: 'Attendance Rate',
            color: 'primary',
            subtle: 'Overall Attendance Rate',
            value: `${(report.rate || 0).toFixed(2)}%` || '0',
            isReady: !loading,
            icon: ATTENDANCE_ALL_ICON
        }" />
    </div>
</template>

<script setup lang="ts">
const { report, loading } = storeToRefs(useAttendanceStore())
</script>