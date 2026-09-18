<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <UIcon name="i-lucide-user-check" class="size-4 text-primary" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-highlighted">Staff Attendance</h3>
          <p class="text-xs text-muted">{{ formatDateString(today) }}</p>
        </div>
      </div>

      <UButton to="/hr/teacher-attendance" variant="subtle" color="neutral" size="xs" label="View Register"
        trailing-icon="i-lucide-arrow-right" />
    </div>

    <!-- Empty -->
    <div v-if="!loadingRoster && !roster?.entries.length"
      class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-default py-10 text-center">
      <UIcon name="i-lucide-users" class="size-8 text-muted" />
      <p class="text-sm font-medium text-highlighted">No active teachers</p>
      <p class="text-xs text-muted">Staff attendance will appear here once teachers are added.</p>
    </div>

    <template v-else>
      <!-- Metrics -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric :record="{
          label: 'Present',
          color: 'success',
          value: roster?.presentCount ?? 0,
          isReady: !loadingRoster,
          icon: ATTENDANCE_PRESENT_ICON
        }" />
        <Metric :record="{
          label: 'Absent',
          color: 'error',
          value: roster?.absentCount ?? 0,
          isReady: !loadingRoster,
          icon: ATTENDANCE_ABSENT_ICON
        }" />
        <Metric :record="{
          label: 'Late',
          color: 'warning',
          value: roster?.lateCount ?? 0,
          isReady: !loadingRoster,
          icon: ATTENDANCE_LATE_ICON
        }" />
        <Metric :record="{
          label: 'Excused',
          color: 'info',
          value: roster?.excusedCount ?? 0,
          isReady: !loadingRoster,
          icon: ATTENDANCE_EXCUSED_ICON
        }" />
        <Metric class="col-span-2 sm:col-span-1" :record="{
          label: 'Rate',
          color: 'primary',
          value: `${roster?.rate ?? 0}%`,
          isReady: !loadingRoster,
          icon: ATTENDANCE_ALL_ICON
        }" />
      </div>

      <!-- Clock in / clock out list -->
      <div class="rounded-xl border border-default">
        <div class="flex items-center justify-between border-b border-default px-3 py-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Clock In / Out</p>
          <p class="text-xs text-muted">{{ roster?.entries.length ?? 0 }} teachers</p>
        </div>

        <div v-if="loadingRoster" class="space-y-3 p-3">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3">
            <USkeleton class="h-9 w-9 shrink-0 rounded-full" />
            <div class="min-w-0 flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-32" />
              <USkeleton class="h-3 w-24" />
            </div>
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
        </div>

        <div v-else class="max-h-90 divide-y divide-default overflow-y-auto">
          <div v-for="row in roster?.entries" :key="row.teacher.id"
            class="flex flex-wrap items-center gap-3 px-3 py-2.5">
            <UAvatar :src="row.teacher.user?.photo || undefined" :alt="teacherName(row.teacher)" size="sm"
              loading="lazy" class="shrink-0 ring-1 ring-gray-200 dark:ring-gray-700" />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ teacherName(row.teacher) }}</p>

              <p class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted">
                <span class="inline-flex items-center gap-1">
                  <UIcon name="i-lucide-log-in" class="size-3" />
                  {{ row.clockedInAt ? formatTime(row.clockedInAt) : '—' }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <UIcon name="i-lucide-log-out" class="size-3" />
                  {{ row.clockedOutAt ? formatTime(row.clockedOutAt) : '—' }}
                </span>
              </p>
            </div>

            <UBadge v-if="row.status" :label="statusLabel(row.status)" variant="subtle" size="sm"
              :color="teacherAttendanceStatusColor(row.status)" />
            <UBadge v-else label="Not marked" variant="subtle" color="neutral" size="sm" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const store = useTeacherAttendanceStore()
const { roster, loadingRoster } = storeToRefs(store)

const today = new Date().toISOString().slice(0, 10)

function teacherName(teacher: Teacher) {
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function statusLabel(status: TeacherAttendanceStatus) {
  return TEACHER_ATTENDANCE_STATUS_OPTIONS.find(o => o.value === status)?.label || status
}

onMounted(() => {
  store.fetchRoster(today)
})
</script>
