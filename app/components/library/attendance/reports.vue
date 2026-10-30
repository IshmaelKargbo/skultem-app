<script setup lang="ts">
// Library Attendance reports (docs/LIBRARY_ATTENDANCE.md §10). Independent visits and class sessions are
// reported separately - never added into one "library attendance" figure. Totals count finalized registers
// only; cancelled and incomplete ones are listed as not counted.
const { canSuperviseAttendance } = useLibraryAccess()
const { error: toastError } = useNotify()
const route = useRoute()

const today = schoolToday()
const from = ref(addDays(today, -29))
const to = ref(today)
const rangeError = computed(() => {
  if (!from.value || !to.value) return 'Choose a date range'
  if (to.value < from.value) return 'The end date must be on or after the start date'
  const days = (Date.parse(to.value) - Date.parse(from.value)) / 86400000
  return days >= 92 ? 'Choose a range of at most 92 days' : ''
})

const totals = ref<LibraryAttendanceTotals | null>(null)
const totalsLoading = ref(false)

async function loadTotals() {
  if (rangeError.value) return
  totalsLoading.value = true
  try {
    totals.value = await LibraryAttendanceApi().totals(from.value, to.value)
  } catch (err: any) {
    toastError(err?.message || 'Failed to load totals')
  } finally {
    totalsLoading.value = false
  }
}

// Student history
const studentId = ref(String(route.query.student || ''))
const { searchTerm, students, loading: studentsLoading } = useStudentSearch(25, () => [studentId.value])
const history = ref<StudentLibraryHistory | null>(null)
const historyLoading = ref(false)

async function loadHistory() {
  history.value = null
  if (!studentId.value) return
  historyLoading.value = true
  try {
    history.value = await LibraryAttendanceApi().studentHistory(studentId.value)
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the student\'s library record')
  } finally {
    historyLoading.value = false
  }
}

const exporting = ref('')
async function run(key: string, action: () => Promise<void>) {
  exporting.value = key
  try {
    await action()
  } catch (err: any) {
    toastError(err?.message || 'Failed to export')
  } finally {
    exporting.value = ''
  }
}

function exportItems(kind: 'visits' | 'sessions' | 'totals' | 'student') {
  const api = LibraryAttendanceApi()
  const action = (format: 'csv' | 'pdf') => {
    switch (kind) {
      case 'visits': return api.exportVisits(format, { from: from.value, to: to.value })
      case 'sessions': return api.exportSessions(format, from.value, to.value)
      case 'totals': return api.exportTotals(format, from.value, to.value)
      default: return api.exportStudent(format, studentId.value)
    }
  }
  return [
    { label: 'CSV', icon: 'i-lucide-file-spreadsheet', onSelect: () => run(kind, () => action('csv')) },
    { label: 'PDF', icon: 'i-lucide-file-text', onSelect: () => run(kind, () => action('pdf')) }
  ]
}

watch([from, to], loadTotals)
watch(studentId, loadHistory)
onMounted(() => {
  loadTotals()
  loadHistory()
})
</script>

