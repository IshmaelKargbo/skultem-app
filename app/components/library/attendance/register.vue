<script setup lang="ts">
// One class library session's register (Workflow B). While it's in progress the librarian marks each student
// by hand, can add or take students off the roster (with a reason), and finalizes it once nobody is unmarked.
// After that only a principal-level user can correct a mark, and every correction is kept.
const props = defineProps<{ sessionId: string }>()

const store = useLibraryAttendanceStore()
const { canRecordAttendance, canSuperviseAttendance, canCorrectAttendance } = useLibraryAccess()
const { success: toastSuccess, error: toastError } = useNotify()

const detail = ref<LibrarySessionDetail | null>(null)
const loading = ref(true)
const saving = ref(false)

// What's on screen, before it is saved: recordId -> mark.
const marks = reactive<Record<string, { status: RegisterStatus, excuseReason: string }>>({})

const session = computed(() => detail.value?.session)
const editing = computed(() => !!session.value?.editable && canRecordAttendance.value)
const onRoster = computed(() => (detail.value?.records || []).filter(r => !r.removed))
const takenOff = computed(() => (detail.value?.records || []).filter(r => r.removed))
const unmarked = computed(() => onRoster.value.filter(r => (marks[r.id]?.status ?? r.status) === 'UNMARKED'))

const changed = computed(() => onRoster.value.filter((r) => {
  const m = marks[r.id]
  if (!m || m.status === 'UNMARKED') return false
  return m.status !== r.status || (m.status === 'EXCUSED' && (m.excuseReason || '') !== (r.excuseReason || ''))
}))

const counts = computed(() => {
  const c = { PRESENT: 0, ABSENT: 0, EXCUSED: 0, UNMARKED: 0 } as Record<RegisterStatus, number>
  for (const r of onRoster.value) c[marks[r.id]?.status ?? r.status]++
  return c
})

function apply(d: LibrarySessionDetail) {
  detail.value = d
  for (const key of Object.keys(marks)) delete marks[key]
  for (const r of d.records) marks[r.id] = { status: r.status, excuseReason: r.excuseReason || '' }
}

async function load() {
  loading.value = true
  try {
    apply(await LibraryAttendanceApi().session(props.sessionId))
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the register')
  } finally {
    loading.value = false
  }
}

function setMark(row: RegisterRow, status: FinalStatus) {
  marks[row.id] = { status, excuseReason: status === 'EXCUSED' ? (marks[row.id]?.excuseReason || '') : '' }
}

// An explicit shortcut, never a default: only fills in students nobody has marked yet.
function markRemainingPresent() {
  for (const r of unmarked.value) marks[r.id] = { status: 'PRESENT', excuseReason: '' }
}

async function save(quiet = false) {
  if (!changed.value.length) return true
  saving.value = true
  try {
    apply(await LibraryAttendanceApi().saveMarks(props.sessionId, changed.value.map(r => ({
      recordId: r.id,
      status: marks[r.id]!.status as FinalStatus,
      excuseReason: marks[r.id]!.status === 'EXCUSED' ? marks[r.id]!.excuseReason || null : null
    }))))
    if (!quiet) toastSuccess('Register saved')
    store.changed()
    return true
  } catch (err: any) {
    toastError(err?.message || 'Failed to save the register')
    return false
  } finally {
    saving.value = false
  }
}

// Finalizing: review first. With anyone unmarked the dialog lists them instead of offering to finalize.
const finalizeOpen = ref(false)
const finalizing = ref(false)

async function startFinalize() {
  if (!(await save(true))) return
  finalizeOpen.value = true
}

async function finalize() {
  finalizing.value = true
  try {
    apply(await LibraryAttendanceApi().finalize(props.sessionId))
    toastSuccess('Register finalized')
    finalizeOpen.value = false
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to finalize the register')
  } finally {
    finalizing.value = false
  }
}

// Roster changes
const addOpen = ref(false)
const addStudentId = ref('')
const { searchTerm: studentSearch, students, loading: studentsLoading } = useStudentSearch(25, () => [addStudentId.value])
const rosterSaving = ref(false)

async function addStudent(reason: string) {
  if (!addStudentId.value) return toastError('Choose a student')
  if (!(await save(true))) return
  rosterSaving.value = true
  try {
    apply(await LibraryAttendanceApi().addToRoster(props.sessionId, addStudentId.value, reason))
    toastSuccess('Student added to the register')
    addOpen.value = false
    addStudentId.value = ''
  } catch (err: any) {
    toastError(err?.message || 'Failed to add the student')
  } finally {
    rosterSaving.value = false
  }
}

