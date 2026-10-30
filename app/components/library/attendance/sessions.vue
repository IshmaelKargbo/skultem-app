<script setup lang="ts">
// Scheduled class library sessions (Workflow B), a week at a time. They come from the school's timetable - the
// Library subject's periods - so there's nothing to create here: open one to take its register, or cancel it.
const store = useLibraryAttendanceStore()
const { overview } = storeToRefs(store)
const { canRecordAttendance, canSuperviseAttendance } = useLibraryAccess()
const { error: toastError, success: toastSuccess } = useNotify()
const route = useRoute()

const today = schoolToday()
const initialFilter = String(route.query.status || '').toUpperCase() as SessionFilter
const filter = ref<SessionFilter>(sessionFilterOptions.some(o => o.value === initialFilter) ? initialFilter : 'ALL')
// "Incomplete" looks back over the last few weeks; every other view is one week.
const week = ref(weekStart(String(route.query.week || today)))
const range = computed(() => filter.value === 'INCOMPLETE'
  ? { from: addDays(today, -42), to: today }
  : { from: week.value, to: addDays(week.value, 6) })

const sessions = ref<LibrarySession[]>([])
const loading = ref(false)
const openingKey = ref('')

// Latest day first; within a day, periods stay in the order the server gives them (by period time).
const byDate = computed(() => {
  const groups = new Map<string, LibrarySession[]>()
  for (const s of sessions.value) {
    const rows = groups.get(s.date)
    if (rows) rows.push(s)
    else groups.set(s.date, [s])
  }
  return [...groups.entries()]
    .map(([date, rows]) => ({ date, rows }))
    .sort((a, b) => b.date.localeCompare(a.date))
})

let request = 0
async function load() {
  const mine = ++request
  loading.value = true
  try {
    const rows = await LibraryAttendanceApi().listSessions(range.value.from, range.value.to, { status: filter.value })
    if (mine === request) sessions.value = rows
  } catch (err: any) {
    if (mine === request) toastError(err?.message || 'Failed to load sessions')
  } finally {
    if (mine === request) loading.value = false
  }
}

function key(s: LibrarySession) {
  return s.id || `${s.timetableEntryId}|${s.date}`
}

function canOpen(s: LibrarySession) {
  return s.status === 'UPCOMING' && s.editable && s.date <= today && !!s.timetableEntryId && canRecordAttendance.value
}

function canCancel(s: LibrarySession) {
  return (s.status === 'UPCOMING' || s.status === 'IN_PROGRESS') && s.editable && canSuperviseAttendance.value
}

