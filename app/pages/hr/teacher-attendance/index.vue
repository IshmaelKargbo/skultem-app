<template>
  <div id="attendance-scroll" class="px-4 md:px-6 space-y-4">
    <Heading title="Mark Attendance" subtitle="Mark staff present, absent or late, or clock them in/out.">
      <div class="flex w-100 items-center gap-2">
          <UInput v-model="date" type="date" :max="today" />
        <UButton variant="soft" color="neutral" icon="i-lucide-map-pin" to="/settings/school?section=attendance"
          label="Location Settings" />
      </div>
      <UButton icon="i-lucide-save" :loading="saving" :disabled="!pendingChanges.length" @click="saveAttendance">
        Save Attendance
      </UButton>
    </Heading>

    <HrSectionNav />

    <UAlert v-if="error" color="error" variant="soft" icon="i-lucide-alert-circle" title="Couldn't load attendance"
      :description="error" />

    <!-- Summary -->
    <div class="grid md:grid-cols-5 grid-cols-2 md:gap-5 gap-3">
      <Metric :record="{
        label: 'Present',
        color: 'success',
        value: roster?.presentCount ?? 0,
        subtle: 'Marked Present Today',
        isReady: !loadingRoster,
        icon: ATTENDANCE_PRESENT_ICON
      }" />
      <Metric :record="{
        label: 'Absent',
        color: 'error',
        value: roster?.absentCount ?? 0,
        subtle: 'Not Present Today',
        isReady: !loadingRoster,
        icon: ATTENDANCE_ABSENT_ICON
      }" />
      <Metric :record="{
        label: 'Late',
        color: 'warning',
        value: roster?.lateCount ?? 0,
        subtle: 'Staff Arrived Late',
        isReady: !loadingRoster,
        icon: ATTENDANCE_LATE_ICON
      }" />
      <Metric :record="{
        label: 'Excused',
        color: 'info',
        value: roster?.excusedCount ?? 0,
        subtle: 'Authorized Absence',
        isReady: !loadingRoster,
        icon: ATTENDANCE_EXCUSED_ICON
      }" />
      <Metric class="col-span-2 md:col-span-1" :record="{
        label: 'Attendance Rate',
        color: 'primary',
        value: `${roster?.rate ?? 0}%`,
        subtle: 'Overall Attendance Rate',
        isReady: !loadingRoster,
        icon: ATTENDANCE_ALL_ICON
      }" />
    </div>

    <!-- Register -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-semibold">Register</p>
            <p class="text-xs-base text-muted">{{ formatDateString(date) }}</p>
          </div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search teacher..." class="w-full sm:w-56" />
        </div>
      </template>

      <div v-if="loadingRoster" class="space-y-3 p-3">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3">
          <USkeleton class="h-10 w-10 rounded-full shrink-0" />
          <div class="min-w-0 flex-1 space-y-1.5">
            <USkeleton class="h-3.5 w-32" />
            <USkeleton class="h-3 w-20" />
          </div>
          <USkeleton class="h-7 w-24 rounded-md" />
        </div>
      </div>

      <div v-else-if="filteredEntries.length" class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="row in filteredEntries" :key="row.teacher.id" class="flex flex-wrap items-center gap-3 p-3">
          <UAvatar :src="row.teacher.user?.photo || undefined" :alt="teacherName(row.teacher)" size="md"
            loading="lazy" class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0" />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ teacherName(row.teacher) }}</p>
            <p class="truncate text-[11px] text-gray-500 dark:text-gray-400">{{ row.teacher.staffId }}</p>

            <p v-if="row.clockedInAt"
              class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-log-in" class="size-3" />
                {{ row.clockInByAdmin ? 'Clocked in by admin' : 'Self clocked in' }} {{ formatTime(row.clockedInAt) }}
              </span>
              <span v-if="row.clockedOutAt" class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-log-out" class="size-3" />
                {{ row.clockOutByAdmin ? 'out by admin' : 'out' }} {{ formatTime(row.clockedOutAt) }}
              </span>
            </p>
            <p v-if="row.recordedBy" class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              Marked by {{ row.recordedBy }}
            </p>
          </div>

          <UBadge v-if="row.clockedInAt" :label="statusBadgeLabel(row.teacher.id)"
            :color="teacherAttendanceStatusColor(marks[row.teacher.id]?.status)" variant="soft"
            class="rounded-full" />

          <UDropdownMenu v-else :items="statusMenuItems(row.teacher.id)" :content="{ align: 'end' }">
            <UButton :label="statusBadgeLabel(row.teacher.id)" trailing-icon="i-lucide-chevron-down" size="xs"
              variant="soft" :color="teacherAttendanceStatusColor(marks[row.teacher.id]?.status)"
              class="rounded-full" />
          </UDropdownMenu>

          <UInput v-if="!row.clockedInAt && marks[row.teacher.id]?.status === 'EXCUSED'"
            v-model="marks[row.teacher.id]!.note" placeholder="Reason (optional)" class="w-full sm:w-48" />

          <template v-if="isToday">
            <UButton v-if="!row.clockedInAt" size="xs" icon="i-lucide-log-in" label="Clock In"
              :loading="adminClockingTeacherId === row.teacher.id" @click="onAdminClockIn(row.teacher.id)" />

            <template v-else>
              <UButton v-if="!row.clockedOutAt" size="xs" color="neutral" variant="outline" icon="i-lucide-log-out"
                label="Clock Out" :loading="adminClockingTeacherId === row.teacher.id"
                @click="onAdminClockOut(row.teacher.id)" />

              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw"
                :label="row.clockedOutAt ? 'Undo Clock Out' : 'Undo Clock In'"
                :loading="unclockingTeacherId === row.teacher.id" @click="onAdminUnclock(row.teacher.id)" />
            </template>
          </template>
        </div>
      </div>

      <div v-else-if="roster?.entries.length" class="flex flex-col items-center gap-2 py-10 text-center">
        <UIcon name="i-lucide-search-x" class="text-4xl text-muted" />
        <p class="font-medium">No teacher matches "{{ search }}"</p>
      </div>

      <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
        <UIcon name="i-lucide-users" class="text-4xl text-muted" />
        <p class="font-medium">No active teachers</p>
        <p class="text-sm text-muted">Teachers will appear here once added to the school.</p>
      </div>
    </UCard>

    <!-- History -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <p class="font-semibold">History</p>
      </template>

      <div v-if="loadingHistory" class="space-y-3 p-3">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between">
          <div class="space-y-1.5">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-3 w-20" />
          </div>
          <USkeleton class="h-7 w-12" />
        </div>
      </div>

      <div v-else>
        <button v-for="(day, index) in history" :key="day.date" type="button" :class="[
          'flex w-full p-3 justify-between cursor-pointer text-left transition-colors',
          index + 1 < history.length ? 'border-b border-gray-200 dark:border-gray-800' : '',
          day.date === date
            ? 'bg-success-50/40 dark:bg-gray-950 rounded-md'
            : 'hover:bg-gray-50 dark:hover:bg-gray-950'
        ]" @click="date = day.date">
          <div class="space-y-0.5">
            <p class="md:text-base font-medium">{{ formatDateString(day.date) }}</p>
            <p class="text-sm text-mute">{{ day.presentCount }}/{{ day.totalCount }} present</p>
          </div>

          <div class="flex flex-col items-end">
            <p class="md:text-2xl text-xl" :class="day.rate >= 80 ? 'text-success-500' : 'text-warning-500'">
              {{ day.rate }}%
            </p>
          </div>
        </button>

        <div v-if="!history.length"
          class="flex flex-col m-4 items-center justify-center rounded-xl border-2 border-dashed dark:border-gray-700 border-gray-200 py-10">
          <UIcon name="i-lucide-calendar-x" class="mb-2 text-4xl text-muted" />

          <p class="font-medium">
            No attendance records
          </p>

          <p class="text-sm text-muted">
            Attendance records will appear here.
          </p>
        </div>
      </div>

      <div v-if="!loadingHistory && historyMeta.total > historyMeta.size"
        class="flex justify-center border-t border-gray-200 py-4 dark:border-gray-800">
        <UPagination v-model:page="historyPage" size="sm" :page-size="historyMeta.size"
          :items-per-page="historyMeta.size" :total="historyMeta.total" show-edges />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const notify = useNotify()
