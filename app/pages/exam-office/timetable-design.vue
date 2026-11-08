<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Exam Timetable Design" subtitle="Customise the exam timetable PDF that staff and parents download.">
      <div class="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
        <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" class="justify-center"
          to="/exam-office/timetable" label="Back to timetables" />
        <GuideButton guide="exam-office-timetable-design" /><HelpButton topic="exam-office-timetable-design" />
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="outline" class="justify-center" label="Reset"
          @click="reset" />
        <UButton icon="i-lucide-save" color="primary" :loading="saving" class="justify-center" label="Save Settings"
          @click="saveDesign" />
      </div>
    </Heading>

    <div data-guide="grades-tabs"><GradesSectionNav /></div>

    <div class="grid gap-6 lg:grid-cols-5">
      <!-- Controls -->
      <div class="space-y-6 lg:col-span-2">
        <UCard data-guide="design-style">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">Style</h3>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Heading" help="Printed above each timetable's own title (e.g. First Term Examination).">
              <UInput v-model="design.heading" placeholder="EXAMINATION TIMETABLE" maxlength="120" class="w-full" />
            </UFormField>

            <UFormField label="Accent Color">
              <div class="flex items-center gap-3">
                <UInput :model-value="accentValue" type="color" class="h-10 w-14 shrink-0 p-1"
                  @update:model-value="(v: string) => { design.accentColor = v }" />
                <UInput :model-value="design.accentColor || ''" placeholder="School brand color"
                  class="w-full font-mono text-sm" @update:model-value="(v: string) => { design.accentColor = v || null }" />
                <UButton v-if="design.accentColor" icon="i-lucide-x" color="neutral" variant="ghost" size="sm"
                  title="Use school color" @click="() => { design.accentColor = null }" />
              </div>
              <template #help>Header line, table headings and the class badge. Blank uses your brand color.</template>
            </UFormField>

            <UFormField label="Page Orientation">
              <div class="grid grid-cols-2 gap-2">
                <UButton v-for="o in orientations" :key="o.value" :icon="o.icon" :label="o.label"
                  :variant="design.orientation === o.value ? 'solid' : 'outline'"
                  :color="design.orientation === o.value ? 'primary' : 'neutral'" class="justify-center"
                  @click="() => { design.orientation = o.value }" />
              </div>
              <template #help>Portrait suits a class page; landscape gives the full timetable more room.</template>
            </UFormField>

            <UFormField label="Footer Note" help="Optional line under the papers.">
              <UInput v-model="footerNote" maxlength="255" class="w-full"
                placeholder="e.g. Report any clash to the exam office before the first paper." />
            </UFormField>
          </div>
        </UCard>

        <UCard data-guide="design-show">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-list" class="size-5 text-primary" />
              <h3 class="font-semibold">What to show</h3>
            </div>
          </template>

          <div class="grid gap-3">
            <label v-for="o in toggles" :key="o.key"
              class="flex cursor-pointer items-start gap-3 rounded-xl border border-default p-3.5 transition-colors hover:bg-muted/40">
              <UCheckbox :model-value="design[o.key]" class="mt-0.5"
                @update:model-value="(v) => { design[o.key] = !!v }" />
              <div class="flex items-start gap-2.5">
                <UIcon :name="o.icon" class="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <p class="text-sm font-medium">{{ o.label }}</p>
                  <p class="text-xs text-muted">{{ o.hint }}</p>
                </div>
              </div>
            </label>
          </div>

          <div v-if="design.showSignatures" class="mt-4 grid grid-cols-2 gap-3">
            <UFormField label="Left signature">
              <UInput v-model="design.leftSignature" maxlength="60" class="w-full" />
            </UFormField>
            <UFormField label="Right signature">
              <UInput v-model="design.rightSignature" maxlength="60" class="w-full" />
            </UFormField>
          </div>
        </UCard>
      </div>

      <!-- Preview -->
      <div class="lg:sticky lg:top-6 lg:col-span-3 lg:self-start">
        <UCard data-guide="design-preview" :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-eye" class="size-5 text-primary" />
                <h3 class="font-semibold">Live Preview</h3>
                <span v-if="usingSample" class="text-xs text-muted">(sample - no exam timetable yet)</span>
              </div>
              <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <USelectMenu v-if="timetableOptions.length" v-model="timetableId" :items="timetableOptions"
                  value-key="value" :loading="loadingPreview" class="w-full sm:w-52" />
                <div class="grid grid-cols-2 gap-1 rounded-lg bg-elevated p-1">
                  <UButton v-for="m in modes" :key="m.value" size="xs" :label="m.label"
                    :color="previewMode === m.value ? 'primary' : 'neutral'" :variant="previewMode === m.value ? 'solid' : 'ghost'"
                    @click="() => { previewMode = m.value }" />
                </div>
              </div>
            </div>
          </template>

          <div ref="viewportRef" class="overflow-hidden p-4">
            <div :style="{ width: `${frameWidth}px`, height: `${frameHeight}px`, margin: '0 auto', overflow: 'hidden' }">
              <div :style="{ width: `${docWidth}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }">
                <ExamOfficeTimetableDocument id="exam-design-preview" :timetable="previewTimetable" :design="design"
                  :mode="previewMode" :class-ids="previewClassIds" :school-name="school?.name || 'Your School'"
                  :logo="school?.logo || ''" :brand-color="school?.primaryColor" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { success, error: notifyError } = useNotify()
