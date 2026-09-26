<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-medium text-highlighted">{{ config.sectionName || 'Whole school' }}</p>
          <p class="text-xs text-muted">{{ summary }}</p>
        </div>
        <UButton label="Save" icon="lucide:save" size="sm" :loading="saving" :disabled="!dirty || !!problem"
          @click="save" />
      </div>
    </template>

    <div class="space-y-5">
      <URadioGroup v-model="form.structure" variant="card" :items="structures" :disabled="saving" />

      <template v-if="form.structure === 'CA_AND_TEST'">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField label="Continuous assessment (%)" help="Share of the test score that comes from CA">
            <UInput v-model.number="form.caPercentage" type="number" min="1" max="99" class="w-full"
              :disabled="saving" @update:model-value="onCa" />
          </UFormField>
          <UFormField label="Formal test (%)" help="The rest - changes automatically so the two total 100">
            <UInput v-model.number="form.formalPercentage" type="number" min="1" max="99" class="w-full"
              :disabled="saving" @update:model-value="onFormal" />
          </UFormField>
        </div>

        <UFormField label="How often is CA recorded?">
          <URadioGroup v-model="form.caFrequency" variant="card" orientation="horizontal"
            :items="frequencies" :disabled="saving" :ui="{ fieldset: 'grid grid-cols-2 gap-2 sm:grid-cols-4' }" />
        </UFormField>

        <UFormField :label="`How many ${unit.plural} of CA in a term?`"
          :help="`Teachers get ${form.caEntries || 0} recording ${form.caEntries === 1 ? 'slot' : 'slots'} (${slotExample}). The CA score is the average of what is recorded.`">
          <UInput v-model.number="form.caEntries" type="number" min="1" max="40" class="w-full sm:w-40"
            :disabled="saving" />
        </UFormField>

        <!-- Terms and tests differ in length: a short term, or a short test, has fewer weeks. -->
        <div class="space-y-2">
          <div>
            <p class="text-sm font-medium text-highlighted">Plan by term</p>
            <p class="text-xs text-muted">
              Each test can have its own number of CA {{ unit.plural }} in each term - and an exam can stay a single
              score. Anything left on "Default" uses {{ form.caEntries || 0 }} {{ unit.plural }}.
            </p>
          </div>

          <div v-if="!planTerms.length || !planAssessments.length" class="text-xs text-muted">
            {{ planLoading ? 'Loading terms and assessments...' : 'Add terms and assessment templates first to plan them here.' }}
          </div>

          <!-- Phone: one card per term, its assessments stacked - no sideways scrolling table. -->
          <div v-else class="space-y-3 md:hidden">
            <div v-for="t in planTerms" :key="t.id" class="rounded-xl border border-default">
              <div class="flex items-center justify-between gap-2 border-b border-default px-3 py-2">
                <p class="text-sm font-semibold text-highlighted">{{ t.name }}</p>
                <p class="text-[11px] text-muted">{{ termSummary(t.id) }}</p>
              </div>
              <div v-for="a in planAssessments" :key="a"
                class="flex items-center justify-between gap-3 border-b border-default px-3 py-2 last:border-0">
                <p class="min-w-0 truncate text-sm font-medium">{{ a }}</p>
                <div class="flex shrink-0 items-center gap-2">
                  <USelect v-model="cell(t.id, a).mode" :items="cellModes" size="md" class="w-32" :disabled="saving" />
                  <UInput v-if="cell(t.id, a).mode === 'ca'" v-model.number="cell(t.id, a).caEntries" type="number"
                    min="1" max="40" size="md" class="w-16" :ui="{ base: 'text-base' }" :disabled="saving" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="planTerms.length && planAssessments.length" class="hidden overflow-x-auto rounded-xl border border-default md:block">
            <table class="w-full min-w-max text-sm">
              <thead>
                <tr class="text-left text-[11px] uppercase tracking-wide text-muted">
                  <th class="px-3 py-2">Assessment</th>
                  <th v-for="t in planTerms" :key="t.id" class="px-3 py-2">
                    {{ t.name }}
                    <span class="block normal-case tracking-normal text-[10px]">{{ termSummary(t.id) }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in planAssessments" :key="a" class="border-t border-default">
                  <td class="px-3 py-2 font-medium">{{ a }}</td>
                  <td v-for="t in planTerms" :key="t.id" class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <USelect v-model="cell(t.id, a).mode" :items="cellModes" size="sm" class="w-32" :disabled="saving" />
                      <UInput v-if="cell(t.id, a).mode === 'ca'" v-model.number="cell(t.id, a).caEntries" type="number"
                        min="1" max="40" size="sm" class="w-16" :disabled="saving" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-xl border border-default bg-elevated/40 p-3 text-sm">
          <p class="font-medium text-highlighted">Example</p>
          <p class="text-muted">
            A student averages 80% in CA and scores 80% in the formal test:
            CA {{ example.ca }}/{{ form.caPercentage || 0 }} + Test {{ example.formal }}/{{ form.formalPercentage || 0 }}
            = <span class="font-semibold text-highlighted">{{ example.total }}/100</span>.
            The result still appears as one simple score.
          </p>
        </div>
      </template>

      <UAlert v-if="problem" color="warning" variant="subtle" icon="lucide:alert-triangle" :description="problem" />

      <UCheckbox v-if="dirty" v-model="applyNow" label="Also move assessments nobody has graded yet onto this setup"
        description="Blank assessments (no grade, no CA recording) switch straight away, so nothing has to wait for a new term. Anything with a grade in it is never touched." />

      <div class="flex flex-col gap-3 border-t border-dashed border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-muted">
          {{ dirty ? 'Save your changes first to apply them to unstarted assessments.'
            : 'Assessments that already have a grade in them keep the setup they started with.' }}
        </p>
        <UButton label="Apply to unstarted assessments" icon="lucide:refresh-cw" size="sm" color="neutral"
          variant="subtle" class="justify-center" :disabled="dirty || (config.isDefault && config.structure === 'SIMPLE')"
          @click="confirmOpen = true" />
      </div>
    </div>

    <UModal v-model:open="confirmOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Apply to unstarted assessments</h3>
          </template>

          <div class="space-y-3">
            <UAlert color="info" variant="soft" title="Only genuinely blank assessments move"
              description="Any assessment in this section that is open but has not had a single grade entered - not even a partial CA recording - will move onto the saved setup right now. Anything with any grade already in it, or already submitted/approved/locked, is left exactly as it is." />
          </div>

          <template #footer>
            <div class="flex gap-2">
              <UButton class="w-full flex items-center justify-center" label="Cancel" variant="soft"
                :disabled="applying" @click="confirmOpen = false" />
              <UButton class="w-full flex items-center justify-center" label="Apply" :loading="applying"
                @click="applyToUnstarted" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ config: AssessmentConfiguration }>()