const removing = ref<RegisterRow | null>(null)
const removeOpen = ref(false)

function startRemove(row: RegisterRow) {
  removing.value = row
  removeOpen.value = true
}

async function removeStudent(reason: string) {
  if (!removing.value) return
  if (!(await save(true))) return
  rosterSaving.value = true
  try {
    apply(await LibraryAttendanceApi().removeFromRoster(props.sessionId, removing.value.id, reason))
    toastSuccess('Student taken off the register')
    removeOpen.value = false
  } catch (err: any) {
    toastError(err?.message || 'Failed to remove the student')
  } finally {
    rosterSaving.value = false
  }
}

// Cancelling an in-progress session
const cancelOpen = ref(false)
const cancelSaving = ref(false)

async function cancel(reason: string) {
  cancelSaving.value = true
  try {
    apply(await LibraryAttendanceApi().cancelSession(props.sessionId, reason))
    toastSuccess('Session cancelled')
    cancelOpen.value = false
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to cancel the session')
  } finally {
    cancelSaving.value = false
  }
}

// Corrections (finalized registers, principal-level only)
const correcting = ref<RegisterRow | null>(null)
const correctOpen = ref(false)
const correctStatus = ref<FinalStatus>('PRESENT')
const correctExcuse = ref('')
const correctSaving = ref(false)

function startCorrect(row: RegisterRow) {
  correcting.value = row
  correctStatus.value = finalStatuses.find(s => s !== row.status) || 'PRESENT'
  correctExcuse.value = ''
  correctOpen.value = true
}

async function correct(reason: string) {
  if (!correcting.value) return
  correctSaving.value = true
  try {
    apply(await LibraryAttendanceApi().correct(props.sessionId, correcting.value.id, correctStatus.value, reason,
      correctStatus.value === 'EXCUSED' ? correctExcuse.value || null : null))
    toastSuccess('Attendance corrected')
    correctOpen.value = false
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to correct the attendance')
  } finally {
    correctSaving.value = false
  }
}

const statusItems = finalStatuses.map(s => ({ label: registerStatusStyle[s].label, value: s }))

onBeforeRouteLeave(() => {
  if (changed.value.length && !window.confirm('You have unsaved marks on this register. Leave anyway?')) return false
})

onMounted(load)
</script>

