<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Human Resource" subtitle="Staff attendance and leave, at a glance.">
      <UButton icon="i-lucide-log-in" to="/hr/teacher-attendance/clock-in" label="Clock In / Out" variant="soft" />
      <UButton icon="i-lucide-calendar-plus" to="/hr/leave/add" label="Request Leave" />
    </Heading>

    <HrSectionNav />

    <!-- Leave summary -->
    <div class="grid gap-4 grid-cols-2 md:grid-cols-4">
      <Metric :record="{
        icon: 'i-lucide-file-text',
        label: 'Total Leave Requests',
        value: leaveSummary?.total ?? 0,
        isReady: !loadingLeaveSummary,
        color: 'primary'
      }" />
      <Metric :record="{
        icon: 'i-lucide-clock-3',
        label: 'Pending',
        value: leaveSummary?.pending ?? 0,
        isReady: !loadingLeaveSummary,
        color: 'warning'
      }" />
      <Metric :record="{
        icon: 'i-lucide-check-circle',
        label: 'Approved',
        value: leaveSummary?.approved ?? 0,
        isReady: !loadingLeaveSummary,
        color: 'success'
      }" />
      <Metric :record="{
        icon: 'i-lucide-x-circle',
        label: 'Rejected',
        value: leaveSummary?.rejected ?? 0,
        isReady: !loadingLeaveSummary,
        color: 'error'
      }" />
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <div>
          <h3 class="font-semibold">Quick Actions</h3>
          <p class="text-sm text-muted">Frequently used actions.</p>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <NuxtLink v-for="action in quickActions" :key="action.label" :to="action.to"
          class="flex flex-col items-center gap-2 rounded-xl border border-default px-3 py-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
          <span class="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="action.icon" class="size-5" />
          </span>
          <span class="text-xs font-medium leading-tight">{{ action.label }}</span>
        </NuxtLink>
      </div>
    </UCard>

    <!-- Today's staff attendance -->
    <UCard>
      <DashboardAdminStaffAttendance />
    </UCard>

    <!-- Recent leave requests -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">Recent Leave Requests</h3>
          <UButton to="/hr/leave" variant="ghost" color="neutral" size="sm" label="View all" />
        </div>
      </template>

      <div v-if="loadingLeave" class="space-y-3 p-3">
        <USkeleton v-for="i in 3" :key="i" class="h-12 w-full rounded-lg" />
      </div>

      <ul v-else-if="leaveRecords.length" class="divide-y divide-default">
        <li v-for="request in leaveRecords" :key="request.id"
          class="flex items-center gap-3 p-3 transition-colors hover:bg-elevated/40">
          <UAvatar :src="request.teacher?.user?.photo || undefined" :alt="teacherName(request.teacher)" size="sm"
            loading="lazy" />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ teacherName(request.teacher) }}</p>
            <p class="truncate text-xs text-muted">
              {{ leaveTypeLabel(request.type) }} · {{ formatDate(request.startDate) }} - {{
                formatDate(request.endDate) }}
            </p>
          </div>

          <UBadge :color="leaveStatusColor(request.status)" variant="soft" size="sm">
            {{ clean(request.status) }}
          </UBadge>

          <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-eye" :to="`/hr/leave/${request.id}`" />
        </li>
      </ul>

      <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
        <UIcon name="i-lucide-calendar-x" class="text-3xl text-muted" />
        <p class="text-sm text-muted">No leave requests yet.</p>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const leaveStore = useLeaveStore()
const { records: leaveRecords, loading: loadingLeave, summary: leaveSummary, loadingSummary: loadingLeaveSummary } = storeToRefs(leaveStore)

const quickActions = [
  { label: 'Teacher Attendance', icon: ATTENDANCE_ICON, to: '/hr/teacher-attendance' },
  { label: 'Clock In / Out', icon: 'i-lucide-log-in', to: '/hr/teacher-attendance/clock-in' },
  { label: 'Leave Requests', icon: LAYERS_ICON, to: '/hr/leave' },
  { label: 'Request Leave', icon: 'i-lucide-calendar-plus', to: '/hr/leave/add' },
  { label: 'Attendance Settings', icon: 'i-lucide-map-pin', to: '/hr/teacher-attendance/settings' },
]

function teacherName(teacher?: Teacher) {
  if (!teacher) return ''
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function leaveTypeLabel(value: LeaveType) {
  return LEAVE_TYPE_OPTIONS.find(o => o.value === value)?.label || clean(value)
}

onMounted(() => {
  useAppStore().setTitle('Human Resource')
  useAppStore().setBack(false)
  document.title = 'Human Resource | Skultem'

  leaveStore.fetchAll(1, 5)
  leaveStore.fetchSummary()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
