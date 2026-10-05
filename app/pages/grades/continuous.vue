<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading :title="assessment ? `${assessment.name} - Continuous Assessment` : 'Continuous Assessment'"
      :subtitle="subtitle">
      <div v-if="structure" class="flex flex-wrap items-center gap-2">
        <UButton icon="lucide:circle-help" label="How it works" color="neutral" variant="ghost" @click="helpOpen = true" />
        <UButton icon="lucide:chart-no-axes-combined" label="Class insight" color="neutral" variant="subtle"
          @click="insightOpen = true" />
        <UButton icon="lucide:calendar-check" color="neutral" variant="subtle"
          :label="`${CA_UNITS[structure.caFrequency].plural} (${lockedCount}/${structure.caEntries} locked)`"
          @click="weeksOpen = true" />
        <UButton to="/grades" icon="lucide:arrow-left" label="Back" color="neutral" variant="subtle" />
      </div>
      <UButton v-else to="/grades" icon="lucide:arrow-left" label="Back to grades" color="neutral" variant="subtle" />
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
      <!-- One slim progress card instead of paragraphs of explanation (those are in "How it works"). -->
      <UCard :ui="{ body: 'p-3 sm:p-4' }">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge :color="caSubmitted ? 'success' : 'primary'" variant="subtle" size="lg"
              :icon="caSubmitted ? 'lucide:check-circle' : 'lucide:circle-dot'">
              {{ monitorOnly ? 'CA (monitoring)' : '1 · CA recordings' }}
            </UBadge>
            <UIcon name="lucide:chevron-right" class="size-4 text-muted" />
            <UBadge :color="allFormalIn ? 'success' : formalEditable ? 'primary' : 'neutral'" variant="subtle" size="lg"
              :icon="allFormalIn ? 'lucide:check-circle' : formalEditable ? 'lucide:circle-dot' : 'lucide:lock'">
              {{ monitorOnly ? 'Formal test (the score)' : '2 · Formal test' }}
            </UBadge>
          </div>
          <p class="text-xs text-muted sm:text-right">{{ progressText }}</p>
        </div>
      </UCard>

      <!-- Phone: one card per student. -->
      <div class="space-y-3 md:hidden">
        <div v-for="row in rows" :key="row.id" class="rounded-xl border border-default p-3">
          <div class="mb-3 flex items-center justify-between gap-2">
            <button type="button" class="min-w-0 text-left" @click="detailId = row.id">
              <p class="truncate text-sm font-semibold text-highlighted">{{ row.name }}</p>
              <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                CA {{ preview(row).ca ?? '-' }}<span v-if="preview(row).ca !== null">%</span>
                <UBadge v-if="strengthOf(preview(row).ca)" :color="strengthOf(preview(row).ca)!.color" variant="soft"
                  size="sm">{{ strengthOf(preview(row).ca)!.label }}</UBadge>
              </p>
            </button>
            <div class="shrink-0 rounded-xl border border-default bg-elevated/40 px-3 py-1 text-center">
              <p class="text-[10px] uppercase tracking-wide text-muted">Score</p>
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
            <p v-else-if="!caSubmitted && !monitorOnly" class="inline-flex items-center gap-1 text-xs text-muted">
              <UIcon name="lucide:lock" /> Opens after the CA is submitted
            </p>
            <p v-else class="rounded-lg bg-elevated/40 px-3 py-2 text-base">{{ form[row.id]?.formal ?? '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Desktop: one row per student. -->
      <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="overflow-x-auto">
          <table class="w-full min-w-max text-sm">
            <thead>
              <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-muted">
                <th class="sticky left-0 bg-default px-4 py-3">Student</th>
                <th v-for="n in structure.caEntries" :key="n" class="px-2 py-3">
                  <span class="flex items-center gap-1 whitespace-nowrap">
                    <UIcon v-if="isLocked(n)" name="lucide:lock" class="text-success" />
                    {{ caRecordingLabel(structure.caFrequency, n) }}
                  </span>
                </th>
                <th class="px-3 py-3">CA avg</th>
                <th class="px-3 py-3">Formal test</th>
                <th class="px-3 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="border-b border-default last:border-0">
                <td class="sticky left-0 bg-default px-4 py-2">
                  <button type="button" class="flex items-center gap-2 text-left" @click="detailId = row.id">
                    <span class="font-medium text-highlighted whitespace-nowrap">{{ row.name }}</span>
                    <UIcon v-if="trendOf(row).trend === 'improving'" name="lucide:trending-up" class="size-4 text-success" />
                    <UIcon v-else-if="trendOf(row).trend === 'declining'" name="lucide:trending-down" class="size-4 text-error" />
                  </button>
                </td>
                <td v-for="n in structure.caEntries" :key="n" class="px-1 py-2">
                  <UInput v-if="caEditable && !isLocked(n)" v-model.number="form[row.id]!.entries[n - 1]" type="number"
                    min="0" max="100" class="w-20" :ui="{ base: 'text-base' }" @update:model-value="clamp(row.id, n - 1)" />
                  <span v-else class="px-2">{{ form[row.id]?.entries[n - 1] ?? '-' }}</span>
                </td>
                <td class="px-3 py-2">
                  <span class="font-medium">{{ preview(row).ca ?? '-' }}</span>
                  <UBadge v-if="strengthOf(preview(row).ca)" :color="strengthOf(preview(row).ca)!.color" variant="soft"
                    size="sm" class="ml-1.5">{{ strengthOf(preview(row).ca)!.label }}</UBadge>
                </td>
                <td class="px-3 py-2">
                  <UInput v-if="formalEditable" v-model.number="form[row.id]!.formal" type="number" min="0" max="100"
                    class="w-24" :ui="{ base: 'text-base' }" @update:model-value="clampFormal(row.id)" />
                  <span v-else-if="!caSubmitted && !monitorOnly" class="inline-flex items-center gap-1 text-xs text-muted">
                    <UIcon name="lucide:lock" /> after CA
                  </span>
                  <span v-else>{{ form[row.id]?.formal ?? '-' }}</span>
                </td>
                <td class="px-3 py-2">
                  <UBadge color="primary" variant="soft" size="lg">{{ preview(row).total }}</UBadge>
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
            <UButton v-if="!caSubmitted && !monitorOnly" icon="lucide:send" label="Submit CA" :loading="submittingCa"
              :disabled="busy || missingCa > 0" @click="submitCa" />
            <UButton v-else icon="lucide:check-circle" label="Submit for approval" color="success"
              :loading="submitting" :disabled="busy || !allFormalIn" @click="submitForApproval" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- How it works: the explanation lives here, not on the page. -->
    <UModal v-model:open="helpOpen" title="How this assessment works">
      <template #body>
        <div v-if="structure" class="space-y-4 text-sm">
          <template v-if="monitorOnly">
            <div>
              <p class="font-medium text-highlighted">The formal test is the score</p>
              <p class="mt-0.5 text-muted">Each student's score for {{ assessment?.name }} is their formal test mark (0-100).</p>
            </div>
            <div>
              <p class="font-medium text-highlighted">CA is for monitoring</p>
              <p class="mt-0.5 text-muted">
                Record {{ structure.caEntries }} {{ CA_UNITS[structure.caFrequency].plural.toLowerCase() }} of classwork to see how
                strong each student is (Strong, Steady or Needs support). It never changes the score, and nothing waits
                on it - you can enter the test and submit for approval at any time.
              </p>
            </div>
          </template>
          <template v-else>
            <div>
              <p class="font-medium text-highlighted">Step 1 · CA recordings ({{ structure.caPercentage }}%)</p>
              <p class="mt-0.5 text-muted">
                Record {{ structure.caEntries }} {{ CA_UNITS[structure.caFrequency].plural.toLowerCase() }} for every student.
                Lock each one once everyone has a mark, then submit the CA - that closes the rest.
              </p>
            </div>
            <div>
              <p class="font-medium text-highlighted">Step 2 · Formal test ({{ structure.formalPercentage }}%)</p>
              <p class="mt-0.5 text-muted">Opens once the CA is submitted. Enter one mark out of 100 for every student.</p>
            </div>
            <div>
              <p class="font-medium text-highlighted">The score</p>
              <p class="mt-0.5 text-muted">
                The CA average and the test mark are combined by their shares - for example CA 80 and test 80 gives
                {{ structure.caPercentage }}% of 80 + {{ structure.formalPercentage }}% of 80 = 80.
              </p>
            </div>
          </template>
          <div>
            <p class="font-medium text-highlighted">Empty boxes</p>
            <p class="mt-0.5 text-muted">An empty box means "not recorded yet", never zero.</p>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Weeks: lock / unlock each recording. -->
    <UModal v-model:open="weeksOpen" :title="structure ? `${CA_UNITS[structure.caFrequency].plural}` : 'Recordings'"
      description="Lock a recording once every student has a mark for it, so it can't be changed later.">
      <template #body>
        <div v-if="structure" class="divide-y divide-default">
          <div v-for="n in structure.caEntries" :key="n" class="flex items-center justify-between gap-3 py-2.5">
            <div class="flex min-w-0 items-center gap-2">
              <UIcon :name="isLocked(n) ? 'lucide:lock' : 'lucide:pencil-line'"
                :class="isLocked(n) ? 'text-success' : 'text-muted'" />
              <p class="text-sm font-medium">{{ caRecordingLabel(structure.caFrequency, n) }}</p>
              <span class="text-xs text-muted">{{ weekFilled(n) }}/{{ rows.length }} marked</span>
            </div>
            <UButton v-if="editable && !isLocked(n) && weekComplete(n)" size="sm" variant="subtle" color="success"
              icon="lucide:lock" label="Lock" :loading="lockingWeek === n" :disabled="busy" @click="lockWeek(n)" />
            <UButton v-else-if="editable && isLocked(n) && isAdmin" size="sm" variant="ghost" color="warning"
              icon="lucide:lock-open" label="Unlock" :disabled="busy" @click="weeksOpen = false; askUnlock(n)" />
            <span v-else-if="isLocked(n)" class="text-xs text-success">Locked</span>
            <span v-else class="text-xs text-muted">Waiting for marks</span>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Class insight. -->
    <UModal v-model:open="insightOpen" title="Class insight">
      <template #body>
        <GradesTeacherCaInsight v-if="assessment" :assessment="assessment" :rows="rows" />
      </template>
    </UModal>

    <!-- One student's detail. -->
    <UModal v-model:open="detailOpen" :title="detailRow?.name || 'Student'">
      <template #body>
        <div v-if="detailRow && structure" class="space-y-4 text-sm">
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="rounded-xl bg-elevated/40 p-3">
              <p class="text-xs text-muted">CA average</p>
              <p class="text-lg font-bold text-highlighted">{{ preview(detailRow).ca ?? '-' }}<span v-if="preview(detailRow).ca !== null" class="text-sm">%</span></p>
              <UBadge v-if="strengthOf(preview(detailRow).ca)" :color="strengthOf(preview(detailRow).ca)!.color" variant="soft"
                size="sm">{{ strengthOf(preview(detailRow).ca)!.label }}</UBadge>
            </div>
            <div class="rounded-xl bg-elevated/40 p-3">
              <p class="text-xs text-muted">Formal test</p>
              <p class="text-lg font-bold text-highlighted">{{ form[detailRow.id]?.formal ?? '-' }}</p>
            </div>
            <div class="rounded-xl bg-primary/10 p-3">
              <p class="text-xs text-muted">Score</p>
              <p class="text-lg font-bold text-primary">{{ preview(detailRow).total }}</p>
            </div>
          </div>

          <div>
            <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Recordings</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="n in structure.caEntries" :key="n" class="rounded-lg border border-default px-2.5 py-1 text-xs">
                <span class="text-muted">{{ caRecordingLabel(structure.caFrequency, n) }}:</span>
                <span class="ml-1 font-medium text-highlighted">{{ form[detailRow.id]?.entries[n - 1] ?? '-' }}</span>
              </span>
            </div>
          </div>

          <p v-if="trendOf(detailRow).trend !== 'not-enough-data'" class="flex items-center gap-2 text-muted">
            <UIcon :name="trendOf(detailRow).trend === 'improving' ? 'lucide:trending-up' : trendOf(detailRow).trend === 'declining' ? 'lucide:trending-down' : 'lucide:minus'"
              :class="trendOf(detailRow).trend === 'improving' ? 'text-success' : trendOf(detailRow).trend === 'declining' ? 'text-error' : ''" />
            CA is {{ CA_TREND_LABEL[trendOf(detailRow).trend].toLowerCase() }}.
          </p>

          <p class="rounded-lg bg-elevated/40 px-3 py-2 text-xs text-muted">
            <template v-if="monitorOnly">The score is the formal test only - CA is for monitoring and doesn't change it.</template>
            <template v-else>
              CA {{ preview(detailRow).caPts }}/{{ structure.caPercentage }} + Test
              {{ preview(detailRow).formalPts }}/{{ structure.formalPercentage }} =
              <span class="font-semibold text-highlighted">{{ preview(detailRow).total }}/100</span>
            </template>
          </p>
        </div>
      </template>
    </UModal>

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

// The explanations, week locking, insight and one student's breakdown live in modals rather than on the page.
const helpOpen = ref(false)
const weeksOpen = ref(false)
const insightOpen = ref(false)
const detailId = ref('')
const detailOpen = computed({
  get: () => !!detailId.value,
  set: (v: boolean) => { if (!v) detailId.value = '' }
})

const rows = ref<StudentAssessment[]>([])
const assessment = ref<Assessment | null>(null)

type RowForm = { entries: (number | null)[], formal: number | null }
const form = reactive<Record<string, RowForm>>({})

const structure = computed(() => continuousOf(rows.value, assessmentId.value))
const caSubmitted = computed(() => !!structure.value?.caSubmitted)
// CA is only for monitoring (worth 0% of the score): it never gates the formal test or the approval.
const monitorOnly = computed(() => !!structure.value && structure.value.caPercentage === 0)
const editable = computed(() => !!assessment.value && isEditableStatus(assessment.value.status as ScoreStatus))
const weekFilled = (week: number) => rows.value.filter(r => form[r.id]?.entries[week - 1] != null).length
const detailRow = computed(() => rows.value.find(r => r.id === detailId.value) ?? null)
const lockedCount = computed(() => structure.value?.lockedWeeks?.length ?? 0)
const isLocked = (week: number) => !!structure.value?.lockedWeeks?.includes(week)
// Every student has a mark for the week - it can be locked.
const weekComplete = (week: number) => rows.value.length > 0
  && rows.value.every(r => form[r.id]?.entries[week - 1] !== null && form[r.id]?.entries[week - 1] !== undefined)
const caEditable = computed(() => editable.value && !caSubmitted.value)
const formalEditable = computed(() => editable.value && (caSubmitted.value || monitorOnly.value))
const step = computed(() => caSubmitted.value ? 2 : 1)

const subtitle = computed(() => structure.value
  ? (monitorOnly.value
    ? `CA for monitoring only · formal test is the score · ${rows.value.length} students`
    : `CA ${structure.value.caPercentage}% + formal test ${structure.value.formalPercentage}% · ${rows.value.length} students`)
  : '')

// How strong a student's CA is - for monitoring: 70+ strong, 50-69 steady, below 50 needs support.
function strengthOf(ca: number | null) {
  if (ca === null) return null
  if (ca >= 70) return { label: 'Strong', color: 'success' as const }
  if (ca >= 50) return { label: 'Steady', color: 'warning' as const }
  return { label: 'Needs support', color: 'error' as const }
}

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

// One short line of where things stand (the long explanations are in "How it works").
const progressText = computed(() => {
  const n = rows.value.length
  const formalIn = rows.value.filter(r => form[r.id]?.formal !== null && form[r.id]?.formal !== undefined).length
  if (monitorOnly.value) return `Formal test: ${formalIn} of ${n} in`
  if (!caSubmitted.value) return missingCa.value > 0 ? `${missingCa.value} CA mark${missingCa.value === 1 ? '' : 's'} still empty` : 'All CA marks are in'
  return `Formal test: ${formalIn} of ${n} in`
})

function trendOf(row: StudentAssessment) {
  return caTrendOf(form[row.id]?.entries ?? [])
}

// How many CA boxes are still empty across the class - the CA can only be submitted at zero.
const missingCa = computed(() =>
  Object.values(form).reduce((sum, f) => sum + f.entries.filter(v => v === null).length, 0))
const allFormalIn = computed(() =>
  rows.value.length > 0 && rows.value.every(r => form[r.id]?.formal !== null && form[r.id]?.formal !== undefined))

const hint = computed(() => {
  if (monitorOnly.value)
    return allFormalIn.value
      ? 'The formal test is in for everyone. Submit for approval - CA is only for monitoring and doesn\'t need finishing first.'
      : 'Enter the formal test for every student, then submit for approval. CA can be recorded any time and never changes the score.'
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
      formalScore: (caSubmitted.value || monitorOnly.value) ? f.formal : null
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
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
