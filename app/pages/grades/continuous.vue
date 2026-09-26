<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading :title="assessment ? `${assessment.name} - Continuous Assessment` : 'Continuous Assessment'"
      :subtitle="subtitle">
      <UButton to="/grades" icon="lucide:arrow-left" label="Back to grades" color="neutral" variant="subtle" />
    </Heading>

    <UCard v-if="loading">
      <USkeleton class="h-40 w-full" />
    </UCard>

    <UCard v-else-if="!structure || !assessment">
      <div class="space-y-3 py-6 text-center">
        <p class="text-sm font-medium text-highlighted">This assessment isn't scored as continuous assessment</p>
        <p class="text-xs text-muted">Pick a subject that is set up for CA + formal test from the grade entry page.</p>
        <UButton to="/grades" label="Go to grade entry" />
      </div>
    </UCard>

    <template v-else>
      <!-- The two steps: every CA recording first, then the formal test. -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="rounded-xl border p-3" :class="step === 1 ? 'border-primary bg-primary/5' : 'border-default'">
          <div class="flex items-center gap-2">
            <UIcon :name="caSubmitted ? 'lucide:check-circle' : 'lucide:circle-dot'"
              :class="caSubmitted ? 'text-success' : 'text-primary'" />
            <p class="text-sm font-semibold text-highlighted">Step 1 · CA recordings</p>
          </div>
          <p class="mt-1 text-xs text-muted">
            {{ structure.caEntries }} {{ CA_UNITS[structure.caFrequency].plural }} for every student
            ({{ structure.caPercentage }}%). Lock each week once everyone has it, then submit the CA - it locks the rest.
            <span v-if="caSubmitted" class="font-medium text-success">Submitted.</span>
          </p>
        </div>
        <div class="rounded-xl border p-3" :class="step === 2 ? 'border-primary bg-primary/5' : 'border-default'">
          <div class="flex items-center gap-2">
            <UIcon :name="allFormalIn ? 'lucide:check-circle' : caSubmitted ? 'lucide:circle-dot' : 'lucide:lock'"
              :class="allFormalIn ? 'text-success' : caSubmitted ? 'text-primary' : 'text-muted'" />
            <p class="text-sm font-semibold text-highlighted">Step 2 · Formal test</p>
          </div>
          <p class="mt-1 text-xs text-muted">
            One score out of 100 per student ({{ structure.formalPercentage }}%).
            {{ caSubmitted ? '' : 'Opens once the CA is submitted.' }}
          </p>
        </div>
      </div>

      <GradesTeacherCaInsight :assessment="assessment" :rows="rows" />

      <!-- Phone: the weeks as a list (lock / unlock live here), then one card per student - no sideways grid. -->
      <div class="space-y-3 md:hidden">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <p class="text-sm font-semibold text-highlighted">Weeks</p>
          </template>
          <div v-for="n in structure.caEntries" :key="n"
            class="flex items-center justify-between gap-3 border-b border-default px-4 py-2.5 last:border-0">
            <div class="flex min-w-0 items-center gap-2">
              <UIcon :name="isLocked(n) ? 'lucide:lock' : 'lucide:pencil-line'"
                :class="isLocked(n) ? 'text-success' : 'text-muted'" />
              <p class="text-sm font-medium">{{ caRecordingLabel(structure.caFrequency, n) }}</p>
              <span class="text-xs text-muted">{{ weekFilled(n) }}/{{ rows.length }}</span>
            </div>
            <UButton v-if="editable && !isLocked(n) && weekComplete(n)" size="sm" variant="subtle" color="success"
              icon="lucide:lock" label="Lock" :loading="lockingWeek === n" :disabled="busy" @click="lockWeek(n)" />
            <UButton v-else-if="editable && isLocked(n) && isAdmin" size="sm" variant="ghost" color="warning"
              icon="lucide:lock-open" label="Unlock" :disabled="busy" @click="askUnlock(n)" />
            <span v-else-if="isLocked(n)" class="text-xs text-success">Locked</span>
          </div>
        </UCard>

        <div v-for="row in rows" :key="row.id" class="rounded-xl border border-default p-3">
          <div class="mb-3 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-highlighted">{{ row.name }}</p>
              <UBadge v-if="trendOf(row).trend !== 'not-enough-data'" size="sm" variant="subtle" class="mt-1"
                :color="trendOf(row).trend === 'improving' ? 'success' : trendOf(row).trend === 'declining' ? 'error' : 'neutral'"
                :icon="trendOf(row).trend === 'improving' ? 'lucide:trending-up' : trendOf(row).trend === 'declining' ? 'lucide:trending-down' : 'lucide:minus'">
                {{ CA_TREND_LABEL[trendOf(row).trend] }}
              </UBadge>
            </div>
            <div class="shrink-0 rounded-xl border border-default bg-elevated/40 px-3 py-1 text-center">
              <p class="text-lg font-bold text-primary">{{ preview(row).total }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div v-for="n in structure.caEntries" :key="n">
              <p class="mb-1 flex items-center gap-1 text-[11px] text-muted">
                <UIcon v-if="isLocked(n)" name="lucide:lock" class="size-3 text-success" />
                {{ caRecordingLabel(structure.caFrequency, n) }}
              </p>
              <UInput v-if="caEditable && !isLocked(n)" v-model.number="form[row.id]!.entries[n - 1]" type="number"
                min="0" max="100" :ui="{ base: 'text-base' }" @update:model-value="clamp(row.id, n - 1)" />
              <p v-else class="rounded-lg bg-elevated/40 px-3 py-2 text-base">{{ form[row.id]?.entries[n - 1] ?? '-' }}</p>
            </div>
          </div>

          <div class="mt-3 border-t border-dashed border-default pt-3">
            <p class="mb-1 text-[11px] text-muted">Formal test (0-100)</p>
            <UInput v-if="formalEditable" v-model.number="form[row.id]!.formal" type="number" min="0" max="100"
              :ui="{ base: 'text-base' }" @update:model-value="clampFormal(row.id)" />
            <p v-else-if="!caSubmitted" class="inline-flex items-center gap-1 text-xs text-muted">
              <UIcon name="lucide:lock" /> Opens after the CA is submitted
            </p>
            <p v-else class="rounded-lg bg-elevated/40 px-3 py-2 text-base">{{ form[row.id]?.formal ?? '-' }}</p>
            <p class="mt-2 text-xs text-muted">
              CA <span class="font-semibold text-highlighted">{{ preview(row).caPts }}/{{ structure.caPercentage }}</span>
              ({{ preview(row).ca ?? '-' }}% avg) + Test
              <span class="font-semibold text-highlighted">{{ preview(row).formalPts }}/{{ structure.formalPercentage }}</span>
            </p>
          </div>
        </div>
      </div>

      <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="overflow-x-auto">
          <table class="w-full min-w-max text-sm">
            <thead>
              <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-muted">
                <th class="sticky left-0 bg-default px-4 py-3">Student</th>
                <th v-for="n in structure.caEntries" :key="n" class="px-2 py-3 align-top">
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <UIcon v-if="isLocked(n)" name="lucide:lock" class="text-success" />
                    {{ caRecordingLabel(structure.caFrequency, n) }}
                  </div>
                  <!-- Complete for everyone -> lock it, so it can't be changed later. -->
                  <UButton v-if="editable && !isLocked(n) && weekComplete(n)" size="xs" variant="subtle" color="success"
                    icon="lucide:lock" label="Lock" class="mt-1" :loading="lockingWeek === n" :disabled="busy"
                    @click="lockWeek(n)" />
                  <UButton v-else-if="editable && isLocked(n) && isAdmin" size="xs" variant="ghost" color="warning"
                    icon="lucide:lock-open" label="Unlock" class="mt-1" :disabled="busy" @click="askUnlock(n)" />
                </th>
                <th class="px-3 py-3">CA avg</th>
                <th class="px-3 py-3">Formal test</th>
                <th class="px-3 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="border-b border-default last:border-0">
                <td class="sticky left-0 bg-default px-4 py-2">
                  <p class="font-medium text-highlighted whitespace-nowrap">{{ row.name }}</p>
                  <UBadge v-if="trendOf(row).trend !== 'not-enough-data'" size="sm" variant="subtle"
                    :color="trendOf(row).trend === 'improving' ? 'success' : trendOf(row).trend === 'declining' ? 'error' : 'neutral'"
                    :icon="trendOf(row).trend === 'improving' ? 'lucide:trending-up' : trendOf(row).trend === 'declining' ? 'lucide:trending-down' : 'lucide:minus'">
                    {{ CA_TREND_LABEL[trendOf(row).trend] }}
                  </UBadge>
                </td>
                <td v-for="n in structure.caEntries" :key="n" class="px-1 py-2">
                  <UInput v-if="caEditable && !isLocked(n)" v-model.number="form[row.id]!.entries[n - 1]" type="number"
                    min="0" max="100" class="w-20" :ui="{ base: 'text-base' }" @update:model-value="clamp(row.id, n - 1)" />
                  <span v-else class="px-2">{{ form[row.id]?.entries[n - 1] ?? '-' }}</span>
                </td>
                <td class="px-3 py-2 font-medium">{{ preview(row).ca ?? '-' }}</td>
                <td class="px-3 py-2">
                  <UInput v-if="formalEditable" v-model.number="form[row.id]!.formal" type="number" min="0" max="100"
                    class="w-24" :ui="{ base: 'text-base' }" @update:model-value="clampFormal(row.id)" />
                  <span v-else-if="!caSubmitted" class="inline-flex items-center gap-1 text-xs text-muted">
                    <UIcon name="lucide:lock" /> after CA
                  </span>
                  <span v-else>{{ form[row.id]?.formal ?? '-' }}</span>
                </td>
                <td class="px-3 py-2">
                  <UBadge color="primary" variant="soft">{{ preview(row).total }}</UBadge>
                  <p class="mt-0.5 text-[11px] text-muted whitespace-nowrap">
                    CA {{ preview(row).caPts }}/{{ structure.caPercentage }} + Test
                    {{ preview(row).formalPts }}/{{ structure.formalPercentage }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <UCard v-if="editable" class="mb-2">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-muted">{{ hint }}</p>
          <div class="grid grid-cols-2 gap-2 sm:flex">
            <UButton icon="lucide:save" label="Save" color="neutral" variant="subtle" :loading="saving"
              :disabled="busy" @click="save(true)" />
            <UButton v-if="!caSubmitted" icon="lucide:send" label="Submit CA" :loading="submittingCa"
              :disabled="busy || missingCa > 0" @click="submitCa" />
            <UButton v-else icon="lucide:check-circle" label="Submit for approval" color="success"
              :loading="submitting" :disabled="busy || !allFormalIn" @click="submitForApproval" />
          </div>
        </div>
      </UCard>
    </template>

    <UModal v-model:open="unlockOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Unlock {{ structure ? caRecordingLabel(structure.caFrequency, unlockWeek) : '' }}</h3>
          </template>
          <div class="space-y-3">
            <UAlert color="warning" variant="soft" icon="lucide:shield-alert" title="This is recorded on the audit trail"
              description="A locked recording is closed so the record can't be quietly changed. Unlocking it lets it be corrected, and if the CA was already submitted it opens again and has to be re-submitted." />
            <UFormField label="Why is it being unlocked?" required>
              <UTextarea v-model="unlockReason" class="w-full" :rows="2" autoresize
                placeholder="e.g. Week 3 marks were entered against the wrong class" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton class="w-full flex items-center justify-center" label="Cancel" variant="soft"
                :disabled="unlocking" @click="unlockOpen = false" />
              <UButton class="w-full flex items-center justify-center" label="Unlock" color="warning" :loading="unlocking"
                :disabled="!unlockReason.trim()" @click="unlockWeekConfirm" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useAssessmentStore()
const { success, error: toastError } = useNotify()
const { can } = useAuth()
const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const teacherSubjectId = computed(() => String(route.query.teacherSubjectId || ''))
const termId = computed(() => String(route.query.termId || ''))
const assessmentId = computed(() => String(route.query.assessmentId || ''))

const loading = ref(true)
const saving = ref(false)
const submittingCa = ref(false)
const submitting = ref(false)
const busy = computed(() => saving.value || submittingCa.value || submitting.value)

const rows = ref<StudentAssessment[]>([])
const assessment = ref<Assessment | null>(null)

type RowForm = { entries: (number | null)[], formal: number | null }
const form = reactive<Record<string, RowForm>>({})

const structure = computed(() => continuousOf(rows.value, assessmentId.value))
const caSubmitted = computed(() => !!structure.value?.caSubmitted)
const editable = computed(() => !!assessment.value && isEditableStatus(assessment.value.status as ScoreStatus))
const weekFilled = (week: number) => rows.value.filter(r => form[r.id]?.entries[week - 1] != null).length
const isLocked = (week: number) => !!structure.value?.lockedWeeks?.includes(week)
// Every student has a mark for the week - it can be locked.
const weekComplete = (week: number) => rows.value.length > 0
  && rows.value.every(r => form[r.id]?.entries[week - 1] !== null && form[r.id]?.entries[week - 1] !== undefined)
const caEditable = computed(() => editable.value && !caSubmitted.value)
const formalEditable = computed(() => editable.value && caSubmitted.value)
const step = computed(() => caSubmitted.value ? 2 : 1)

const subtitle = computed(() => structure.value
  ? `CA ${structure.value.caPercentage}% + formal test ${structure.value.formalPercentage}% · ${rows.value.length} students`
  : '')

function scoreOf(row: StudentAssessment) {
  return row.scores.find(s => s.assessment === assessmentId.value)
}

function resetForm() {
  for (const k of Object.keys(form)) delete form[k]
  const s = structure.value
  if (!s) return
  for (const row of rows.value) {
    const c = scoreOf(row)?.continuous
    form[row.id] = {
      entries: Array.from({ length: s.caEntries }, (_, i) => c?.caEntryScores?.[i] ?? null),
      formal: c?.formalScore ?? null
    }
  }
}

async function load() {
  loading.value = true
  try {
    const [students, cycles] = await Promise.all([
      store.fetchAllStudentAssessments(teacherSubjectId.value, termId.value),
      store.fetchAllAssessments(teacherSubjectId.value, termId.value)
    ])
    rows.value = students || []
    assessment.value = (cycles || []).find((a: Assessment) => a.id === assessmentId.value) || null
    resetForm()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to load the assessment')
  } finally {
    loading.value = false
  }
}

function clampTo(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : null
}
function clamp(rowId: string, i: number) {
  const f = form[rowId]
  if (f) f.entries[i] = clampTo(f.entries[i])
}
function clampFormal(rowId: string) {
  const f = form[rowId]
  if (f) f.formal = clampTo(f.formal)
}

function preview(row: StudentAssessment) {
  const s = structure.value, f = form[row.id]
  if (!s || !f) return { ca: null as number | null, caPts: 0, formalPts: 0, total: 0 }
  const ca = caComponentOf(f.entries)
  return {
    ca,
    caPts: caPoints(ca, s.caPercentage),
    formalPts: caPoints(f.formal, s.formalPercentage),
    total: caCombine(ca, f.formal, s.caPercentage, s.formalPercentage)
  }
}

function trendOf(row: StudentAssessment) {
  return caTrendOf(form[row.id]?.entries ?? [])
}

// How many CA boxes are still empty across the class - the CA can only be submitted at zero.
const missingCa = computed(() =>
  Object.values(form).reduce((sum, f) => sum + f.entries.filter(v => v === null).length, 0))
const allFormalIn = computed(() =>
  rows.value.length > 0 && rows.value.every(r => form[r.id]?.formal !== null && form[r.id]?.formal !== undefined))

const hint = computed(() => {
  if (!caSubmitted.value)
    return missingCa.value > 0
      ? `${missingCa.value} CA recording${missingCa.value === 1 ? '' : 's'} still empty. Every ${structure.value ? CA_UNITS[structure.value.caFrequency].singular.toLowerCase() : 'recording'} needs a mark for every student before the CA can be submitted.`
      : 'All CA recordings are in. Submit the CA to open the formal test.'
  return allFormalIn.value
    ? 'Everything is in. Submit for approval.'
    : 'Enter the formal test for every student, then submit for approval.'
})

function buildRecords() {
  return rows.value.flatMap(row => {
    const score = scoreOf(row), f = form[row.id]
    if (!score || !f) return []
    return [{
      scoreId: score.id,
      // Only what has been recorded - an empty box means "not yet", never "zero".
      // Locked weeks are closed - never sent back.
      entries: caSubmitted.value ? [] : f.entries.flatMap((v, i) => v === null || isLocked(i + 1) ? [] : [{ entryNumber: i + 1, score: v }]),
      formalScore: caSubmitted.value ? f.formal : null
    }]
  })
}

async function save(showToast: boolean) {
  saving.value = true
  try {
    await AssessmentApi().recordContinuous(teacherSubjectId.value, {
      assessmentId: assessmentId.value,
      termId: termId.value,
      records: buildRecords()
    })
    if (showToast) success('Saved')
    await load()
    return true
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to save')
    return false
  } finally {
    saving.value = false
  }
}

const lockingWeek = ref(0)
async function lockWeek(week: number) {
  lockingWeek.value = week
  try {
    // Save first so what is on screen is what gets locked.
    if (!(await save(false))) return
    await AssessmentApi().lockContinuousWeek(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, week
    })
    success(`${structure.value ? caRecordingLabel(structure.value.caFrequency, week) : 'Recording'} locked`)
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to lock the recording')
  } finally {
    lockingWeek.value = 0
  }
}

const unlockOpen = ref(false)
const unlockWeek = ref(1)
const unlockReason = ref('')
const unlocking = ref(false)
function askUnlock(week: number) {
  unlockWeek.value = week
  unlockReason.value = ''
  unlockOpen.value = true
}
async function unlockWeekConfirm() {
  unlocking.value = true
  try {
    await AssessmentApi().unlockContinuousWeek(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, week: unlockWeek.value, reason: unlockReason.value.trim()
    })
    success('Unlocked')
    unlockOpen.value = false
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to unlock')
  } finally {
    unlocking.value = false
  }
}

async function submitCa() {
  submittingCa.value = true
  try {
    // Save first so what is on screen is what gets checked.
    saving.value = true
    await AssessmentApi().recordContinuous(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, records: buildRecords()
    })
    saving.value = false
    await AssessmentApi().submitContinuousCa(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value
    })
    success('CA submitted - the formal test is now open')
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to submit the CA')
  } finally {
    saving.value = false
    submittingCa.value = false
  }
}

async function submitForApproval() {
  submitting.value = true
  try {
    if (!(await save(false))) return
    await store.submit(teacherSubjectId.value, {
      assessmentId: assessmentId.value, termId: termId.value, note: 'Submitted from continuous assessment'
    })
    success('Assessment submitted for approval')
    await load()
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to submit for approval')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Continuous Assessment')
  document.title = 'Continuous Assessment | Grades | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