async function openSession(s: LibrarySession) {
  openingKey.value = key(s)
  try {
    const detail = await LibraryAttendanceApi().openSession(s.timetableEntryId!, s.date)
    store.changed()
    await navigateTo(`/library/attendance/sessions/${detail.session.id}`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to open the session')
  } finally {
    openingKey.value = ''
  }
}

const cancelling = ref<LibrarySession | null>(null)
const cancelOpen = ref(false)
const cancelSaving = ref(false)

function startCancel(s: LibrarySession) {
  cancelling.value = s
  cancelOpen.value = true
}

async function cancel(reason: string) {
  const s = cancelling.value
  if (!s) return
  cancelSaving.value = true
  try {
    if (s.id) await LibraryAttendanceApi().cancelSession(s.id, reason)
    else await LibraryAttendanceApi().cancelUpcoming(s.timetableEntryId!, s.date, reason)
    toastSuccess('Session cancelled')
    cancelOpen.value = false
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to cancel the session')
  } finally {
    cancelSaving.value = false
  }
}

watch([filter, week], load)
watch(() => store.changeVersion, load)
onMounted(load)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div v-if="filter !== 'INCOMPLETE'" class="flex items-center gap-2">
          <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="sm" aria-label="Previous week"
            @click="() => { week = addDays(week, -7) }" />
          <p class="min-w-44 text-center text-sm font-medium">
            {{ formatDayLabel(range.from) }} - {{ formatDayLabel(range.to) }}
          </p>
          <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="sm" aria-label="Next week"
            @click="() => { week = addDays(week, 7) }" />
          <UButton v-if="week !== weekStart(today)" label="This week" variant="ghost" size="sm"
            @click="() => { week = weekStart(today) }" />
        </div>
        <p v-else class="text-sm text-muted">
          Sessions from the last six weeks whose period is over and whose register isn't finalized.
          Nobody is marked absent for these.
        </p>
        <USelectMenu v-model="filter" value-key="value" :items="sessionFilterOptions" :search-input="false"
          class="w-full sm:w-48" />
      </div>
    </template>

    <div v-if="loading && !sessions.length" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-xl" />
    </div>

    <div v-else-if="!sessions.length" class="flex flex-col items-center gap-3 py-16 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
        <UIcon :name="LIBRARY_SESSION_ICON" class="text-4xl text-primary-500" />
      </div>
      <h3 class="font-semibold text-gray-900 dark:text-white">No library sessions</h3>
      <p class="max-w-md text-sm text-muted">
        <template v-if="overview && !overview.libraryPeriods">
          There are no Library periods on the timetable yet. Once the school adds them to a class's periods, each
          one shows up here every week.
        </template>
        <template v-else>
          Sessions come from the Library periods on the timetable. Holidays and days outside a term have none.
        </template>
      </p>
    </div>

    <div v-else class="space-y-5">
      <div v-for="group in byDate" :key="group.date" class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">
          {{ formatDayLabel(group.date) }}<span v-if="group.date === today"> · Today</span>
        </p>

        <div v-for="s in group.rows" :key="key(s)"
          class="flex flex-col gap-3 rounded-xl border border-default p-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium">{{ s.className }}</p>
              <UBadge size="sm" variant="soft" :color="sessionStatusStyle[s.status].color"
                :label="sessionStatusStyle[s.status].label" />
              <UBadge v-if="s.incomplete" size="sm" variant="soft" color="error" label="Incomplete" />
            </div>
            <p class="text-xs text-muted">
              {{ s.periodName }} · {{ shortTime(s.startTime) }}-{{ shortTime(s.endTime) }}<span v-if="s.roomName"> · {{ s.roomName }}</span>
            </p>
            <p v-if="s.status === 'CANCELLED'" class="text-xs text-muted">Cancelled: {{ s.cancelReason }}</p>
            <p v-else-if="s.id" class="text-xs text-muted">
              {{ s.present }} present · {{ s.absent }} absent · {{ s.excused }} excused<span v-if="s.unmarked"> · {{ s.unmarked }} unmarked</span>
            </p>
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <UButton v-if="canOpen(s)" :icon="LIBRARY_ATTENDANCE_ICON" size="sm" label="Take Register"
              :loading="openingKey === key(s)" @click="openSession(s)" />
            <UButton v-else-if="s.id" :to="`/library/attendance/sessions/${s.id}`" size="sm" variant="soft"
              :label="s.status === 'IN_PROGRESS' && canRecordAttendance ? 'Continue Register' : 'View Register'" />
            <UButton v-if="canCancel(s)" size="sm" variant="ghost" color="error" label="Cancel"
              @click="startCancel(s)" />
          </div>
        </div>
      </div>
    </div>
  </UCard>

  <LibraryAttendanceReasonModal v-model:open="cancelOpen" title="Cancel Library Session"
    :description="cancelling ? `${cancelling.className}, ${formatDayLabel(cancelling.date)} ${shortTime(cancelling.startTime)}. Nobody is marked absent for a cancelled session, and this can't be undone.` : undefined"
    confirm-label="Cancel Session" color="error" :loading="cancelSaving"
    placeholder="e.g. Library used for exams" @confirm="cancel" />
</template>
