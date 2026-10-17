<template>
  <div class="space-y-4">
    <UAlert v-if="legacy" color="warning" variant="soft" icon="lucide:info"
      title="This template follows an earlier setup"
      description="Continuous assessment currently applies to every test with equal recordings. Choosing the tests below replaces that." />

    <div class="rounded-xl border border-default bg-elevated/30 p-3 text-sm text-muted">
      <p class="font-medium text-highlighted">Which tests use continuous assessment (CA)?</p>
      <p class="mt-0.5">
        Every test is a single score unless you switch CA on for it. For example, Test 1 can be built from Attendance,
        Assignments and Class participation, while the Exam stays one mark.
      </p>
    </div>

    <p v-if="!rows.length" class="rounded-xl border border-dashed border-default p-6 text-center text-sm text-muted">
      Add the template's tests in the previous step first, then choose how each is scored.
    </p>

    <div v-for="(row, i) in rows" :key="row.name"
      class="rounded-2xl border transition-colors" :class="row.usesCa ? 'border-primary/40 bg-primary/5' : 'border-default'">
      <div class="flex items-center justify-between gap-3 p-3 sm:p-4">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-inverted"
            :class="SEGMENTS[i % SEGMENTS.length]">{{ i + 1 }}</span>
          <div class="min-w-0">
            <p class="truncate font-semibold text-highlighted">
              {{ row.name }} <span class="font-normal text-muted">· {{ row.weight }}% of the term</span>
            </p>
            <p class="text-xs text-muted">
              {{ row.usesCa ? 'Built from the parts below' : 'Teachers enter one mark out of 100' }}
            </p>
          </div>
        </div>
        <USwitch :model-value="row.usesCa" label="CA" :disabled="disabled" @update:model-value="(v: boolean) => toggle(row, v)" />
      </div>

      <div v-if="row.usesCa" class="space-y-3 border-t border-primary/20 p-3 sm:p-4">
        <p class="text-xs text-muted">
          Each part is worth a share of <span class="font-medium text-highlighted">{{ row.name }}</span>. The parts and the
          final part total 100%.
        </p>
        <AcademicsAssessmentTemplatePartsEditor v-model:parts="row.parts" v-model:formal-label="row.formalLabel"
          :disabled="disabled" />

        <!-- What each part is worth in the whole term -->
        <div v-if="!partsProblem(row.parts)" class="rounded-lg bg-default p-3 text-xs">
          <p class="mb-1.5 font-medium text-highlighted">In the term mark ({{ row.name }} = {{ row.weight }}%)</p>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-muted">
            <span v-for="p in row.parts" :key="p.name">
              {{ p.name }} <span class="font-semibold text-highlighted">{{ ofTerm(p.weight, row.weight) }}%</span>
            </span>
            <span>
              {{ row.formalLabel.trim() || 'Final part' }}
              <span class="font-semibold text-highlighted">{{ ofTerm(100 - total(row.parts), row.weight) }}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <UAlert v-if="problem" color="warning" variant="subtle" icon="lucide:alert-triangle" :description="problem" />
  </div>
</template>

<script setup lang="ts">
// How each test of one template is scored. Every test is a single score unless CA is switched on for it, and a CA test
// carries its own named parts (one of which can come from the attendance register). Nothing is saved from here: the
// page reads `payload` / `problem` / `dirty` / `chips` and saves everything together.
const props = defineProps<{
  config: AssessmentConfiguration
  template: Pick<AssessmentTemplate, 'id' | 'name' | 'assessments'>
  draft?: boolean
  disabled?: boolean
}>()

const SEGMENTS = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-secondary', 'bg-error']

type Row = { name: string, weight: number, usesCa: boolean, parts: CaComponent[], formalLabel: string }
const rows = reactive<Row[]>([])

const copyParts = (parts: CaComponent[]) => parts.map(p => ({ name: p.name, weight: p.weight, source: p.source ?? 'MANUAL' }))
const cleanParts = (parts: CaComponent[]) => parts.map(p => ({
  name: (p.name ?? '').trim(), weight: Number(p.weight), source: p.source ?? 'MANUAL'
}))
const total = (parts: CaComponent[]) => parts.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)
const ofTerm = (share: number, testWeight: number) => Math.round(share * testWeight) / 100