<template>
  <div class="space-y-3">
    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 class="font-semibold">Class Library Attendance</h3>
            <p class="text-xs text-muted">Present, absent and excused from finalized registers only.</p>
          </div>
          <div class="flex flex-wrap items-end gap-2">
            <UFormField label="From">
              <UInput v-model="from" type="date" :max="to" />
            </UFormField>
            <UFormField label="To">
              <UInput v-model="to" type="date" :min="from" />
            </UFormField>
            <template v-if="canSuperviseAttendance">
              <UDropdownMenu :items="exportItems('totals')">
                <UButton icon="i-lucide-download" variant="outline" label="Totals"
                  :loading="exporting === 'totals'" :disabled="!!rangeError" />
              </UDropdownMenu>
              <UDropdownMenu :items="exportItems('sessions')">
                <UButton icon="i-lucide-download" variant="outline" label="Sessions"
                  :loading="exporting === 'sessions'" :disabled="!!rangeError" />
              </UDropdownMenu>
              <UDropdownMenu :items="exportItems('visits')">
                <UButton icon="i-lucide-download" variant="outline" label="Visits"
                  :loading="exporting === 'visits'" :disabled="!!rangeError" />
              </UDropdownMenu>
            </template>
          </div>
        </div>
        <p v-if="rangeError" class="mt-2 text-sm text-error">{{ rangeError }}</p>
      </template>

      <div v-if="totalsLoading && !totals" class="space-y-2">
        <USkeleton v-for="i in 4" :key="i" class="h-10 w-full" />
      </div>
      <template v-else-if="totals">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-muted">
                <th class="py-2 pr-3 font-medium">Class</th>
                <th class="py-2 pr-3 text-right font-medium">Sessions</th>
                <th class="py-2 pr-3 text-right font-medium">Present</th>
                <th class="py-2 pr-3 text-right font-medium">Absent</th>
                <th class="py-2 text-right font-medium">Excused</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="row in totals.classes" :key="row.classSessionId || row.className">
                <td class="py-2 pr-3">{{ row.className }}</td>
                <td class="py-2 pr-3 text-right">{{ row.sessions }}</td>
                <td class="py-2 pr-3 text-right">{{ row.present }}</td>
                <td class="py-2 pr-3 text-right">{{ row.absent }}</td>
                <td class="py-2 text-right">{{ row.excused }}</td>
              </tr>
              <tr v-if="!totals.classes.length">
                <td colspan="5" class="py-8 text-center text-muted">No finalized registers in this range.</td>
              </tr>
              <tr v-else class="font-semibold">
                <td class="py-2 pr-3">{{ totals.overall.className }}</td>
                <td class="py-2 pr-3 text-right">{{ totals.overall.sessions }}</td>
                <td class="py-2 pr-3 text-right">{{ totals.overall.present }}</td>
                <td class="py-2 pr-3 text-right">{{ totals.overall.absent }}</td>
                <td class="py-2 text-right">{{ totals.overall.excused }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-muted">
          Not counted: {{ totals.incompleteSessions }} incomplete and {{ totals.cancelledSessions }} cancelled
          {{ totals.incompleteSessions + totals.cancelledSessions === 1 ? 'session' : 'sessions' }}.
          <ULink v-if="totals.incompleteSessions" to="/library/attendance/sessions?status=INCOMPLETE" class="text-primary">
            See incomplete registers
          </ULink>
        </p>
      </template>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 class="font-semibold">Student Library Record</h3>
            <p class="text-xs text-muted">A student's own visits and their class library sessions, kept apart.</p>
          </div>
          <div class="flex flex-wrap items-end gap-2">
            <USelectMenu v-model="studentId" v-model:search-term="searchTerm" value-key="value" :items="students"
              :loading="studentsLoading" ignore-filter placeholder="Search for a student" class="w-full sm:w-72" />
            <UDropdownMenu v-if="canSuperviseAttendance && studentId" :items="exportItems('student')">
              <UButton icon="i-lucide-download" variant="outline" label="Export" :loading="exporting === 'student'" />
            </UDropdownMenu>
          </div>
        </div>
      </template>

      <div v-if="historyLoading" class="space-y-2">
        <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
      </div>
      <p v-else-if="!history" class="py-8 text-center text-sm text-muted">Choose a student to see their library record.</p>
      <div v-else class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Independent visits ({{ history.visits.length }})
          </p>
          <p v-if="!history.visits.length" class="text-sm text-muted">No visits.</p>
          <ul v-else class="divide-y divide-default rounded-xl border border-default">
            <li v-for="v in history.visits" :key="v.id" class="flex items-center justify-between gap-3 px-3 py-2">
              <div>
                <p class="text-sm">{{ formatDateTime(v.checkedInAt) }}</p>
                <p class="text-xs text-muted">
                  <template v-if="v.durationMinutes !== null">{{ formatMinutes(v.durationMinutes) }}</template>
                  <template v-else-if="v.status === 'RESOLVED'">Check-out not recorded</template>
                </p>
              </div>
              <UBadge size="sm" variant="soft" :color="visitState(v).color" :label="visitState(v).label" />
            </li>
          </ul>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Class library sessions ({{ history.sessions.length }})
          </p>
          <p v-if="!history.sessions.length" class="text-sm text-muted">No class library sessions.</p>
          <ul v-else class="divide-y divide-default rounded-xl border border-default">
            <li v-for="s in history.sessions" :key="s.sessionId" class="flex items-center justify-between gap-3 px-3 py-2">
              <div>
                <ULink :to="`/library/attendance/sessions/${s.sessionId}`" class="text-sm hover:text-primary">
                  {{ formatDayLabel(s.date) }} · {{ s.className }}
                </ULink>
                <p class="text-xs text-muted">
                  {{ s.periodName }}
                  <template v-if="s.sessionStatus === 'CANCELLED'"> · session cancelled, not counted</template>
                  <template v-else-if="s.sessionStatus === 'IN_PROGRESS'"> · not finalized yet</template>
                  <template v-if="s.corrected"> · corrected</template>
                </p>
              </div>
              <UBadge size="sm" variant="soft" :color="registerStatusStyle[s.status].color"
                :label="registerStatusStyle[s.status].label" />
            </li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>