const emit = defineEmits<{ saved: [config: AssessmentConfiguration] }>()

const { success, info } = useNotify()
const termStore = useTermStore()
const assessmentStore = useAssessmentStore()
const saving = ref(false)
const applying = ref(false)
const confirmOpen = ref(false)
const applyNow = ref(true)

// --- Plan by term: which assessments use CA + formal test in which term, and how many recordings each has ---
type CellMode = 'default' | 'ca' | 'simple'
const cellModes = [
  { label: 'Default', value: 'default' },
  { label: 'CA + test', value: 'ca' },
  { label: 'Single score', value: 'simple' }
]
const planLoading = ref(true)
const cells = reactive<Record<string, { mode: CellMode, caEntries: number }>>({})
const keyOf = (termId: string, name: string) => `${termId}|${name.toLowerCase()}`
// Every (term, assessment) cell exists up front (see ensureCells) so the grid never creates state while rendering.
function cell(termId: string, name: string) {
  return cells[keyOf(termId, name)] ?? { mode: 'default' as CellMode, caEntries: form.caEntries || 6 }
}
function ensureCells() {
  for (const t of planTerms.value) {
    for (const a of planAssessments.value) {
      const k = keyOf(t.id, a)
      if (!cells[k]) cells[k] = { mode: 'default', caEntries: form.caEntries || 6 }
    }
  }
}