// The tests of the template, in order, and what the saved setup says about each.
const tests = computed(() => [...(props.template.assessments || [])]
  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  .filter(a => a.name?.trim())
  .map(a => ({ name: a.name.trim(), weight: Number(a.weight) || 0 })))

function fromConfig(name: string): Pick<Row, 'usesCa' | 'parts' | 'formalLabel'> {
  const entry = (props.config.plan || []).find(p => p.assessmentName.toLowerCase() === name.toLowerCase()
    && p.usesCa && p.caComponents?.length)
  return entry
    ? { usesCa: true, parts: copyParts(entry.caComponents!), formalLabel: entry.formalLabel ?? '' }
    : { usesCa: false, parts: [], formalLabel: '' }
}

// Keeps what has been typed when the tests change (a rename starts that test fresh).
function syncRows() {
  const previous = new Map(rows.map(r => [r.name.toLowerCase(), r]))
  const next = tests.value.map((t) => {
    const keep = previous.get(t.name.toLowerCase())
    return keep ? { ...keep, weight: t.weight } : { name: t.name, weight: t.weight, ...fromConfig(t.name) }
  })
  rows.splice(0, rows.length, ...next)
}
syncRows()
watch(tests, syncRows)

const initialKey = ref('')
const snapshot = () => JSON.stringify(rows.filter(r => r.usesCa).map(r => [r.name.toLowerCase(), cleanParts(r.parts), r.formalLabel.trim()]))
initialKey.value = snapshot()
// Re-read when a different saved setup is handed in (after a save).
watch(() => props.config, () => { rows.splice(0, rows.length); syncRows(); initialKey.value = snapshot() })

// The earlier setup: CA on every test with equal recordings - it has no per-test parts.
const legacy = computed(() => props.config.structure === 'CA_AND_TEST' && !rows.some(r => r.usesCa)
  && !(props.config.plan || []).some(p => p.caComponents?.length))

function toggle(row: Row, on: boolean) {
  row.usesCa = on
  // A starter that matches how most schools build a classwork test - edit anything.
  if (on && !row.parts.length) {
    row.parts = [
      { name: 'Attendance', weight: 20, source: 'ATTENDANCE' },
      { name: 'Assignment', weight: 20, source: 'MANUAL' },
      { name: 'Class participation', weight: 20, source: 'MANUAL' }
    ]
    row.formalLabel = 'Test'
  }
}

const problem = computed(() => {
  for (const r of rows) {
    if (!r.usesCa) continue
    const bad = partsProblem(r.parts)
    if (bad) return `${r.name}: ${bad}`
  }
  return ''
})

const dirty = computed(() => snapshot() !== initialKey.value)

// What gets saved. The top-level numbers are only a valid placeholder: the template's setup lists the CA tests, and
// every test it doesn't list stays a single score.
const payload = computed<SaveAssessmentConfigurationDto>(() => {
  const ca = rows.filter(r => r.usesCa)
  if (!ca.length) return { structure: 'SIMPLE', applyToUnstarted: true }
  return {
    structure: 'CA_AND_TEST',
    caPercentage: 30,
    formalPercentage: 70,
    caFrequency: 'WEEKLY',
    caEntries: 6,
    caComponents: [],
    formalLabel: null,
    plan: ca.map(r => ({
      termId: '*',
      assessmentName: r.name,
      usesCa: true,
      caEntries: r.parts.length,
      caComponents: cleanParts(r.parts),
      formalLabel: r.formalLabel.trim() || null
    })),
    applyToUnstarted: true
  }
})

const chips = computed(() => {
  const ca = rows.filter(r => r.usesCa)
  return {
    style: ca.length ? 'Continuous assessment' : 'Simple assessment',
    counts: ca.length ? `CA on ${ca.map(r => r.name).join(', ')}` : '',
    recordings: ca.length ? `${rows.length - ca.length} single-score test${rows.length - ca.length === 1 ? '' : 's'}` : '',
    custom: ''
  }
})

defineExpose({ payload, problem, dirty, chips })
</script>
