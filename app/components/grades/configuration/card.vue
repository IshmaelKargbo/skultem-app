<template>
  <!-- A collapsible card per school / section (same pattern as Settings > Section Branding): the header
       summarises the setup, opening the card shows everything you can change. -->
  <UCard :ui="{ header: 'p-3 sm:p-4', body: open ? 'p-4 sm:p-5' : 'hidden' }">
    <template #header>
      <button type="button" class="flex w-full items-center justify-between gap-3 text-left" :aria-expanded="open"
        @click="open = !open">
        <div class="min-w-0 space-y-1.5">
          <p class="font-medium text-highlighted">{{ config.sectionName || 'Whole school' }}</p>
          <div class="flex flex-wrap items-center gap-1.5">
            <UBadge color="primary" variant="subtle">{{ chips.style }}</UBadge>
            <UBadge v-if="chips.counts" color="neutral" variant="subtle">{{ chips.counts }}</UBadge>
            <UBadge v-if="chips.recordings" color="neutral" variant="subtle">{{ chips.recordings }}</UBadge>
            <UBadge v-if="chips.custom" color="neutral" variant="subtle">{{ chips.custom }}</UBadge>
            <UBadge v-if="dirty" color="warning" variant="soft">Unsaved changes</UBadge>
          </div>
          <p class="text-xs text-muted">{{ who }}</p>
        </div>
        <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0 text-muted transition-transform"
          :class="open ? 'rotate-180' : ''" />
      </button>
    </template>

    <div v-show="open" class="space-y-6">
          <UFormField label="How are tests scored?">
            <URadioGroup v-model="form.structure" variant="card" :items="structures" :disabled="saving" />
          </UFormField>

          <template v-if="form.structure === 'CA_AND_TEST'">
            <UFormField label="Does CA count toward the score?">
              <URadioGroup v-model="form.caMode" variant="card" :items="caModes" :disabled="saving"
                :ui="{ fieldset: 'grid grid-cols-1 gap-2 sm:grid-cols-2' }" @update:model-value="onCaMode" />
            </UFormField>

            <div v-if="form.caMode === 'counts'" class="space-y-2">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <UFormField label="CA share (%)">
                  <UInput v-model.number="form.caPercentage" type="number" min="1" max="99" class="w-full"
                    :disabled="saving" @update:model-value="onCa" />
                </UFormField>
                <UFormField label="Formal test share (%)" help="Fills in so the two total 100">
                  <UInput v-model.number="form.formalPercentage" type="number" min="1" max="99" class="w-full"
                    :disabled="saving" @update:model-value="onFormal" />
                </UFormField>
              </div>
              <p class="text-xs text-muted">
                Example: CA 80 and test 80 gives {{ example.ca }} + {{ example.formal }} =
                <span class="font-medium text-highlighted">{{ example.total }}/100</span>.
              </p>
            </div>
            <p v-else class="rounded-lg bg-elevated/40 px-3 py-2 text-xs text-muted">
              The formal test is the whole score. Teachers still record CA {{ unit.plural }} and see how strong each
              student is, and nothing waits on it.
            </p>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="How often is CA recorded?">
                <USelect v-model="form.caFrequency" :items="frequencyItems" class="w-full" :disabled="saving" />
              </UFormField>
              <UFormField :label="`${unit.plural} of CA per term`"
                :help="`Teachers get ${form.caEntries || 0} slot${form.caEntries === 1 ? '' : 's'}: ${slotExample}`">
                <UInput v-model.number="form.caEntries" type="number" min="1" max="40" class="w-full"
                  :disabled="saving" />
              </UFormField>
            </div>

            <!-- Optional: most schools never need this, so it stays folded away. -->
            <div class="rounded-xl border border-default">
              <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                :aria-expanded="showPlan" @click="showPlan = !showPlan">
                <span>
                  <span class="block text-sm font-medium text-highlighted">Different for some tests or terms</span>
                  <span class="block text-xs text-muted">
                    {{ planPayload.length ? `${planPayload.length} custom` : 'Optional - every test follows the setup above' }}
                  </span>
                </span>
                <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
                  :class="showPlan ? 'rotate-180' : ''" />
              </button>
              <div v-show="showPlan" class="border-t border-default p-4">
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

              </div>
            </div>
          </template>

          <UAlert v-if="problem" color="warning" variant="subtle" icon="lucide:alert-triangle" :description="problem" />

      <div class="border-t border-default pt-4">
        <div class="flex w-full flex-col gap-3">
          <UCheckbox v-if="dirty" v-model="applyNow" label="Also update tests nobody has started"
            description="Tests with no marks yet switch straight away. Anything with a mark in it is never touched." />
          <div class="flex items-center justify-between gap-3">
            <UButton v-if="!dirty && !(config.isDefault && config.structure === 'SIMPLE')" label="Update tests nobody has started"
              icon="lucide:refresh-cw" size="sm" color="neutral" variant="ghost" @click="confirmOpen = true" />
            <span v-else />
            <div class="flex gap-2">
              <UButton label="Discard changes" color="neutral" variant="soft" :disabled="saving || !dirty" @click="resetForm" />
              <UButton label="Save" icon="lucide:save" :loading="saving" :disabled="!dirty || !!problem"
                @click="save" />
            </div>
          </div>
        </div>
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
// Whether the card is unfolded. The page owns it, so a reload after saving doesn't fold everything back.
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [config: AssessmentConfiguration] }>()

