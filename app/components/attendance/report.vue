<template>
    <div class="grid grid-cols-5 gap-5" v-if="report">
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
        <Metric :record="{
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