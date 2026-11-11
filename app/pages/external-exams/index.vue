<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="External Exams"
      subtitle="NPSE, BECE, WASSCE and other national exams: enter each candidate's results, confirm them, then print result slips and statements.">
      <UButton icon="i-lucide-settings-2" variant="outline" color="neutral" label="Exams & grading" class="justify-center"
        to="/external-exams/exams" />
      <UButton icon="i-lucide-plus" label="Add exam class" class="justify-center" @click="openCreate" />
    </Heading>
    <ExternalExamSectionNav />

    <UAlert v-if="documentsOff" color="warning" variant="soft" icon="i-lucide-printer"
      title="Printing is not set up yet"
      description="You can enter and confirm results now. Result slips and statements print once the platform team connects the document service." />

    <UCard v-if="loading">
      <div class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-14 w-full" /></div>
    </UCard>

    <UCard v-else-if="!sittings.length">
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UIcon name="i-lucide-award" class="size-7 text-primary" />
        </div>
        <h3 class="text-base font-semibold text-highlighted">No exam classes yet</h3>
        <p class="max-w-md text-sm text-muted">
          Add the class that sits an external exam - Class 6 for NPSE, JSS 3 for BECE, SSS 3 for WASSCE. Its students
          become the candidates and the subjects you choose become the result columns.
        </p>
        <UButton icon="i-lucide-plus" label="Add exam class" @click="openCreate" />
      </div>
    </UCard>

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <NuxtLink v-for="s in sittings" :key="s.id" :to="`/external-exams/${s.id}`"
        class="block rounded-xl border border-default bg-default p-4 transition hover:border-primary/50 hover:shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold tracking-wide text-primary">{{ s.examCode }} · {{ s.academicYearName }}</p>
            <h3 class="truncate text-base font-semibold text-highlighted">{{ s.className }}</h3>
            <p class="truncate text-xs text-muted">{{ s.examName }}</p>
          </div>
          <UBadge :color="s.status === 'CONFIRMED' ? 'success' : 'warning'" variant="soft"
            :label="s.status === 'CONFIRMED' ? 'Confirmed' : 'Draft'" />
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-lg bg-elevated p-2">
            <p class="text-lg font-semibold text-highlighted">{{ s.candidates }}</p>
            <p class="text-[11px] text-muted">Candidates</p>
          </div>
          <div class="rounded-lg bg-elevated p-2">
            <p class="text-lg font-semibold text-highlighted">{{ s.withIndexNumber }}</p>
            <p class="text-[11px] text-muted">Index numbers</p>
          </div>
          <div class="rounded-lg bg-elevated p-2">
            <p class="text-lg font-semibold text-highlighted">{{ percent(s) }}%</p>
            <p class="text-[11px] text-muted">Scores entered</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <UModal v-model:open="createOpen" title="Add exam class"
      description="The class's students for that year become the candidates.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Exam" required>
            <USelectMenu v-model="form.examId" :items="examOptions" value-key="value" label-key="label"
              placeholder="Choose the exam" class="w-full" :loading="loadingExams" />
          </UFormField>
          <UFormField label="Class" required :hint="selectedExam?.level ? `${levelLabel(selectedExam.level)} classes first` : ''">
            <USelectMenu v-model="form.classId" :items="classOptions" value-key="value" label-key="label"
              placeholder="Choose the class sitting it" class="w-full" :loading="classStore.loading" />
          </UFormField>
          <UFormField label="Academic year" required>
            <USelectMenu v-model="form.academicYearId" :items="yearOptions" value-key="value" label-key="label"
              placeholder="Choose the year" class="w-full" :loading="yearStore.loading" />
          </UFormField>
          <UFormField label="Centre number" hint="Optional">
            <UInput v-model="form.centreNumber" placeholder="As printed on the candidates' slips" class="w-full" />
          </UFormField>
          <UFormField label="Subjects the exam covers" required
            :help="form.classId ? 'Taken from the class. Untick any the exam does not cover.' : 'Choose a class first.'">
            <div v-if="loadingSubjects" class="space-y-2"><USkeleton v-for="i in 4" :key="i" class="h-5 w-48" /></div>
            <div v-else-if="subjects.length" class="grid gap-2 sm:grid-cols-2">
              <UCheckbox v-for="subject in subjects" :key="subject.id" :label="subject.name"
                :model-value="form.subjectIds.includes(subject.id)" @update:model-value="toggleSubject(subject.id)" />
            </div>
            <p v-else-if="form.classId" class="text-sm text-muted">This class has no subjects yet.</p>
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton icon="i-lucide-check" label="Add exam class" :loading="creating" :disabled="!canCreate"
            @click="create" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="creating" @click="createOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { success, error: toastError } = useNotify()
