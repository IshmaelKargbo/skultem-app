<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading :title="sitting ? `${sitting.summary.className} · ${sitting.summary.examCode} ${sitting.summary.academicYearName}` : 'External exam'"
      :subtitle="sitting ? sitting.summary.examName : ''">
      <template v-if="sitting && !confirmed">
        <UButton icon="i-lucide-save" label="Save" class="justify-center" :loading="saving" :disabled="!dirtyCount"
          @click="saveNow" />
        <UButton icon="i-lucide-badge-check" color="success" variant="soft" label="Confirm results" class="justify-center"
          :disabled="saving" @click="confirmOpen = true" />
        <UDropdownMenu :items="draftMenu">
          <UButton icon="i-lucide-ellipsis" variant="outline" color="neutral" aria-label="More" class="justify-center" />
        </UDropdownMenu>
      </template>
      <template v-else-if="sitting">
        <UButton icon="i-lucide-file-text" label="Result slips" class="justify-center" @click="view(null, 'slip')" />
        <UButton icon="i-lucide-scroll-text" variant="soft" label="Statements" class="justify-center"
          @click="view(null, 'statement')" />
        <UButton icon="i-lucide-lock-open" variant="outline" color="neutral" label="Reopen" class="justify-center"
          :loading="reopening" @click="reopen" />
      </template>
    </Heading>
    <ExternalExamSectionNav />

    <UCard v-if="loading">
      <div class="space-y-3"><USkeleton v-for="i in 6" :key="i" class="h-10 w-full" /></div>
    </UCard>

    <template v-else-if="sitting">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <UBadge :color="confirmed ? 'success' : 'warning'" variant="soft" :icon="confirmed ? 'i-lucide-lock' : 'i-lucide-pencil'"
          :label="confirmed ? 'Confirmed - ready to print' : 'Draft - scores can be changed'" />
        <span v-if="sitting.summary.centreNumber" class="text-muted">Centre {{ sitting.summary.centreNumber }}</span>
        <span v-if="confirmed && sitting.summary.confirmedByName" class="text-muted">
          · Confirmed by {{ sitting.summary.confirmedByName }}
        </span>
        <span class="text-muted">· {{ sitting.aggregateLabel }}</span>
        <span v-if="dirtyCount" class="font-medium text-warning">· {{ dirtyCount }} unsaved {{ dirtyCount === 1 ? 'change' : 'changes' }}</span>
      </div>

      <UAlert v-if="confirmed && documentsOff" color="warning" variant="soft" icon="i-lucide-printer"
        title="Printing is not set up yet"
        description="The results are confirmed. Slips and statements print once the platform team connects the document service." />

      <UCard v-if="!sitting.candidates.length">
        <div class="flex flex-col items-center gap-3 py-10 text-center">
          <UIcon name="i-lucide-users" class="size-8 text-muted" />
          <p class="text-sm text-muted">No students are enrolled in this class for {{ sitting.summary.academicYearName }}.</p>
          <UButton v-if="!confirmed" size="sm" variant="soft" icon="i-lucide-refresh-cw" label="Check the class again"
            :loading="refreshing" @click="refresh" />
        </div>
      </UCard>

      <UCard v-else :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search candidate or index number..."
              class="w-full sm:max-w-xs" />
            <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
              <UBadge variant="subtle" color="neutral" :label="`${sitting.summary.candidates} candidates`" />
              <UBadge variant="subtle" :color="missingIndex ? 'warning' : 'success'"
                :label="`${sitting.summary.candidates - missingIndex} with index numbers`" />
              <UBadge variant="subtle" color="neutral"
                :label="`${sitting.subjects.length} subjects · ${byGrades ? 'grades' : 'scores'}`" />
            </div>
          </div>
        </template>

        <!-- Desktop -->
        <UTable class="hidden md:block" :columns="columns" :data="rows" :loading="loading"
          :ui="{ td: 'align-top', th: 'whitespace-nowrap' }">
          <template #empty>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="i-lucide-search-x" class="text-4xl text-gray-400" />
              <p class="text-gray-500">No candidate matches "{{ search }}".</p>
            </div>
          </template>

          <template #loading>
            <TableLoading :size="columns.length" />
          </template>

          <template #candidate-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar :alt="row.original.studentName" size="md" />
              <div class="space-y-1">
                <p class="font-medium text-highlighted">{{ row.original.studentName }}</p>
                <p class="text-xs text-muted">{{ row.original.admissionNumber || 'No Admission No' }}</p>
              </div>
              <UBadge v-if="isDirty(row.original.id)" size="sm" variant="subtle" color="warning" label="Unsaved" />
            </div>
          </template>

          <template #indexNumber-cell="{ row }">
            <UInput v-if="!confirmed" v-model="drafts[row.original.id]!.indexNumber" size="sm" class="w-36"
              placeholder="Index no." :color="drafts[row.original.id]!.indexNumber.trim() ? undefined : 'warning'"
              :aria-label="`Index number for ${row.original.studentName}`" />
            <span v-else class="font-mono text-sm">{{ row.original.indexNumber }}</span>
          </template>

          <template v-for="subject in sitting.subjects" :key="subject.id" #[`subject-${subject.id}-cell`]="{ row }">
            <ExternalExamResultCell :draft="drafts[row.original.id]!" :subject-id="subject.id"
              :subject-name="subject.name" :candidate-name="row.original.studentName" :confirmed="confirmed"
              :by-grades="byGrades" :scale="sitting.exam.gradeScale" :result="resultFor(row.original, subject.id)" />
          </template>

          <template #aggregate-cell="{ row }">
            <p class="text-center font-semibold text-primary">{{ row.original.aggregate ?? '-' }}</p>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UButton v-if="confirmed" size="sm" variant="ghost" color="success" :icon="VIEW_ICON"
                :aria-label="`View ${row.original.studentName}'s result`" @click="view(row.original, 'slip')" />
              <UButton v-else size="sm" variant="ghost" color="error" icon="i-lucide-user-minus"
                :aria-label="`Remove ${row.original.studentName}`" title="Did not sit - remove from this exam"
                @click="askRemove(row.original)" />
            </div>
          </template>
        </UTable>

        <!-- Mobile -->
        <div class="space-y-3 p-4 md:hidden">
          <p v-if="!rows.length" class="py-6 text-center text-sm text-muted">No candidate matches "{{ search }}".</p>
          <div v-for="c in rows" :key="c.id" class="space-y-3 rounded-lg border p-3"
            :class="isDirty(c.id) ? 'border-warning/50' : 'border-default'">
            <div class="flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar :alt="c.studentName" size="md" />
                <div class="min-w-0">
                  <p class="truncate font-medium text-highlighted">{{ c.studentName }}</p>
                  <p class="text-xs text-muted">{{ c.admissionNumber || 'No Admission No' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[11px] text-muted">{{ sitting.aggregateLabel }}</p>
                <p class="font-semibold text-primary">{{ c.aggregate ?? '-' }}</p>
              </div>
            </div>
            <UInput v-if="!confirmed" v-model="drafts[c.id]!.indexNumber" size="sm" class="w-full"
              placeholder="Index number" :aria-label="`Index number for ${c.studentName}`" />
            <p v-else class="font-mono text-sm">{{ c.indexNumber }}</p>
            <div class="divide-y divide-default rounded-md border border-default">
              <div v-for="subject in sitting.subjects" :key="subject.id"
                class="flex items-center justify-between gap-3 px-3 py-2">
                <span class="text-sm">{{ subject.name }}</span>
                <ExternalExamResultCell :draft="drafts[c.id]!" :subject-id="subject.id" :subject-name="subject.name"
                  :candidate-name="c.studentName" :confirmed="confirmed" :by-grades="byGrades"
                  :scale="sitting.exam.gradeScale" :result="resultFor(c, subject.id)" />
              </div>
            </div>
            <div class="flex justify-end">
              <UButton v-if="confirmed" size="sm" variant="soft" :icon="VIEW_ICON" label="View result"
                @click="view(c, 'slip')" />
              <UButton v-else size="sm" variant="ghost" color="error" icon="i-lucide-user-minus" label="Remove"
                @click="askRemove(c)" />
            </div>
          </div>
        </div>
      </UCard>
      <p v-if="!confirmed && sitting.candidates.length" class="text-xs text-muted">
        {{ byGrades ? 'Pick the grade released for each subject; "- (not sat)" prints as absent.' : 'Leave a score blank if the candidate did not sit that subject - it prints as absent.' }} Grades use the exam's scale
        ({{ sitting.exam.code }} on the Exams &amp; grading page).
      </p>
    </template>

    <!-- Confirm -->
    <UModal v-model:open="confirmOpen" title="Confirm these results?"
      description="Confirmed results are locked and can be printed. You can reopen them later to correct a mistake.">
      <template #body>
        <ul class="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>{{ sitting?.summary.candidates }} candidates, {{ sitting?.subjects.length }} subjects.</li>
          <li v-if="missingIndex">{{ missingIndex }} {{ missingIndex === 1 ? 'candidate has' : 'candidates have' }} no index number yet - add them first.</li>
          <li v-if="dirtyCount">Your unsaved changes are saved first.</li>
        </ul>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton color="success" icon="i-lucide-badge-check" label="Confirm results" :loading="confirming"
            @click="confirmResults" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="confirming" @click="confirmOpen = false" />
        </div>
      </template>
    </UModal>

    <!-- Subjects and centre -->
    <UModal v-model:open="editOpen" title="Subjects and centre"
      description="Taking a subject off the exam removes its scores.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Centre number" hint="Optional">
            <UInput v-model="edit.centreNumber" class="w-full" />
          </UFormField>
          <UFormField label="Subjects the exam covers" required>
            <div v-if="loadingSubjects" class="space-y-2"><USkeleton v-for="i in 4" :key="i" class="h-5 w-48" /></div>
            <div v-else class="grid gap-2 sm:grid-cols-2">
              <UCheckbox v-for="subject in classSubjects" :key="subject.id" :label="subject.name"
                :model-value="edit.subjectIds.includes(subject.id)" @update:model-value="toggleEditSubject(subject.id)" />
            </div>
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton icon="i-lucide-check" label="Save" :loading="savingEdit" :disabled="!edit.subjectIds.length"
            @click="saveEdit" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="savingEdit" @click="editOpen = false" />
        </div>
      </template>
    </UModal>

    <!-- Remove a candidate -->
    <UModal v-model:open="removeOpen" :title="`Remove ${removing?.studentName}?`"
      description="For a student who is not sitting this exam. Their scores here are deleted; nothing else changes.">
      <template #footer>
        <div class="flex gap-2">
          <UButton color="error" icon="i-lucide-user-minus" label="Remove" :loading="removingBusy" @click="remove" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="removingBusy" @click="removeOpen = false" />
        </div>
      </template>
    </UModal>

    <!-- Delete -->
    <UModal v-model:open="deleteOpen" title="Delete this exam class?"
      description="Every candidate's index number and scores for it are deleted.">
      <template #footer>
        <div class="flex gap-2">
          <UButton color="error" icon="i-lucide-trash-2" label="Delete" :loading="deleting" @click="destroy" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="deleting" @click="deleteOpen = false" />
        </div>
      </template>
    </UModal>

    <ExternalExamDocumentViewer v-if="sitting" v-model:open="viewerOpen" v-model:type="viewerType"
      :sitting-id="sitting.summary.id" :candidate-id="viewing?.id ?? null" :candidate-name="viewing?.studentName ?? null" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { success, error: toastError } = useNotify()
const documentService = useDocumentService()
const api = ExternalExamApi()
const id = computed(() => String(route.params.id))

const sitting = ref<ExamSitting>()
const loading = ref(true)
const confirmed = computed(() => sitting.value?.summary.status === 'CONFIRMED')
const documentsOff = computed(() => !!documentService.status.value && !documentService.status.value.externalExams)

// ---- What is being typed: index number and scores as text, per candidate, compared to what was loaded. For an
// exam entered as grades (BECE, WASSCE), each cell holds the grade instead ('' = not sat).

// Results entered as grades: a grade per subject from the exam's scale, e.g. BECE 1-7.
const byGrades = computed(() => sitting.value?.exam.entryMode === 'GRADES')

type Draft = { indexNumber: string, scores: Record<string, string> }
const drafts = reactive<Record<string, Draft>>({})
const saved = ref<Record<string, string>>({})

function fingerprint(d: Draft) {
  return JSON.stringify([d.indexNumber.trim(), Object.entries(d.scores).map(([k, v]) => [k, String(v ?? '').trim()]).sort()])
}

function take(next: ExamSitting) {
  sitting.value = next
  for (const key of Object.keys(drafts)) delete drafts[key]
  const marks: Record<string, string> = {}
  for (const c of next.candidates) {
    const scores: Record<string, string> = {}
    const grades = next.exam.entryMode === 'GRADES'
    for (const s of next.subjects) {
      scores[s.id] = grades ? (c.grades?.[s.id] ?? '') : c.scores[s.id] == null ? '' : String(c.scores[s.id])
    }
    drafts[c.id] = { indexNumber: c.indexNumber ?? '', scores }
    marks[c.id] = fingerprint(drafts[c.id]!)
  }
  saved.value = marks
}

const isDirty = (candidateId: string) => !!drafts[candidateId] && fingerprint(drafts[candidateId]!) !== saved.value[candidateId]
const dirtyCount = computed(() => Object.keys(drafts).filter(isDirty).length)
const missingIndex = computed(() => Object.values(drafts).filter(d => !d.indexNumber.trim()).length)

function parse(value: string | undefined): number | null {
  const v = String(value ?? '').trim()
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}
const invalid = (value: string | undefined) => {
  const n = parse(value)
  return n !== null && (Number.isNaN(n) || n < 0 || n > 100)
}
const resultFor = (c: ExamCandidate, subjectId: string) => c.results.find(r => r.subjectId === subjectId)

// ---- The table: one row per candidate, one column per subject.

const search = ref('')
const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  const all = sitting.value?.candidates ?? []
  if (!q) return all
  return all.filter(c => c.studentName.toLowerCase().includes(q)
    || (c.admissionNumber ?? '').toLowerCase().includes(q)
    || (drafts[c.id]?.indexNumber ?? c.indexNumber ?? '').toLowerCase().includes(q))
})
const columns = computed(() => [
  { id: 'candidate', header: 'Candidate' },
  { id: 'indexNumber', header: 'Index number' },
  ...(sitting.value?.subjects ?? []).map(s => ({
    id: `subject-${s.id}`, header: s.name, meta: { class: { th: 'text-center', td: 'text-center' } }
  })),
  {
    id: 'aggregate', header: sitting.value?.exam.aggregateMode === 'TOTAL' && !byGrades.value ? 'Total' : 'Aggregate',
    meta: { class: { th: 'text-center' } }
  },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
])

