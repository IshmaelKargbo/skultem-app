<template>
  <!-- Read-only look at one template: its tests, weights and how they are scored. -->
  <USlideover v-model:open="open" :title="template?.name ?? 'Template'" :description="template?.description">
    <template #body>
      <div v-if="template" class="space-y-5">
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-xl bg-elevated/50 p-3">
            <p class="text-[11px] uppercase tracking-wide text-muted">Pass mark</p>
            <p class="text-lg font-semibold text-highlighted">{{ template.passMark }}%</p>
          </div>
          <div class="rounded-xl bg-elevated/50 p-3">
            <p class="text-[11px] uppercase tracking-wide text-muted">Tests</p>
            <p class="text-lg font-semibold text-highlighted">{{ template.assessments?.length ?? 0 }}</p>
          </div>
          <div class="rounded-xl bg-elevated/50 p-3">
            <p class="text-[11px] uppercase tracking-wide text-muted">Weight</p>
            <p class="text-lg font-semibold" :class="total === 100 ? 'text-success' : 'text-warning'">{{ total }}%</p>
          </div>
        </div>

        <p v-if="(template.startsInTerm ?? 1) > 1"
          class="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
          <UIcon name="lucide:calendar-range" class="mt-0.5 size-4 shrink-0 text-primary" />
          Students are graded from term {{ template.startsInTerm }}. Earlier terms get no assessments or fees.
        </p>

        <section class="space-y-2">
          <p class="text-sm font-medium text-highlighted">Tests in a term</p>
          <AcademicsAssessmentTemplateWeightBar :items="items" />
          <ul class="divide-y divide-default text-sm">
            <li v-for="(a, i) in items" :key="i" class="flex items-center justify-between gap-3 py-2">
              <span class="flex min-w-0 items-center gap-2">
                <span class="size-2.5 shrink-0 rounded-full" :class="SEGMENTS[i % SEGMENTS.length]" />
                <span class="truncate">{{ a.name }}</span>
                <span v-if="scoredAsCa(a.name)" class="shrink-0 text-xs text-muted">· {{ scoredAsCa(a.name) }}</span>
                <UBadge v-if="a.terms.length" size="sm" variant="subtle" color="neutral" :label="termsLabel(a.terms)" />
              </span>
              <span class="shrink-0 font-semibold">{{ a.weight }}%</span>
            </li>
            <li v-if="!items.length" class="py-3 text-center text-muted">No tests added yet.</li>
          </ul>
          <p v-if="total !== 100" class="text-xs text-warning">
            {{ items.some(a => a.terms.length) ? 'Each term\'s tests must total 100%.' : 'The weights must total 100%.' }}
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-highlighted">Scoring</p>
          <div v-if="loading" class="space-y-2"><USkeleton class="h-6 w-40" /><USkeleton class="h-16 w-full" /></div>
          <template v-else-if="config">
            <div class="flex flex-wrap gap-1.5">
              <UBadge color="primary" variant="subtle">
                {{ caTests.length ? `CA on ${caTests.length} test${caTests.length === 1 ? '' : 's'}`
                  : config.structure === 'CA_AND_TEST' ? 'Continuous assessment' : 'Simple scores' }}
              </UBadge>
              <UBadge v-if="config.inherited" color="warning" variant="subtle">Follows the school-wide setup</UBadge>
            </div>

            <!-- Each CA test with its parts -->
            <div v-for="t in caTests" :key="t.assessmentName" class="rounded-xl border border-default text-sm">
              <p class="border-b border-default px-3 py-2 font-medium text-highlighted">{{ t.assessmentName }}</p>
              <ul class="divide-y divide-default">
                <li v-for="p in t.caComponents" :key="p.name" class="flex items-center justify-between gap-3 px-3 py-2">
                  <span class="flex items-center gap-2">
                    {{ p.name }}
                    <UBadge v-if="p.source === 'ATTENDANCE'" size="sm" variant="subtle" color="info"
                      icon="lucide:calendar-check">from register</UBadge>
                  </span>
                  <span class="font-semibold">{{ p.weight }}%</span>
                </li>
                <li class="flex items-center justify-between gap-3 px-3 py-2">
                  <span>{{ t.formalLabel || 'Final part' }}</span>
                  <span class="font-semibold">{{ 100 - partsTotal(t.caComponents) }}%</span>
                </li>
              </ul>
            </div>
            <p v-if="caTests.length" class="text-xs text-muted">Every other test is a single score.</p>
            <p v-else-if="config.structure === 'CA_AND_TEST'" class="text-sm text-muted">
              Continuous assessment applies to every test: {{ config.caEntries }} equal recordings
              ({{ config.caFrequencyUnit?.toLowerCase() }}) averaged.
            </p>
            <p v-else class="text-sm text-muted">Teachers enter one mark per test.</p>
          </template>
        </section>

        <p class="text-xs text-muted">Last updated {{ formatDate(template.updatedAt) }}</p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-2">
        <UButton icon="lucide:trash-2" label="Delete" color="error" variant="ghost" @click="emit('delete')" />
        <div class="flex gap-2">
          <UButton icon="lucide:sliders-horizontal" label="Scoring" color="neutral" variant="outline"
            @click="emit('edit', 2)" />
          <UButton icon="lucide:pencil" label="Edit tests" @click="emit('edit', 1)" />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const props = defineProps<{ template: AssessmentTemplate | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ edit: [step: number], delete: [] }>()

const SEGMENTS = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-secondary', 'bg-error']
const config = ref<AssessmentConfiguration | null>(null)
const loading = ref(false)

const items = computed(() => [...(props.template?.assessments ?? [])]
  .sort((a, b) => a.position - b.position).map(a => ({ name: a.name, weight: a.weight, terms: a.terms ?? [] })))
const total = computed(() => weightTotal(items.value, props.template?.startsInTerm ?? 1))

// The tests that use CA, with their parts (a template's own setup lists exactly these).
const caTests = computed(() => (config.value?.plan ?? []).filter(p => p.usesCa && p.caComponents?.length))
const partsTotal = (parts?: CaComponent[]) => (parts ?? []).reduce((sum, p) => sum + p.weight, 0)

// "CA" / "single score" next to a test in the list.
function scoredAsCa(name: string) {
  if (config.value?.structure !== 'CA_AND_TEST') return ''
  if (caTests.value.length) return caTests.value.some(t => t.assessmentName.toLowerCase() === name.toLowerCase()) ? 'CA' : 'single score'
  return 'CA'
}

watch(() => [open.value, props.template?.id], async ([isOpen, id]) => {
  if (!isOpen || !id) return
  loading.value = true
  config.value = null
  try {
    config.value = (await AssessmentApi().getTemplateConfiguration(String(id))) ?? null
  } finally {
    loading.value = false
  }
})
</script>