const { success, info } = useNotify()
const termStore = useTermStore()
const assessmentStore = useAssessmentStore()
const saving = ref(false)
const applying = ref(false)
const confirmOpen = ref(false)
const showPlan = ref(false)
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
  { label: 'Continuous Assessment + Formal Assessment', value: 'CA_AND_TEST', description: 'Teachers record CA through the term alongside the formal test. Choose below whether CA counts toward the score or is only for monitoring' }
]
const caModes = [
  { label: 'Counts toward the score', value: 'counts', description: 'CA and the formal test are weighted together (for example 30% CA + 70% test) to make the test score' },
  { label: 'Monitoring only', value: 'monitor', description: 'CA shows how strong a student is but never changes the Test 1 / Test 2 score - the formal test is 100%' }
]
const frequencies = CA_FREQUENCY_OPTIONS.map(o => ({ label: o.label, value: o.value, description: o.hint }))
const frequencyItems = CA_FREQUENCY_OPTIONS.map(o => ({ label: o.label, value: o.value }))

function fromConfig(c: AssessmentConfiguration) {
  const ca = c.structure === 'CA_AND_TEST'
  const monitor = ca && c.caPercentage === 0
  return {
    structure: c.structure as AssessmentStructure,
    // CA at 0% is the "monitoring only" setup - CA is recorded but isn't part of the score.
    caMode: (monitor ? 'monitor' : 'counts') as 'counts' | 'monitor',
    caPercentage: ca && !monitor ? c.caPercentage : 30,
    formalPercentage: ca && !monitor ? c.formalPercentage : 70,
    caFrequency: (c.caFrequency ?? 'WEEKLY') as CaFrequency,
    caEntries: ca ? c.caEntries : 6
  }
}

const form = reactive(fromConfig(props.config))
watch(() => props.config, c => { Object.assign(form, fromConfig(c)); loadCells(c) })

function onCaMode(mode: unknown) {
  // Back to "counts": the weights are 30/70 again unless the school already had something else in the boxes.
  if (mode === 'counts' && (!form.caPercentage || form.caPercentage < 1)) {
    form.caPercentage = 30
    form.formalPercentage = 70
  }
}

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
  if (form.caMode === 'counts') {
    const ca = Number(form.caPercentage), formal = Number(form.formalPercentage)
    if (!(ca >= 1 && ca <= 99) || !(formal >= 1 && formal <= 99)) return 'Each part must be between 1% and 99%.'
    if (ca + formal !== 100) return 'CA and formal test must total 100%.'
  }
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
  const monitor = c.structure === 'CA_AND_TEST' && c.caPercentage === 0
  if ((form.caMode === 'monitor') !== monitor) return true
  return (form.caMode === 'counts' && (form.caPercentage !== c.caPercentage || form.formalPercentage !== c.formalPercentage))
    || form.caFrequency !== c.caFrequency || form.caEntries !== c.caEntries
    || c.inherited || planKey(planPayload.value) !== planKey(c.plan || [])
})

// What the card shows: a few short chips instead of a sentence, and who/when changed it.
const chips = computed(() => {
  const c = props.config
  if (c.structure !== 'CA_AND_TEST') return { style: 'Simple assessment', counts: '', recordings: '', custom: '' }
  const unitName = CA_UNITS[c.caFrequency ?? 'WEEKLY'].plural.toLowerCase()
  return {
    style: 'CA + formal test',
    counts: c.caPercentage === 0 ? 'CA for monitoring only' : `CA ${c.caPercentage}% · Test ${c.formalPercentage}%`,
    recordings: `${c.caEntries} ${unitName}`,
    custom: c.plan?.length ? `${c.plan.length} custom` : ''
  }
})
const who = computed(() => {
  const c = props.config
  return c.isDefault ? 'Default - never changed'
    : c.inherited ? 'Inherited from the school-wide setup'
    : `Version ${c.version}${c.updatedBy ? ` · changed by ${c.updatedBy}` : ''}${c.updatedAt ? ` on ${new Date(c.updatedAt).toLocaleDateString()}` : ''}`
})

// Throws away unsaved edits and goes back to what is saved.
function resetForm() {
  Object.assign(form, fromConfig(props.config))
  loadCells(props.config)
}

async function save() {
  if (problem.value) return
  saving.value = true
  try {
    const payload: SaveAssessmentConfigurationDto = form.structure === 'SIMPLE'
      ? { structure: 'SIMPLE', applyToUnstarted: applyNow.value }
      : {
          structure: form.structure,
          // Monitoring only = CA 0% / formal 100% (CA is recorded but isn't part of the score).
          caPercentage: form.caMode === 'monitor' ? 0 : form.caPercentage,
          formalPercentage: form.caMode === 'monitor' ? 100 : form.formalPercentage,
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