async function load() {
  loading.value = true
  try {
    take(await api.sitting(id.value))
    useAppStore().setTitle(`External Exams · ${sitting.value!.summary.examCode}`)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

const saving = ref(false)
async function saveNow() {
  await save()
}
async function save(): Promise<boolean> {
  if (!sitting.value) return false
  const changed = Object.keys(drafts).filter(isDirty)
  if (!changed.length) return true
  if (!byGrades.value && changed.some(cid => Object.values(drafts[cid]!.scores).some(invalid))) {
    toastError('Scores must be numbers from 0 to 100')
    return false
  }
  saving.value = true
  try {
    take(await api.saveScores(id.value, changed.map(cid => byGrades.value
      ? {
          candidateId: cid,
          indexNumber: drafts[cid]!.indexNumber.trim() || null,
          grades: { ...drafts[cid]!.scores }
        }
      : {
          candidateId: cid,
          indexNumber: drafts[cid]!.indexNumber.trim() || null,
          scores: Object.fromEntries(Object.entries(drafts[cid]!.scores).map(([k, v]) => [k, parse(v)]))
        })))
    success('Saved')
    return true
  } catch (err: any) {
    toastError(err.message)
    return false
  } finally {
    saving.value = false
  }
}

// ---- Confirm / reopen

const confirmOpen = ref(false)
const confirming = ref(false)
async function confirmResults() {
  confirming.value = true
  try {
    if (!(await save())) return
    take(await api.confirm(id.value))
    confirmOpen.value = false
    success('Results confirmed - you can print them now')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    confirming.value = false
  }
}

const reopening = ref(false)
async function reopen() {
  reopening.value = true
  try {
    take(await api.reopen(id.value))
    success('Reopened - you can change the scores again')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    reopening.value = false
  }
}

// ---- Candidates from the class

const refreshing = ref(false)
async function refresh() {
  if (dirtyCount.value && !(await save())) return
  refreshing.value = true
  try {
    const before = sitting.value?.candidates.length ?? 0
    take(await api.refreshCandidates(id.value))
    const added = (sitting.value?.candidates.length ?? 0) - before
    success(added > 0 ? `${added} new ${added === 1 ? 'candidate' : 'candidates'} added from the class` : 'Candidates are up to date')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    refreshing.value = false
  }
}

const removeOpen = ref(false)
const removing = ref<ExamCandidate | null>(null)
const removingBusy = ref(false)
function askRemove(c: ExamCandidate) {
  removing.value = c
  removeOpen.value = true
}
async function remove() {
  if (!removing.value) return
  if (dirtyCount.value && !(await save())) return
  removingBusy.value = true
  try {
    take(await api.removeCandidate(id.value, removing.value.id))
    removeOpen.value = false
    success('Candidate removed')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    removingBusy.value = false
  }
}

// ---- Subjects and centre

const editOpen = ref(false)
const savingEdit = ref(false)
const loadingSubjects = ref(false)
const classSubjects = ref<ExamSubjectOption[]>([])
const edit = reactive({ centreNumber: '', subjectIds: [] as string[] })
async function openEdit() {
  if (!sitting.value) return
  edit.centreNumber = sitting.value.summary.centreNumber ?? ''
  edit.subjectIds = sitting.value.subjects.map(s => s.id)
  editOpen.value = true
  loadingSubjects.value = true
  try {
    classSubjects.value = await api.classSubjects(sitting.value.summary.classId) ?? []
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loadingSubjects.value = false
  }
}
function toggleEditSubject(sid: string) {
  edit.subjectIds = edit.subjectIds.includes(sid) ? edit.subjectIds.filter(s => s !== sid) : [...edit.subjectIds, sid]
}
async function saveEdit() {
  if (dirtyCount.value && !(await save())) return
  savingEdit.value = true
  try {
    take(await api.updateSitting(id.value, { centreNumber: edit.centreNumber || null, subjectIds: edit.subjectIds }))
    editOpen.value = false
    success('Saved')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    savingEdit.value = false
  }
}

// ---- Delete

const deleteOpen = ref(false)
const deleting = ref(false)
async function destroy() {
  deleting.value = true
  try {
    await api.deleteSitting(id.value)
    saved.value = {}
    for (const key of Object.keys(drafts)) delete drafts[key]
    success('Exam class deleted')
    await navigateTo('/external-exams')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    deleting.value = false
  }
}

const draftMenu = computed(() => [[
  { label: 'Add new students from the class', icon: 'i-lucide-refresh-cw', onSelect: refresh },
  { label: 'Subjects and centre', icon: 'i-lucide-list-checks', onSelect: openEdit }
], [
  { label: 'Delete exam class', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => { deleteOpen.value = true } }
]])

// ---- Viewing and printing (confirmed only)

const viewerOpen = ref(false)
const viewerType = ref<ExamDocumentType>('slip')
const viewing = ref<ExamCandidate | null>(null)
function view(c: ExamCandidate | null, type: ExamDocumentType) {
  viewing.value = c
  viewerType.value = type
  viewerOpen.value = true
}

onBeforeRouteLeave(() => {
  if (dirtyCount.value && !window.confirm('You have unsaved scores. Leave without saving them?')) return false
})

onMounted(() => {
  useAppStore().setTitle('External Exams')
  useAppStore().setBack('/external-exams')
  document.title = 'External Exam Results | Skultem'
  documentService.ensureLoaded()
  load()
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