const classStore = useClassStore()
const yearStore = useAcademicYearStore()
const documentService = useDocumentService()

const sittings = ref<ExamSittingSummary[]>([])
const loading = ref(true)
const exams = ref<ExternalExam[]>([])
const loadingExams = ref(false)
const documentsOff = computed(() => !!documentService.status.value && !documentService.status.value.externalExams)

async function load() {
  loading.value = true
  try {
    sittings.value = await ExternalExamApi().sittings() ?? []
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

function percent(s: ExamSittingSummary) {
  return s.scoresExpected ? Math.round((s.scoresEntered / s.scoresExpected) * 100) : 0
}

function levelLabel(level: string) {
  return ({ PRIMARY: 'Primary', JSS: 'JSS', SSS: 'SSS', NURSERY: 'Nursery', DAYCARE: 'Daycare' } as Record<string, string>)[level] ?? level
}

// ---- Adding an exam class

const createOpen = ref(false)
const creating = ref(false)
const form = reactive({ examId: '', classId: '', academicYearId: '', centreNumber: '', subjectIds: [] as string[] })
const subjects = ref<ExamSubjectOption[]>([])
const loadingSubjects = ref(false)

const selectedExam = computed(() => exams.value.find(e => e.id === form.examId))
const examOptions = computed(() => exams.value.map(e => ({ label: `${e.code} - ${e.name}`, value: e.id })))
// The exam's own level first, final-year classes first within it - the classes that usually sit it.
const classOptions = computed(() => {
  const level = selectedExam.value?.level
  return [...classStore.records]
    .sort((a, b) => Number(b.level === level) - Number(a.level === level)
      || Number(b.terminal) - Number(a.terminal) || a.name.localeCompare(b.name))
    .map(c => ({ label: c.terminal ? `${c.name} (final year)` : c.name, value: c.id }))
})
const yearOptions = computed(() => yearStore.records.map(y => ({ label: y.active ? `${y.name} (current)` : y.name, value: y.id })))
const canCreate = computed(() => !!form.examId && !!form.classId && !!form.academicYearId && form.subjectIds.length > 0)

async function openCreate() {
  createOpen.value = true
  Object.assign(form, { examId: '', classId: '', centreNumber: '', subjectIds: [] })
  form.academicYearId = yearStore.records.find(y => y.active)?.id ?? ''
  subjects.value = []
  if (!exams.value.length) {
    loadingExams.value = true
    try {
      exams.value = await ExternalExamApi().exams() ?? []
    } catch (err: any) {
      toastError(err.message)
    } finally {
      loadingExams.value = false
    }
  }
}

watch(() => form.classId, async (classId) => {
  subjects.value = []
  form.subjectIds = []
  if (!classId) return
  loadingSubjects.value = true
  try {
    subjects.value = await ExternalExamApi().classSubjects(classId) ?? []
    form.subjectIds = subjects.value.map(s => s.id)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loadingSubjects.value = false
  }
})

function toggleSubject(id: string) {
  form.subjectIds = form.subjectIds.includes(id) ? form.subjectIds.filter(s => s !== id) : [...form.subjectIds, id]
}

async function create() {
  creating.value = true
  try {
    const sitting = await ExternalExamApi().createSitting({
      examId: form.examId,
      classId: form.classId,
      academicYearId: form.academicYearId,
      centreNumber: form.centreNumber || undefined,
      subjectIds: form.subjectIds
    })
    createOpen.value = false
    success(`${sitting.summary.className} added with ${sitting.summary.candidates} candidates`)
    await navigateTo(`/external-exams/${sitting.summary.id}`)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('External Exams')
  document.title = 'External Exams | Skultem'
  load()
  documentService.ensureLoaded()
  classStore.fetchAll(1, 200)
  yearStore.fetchAll(1, 50)
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