const { design, load, save } = useExamTimetableDesign()
const { school, hydrateFromCache } = useSchoolInfo()
hydrateFromCache()
const api = ExamOfficeApi()
const termStore = useTermStore()

const saving = ref(false)

const orientations = [
  { value: 'PORTRAIT', label: 'Portrait', icon: 'i-lucide-rectangle-vertical' },
  { value: 'LANDSCAPE', label: 'Landscape', icon: 'i-lucide-rectangle-horizontal' },
] as const

type ToggleKey = 'showLogo' | 'showVenue' | 'showDuration' | 'showInvigilators' | 'showInstructions' | 'showSignatures'
type Toggle = { key: ToggleKey, label: string, hint: string, icon: string }
const toggles: Toggle[] = [
  { key: 'showLogo', label: 'School logo', hint: 'Your logo beside the school name', icon: 'i-lucide-image' },
  { key: 'showDuration', label: 'Paper length', hint: 'e.g. "2 hrs" under each paper\'s time', icon: 'i-lucide-timer' },
  { key: 'showVenue', label: 'Venue', hint: 'Where each paper is sat', icon: 'i-lucide-map-pin' },
  { key: 'showInvigilators', label: 'Invigilators', hint: 'On the full timetable only - never on class pages sent home', icon: 'i-lucide-user-round-check' },
  { key: 'showInstructions', label: 'Instructions to candidates', hint: "The timetable's own instructions, under the papers", icon: 'i-lucide-list-checks' },
  { key: 'showSignatures', label: 'Signature lines', hint: 'Two lines to sign at the bottom', icon: 'i-lucide-signature' },
]

const modes = [
  { value: 'classes', label: 'Class page' },
  { value: 'full', label: 'Full' },
] as const

const footerNote = computed({
  get: () => design.value.footerNote ?? '',
  set: (v: string) => { design.value.footerNote = v || null },
})

