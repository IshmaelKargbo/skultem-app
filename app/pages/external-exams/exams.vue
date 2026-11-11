<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Exams & grading"
      subtitle="The national exams your candidates sit and the grade scale each is read on. Check the scales against the exam body's latest ones.">
      <UButton icon="i-lucide-plus" label="Add an exam" class="justify-center" @click="openEdit(null)" />
    </Heading>
    <ExternalExamSectionNav />

    <UCard v-if="loading">
      <div class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-20 w-full" /></div>
    </UCard>

    <div v-else class="grid gap-3 lg:grid-cols-2">
      <UCard v-for="exam in exams" :key="exam.id">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold tracking-wide text-primary">
              {{ exam.code }}<span v-if="exam.examBody"> · {{ exam.examBody }}</span><span v-if="exam.level"> · {{ exam.level }}</span>
            </p>
            <h3 class="font-semibold text-highlighted">{{ exam.name }}</h3>
            <p class="text-xs text-muted">{{ aggregateText(exam) }}</p>
          </div>
          <div class="flex gap-1">
            <UButton size="sm" variant="soft" icon="i-lucide-pencil" label="Edit" @click="openEdit(exam)" />
            <UButton v-if="!exam.builtIn" size="sm" variant="ghost" color="error" icon="i-lucide-trash-2"
              :aria-label="`Delete ${exam.code}`" @click="askDelete(exam)" />
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <UBadge v-for="g in exam.gradeScale" :key="g.grade" variant="outline" color="neutral"
            :label="`${g.grade}: ${g.minScore}-${g.maxScore}`" />
        </div>
      </UCard>
    </div>

    <UModal v-model:open="editOpen" :title="editing ? `Edit ${editing.code}` : 'Add an exam'"
      :ui="{ content: 'sm:max-w-2xl' }">
      <template #body>
        <div class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormField label="Code" required hint="Short, e.g. NPSE">
              <UInput v-model="form.code" :disabled="!!editing" class="w-full" />
            </UFormField>
            <UFormField label="Exam body" hint="Optional">
              <UInput v-model="form.examBody" placeholder="WAEC, MBSSE..." class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Name" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <div class="grid gap-3 sm:grid-cols-3">
            <UFormField label="Level">
              <USelect v-model="form.level" :items="levels" class="w-full" />
            </UFormField>
            <UFormField label="Results are entered as" hint="BECE, WASSCE: grades">
              <USelect v-model="form.entryMode" :items="entryModes" class="w-full" />
            </UFormField>
            <UFormField v-if="form.entryMode === 'SCORES'" label="Result figure">
              <USelect v-model="form.aggregateMode" :items="modes" class="w-full" />
            </UFormField>
            <UFormField v-if="form.aggregateMode === 'POINTS' || form.entryMode === 'GRADES'" label="Best of"
              hint="0 = all subjects">
              <UInput v-model.number="form.bestOf" type="number" min="0" max="30" class="w-full" />
            </UFormField>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between">
              <p class="text-sm font-medium text-highlighted">Grade scale</p>
              <UButton size="xs" variant="soft" icon="i-lucide-plus" label="Add grade" @click="addBand" />
            </div>
            <div class="space-y-2">
              <div class="hidden grid-cols-[4rem_4rem_4rem_4rem_1fr_2rem] gap-2 px-1 text-xs text-muted sm:grid">
                <span>From</span><span>To</span><span>Grade</span><span>Points</span><span>Remark</span><span />
              </div>
              <div v-for="(band, i) in form.gradeScale" :key="i"
                class="grid grid-cols-4 gap-2 sm:grid-cols-[4rem_4rem_4rem_4rem_1fr_2rem]">
                <UInput v-model.number="band.minScore" type="number" min="0" max="100" size="sm" aria-label="From score" />
                <UInput v-model.number="band.maxScore" type="number" min="0" max="100" size="sm" aria-label="To score" />
                <UInput v-model="band.grade" size="sm" aria-label="Grade" />
                <UInput v-model.number="band.points" type="number" size="sm" aria-label="Points" />
                <UInput v-model="band.remark" size="sm" class="col-span-3 sm:col-span-1" aria-label="Remark" />
                <UButton size="sm" variant="ghost" color="error" icon="i-lucide-x" aria-label="Remove grade"
                  @click="removeBand(i)" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton icon="i-lucide-check" label="Save" :loading="saving" @click="saveExam" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="saving" @click="editOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteOpen" :title="`Delete ${deleting?.code}?`"
      description="Only an exam no class has sat can be deleted.">
      <template #footer>
        <div class="flex gap-2">
          <UButton color="error" icon="i-lucide-trash-2" label="Delete" :loading="deletingBusy" @click="destroy" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="deletingBusy" @click="deleteOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { success, error: toastError } = useNotify()