// Terms that haven't closed, and every assessment name the school's templates use (Test 1, Test 2, Exam...).
const planTerms = computed(() => (termStore.records || []).filter((t: any) => t.status !== 'CLOSED'))
const planAssessments = computed(() => {
  const seen = new Map<string, number>()
  for (const t of assessmentStore.records || []) {
    for (const a of t.assessments || []) {
      const k = a.name.trim()
      if (!seen.has(k.toLowerCase())) seen.set(k.toLowerCase(), a.position ?? 0)
    }
  }
  const names = new Map<string, string>()
  for (const t of assessmentStore.records || []) for (const a of t.assessments || []) names.set(a.name.trim().toLowerCase(), a.name.trim())
  return [...seen.entries()].sort((x, y) => x[1] - y[1]).map(([k]) => names.get(k)!)
})

function loadCells(c: AssessmentConfiguration) {
  for (const k of Object.keys(cells)) delete cells[k]
  ensureCells()
  for (const p of c.plan || []) {
    cells[keyOf(p.termId, p.assessmentName)] = { mode: p.usesCa ? 'ca' : 'simple', caEntries: p.caEntries || c.caEntries || 6 }
  }
}
watch([planTerms, planAssessments], ensureCells)
function termSummary(termId: string) {
  const total = planAssessments.value.length
  const off = planAssessments.value.filter(a => cell(termId, a).mode === 'simple').length
  return `${total - off} of ${total} use CA + test`
}
const planPayload = computed<AssessmentPlanItem[]>(() => {
  if (form.structure !== 'CA_AND_TEST') return []
  const out: AssessmentPlanItem[] = []
  for (const t of planTerms.value) {
    for (const a of planAssessments.value) {
      const c = cells[keyOf(t.id, a)]
      if (!c || c.mode === 'default') continue
      out.push({ termId: t.id, assessmentName: a, usesCa: c.mode === 'ca', caEntries: c.mode === 'ca' ? Number(c.caEntries) : 0 })
    }
  }
  return out
})
const planKey = (items: AssessmentPlanItem[]) => JSON.stringify([...items]
  .map(i => [i.termId, i.assessmentName.toLowerCase(), i.usesCa, i.caEntries])
  .sort((x, y) => String(x[0] + x[1]).localeCompare(String(y[0] + y[1]))))

onMounted(async () => {
  try {
    await Promise.all([
      termStore.records?.length ? Promise.resolve() : termStore.fetchAll(0, 0),
      assessmentStore.records?.length ? Promise.resolve() : assessmentStore.fetchAll(1, 100)
    ])
  } catch { /* the grid just shows its empty state */ }
  loadCells(props.config)
  planLoading.value = false
})

const structures = [
  { label: 'Simple Assessment', value: 'SIMPLE', description: 'One score per test - the way it has always worked' },
  { label: 'Continuous Assessment + Formal Assessment', value: 'CA_AND_TEST', description: 'Teachers record CA through the term and a formal test; together they make the test score' }
]
const frequencies = CA_FREQUENCY_OPTIONS.map(o => ({ label: o.label, value: o.value, description: o.hint }))

function fromConfig(c: AssessmentConfiguration) {
  const ca = c.structure === 'CA_AND_TEST'
  return {
    structure: c.structure as AssessmentStructure,
    caPercentage: ca ? c.caPercentage : 30,
    formalPercentage: ca ? c.formalPercentage : 70,
    caFrequency: (c.caFrequency ?? 'WEEKLY') as CaFrequency,
    caEntries: ca ? c.caEntries : 6
  }
}

const form = reactive(fromConfig(props.config))
watch(() => props.config, c => { Object.assign(form, fromConfig(c)); loadCells(c) })

// The two percentages always total 100 - editing one fills in the other.
function onCa(v: unknown) {
  const n = Number(v)
  if (Number.isFinite(n)) form.formalPercentage = 100 - n
}
function onFormal(v: unknown) {
  const n = Number(v)
  if (Number.isFinite(n)) form.caPercentage = 100 - n
}

const unit = computed(() => CA_UNITS[form.caFrequency])
const slotExample = computed(() => {
  const f = form.caFrequency
  return [1, 2].map(n => caRecordingLabel(f, n)).join(', ') + ', ...'
})