const store = useTeacherAttendanceStore()
const { roster, loadingRoster, history, historyMeta, loadingHistory, error, adminClockingTeacherId, unclockingTeacherId, saving } = storeToRefs(store)

const today = new Date().toISOString().slice(0, 10)
const date = ref(today)
const historyPage = ref(1)
const search = ref('')

const isToday = computed(() => date.value === today)
const marks = reactive<Record<string, { status: TeacherAttendanceStatus | null, note: string }>>({})

watch(roster, (value) => {
  if (!value) return
  for (const row of value.entries) {
    marks[row.teacher.id] = { status: row.status, note: row.note || '' }
  }
}, { immediate: true })

const filteredEntries = computed(() => {
  const entries = roster.value?.entries || []
  if (!search.value.trim()) return entries

  const query = search.value.trim().toLowerCase()
  return entries.filter(row => teacherName(row.teacher).toLowerCase().includes(query))
})

const pendingChanges = computed(() => {
  const entries = roster.value?.entries || []
  return entries
    .filter(row => marks[row.teacher.id]?.status && marks[row.teacher.id]?.status !== row.status)
    .map(row => ({
      teacherId: row.teacher.id,
      status: marks[row.teacher.id]!.status as TeacherAttendanceStatus,
      note: marks[row.teacher.id]!.note || undefined
    }))
})

