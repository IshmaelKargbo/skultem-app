<template>
  <div class="space-y-3 px-4 md:px-6">
    <!-- What this is, in school terms -->
    <div class="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <UIcon name="lucide:clipboard-list" class="size-5" />
      </span>
      <div class="min-w-0">
        <p class="font-semibold text-highlighted">
          {{ isEdit ? `Editing ${details.name || 'template'}` : 'Set up how a class is assessed' }}
        </p>
        <p class="text-sm text-muted">
          A template says which tests a class sits each term, how much each is worth towards the term mark, and how
          each test is scored. Classes pick a template, so a school can assess primary and secondary differently.
          <template v-if="termNames.length">
            It applies in every term: <span class="font-medium text-highlighted">{{ termNames.join(' · ') }}</span>.
          </template>
        </p>
      </div>
    </div>

    <div class="grid items-start gap-4" :class="step < steps.length - 1 ? 'lg:grid-cols-[minmax(0,1fr)_20rem]' : ''">
    <div class="min-w-0 space-y-4">
    <!-- Stepper -->
    <nav ref="stepperEl" aria-label="Template progress"
      class="scroll-mt-4 rounded-2xl border border-default bg-default p-3 sm:p-4 md:py-6">
      <ol class="flex items-start">
        <li v-for="(value, i) in steps" :key="value.title" class="relative flex flex-1 flex-col items-center">
          <div v-if="i < steps.length - 1" aria-hidden="true"
            class="absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-4 h-0.5 overflow-hidden rounded-full bg-accented sm:top-5">
            <div class="h-full bg-primary transition-all duration-500" :class="step > i ? 'w-full' : 'w-0'" />
          </div>

          <button type="button" :disabled="!canGoTo(i)" :aria-current="step === i ? 'step' : undefined"
            class="group flex flex-col items-center gap-2 disabled:cursor-default" @click="goTo(i)">
            <span
              class="relative z-1 flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 sm:size-10"
              :class="step > i
                ? 'bg-primary text-inverted group-hover:ring-4 group-hover:ring-primary/20'
                : step === i
                  ? 'bg-primary text-inverted ring-4 ring-primary/20'
                  : 'bg-elevated text-muted ring-1 ring-default'">
              <UIcon v-if="step > i" name="i-lucide-check" class="size-4 sm:size-5" />
              <UIcon v-else :name="value.icon" class="size-4 sm:size-5" />
            </span>
            <span class="hidden text-center sm:block">
              <span class="block text-sm font-medium transition-colors"
                :class="step >= i ? 'text-highlighted' : 'text-muted'">{{ value.title }}</span>
              <span class="hidden text-xs text-muted lg:block">{{ value.sub }}</span>
            </span>
          </button>
        </li>
      </ol>

      <div class="mt-3 flex items-center justify-between gap-2 border-t border-default pt-3 sm:hidden">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">{{ steps[step]?.title }}</p>
          <p class="truncate text-xs text-muted">{{ steps[step]?.sub }}</p>
        </div>
        <UBadge variant="subtle" color="primary" size="sm" class="shrink-0" :label="`${step + 1} / ${steps.length}`" />
      </div>
    </nav>

    <UCard v-if="loading">
      <USkeleton class="h-40 w-full" />
    </UCard>

    <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <p class="font-semibold md:text-xl">{{ steps[step]?.heading }}</p>
          <p class="text-sm text-muted">{{ steps[step]?.description }}</p>
        </div>
      </template>

      <div class="p-4 md:p-5">
        <!-- Step 1: Details -->
        <UForm v-show="step === 0" ref="detailsForm" :schema="detailsSchema" :state="details" class="space-y-4"
          @submit="next">
          <UAlert v-if="isEdit && usage?.classNames.length" :color="usage.submittedTests ? 'warning' : 'info'"
            variant="soft" icon="lucide:users"
            :title="`In use by ${usage.classNames.length} class${usage.classNames.length === 1 ? '' : 'es'}`">
            <template #description>
              {{ usage.classNames.join(', ') }}.
              <template v-if="usage.submittedTests">
                {{ usage.submittedTests }} test{{ usage.submittedTests === 1 ? ' has' : 's have' }} already been submitted
                for approval, so saving asks you to confirm.
              </template>
              <template v-else>
                Changes here carry through to these classes' existing tests. Nothing has been submitted yet.
              </template>
            </template>
          </UAlert>

          <UFormField required label="Template name" name="name"
            help="Pick a name teachers will recognise - usually the level or the way it is assessed.">
            <UInput v-model="details.name" placeholder="e.g. JSS Continuous Assessment" class="w-full"
              :disabled="saving" />
            <div v-if="!isEdit" class="mt-2 flex flex-wrap gap-1.5">
              <UButton v-for="n in nameIdeas" :key="n" :label="n" size="xs" color="neutral" variant="outline"
                @click="details.name = n" />
            </div>
          </UFormField>

          <UFormField required label="Pass mark (%)" name="passMark"
            help="The lowest total score that counts as a pass for this template.">
            <UInput v-model.number="details.passMark" type="number" min="0" max="100" class="w-full"
              :disabled="saving" />
            <div v-if="!isEdit" class="mt-2 flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-muted">Common:</span>
              <UButton v-for="m in [40, 45, 50, 60]" :key="m" :label="`${m}%`" size="xs" color="neutral"
                :variant="details.passMark === m ? 'subtle' : 'outline'" @click="details.passMark = m" />
            </div>
          </UFormField>

          <UFormField required label="Description" name="description"
            help="How the marks are shared, e.g. Test 1 50% + Formal Test 50% each term.">
            <UTextarea v-model="details.description" class="w-full" :rows="3" autoresize
              placeholder="Briefly describe how this template is structured" :disabled="saving" />
          </UFormField>
        </UForm>

        <!-- Step 2: Assessments -->
        <div v-show="step === 1" class="space-y-4">
          <!-- Common school setups to start from -->
          <div v-if="!isEdit" class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-highlighted">Start from a common setup</p>
              <UButton v-if="selectedPreset || namedAssignments.length" icon="lucide:eraser" size="xs" color="neutral"
                variant="ghost" label="Clear and start empty" :disabled="saving" @click="clearAssessments" />
            </div>
            <div class="grid gap-2 sm:grid-cols-3">
              <button v-for="p in presets" :key="p.title" type="button"
                class="rounded-xl border p-3 text-left transition hover:border-primary hover:bg-primary/5"
                :class="selectedPreset === p.title ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-default'"
                @click="selectedPreset === p.title ? clearAssessments() : usePreset(p)">
                <p class="flex items-center justify-between gap-2 text-sm font-semibold text-highlighted">
                  {{ p.title }}
                  <UIcon v-if="selectedPreset === p.title" name="lucide:circle-check" class="size-4 text-primary" />
                </p>
                <p class="mt-0.5 text-xs text-muted">{{ p.items.map(i => `${i.name} ${i.weight}%`).join(' · ') }}</p>
                <p class="mt-1.5 text-xs text-muted">{{ p.hint }}</p>
              </button>
            </div>
            <p class="text-xs text-muted">
              {{ selectedPreset ? 'Change any name or weight below, or click the setup again to remove it.' : 'Or add your own tests below.' }}
            </p>
          </div>

          <div class="rounded-xl border p-3"
            :class="totalWeight === 100 ? 'border-success/40 bg-success/5' : 'border-default bg-elevated/40'">
            <div class="mb-2 flex items-center justify-between gap-3">
              <div>
                <p class="text-xs text-muted">Share of the term mark</p>
                <p class="text-xl font-semibold" :class="totalWeight === 100 ? 'text-success' : 'text-warning'">
                  {{ totalWeight }}%
                </p>
              </div>
              <UBadge :color="totalWeight === 100 ? 'success' : 'warning'" variant="subtle"
                :label="totalWeight === 100 ? 'Balanced' : totalWeight > 100 ? `${totalWeight - 100}% over` : `${100 - totalWeight}% left to share`" />
            </div>
            <AcademicsAssessmentTemplateWeightBar :items="namedAssignments" />
          </div>

          <div class="space-y-2">
            <div v-for="(a, i) in assignments" :key="i"
              class="grid grid-cols-[1.5rem_1fr_6rem_auto] items-center gap-2 rounded-xl border border-default p-2.5">
              <span class="flex size-6 items-center justify-center rounded-full text-xs font-semibold text-inverted"
                :class="segmentColor(i)">{{ i + 1 }}</span>
              <UInput v-model="a.name" placeholder="e.g. Test 1" :disabled="saving" />
              <UInput v-model.number="a.weight" type="number" min="1" max="100" :disabled="saving"
                :ui="{ trailing: 'pe-3 text-muted text-sm' }">
                <template #trailing>%</template>
              </UInput>
              <div class="flex">
                <UButton icon="lucide:chevron-up" color="neutral" variant="ghost" size="xs" aria-label="Move up"
                  :disabled="i === 0 || saving" @click="move(i, -1)" />
                <UButton icon="lucide:chevron-down" color="neutral" variant="ghost" size="xs" aria-label="Move down"
                  :disabled="i === assignments.length - 1 || saving" @click="move(i, 1)" />
                <UButton icon="lucide:trash-2" color="error" variant="ghost" size="xs" aria-label="Remove"
                  :disabled="assignments.length === 1 || saving" @click="assignments.splice(i, 1)" />
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton icon="lucide:plus" label="Add assessment" color="neutral" variant="outline" :disabled="saving"
              @click="assignments.push({ name: '', weight: 0 })" />
            <UButton icon="lucide:wand-sparkles" label="Split evenly" color="info" variant="outline"
              :disabled="saving" @click="splitEvenly" />
            <UButton v-if="totalWeight !== 100 && assignments.length" icon="lucide:scale"
              label="Give the rest to the last one" color="neutral" variant="ghost" :disabled="saving"
              @click="balanceLast" />
          </div>
          <p class="text-xs text-muted">
            List the tests in the order they happen in a term. Each term, a student's marks from these tests are
            combined by their weights into one term mark, so the weights must total exactly 100%.
          </p>
        </div>

        <!-- Step 3: Scoring (kept alive once opened, so nothing typed is lost when you go back) -->
        <div v-show="step === 2" class="space-y-3">
          <!-- When grading starts: a class that joins part-way through the year -->
          <div class="rounded-2xl border border-default p-3 sm:p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-highlighted">When does grading begin?</p>
                <p class="text-sm text-muted">
                  Choose the first term these students are assessed. Change it only if the class joins part-way through
                  the year, for example SSS 1 starting in Term 2. Most classes begin in Term 1.
                </p>
              </div>
              <USelectMenu v-model="startsInTerm" value-key="value" :items="startTermOptions" :disabled="saving"
                class="w-44" />
            </div>
            <p v-if="skippedTerms.length" class="mt-2 rounded-lg bg-primary/5 p-2.5 text-xs text-muted">
              <UIcon name="lucide:info" class="mr-1 align-text-bottom text-primary" />
              Students won't have assessments, scores or fees for
              <span class="font-medium text-highlighted">{{ skippedTerms.join(' and ') }}</span>.
              Their first test opens when {{ startTermOptions.find(o => o.value === startsInTerm)?.label }} begins.
            </p>
          </div>

          <UAlert color="primary" variant="soft" icon="lucide:lightbulb" title="Single scores are the default"
            description="Most tests are just one mark. Switch CA on only for a test that is built from parts - for example Test 1 from attendance, assignments and class participation - and leave the Exam as one score." />
          <AcademicsAssessmentTemplateScoringForm v-if="scoringVisited" ref="scoringRef" draft :config="config"
            :template="draftTemplate" />
        </div>

        <!-- Step 4: Review -->
        <div v-if="step === 3" class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-elevated/50 p-3">
              <p class="text-[11px] uppercase tracking-wide text-muted">Template</p>
              <p class="truncate font-semibold text-highlighted">{{ details.name }}</p>
            </div>
            <div class="rounded-xl bg-elevated/50 p-3">
              <p class="text-[11px] uppercase tracking-wide text-muted">Pass mark</p>
              <p class="font-semibold text-highlighted">{{ details.passMark }}%</p>
            </div>
            <div class="rounded-xl bg-elevated/50 p-3">
              <p class="text-[11px] uppercase tracking-wide text-muted">Assessments</p>
              <p class="font-semibold text-highlighted">{{ assignments.length }} · {{ totalWeight }}%</p>
            </div>
          </div>
          <p v-if="details.description" class="text-sm text-muted">{{ details.description }}</p>

          <div class="overflow-hidden rounded-xl border border-default">
            <table class="w-full text-sm">
              <thead class="bg-elevated/50 text-left text-xs text-muted">
                <tr><th class="px-4 py-2">#</th><th class="px-4 py-2">Assessment</th>
                  <th class="px-4 py-2 text-right">Weight</th><th class="px-4 py-2">Scored as</th></tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in assignments" :key="i" class="border-t border-default">
                  <td class="px-4 py-2 text-muted">{{ i + 1 }}</td>
                  <td class="px-4 py-2 font-medium">{{ a.name }}</td>
                  <td class="px-4 py-2 text-right font-semibold text-primary">{{ a.weight }}%</td>
                  <td class="px-4 py-2 text-muted">{{ scoredAs(a.name) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="startsInTerm > 1" class="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
            <UIcon name="lucide:calendar-range" class="mt-0.5 size-4 shrink-0 text-primary" />
            <p>Grading begins in
              <span class="font-semibold text-highlighted">{{ startTermOptions.find(o => o.value === startsInTerm)?.label }}</span>.
              No assessments or fees for {{ skippedTerms.join(' and ') }}.</p>
          </div>

          <div class="rounded-xl border border-default p-3">
            <p class="mb-1.5 text-sm font-medium text-highlighted">Scoring</p>
            <div class="flex flex-wrap gap-1.5">
              <UBadge color="primary" variant="subtle">{{ scoringChips.style }}</UBadge>
              <UBadge v-if="scoringChips.counts" color="neutral" variant="subtle">{{ scoringChips.counts }}</UBadge>
              <UBadge v-if="scoringChips.recordings" color="neutral" variant="subtle">{{ scoringChips.recordings }}</UBadge>
              <UBadge v-if="scoringChips.custom" color="neutral" variant="subtle">{{ scoringChips.custom }}</UBadge>
            </div>
            <p v-for="a in attendanceParts" :key="a.test + a.name" class="mt-2 text-xs text-muted">
              <UIcon name="lucide:calendar-check" class="mr-1 align-text-bottom text-info" />
              {{ a.test }}: {{ a.name }} ({{ a.weight }}%) is filled in from the attendance register.
            </p>
          </div>

          <UCheckbox v-if="isEdit && scoringChanged" v-model="applyNow" label="Also update tests nobody has started"
            description="Tests with no marks yet switch straight away. Anything with a mark in it is never touched." />
        </div>
      </div>

      <!-- Actions -->
      <div
        class="sticky bottom-0 z-10 flex gap-2 rounded-b-[calc(var(--ui-radius)*2)] border-t border-default bg-default/95 px-4 py-3 backdrop-blur sm:justify-end md:px-5 md:py-4">
        <UButton v-if="step === 0" label="Cancel" color="neutral" variant="outline" size="lg"
          to="/academics/assessment-templates" class="flex-1 justify-center sm:flex-none" />
        <UButton v-else :icon="BACK_ICON" label="Back" color="neutral" variant="outline" size="lg" :disabled="saving"
          class="flex-1 justify-center sm:flex-none" @click="back" />
        <UButton v-if="step < steps.length - 1" :trailing-icon="NEXT_ICON" label="Continue" size="lg"
          class="flex-[2] justify-center sm:flex-none" @click="onContinue" />
        <UButton v-else icon="lucide:save" :loading="saving" size="lg" class="flex-[2] justify-center sm:flex-none"
          :label="isEdit ? 'Save changes' : 'Create template'" @click="submit()" />
      </div>
    </UCard>
    </div>

    <!-- Live summary: always shows what has been entered so far -->
    <aside v-if="step < steps.length - 1 && !loading" class="hidden space-y-3 lg:sticky lg:top-4 lg:block">
      <UCard :ui="{ body: 'p-4 sm:p-4 space-y-4', header: 'p-3 sm:p-4' }">
        <template #header>
          <p class="text-xs font-medium uppercase tracking-wide text-muted">Your template</p>
          <p class="truncate text-lg font-semibold text-highlighted">{{ details.name.trim() || 'Untitled template' }}</p>
          <p class="text-xs text-muted">Pass mark {{ details.passMark }}%</p>
        </template>

        <div v-if="namedAssignments.length" class="space-y-2">
          <AcademicsAssessmentTemplateWeightBar :items="namedAssignments" />
          <ul class="divide-y divide-default text-sm">
            <li v-for="(a, i) in namedAssignments" :key="i" class="flex items-center justify-between gap-3 py-1.5">
              <span class="flex min-w-0 items-center gap-2">
                <span class="size-2.5 shrink-0 rounded-full" :class="segmentColor(i)" />
                <span class="truncate">{{ a.name }}</span>
              </span>
              <span class="shrink-0 font-semibold">{{ a.weight }}%</span>
            </li>
          </ul>
        </div>
        <p v-else class="text-sm text-muted">The tests you add appear here.</p>

        <div class="flex flex-wrap gap-1.5">
          <UBadge color="primary" variant="subtle">{{ scoringChips.style }}</UBadge>
          <UBadge v-if="scoringChips.counts" color="neutral" variant="subtle">{{ scoringChips.counts }}</UBadge>
          <UBadge v-if="scoringChips.recordings" color="neutral" variant="subtle">{{ scoringChips.recordings }}</UBadge>
        </div>
      </UCard>

      <!-- Checklist -->
      <div class="rounded-2xl border border-default p-4">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Checklist</p>
        <ul class="space-y-2 text-sm">
          <li v-for="item in checklist" :key="item.label" class="flex items-start gap-2">
            <UIcon :name="item.done ? 'lucide:circle-check' : 'lucide:circle-dashed'"
              class="mt-0.5 size-4 shrink-0" :class="item.done ? 'text-success' : 'text-muted'" />
            <span :class="item.done ? 'text-highlighted' : 'text-muted'">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </aside>
    </div>

    <!-- Editing a template that has already been used -->
    <UModal v-model:open="forceOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Change this template anyway?</h3>
          </template>
          <div class="space-y-3 text-sm">
            <UAlert color="warning" variant="soft" icon="lucide:triangle-alert" :description="forceMessage" />
            <ul class="list-disc space-y-1 pl-5 text-muted">
              <li>Marks already entered are kept and re-weighted to the new weights.</li>
              <li>New tests are added, locked, for every student of the classes using this template.</li>
              <li>Tests you removed are deleted along with their marks.</li>
              <li>Tests that already have marks keep the way they were scored (CA or single score); only blank tests switch.</li>
            </ul>
            <p class="text-xs text-muted">This is recorded in the audit log.</p>
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton class="flex w-full items-center justify-center" label="Cancel" variant="soft"
                @click="forceOpen = false" />
              <UButton class="flex w-full items-center justify-center" label="Change anyway" color="warning"
                icon="lucide:save" :loading="saving" @click="confirmForce" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const route = useRoute()
const store = useAssessmentStore()
const { success, error: toastError } = useNotify()

const editId = computed(() => route.query.id ? String(route.query.id) : '')
const isEdit = computed(() => !!editId.value)

const loading = ref(true)
const saving = ref(false)
const step = ref(0)
const stepperEl = ref<HTMLElement | null>(null)
const detailsForm = ref()
const scoringRef = ref<any>(null)
const scoringVisited = ref(false)
const applyNow = ref(true)

// The term students of classes using this template start being graded in.
const startsInTerm = ref(1)
const savedStartsInTerm = ref(1)
const orderedTerms = computed(() => [...(termStore.records || [])].sort((a: any, b: any) => a.termNumber - b.termNumber))
const startTermOptions = computed(() => (orderedTerms.value.length
  ? orderedTerms.value.map((t: any) => ({ label: t.name, value: t.termNumber }))
  : [1, 2, 3].map(n => ({ label: `Term ${n}`, value: n }))))
const skippedTerms = computed(() => startTermOptions.value.filter(o => o.value < startsInTerm.value).map(o => o.label))

const steps = [
  { title: 'Details', sub: 'Name & pass mark', icon: 'i-lucide-file-text', heading: 'Template Details', description: 'Name the template and set the pass mark.' },
  { title: 'Assessments', sub: 'Tests & weights', icon: 'i-lucide-clipboard-list', heading: 'Assessments', description: 'List the tests in the order they happen and share 100% between them.' },
  { title: 'Scoring', sub: 'Which tests use CA', icon: 'i-lucide-sliders-horizontal', heading: 'How is each test scored?', description: 'Choose the tests that are built from parts (attendance, assignments...). The rest stay a single score.' },
  { title: 'Review', sub: 'Check & save', icon: 'i-lucide-circle-check', heading: 'Review', description: 'Check everything, then save.' }
]

const details = reactive({ name: '', passMark: 50, description: '' })
const detailsSchema = yup.object({
  name: yup.string().trim().required('Template name is required'),
  passMark: yup.number().typeError('Pass mark must be a number').required('Pass mark is required').min(0).max(100),
  description: yup.string().trim().required('Template description is required')
})

const assignments = ref<{ id?: string, name: string, weight: number }[]>([{ name: '', weight: 0 }])
// Only for an existing template: how far it has been used (what an edit touches) and the confirmation dialog.
const usage = ref<{ classNames: string[], submittedTests: number, markedScores: number } | null>(null)
const forceOpen = ref(false)
const forceMessage = ref('')
const namedAssignments = computed(() => assignments.value.filter(a => a.name.trim() && Number(a.weight) > 0)
  .map(a => ({ name: a.name.trim(), weight: Number(a.weight) })))

// Colours shared by the weight bar, the numbered rows and the summary, so a test is the same colour everywhere.
const SEGMENTS = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-secondary', 'bg-error']
const segmentColor = (i: number) => SEGMENTS[i % SEGMENTS.length]

const nameIdeas = ['Primary Standard', 'JSS Continuous Assessment', 'SSS Final Assessment']
const presets = [
  { title: 'Two tests and an exam', hint: 'A common setup for most levels', items: [
    { name: 'Test 1', weight: 20 }, { name: 'Test 2', weight: 20 }, { name: 'Exam', weight: 60 }] },
  { title: 'Test 1 and a formal test', hint: 'Test 1 can hold attendance, assignments and class work (set in Scoring)', items: [
    { name: 'Test 1', weight: 50 }, { name: 'Formal Test', weight: 50 }] },
  { title: 'Classwork and an exam', hint: 'Continuous classwork counts towards the term', items: [
    { name: 'Classwork', weight: 40 }, { name: 'Exam', weight: 60 }] }
]
const selectedPreset = ref('')
function usePreset(p: (typeof presets)[number]) {
  assignments.value = p.items.map(i => ({ ...i }))
  selectedPreset.value = p.title
}
function clearAssessments() {
  assignments.value = [{ name: '', weight: 0 }]
  selectedPreset.value = ''
}

const termStore = useTermStore()
const termNames = computed(() => (termStore.records || []).filter((t: any) => t.status !== 'CLOSED').map((t: any) => t.name))
const totalWeight = computed(() => assignments.value.reduce((sum, a) => sum + (Number(a.weight) || 0), 0))

function move(i: number, by: number) {
  const list = assignments.value
  const j = i + by
  if (j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j]!, list[i]!]
}
function splitEvenly() {
  const n = assignments.value.length
  if (!n) return
  const base = Math.floor(100 / n)
  let rest = 100 - base * n
  assignments.value.forEach((a) => { a.weight = base + (rest > 0 ? 1 : 0); if (rest > 0) rest-- })
}
function balanceLast() {
  const list = assignments.value
  if (!list.length) return
  const others = list.slice(0, -1).reduce((sum, a) => sum + (Number(a.weight) || 0), 0)
  list[list.length - 1]!.weight = Math.max(0, 100 - others)
}

function assignmentsProblem(): string {
  const list = assignments.value.map(a => ({ name: a.name.trim(), weight: Number(a.weight) }))
  if (!list.length) return 'Add at least one assessment.'
  if (list.some(a => !a.name)) return 'Every assessment needs a name.'
  if (new Set(list.map(a => a.name.toLowerCase())).size !== list.length) return 'Assessment names must be different from each other.'
  if (list.some(a => !(a.weight > 0 && a.weight <= 100))) return 'Every weight must be between 1% and 100%.'
  if (totalWeight.value !== 100) return `The weights add up to ${totalWeight.value}% - they must total exactly 100%.`
  return ''
}

// --- Scoring: the form works on a stand-in for the template, built from the assessments above ---
const baseConfig = (): AssessmentConfiguration => ({
  managementSectionId: null, sectionName: null, structure: 'SIMPLE', caEnabled: false, caPercentage: 0,
  formalPercentage: 100, caFrequency: null, caFrequencyUnit: null, caEntries: 0, version: 0, isDefault: true,
  inherited: false, updatedAt: null, updatedBy: null, plan: [], caComponents: [], formalLabel: null,
  assessmentTemplateId: null
})
const config = ref<AssessmentConfiguration>(baseConfig())
const draftTemplate = computed(() => ({
  id: editId.value || 'new',
  name: details.name,
  assessments: assignments.value.filter(a => a.name.trim()).map((a, i) => ({
    id: String(i), name: a.name.trim(), weight: Number(a.weight), position: i + 1
  })) as Assessment[]
}))

const checklist = computed(() => [
  { label: 'Name and pass mark', done: !!details.name.trim() && details.passMark >= 0 },
  { label: totalWeight.value === 100 ? 'Tests share 100% of the term mark'
      : `Tests must total 100% (now ${totalWeight.value}%)`, done: !assignmentsProblem() },
  { label: scoringVisited.value ? `Scoring: ${scoringChips.value.style}` : 'Scoring - plain scores unless you change it',
    done: true },
  { label: startsInTerm.value > 1 ? `Graded from ${startTermOptions.value.find(o => o.value === startsInTerm.value)?.label}`
      : 'Graded from the first term', done: true }
])

const scoringChips = computed(() => scoringRef.value?.chips ?? { style: 'Simple assessment', counts: '', recordings: '', custom: '' })
const scoringChanged = computed(() => !!scoringRef.value?.dirty)
// The tests whose CA includes a part taken from the attendance register.
const attendanceParts = computed(() => ((scoringRef.value?.payload as SaveAssessmentConfigurationDto | undefined)?.plan ?? [])
  .flatMap(p => (p.caComponents ?? []).filter(c => c.source === 'ATTENDANCE')
    .map(c => ({ test: p.assessmentName, name: c.name, weight: c.weight }))))
function scoredAs(name: string) {
  const p = scoringRef.value?.payload as SaveAssessmentConfigurationDto | undefined
  const entry = p?.plan?.find(x => x.usesCa && x.assessmentName.toLowerCase() === name.trim().toLowerCase())
  if (!entry) return 'Single score'
  const n = entry.caComponents?.length ?? 0
  return `CA · ${n} part${n === 1 ? '' : 's'} + ${entry.formalLabel || 'final part'}`
}

// --- Navigation ---
const visitedMax = ref(0)
function canGoTo(i: number) {
  if (saving.value) return false
  return isEdit.value ? true : i <= Math.max(step.value, visitedMax.value) && i < step.value
}
function goTo(i: number) {
  if (!canGoTo(i)) return
  step.value = i
}
function back() {
  if (step.value > 0) step.value--
}

async function onContinue() {
  if (step.value === 0) {
    // The details form validates itself; its submit event moves on.
    return detailsForm.value?.submit()
  }
  if (step.value === 1) {
    const bad = assignmentsProblem()
    if (bad) return toastError(bad)
  }
  if (step.value === 2) {
    const bad = scoringRef.value?.problem
    if (bad) return toastError(bad)
  }
  next()
}
function next() {
  if (step.value < steps.length - 1) step.value++
}

watch(step, (s) => {
  visitedMax.value = Math.max(visitedMax.value, s)
  if (s === 2) scoringVisited.value = true
  stepperEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

// --- Save ---
async function submit(force = false) {
  const bad = assignmentsProblem() || scoringRef.value?.problem
  if (bad) return toastError(bad)

  // Something has already gone for approval: say what an edit touches before sending it.
  if (isEdit.value && !force && usage.value?.submittedTests) {
    forceMessage.value = `${usage.value.submittedTests} test${usage.value.submittedTests === 1 ? ' has' : 's have'} already been submitted `
      + `for approval in ${usage.value.classNames.join(', ')}.`
    forceOpen.value = true
    return
  }

  saving.value = true
  try {
    const list = assignments.value.map(a => ({ id: a.id, name: a.name.trim(), weight: Number(a.weight) }))
    let id = editId.value
    let assigned: any = true

    if (isEdit.value) {
      // Edited in place: renamed and re-weighted tests keep their marks, new ones appear for every student, removed
      // ones go - and the change reaches every class that already uses the template.
      const r = await AssessmentApi().updateTemplate(id, {
        name: details.name.trim(), passMark: details.passMark, description: details.description.trim(),
        assessments: list, force
      })
      if (!r.ok) {
        if (/confirm/i.test(r.message)) {
          forceMessage.value = r.message
          forceOpen.value = true
        } else {
          toastError(r.message)
        }
        return
      }
    } else {
      const created: any = await store.create({
        name: details.name.trim(), passMark: details.passMark, description: details.description.trim()
      })
      id = created?.data?.id
      if (!id) return // the API layer already showed why
      assigned = await store.assign(id, { assignments: list.map(({ name, weight }) => ({ name, weight })) })
    }

    const payload = scoringRef.value?.payload as SaveAssessmentConfigurationDto | undefined
    const needsScoring = payload && (payload.structure !== 'SIMPLE' || (isEdit.value && scoringChanged.value))
    const scored = !needsScoring || await AssessmentApi().saveConfiguration(
      { ...payload!, applyToUnstarted: isEdit.value ? applyNow.value : false }, id)

    const startSaved = startsInTerm.value === savedStartsInTerm.value
      || await AssessmentApi().setTemplateStartsInTerm(id, startsInTerm.value)

    if (!assigned || !scored || !startSaved) {
      if (!isEdit.value) {
        toastError('The template was created but not everything saved. Finish it here.')
        await navigateTo(`/academics/template-setup?id=${id}&step=1`, { replace: true })
      }
      return
    }

    await store.fetchAll(1, 100)
    success(isEdit.value ? 'Template updated' : 'Assessment template created')
    await navigateTo('/academics/assessment-templates')
  } finally {
    saving.value = false
  }
}

function confirmForce() {
  forceOpen.value = false
  submit(true)
}

// --- Load (edit) ---
async function loadForEdit() {
  if (!store.records?.some((t: AssessmentTemplate) => t.id === editId.value)) await store.fetchAll(1, 100)
  const t = (store.records || []).find((x: AssessmentTemplate) => x.id === editId.value)
  if (!t) {
    toastError('Assessment template not found')
    return navigateTo('/academics/assessment-templates')
  }
  details.name = t.name
  details.passMark = t.passMark
  details.description = t.description
  startsInTerm.value = t.startsInTerm ?? 1
  savedStartsInTerm.value = startsInTerm.value
  assignments.value = [...(t.assessments || [])].sort((a, b) => a.position - b.position)
    .map(a => ({ id: a.id, name: a.name, weight: a.weight }))
  if (!assignments.value.length) assignments.value = [{ name: '', weight: 0 }]
  usage.value = (await AssessmentApi().getTemplateUsage(t.id)) ?? null
  config.value = (await AssessmentApi().getTemplateConfiguration(t.id)) ?? baseConfig()
}

onMounted(async () => {
  if (!termStore.records?.length) termStore.fetchAll(0, 0)
  useAppStore().setTitle(isEdit.value ? 'Edit Assessment Template' : 'Add Assessment Template')
  useAppStore().setBack('/academics/assessment-templates')
  document.title = 'Assessment Template | Academics | Skultem'
  try {
    if (isEdit.value) {
      await loadForEdit()
      const wanted = Number(route.query.step ?? 1)
      step.value = Number.isInteger(wanted) ? Math.min(Math.max(wanted, 0), steps.length - 1) : 1
      visitedMax.value = steps.length - 1
    }
  } finally {
    loading.value = false
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