const example = computed(() => {
  const caPts = 80 * (form.caPercentage || 0) / 100
  const fPts = 80 * (form.formalPercentage || 0) / 100
  return { ca: round(caPts), formal: round(fPts), total: round(caPts + fPts) }
})
function round(n: number) { return Math.round(n * 10) / 10 }

const problem = computed(() => {
  if (form.structure === 'SIMPLE') return ''
  const ca = Number(form.caPercentage), formal = Number(form.formalPercentage)
  if (!(ca >= 1 && ca <= 99) || !(formal >= 1 && formal <= 99)) return 'Each part must be between 1% and 99%.'
  if (ca + formal !== 100) return 'CA and formal test must total 100%.'
  const n = Number(form.caEntries)
  if (!Number.isInteger(n) || n < 1 || n > 40) return 'Choose between 1 and 40 CA recordings.'
  if (planPayload.value.some(p => p.usesCa && (!Number.isInteger(p.caEntries) || p.caEntries < 1 || p.caEntries > 40)))
    return 'Each planned test needs between 1 and 40 CA recordings.'
  return ''
})

const dirty = computed(() => {
  const c = props.config
  if (form.structure !== c.structure) return true
  if (form.structure === 'SIMPLE') return false
  return form.caPercentage !== c.caPercentage || form.formalPercentage !== c.formalPercentage
    || form.caFrequency !== c.caFrequency || form.caEntries !== c.caEntries
    || c.inherited || planKey(planPayload.value) !== planKey(c.plan || [])
})

const summary = computed(() => {
  const c = props.config
  const what = c.structure === 'CA_AND_TEST'
    ? `Continuous Assessment: CA ${c.caPercentage}% + formal test ${c.formalPercentage}% · ${c.caEntries} ${CA_UNITS[c.caFrequency ?? 'WEEKLY'].plural}`
    : 'Simple Assessment'
  const who = c.isDefault ? 'Default - never changed'
    : c.inherited ? 'Inherited from the school-wide setup'
    : `Version ${c.version}${c.updatedBy ? ` · changed by ${c.updatedBy}` : ''}${c.updatedAt ? ` on ${new Date(c.updatedAt).toLocaleDateString()}` : ''}`
  return `${what} · ${who}`
})

async function save() {
  if (problem.value) return
  saving.value = true
  try {
    const payload: SaveAssessmentConfigurationDto = form.structure === 'SIMPLE'
      ? { structure: 'SIMPLE', applyToUnstarted: applyNow.value }
      : {
          structure: form.structure, caPercentage: form.caPercentage, formalPercentage: form.formalPercentage,
          caFrequency: form.caFrequency, caEntries: form.caEntries, plan: planPayload.value,
          applyToUnstarted: applyNow.value
        }
    const res = await AssessmentApi().saveConfiguration(payload, props.config.managementSectionId)
    if (res) {
      const moved = res.refreshed ?? null
      success(`${props.config.sectionName || 'School'} assessment setup saved`
        + (moved === null ? '' : ` · ${moved} blank assessment${moved === 1 ? '' : 's'} moved onto it`
          + (res.skipped ? `, ${res.skipped} already graded and left alone` : '')))
      emit('saved', res.configuration)
    }
  } catch {
    // useHandleError already told the user why
  } finally {
    saving.value = false
  }
}

async function applyToUnstarted() {
  applying.value = true
  try {
    const result = await AssessmentApi().applyConfigurationToUnstarted(props.config.managementSectionId)
    if (result) {
      confirmOpen.value = false
      if (result.refreshed > 0) {
        success(`${result.refreshed} assessment${result.refreshed === 1 ? '' : 's'} moved onto the current setup`
          + (result.skipped > 0 ? ` · ${result.skipped} already had grades and were left alone` : ''))
      } else {
        info(result.skipped > 0
          ? `All ${result.skipped} open assessment${result.skipped === 1 ? '' : 's'} already have a grade in them, so nothing moved`
          : 'There are no open assessments to apply this to right now')
      }
    }
  } catch {
    // useHandleError already told the user why
  } finally {
    applying.value = false
  }
}
</script>