function teacherName(teacher: Teacher) {
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function statusBadgeLabel(teacherId: string) {
  const status = marks[teacherId]?.status
  return status
    ? TEACHER_ATTENDANCE_STATUS_OPTIONS.find(o => o.value === status)?.label || status
    : 'Not marked'
}

function statusMenuItems(teacherId: string) {
  return TEACHER_ATTENDANCE_STATUS_OPTIONS.map(option => ({
    label: option.label,
    icon: option.icon,
    onClick: () => {
      const entry = marks[teacherId]
      if (entry) entry.status = option.value
    }
  }))
}

async function saveAttendance() {
  if (!pendingChanges.value.length) return
  try {
    await store.mark(date.value, pendingChanges.value)
    notify.success('Attendance saved successfully')
    store.fetchHistory(historyPage.value, 10)
  } catch (err: any) {
    notify.error(err?.message || 'Failed to save attendance')
  }
}

async function onAdminClockIn(teacherId: string) {
  try {
    await store.adminClockIn(teacherId, date.value)
    notify.success('Teacher clocked in.')
    store.fetchHistory(historyPage.value, 10)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to clock the teacher in.')
  }
}

async function onAdminClockOut(teacherId: string) {
  try {
    await store.adminClockOut(teacherId, date.value)
    notify.success('Teacher clocked out.')
    store.fetchHistory(historyPage.value, 10)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to clock the teacher out.')
  }
}

async function onAdminUnclock(teacherId: string) {
  try {
    await store.adminUnclock(teacherId, date.value)
    notify.success('Clock corrected.')
    store.fetchHistory(historyPage.value, 10)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to undo the clock.')
  }
}

watch(date, () => store.fetchRoster(date.value))
watch(historyPage, () => store.fetchHistory(historyPage.value, 10))

onMounted(() => {
  useAppStore().setTitle('Mark Attendance')
  useAppStore().setBack('/hr')
  document.title = 'Mark Attendance | HR | Skultem'

  store.fetchRoster(date.value)
  store.fetchHistory(1, 10)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