const api = ExternalExamApi()

const exams = ref<ExternalExam[]>([])
const loading = ref(true)

const levels = [
  { label: 'Any', value: 'ANY' },
  { label: 'Primary', value: 'PRIMARY' },
  { label: 'JSS', value: 'JSS' },
  { label: 'SSS', value: 'SSS' }
]
const entryModes = [
  { label: 'Grades (as released, e.g. 1-7)', value: 'GRADES' },
  { label: 'Scores (0-100)', value: 'SCORES' }
]
const modes = [
  { label: 'Aggregate of grade points', value: 'POINTS' },
  { label: 'Total score', value: 'TOTAL' }
]

function aggregateText(e: ExternalExam) {
  const entry = e.entryMode === 'GRADES' ? 'Grades entered as released · ' : 'Scores entered · '
  if (e.entryMode !== 'GRADES' && e.aggregateMode === 'TOTAL') return `${entry}Result: total score`
  return entry + (e.bestOf ? `aggregate of the best ${e.bestOf} subjects` : 'aggregate of all subjects')
}

async function load() {
  loading.value = true
  try {
    exams.value = await api.exams() ?? []
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

const editOpen = ref(false)
const editing = ref<ExternalExam | null>(null)
const saving = ref(false)
const form = reactive({
  code: '', name: '', examBody: '', level: 'ANY', aggregateMode: 'POINTS' as 'POINTS' | 'TOTAL', bestOf: 0,
  entryMode: 'SCORES' as 'SCORES' | 'GRADES',
  gradeScale: [] as ExamGrade[]
})

function openEdit(exam: ExternalExam | null) {
  editing.value = exam
  Object.assign(form, {
    code: exam?.code ?? '',
    name: exam?.name ?? '',
    examBody: exam?.examBody ?? '',
    level: exam?.level ?? 'ANY',
    aggregateMode: exam?.aggregateMode ?? 'POINTS',
    bestOf: exam?.bestOf ?? 0,
    entryMode: exam?.entryMode ?? 'SCORES',
    gradeScale: (exam?.gradeScale ?? [
      { minScore: 70, maxScore: 100, grade: 'A', points: 1, remark: 'Excellent' },
      { minScore: 50, maxScore: 69, grade: 'B', points: 2, remark: 'Credit' },
      { minScore: 0, maxScore: 49, grade: 'F', points: 3, remark: 'Fail' }
    ]).map(g => ({ ...g }))
  })
  editOpen.value = true
}

function removeBand(i: number) {
  form.gradeScale.splice(i, 1)
}

function addBand() {
  form.gradeScale.push({ minScore: 0, maxScore: 0, grade: '', points: form.gradeScale.length + 1, remark: '' })
}

async function saveExam() {
  saving.value = true
  try {
    const body: SaveExternalExam = {
      code: form.code,
      name: form.name,
      examBody: form.examBody || null,
      level: form.level === 'ANY' ? null : form.level,
      bestOf: Number(form.bestOf) || 0,
      entryMode: form.entryMode,
      // Grades always add up as points (best N subjects).
      aggregateMode: form.entryMode === 'GRADES' ? 'POINTS' : form.aggregateMode,
      gradeScale: form.gradeScale.map(g => ({ ...g, minScore: Number(g.minScore), maxScore: Number(g.maxScore), points: Number(g.points) }))
    }
    if (editing.value) await api.updateExam(editing.value.id, body)
    else await api.createExam(body)
    editOpen.value = false
    success('Exam saved')
    await load()
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

const deleteOpen = ref(false)
const deleting = ref<ExternalExam | null>(null)
const deletingBusy = ref(false)
function askDelete(exam: ExternalExam) {
  deleting.value = exam
  deleteOpen.value = true
}
async function destroy() {
  if (!deleting.value) return
  deletingBusy.value = true
  try {
    await api.deleteExam(deleting.value.id)
    deleteOpen.value = false
    success('Exam deleted')
    await load()
  } catch (err: any) {
    toastError(err.message)
  } finally {
    deletingBusy.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('External Exams · Exams & grading')
  document.title = 'Exams & grading | Skultem'
  load()
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