<template>
  <div v-if="loading" class="space-y-3">
    <USkeleton class="h-28 w-full rounded-2xl" />
    <USkeleton class="h-96 w-full rounded-2xl" />
  </div>

  <div v-else-if="detail && session" class="space-y-3">
    <!-- Session -->
    <UCard>
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg font-semibold">{{ session.className }}</h2>
            <UBadge variant="soft" :color="sessionStatusStyle[session.status].color"
              :label="sessionStatusStyle[session.status].label" />
            <UBadge v-if="session.incomplete" variant="soft" color="error" label="Incomplete" />
          </div>
          <p class="text-sm text-muted">
            {{ formatDayLabel(session.date) }} · {{ session.periodName }} · {{ shortTime(session.startTime) }}-{{ shortTime(session.endTime) }}<span v-if="session.roomName"> · {{ session.roomName }}</span>
          </p>
          <p class="text-xs text-muted">
            <span v-if="detail.openedByName">Opened by {{ detail.openedByName }} {{ formatDateTime(detail.openedAt || '') }}.</span>
            <span v-if="detail.finalizedAt"> Finalized by {{ detail.finalizedByName }} {{ formatDateTime(detail.finalizedAt) }}.</span>
            <span v-if="detail.cancelledAt"> Cancelled by {{ detail.cancelledByName }} {{ formatDateTime(detail.cancelledAt) }}: {{ session.cancelReason }}</span>
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UBadge variant="subtle" color="success" :label="`${counts.PRESENT} present`" />
          <UBadge variant="subtle" color="error" :label="`${counts.ABSENT} absent`" />
          <UBadge variant="subtle" color="warning" :label="`${counts.EXCUSED} excused`" />
          <UBadge v-if="session.status === 'IN_PROGRESS'" variant="subtle" color="neutral"
            :label="`${counts.UNMARKED} unmarked`" />
        </div>
      </div>

      <UAlert v-if="session.status === 'IN_PROGRESS' && !session.editable" class="mt-4" color="neutral" variant="soft"
        icon="i-lucide-lock" title="This session's term has ended"
        description="It can no longer be marked or finalized, and nobody is counted absent for it." />
      <UAlert v-if="session.status === 'CANCELLED'" class="mt-4" color="neutral" variant="soft" icon="i-lucide-ban"
        title="Cancelled - nobody is counted absent"
        description="Any marks entered before the cancellation are kept here for the record only." />
    </UCard>

    <!-- Register -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="font-semibold">Register</h3>
            <p class="text-xs text-muted">
              The class as it was when the session was opened. Later class changes don't alter it.
            </p>
          </div>
          <div v-if="editing" class="flex flex-wrap gap-2">
            <UButton v-if="counts.UNMARKED" size="sm" variant="soft" color="success" icon="i-lucide-check-check"
              :label="`Mark ${counts.UNMARKED} remaining Present`" @click="markRemainingPresent" />
            <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-user-plus" label="Add Student"
              @click="() => { addOpen = true }" />
          </div>
        </div>
      </template>

      <div v-if="!onRoster.length" class="py-12 text-center text-sm text-muted">
        Nobody is on this register.<span v-if="editing"> Add the students who attended.</span>
      </div>

      <ul v-else class="divide-y divide-default">
        <li v-for="row in onRoster" :key="row.id"
          class="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between"
          :class="editing && marks[row.id]?.status === 'UNMARKED' ? 'bg-warning/5' : ''">
          <div class="min-w-0">
            <p class="text-sm font-medium">
              {{ row.studentName }}
              <UBadge v-if="row.addedManually" size="sm" variant="soft" color="neutral" label="Added" class="ml-1" />
              <UBadge v-if="row.corrected" size="sm" variant="soft" color="info" label="Corrected" class="ml-1" />
            </p>
            <p class="text-xs text-muted">{{ row.studentClass }}</p>
          </div>

          <div v-if="editing" class="flex flex-col gap-2 md:items-end">
            <div class="flex flex-wrap items-center gap-1.5">
              <UButton v-for="s in finalStatuses" :key="s" size="xs" :label="registerStatusStyle[s].label"
                :color="registerStatusStyle[s].color" :variant="marks[row.id]?.status === s ? 'solid' : 'outline'"
                :disabled="saving" @click="setMark(row, s)" />
              <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-user-minus"
                aria-label="Take off the register" @click="startRemove(row)" />
            </div>
            <UInput v-if="marks[row.id]?.status === 'EXCUSED'" v-model="marks[row.id]!.excuseReason" size="xs"
              :maxlength="500" placeholder="Reason (optional)" class="w-full md:w-64" />
          </div>

          <div v-else class="flex items-center gap-2">
            <div class="text-right">
              <UBadge variant="soft" :color="registerStatusStyle[row.status].color"
                :label="registerStatusStyle[row.status].label" />
              <p v-if="row.excuseReason" class="mt-1 text-xs text-muted">{{ row.excuseReason }}</p>
            </div>
            <UButton v-if="session.status === 'COMPLETED' && canCorrectAttendance" size="xs" variant="ghost"
              icon="i-lucide-pencil" label="Correct" @click="startCorrect(row)" />
          </div>
        </li>
      </ul>

      <template v-if="editing || (canSuperviseAttendance && session.status === 'IN_PROGRESS' && session.editable)" #footer>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-muted">
            <template v-if="changed.length">{{ changed.length }} unsaved {{ changed.length === 1 ? 'change' : 'changes' }}</template>
            <template v-else-if="editing">All marks saved</template>
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton v-if="canSuperviseAttendance" variant="ghost" color="error" label="Cancel Session"
              @click="() => { cancelOpen = true }" />
            <template v-if="editing">
              <UButton variant="outline" :icon="SAVE_ICON" label="Save" :loading="saving" :disabled="!changed.length"
                @click="() => { save() }" />
              <UButton icon="i-lucide-lock" label="Finalize Register" :loading="saving" :disabled="!onRoster.length"
                @click="startFinalize" />
            </template>
          </div>
        </div>
      </template>
    </UCard>

    <!-- History -->
    <UCard v-if="takenOff.length || detail.rosterChanges.length || detail.corrections.length">
      <template #header>
        <h3 class="font-semibold">Changes</h3>
      </template>
      <div class="space-y-4 text-sm">
        <div v-if="detail.corrections.length" class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Corrections after finalizing</p>
          <p v-for="(c, i) in detail.corrections" :key="`c${i}`">
            <span class="font-medium">{{ c.studentName }}</span>:
            {{ registerStatusStyle[c.originalStatus].label }} → {{ registerStatusStyle[c.correctedStatus].label }}
            <span class="text-muted">- {{ c.reason }} ({{ c.correctedByName }}, {{ formatDateTime(c.correctedAt) }})</span>
          </p>
        </div>
        <div v-if="detail.rosterChanges.length" class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Roster changes</p>
          <p v-for="(c, i) in detail.rosterChanges" :key="`r${i}`">
            <span class="font-medium">{{ c.studentName }}</span>
            {{ c.change === 'ADDED' ? 'added' : 'taken off' }}
            <span class="text-muted">- {{ c.reason }} ({{ c.changedByName }}, {{ formatDateTime(c.changedAt) }})</span>
          </p>
        </div>
        <div v-if="takenOff.length" class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Not on the register (not counted)</p>
          <p v-for="r in takenOff" :key="r.id" class="text-muted">{{ r.studentName }} · {{ r.studentClass }}</p>
        </div>
      </div>
    </UCard>
  </div>

  <!-- Finalize review -->
  <UModal v-model:open="finalizeOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ unmarked.length ? 'Some students are unmarked' : 'Finalize Register' }}</h3>
        </template>

        <div v-if="unmarked.length" class="space-y-3">
          <p class="text-sm text-muted">
            Mark each of these students Present, Absent or Excused before finalizing:
          </p>
          <ul class="max-h-64 divide-y divide-default overflow-y-auto rounded-xl border border-default">
            <li v-for="r in unmarked" :key="r.id" class="px-3 py-2 text-sm">{{ r.studentName }}</li>
          </ul>
        </div>
        <div v-else class="space-y-2 text-sm">
          <p>{{ counts.PRESENT }} present, {{ counts.ABSENT }} absent, {{ counts.EXCUSED }} excused.</p>
          <p class="text-muted">
            After finalizing, the register is locked. Only a principal can correct it, and every correction is
            recorded.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton :label="unmarked.length ? 'Back to Register' : 'Back'" variant="outline" color="neutral"
              :disabled="finalizing" @click="() => { finalizeOpen = false }" />
            <UButton v-if="!unmarked.length" icon="i-lucide-lock" label="Finalize" :loading="finalizing"
              @click="finalize" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>

  <LibraryAttendanceReasonModal v-model:open="addOpen" title="Add Student to Register"
    description="For a student who attended but wasn't on the class list when the session was opened."
    confirm-label="Add Student" :loading="rosterSaving" placeholder="e.g. Joined the class this week"
    @confirm="addStudent">
    <UFormField label="Student" required class="mb-4">
      <USelectMenu v-model="addStudentId" v-model:search-term="studentSearch" value-key="value" :items="students"
        :loading="studentsLoading" ignore-filter placeholder="Search for a student" class="w-full" />
    </UFormField>
  </LibraryAttendanceReasonModal>

  <LibraryAttendanceReasonModal v-model:open="removeOpen" title="Take Student off Register"
    :description="removing ? `${removing.studentName} won't be counted for this session. The change is kept.` : undefined"
    confirm-label="Take Off Register" color="warning" :loading="rosterSaving"
    placeholder="e.g. Moved to another class" @confirm="removeStudent" />

  <LibraryAttendanceReasonModal v-model:open="cancelOpen" title="Cancel Library Session"
    description="Nobody is marked absent for a cancelled session, and this can't be undone." confirm-label="Cancel Session"
    color="error" :loading="cancelSaving" placeholder="e.g. Library used for exams" @confirm="cancel" />

  <LibraryAttendanceReasonModal v-model:open="correctOpen" title="Correct Attendance"
    :description="correcting ? `${correcting.studentName} is marked ${registerStatusStyle[correcting.status].label}. The original mark and this correction are both kept.` : undefined"
    confirm-label="Save Correction" :loading="correctSaving" placeholder="e.g. Was in the library, marked by mistake"
    @confirm="correct">
    <div class="mb-4 space-y-3">
      <UFormField label="Correct to" required>
        <USelectMenu v-model="correctStatus" value-key="value" :search-input="false"
          :items="statusItems.filter(i => i.value !== correcting?.status)" class="w-full" />
      </UFormField>
      <UFormField v-if="correctStatus === 'EXCUSED'" label="Excuse (optional)">
        <UInput v-model="correctExcuse" :maxlength="500" class="w-full" />
      </UFormField>
    </div>
  </LibraryAttendanceReasonModal>
</template>