const accentValue = computed(() =>
  /^#[0-9a-f]{6}$/i.test(design.value.accentColor || '')
    ? design.value.accentColor!
    : (/^#[0-9a-f]{6}$/i.test(school.value?.primaryColor || '') ? school.value!.primaryColor! : '#1878c5'))

// --- the preview: a real exam timetable of this term, the sample only while there is none ---
const timetableOptions = ref<{ label: string, value: string }[]>([])
const timetableId = ref('')
const realTimetable = ref<ExamTimetable | null>(null)
const loadingPreview = ref(false)
const previewMode = ref<'classes' | 'full'>('classes')

const sample: ExamTimetable = {
  id: 'sample', termId: '', termName: 'First Term', termStartDate: '', termEndDate: '', assessmentId: '',
  assessmentName: 'Exam', templateName: '', title: 'First Term Examination', startDate: '2026-12-07',
  endDate: '2026-12-11', instructions: DEFAULT_EXAM_INSTRUCTIONS, status: 'PUBLISHED', publishedAt: null,
  publishedByName: null, classes: [{ id: 'jss1', name: 'JSS 1' }], missing: null,
  papers: [
    { id: 'a', subjectId: '', subjectName: 'Mathematics', paper: 'Paper 1 (Objectives)', examDate: '2026-12-07', startTime: '09:00:00', endTime: '11:00:00', venue: 'Main Hall', notes: null, classes: [{ id: 'jss1', name: 'JSS 1' }], invigilators: [{ id: 't1', name: 'Mr Kamara' }] },
    { id: 'b', subjectId: '', subjectName: 'English Language', paper: 'Paper 2 (Theory)', examDate: '2026-12-07', startTime: '11:30:00', endTime: '13:30:00', venue: 'Main Hall', notes: null, classes: [{ id: 'jss1', name: 'JSS 1' }], invigilators: [{ id: 't2', name: 'Mrs Sesay' }] },
    { id: 'c', subjectId: '', subjectName: 'Integrated Science', paper: null, examDate: '2026-12-08', startTime: '09:00:00', endTime: '10:30:00', venue: 'Lab', notes: null, classes: [{ id: 'jss1', name: 'JSS 1' }], invigilators: [{ id: 't3', name: 'Mr Bangura' }] },
    { id: 'd', subjectId: '', subjectName: 'Social Studies', paper: null, examDate: '2026-12-09', startTime: '09:00:00', endTime: '11:00:00', venue: 'Room 4', notes: null, classes: [{ id: 'jss1', name: 'JSS 1' }], invigilators: [{ id: 't4', name: 'Ms Conteh' }] },
  ],
}

const usingSample = computed(() => !realTimetable.value || !realTimetable.value.papers.length)
const previewTimetable = computed(() => (usingSample.value ? sample : realTimetable.value!))
// The class page preview shows the first class that sits a paper.
const previewClassIds = computed(() => {
  const t = previewTimetable.value
  const first = t.classes.find(c => t.papers.some(p => p.classes.some(pc => pc.id === c.id)))
  return first ? [first.id] : []
})

async function loadTimetableList() {
  await termStore.fetchAll(1, 100)
  const term = termStore.records.find(t => t.status === 'ACTIVE') ?? termStore.records[0]
  if (!term) return
  const summaries = (await api.timetables(term.id).catch(() => [])) ?? []
  timetableOptions.value = summaries.filter(s => s.timetableId && s.paperCount > 0)
    .map(s => ({ label: s.title || s.assessmentName, value: s.timetableId! }))
  timetableId.value = timetableOptions.value[0]?.value ?? ''
}

watch(timetableId, async (id) => {
  if (!id) return
  loadingPreview.value = true
  try {
    realTimetable.value = (await api.timetable(id)) ?? null
  } catch {
    realTimetable.value = null
  } finally {
    loadingPreview.value = false
    nextTick().then(scheduleMeasure)
  }
})

// --- scaled preview ---
const viewportRef = ref<HTMLElement | null>(null)
const available = ref(600)
const docWidth = computed(() => (design.value.orientation === 'LANDSCAPE' ? 1123 : 794))
const scale = computed(() => Math.min(1, available.value / docWidth.value))
const docHeight = ref(1000)
const frameWidth = computed(() => Math.round(docWidth.value * scale.value))
const frameHeight = computed(() => Math.round(docHeight.value * scale.value))

let observer: ResizeObserver | undefined
let raf = 0

function measure() {
  available.value = Math.max(240, (viewportRef.value?.clientWidth || 600) - 32)
  const doc = document.getElementById('exam-design-preview')
  if (doc) docHeight.value = doc.scrollHeight
}

function scheduleMeasure() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(measure)
}

watch([design, previewMode], () => nextTick().then(scheduleMeasure), { deep: true })

async function saveDesign() {
  saving.value = true
  try {
    await save()
    success('Exam timetable design saved')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save the design')
  } finally {
    saving.value = false
  }
}

// Back to the defaults in the form only - nothing changes until Save.
function reset() {
  design.value = { ...DEFAULT_EXAM_TIMETABLE_DESIGN }
}

onMounted(async () => {
  useAppStore().setTitle('Exam Timetable Design')
  document.title = 'Exam Timetable Design | Skultem'
  observer = new ResizeObserver(scheduleMeasure)
  if (viewportRef.value) observer.observe(viewportRef.value)
  measure()
  await Promise.all([load(true), loadTimetableList()])
  await nextTick()
  scheduleMeasure()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
