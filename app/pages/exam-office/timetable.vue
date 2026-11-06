<template>
  <ExamOfficeStudentTimetable v-if="isParent" />

  <div v-else class="space-y-3 px-4 md:px-6">
    <div class="space-y-3 print:hidden">
      <Heading title="Exam Timetables" :subtitle="canManage
        ? 'One timetable for each assessment in the term: its papers, venues and invigilators.'
        : 'When and where each class sits its papers.'" />
      <GradesSectionNav />

      <!-- Term, then the term's assessments: each has its own timetable. -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center">
        <USelectMenu v-model="termId" :items="termOptions" value-key="value" label-key="label"
          placeholder="Choose a term" class="w-full md:w-48" :loading="termStore.loading" />
        <div v-if="summaries.length" class="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <UButton v-for="s in summaries" :key="s.assessmentId" size="sm" class="shrink-0"
            :color="s.assessmentId === assessmentId ? 'primary' : 'neutral'"
            :variant="s.assessmentId === assessmentId ? 'solid' : 'soft'" @click="() => { assessmentId = s.assessmentId }">
            <span>{{ s.assessmentName }}</span>
            <span v-if="showTemplates" class="opacity-70">· {{ s.templateName }}</span>
            <UBadge v-if="canManage" size="sm" :variant="s.assessmentId === assessmentId ? 'solid' : 'subtle'"
              :color="statusColor(s.status)" :label="statusLabel(s.status)" />
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingList || loadingTimetable" class="space-y-3 print:hidden">
      <UCard>
        <div class="space-y-2">
          <USkeleton class="h-5 w-64 max-w-full" />
          <USkeleton class="h-4 w-48" />
        </div>
      </UCard>
      <UCard v-for="i in 2" :key="i" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header><USkeleton class="h-5 w-48" /></template>
        <div class="divide-y divide-default">
          <div v-for="j in 3" :key="j" class="flex items-start gap-3 px-4 py-3">
            <USkeleton class="h-4 w-24 shrink-0" />
            <div class="min-w-0 flex-1 space-y-1.5">
              <USkeleton class="h-4 w-44" />
              <USkeleton class="h-3 w-64 max-w-full" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <UCard v-else-if="error" class="print:hidden">
      <div class="flex flex-col items-center gap-3 py-12 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
          <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
        </div>
        <h3 class="font-semibold text-highlighted">Couldn't load the timetable</h3>
        <p class="max-w-sm text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="loadList" />
      </div>
    </UCard>

    <!-- No assessments (or nothing published yet, for teachers) -->
    <UCard v-else-if="!summaries.length" class="print:hidden">
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UIcon name="i-lucide-calendar-clock" class="size-7 text-primary" />
        </div>
        <h3 class="font-semibold text-highlighted">
          {{ !termId ? 'Choose a term' : canManage ? 'No assessments run in this term' : 'No exam timetable published yet' }}
        </h3>
        <p v-if="termId" class="max-w-sm text-sm text-muted">
          <template v-if="canManage">Timetables follow the assessments set up for your classes (Grades settings).</template>
          <template v-else>The exam office hasn't published a timetable for this term yet.</template>
        </p>
      </div>
    </UCard>

    <!-- The selected assessment has no timetable yet -->
    <UCard v-else-if="selected && !selected.timetableId" class="print:hidden">
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UIcon name="i-lucide-calendar-plus" class="size-7 text-primary" />
        </div>
        <h3 class="font-semibold text-highlighted">No timetable for {{ selected.assessmentName }} yet</h3>
        <p class="max-w-sm text-sm text-muted">
          Set the exam period and instructions, then add each paper. Teachers and parents only see it once you publish.
        </p>
        <UButton :icon="ADD_ICON" :label="`Set up ${selected.assessmentName} timetable`" @click="openDetails(true)" />
      </div>
    </UCard>

    <template v-else-if="timetable">
      <!-- Timetable header -->
      <UCard class="print:hidden">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold text-highlighted">{{ timetable.title }}</h2>
              <UBadge v-if="canManage" :color="statusColor(timetable.status)" variant="subtle"
                :icon="timetable.status === 'PUBLISHED' ? 'i-lucide-globe' : 'i-lucide-pencil-line'"
                :label="timetable.status === 'PUBLISHED' ? 'Published' : 'Draft'" />
            </div>
            <p class="text-sm text-muted">
              {{ timetable.assessmentName }} · {{ timetable.termName }}
              <template v-if="period"> · {{ period }}</template>
              · {{ timetable.papers.length }} {{ timetable.papers.length === 1 ? 'paper' : 'papers' }}
            </p>
            <p v-if="canManage" class="text-xs text-muted">
              <template v-if="timetable.status === 'PUBLISHED'">
                Teachers and parents can see it<template v-if="timetable.publishedByName">. Published by {{ timetable.publishedByName }}</template><template v-if="timetable.publishedAt"> on {{ formatDate(timetable.publishedAt) }}</template>.
              </template>
              <template v-else>Only the exam office can see this draft.</template>
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UDropdownMenu v-if="timetable.papers.length" :items="printItems">
              <UButton icon="i-lucide-printer" variant="soft" color="neutral" label="Print" trailing-icon="i-lucide-chevron-down" />
            </UDropdownMenu>
            <template v-if="canManage">
              <UButton :icon="SCHEME_EDIT_ICON" variant="soft" color="neutral" label="Details" @click="openDetails(false)" />
              <UButton v-if="timetable.status === 'DRAFT'" icon="i-lucide-send" label="Publish"
                :disabled="!timetable.papers.length" @click="() => { confirmPublish = true }" />
              <UButton v-else icon="i-lucide-undo-2" variant="soft" color="warning" label="Unpublish"
                :loading="publishing" @click="setPublished(false)" />
              <UButton v-if="timetable.status === 'DRAFT'" :icon="DELETE_ICON" variant="ghost" color="error"
                aria-label="Delete timetable" @click="() => { confirmDelete = true }" />
            </template>
          </div>
        </div>

        <div v-if="timetable.instructions" class="mt-4 rounded-lg bg-elevated/50 p-3">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Instructions to candidates</p>
          <ul class="ml-4 list-disc space-y-0.5 text-sm">
            <li v-for="(line, i) in instructionLines" :key="i">{{ line }}</li>
          </ul>
        </div>
      </UCard>

      <!-- Missing papers: each class's subjects with no paper yet -->
      <UCard v-if="canManage && missingCount" class="print:hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          :aria-expanded="missingOpen" @click="() => { missingOpen = !missingOpen }">
          <span class="flex items-center gap-2.5">
            <UIcon name="i-lucide-triangle-alert" class="size-5 shrink-0 text-warning" />
            <span>
              <span class="block text-sm font-medium text-highlighted">
                {{ missingCount }} {{ missingCount === 1 ? 'subject has' : 'subjects have' }} no paper yet
              </span>
              <span class="block text-xs text-muted">
                Across {{ timetable.missing!.length }} {{ timetable.missing!.length === 1 ? 'class' : 'classes' }}.
                Check before you publish.
              </span>
            </span>
          </span>
          <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
            :class="{ 'rotate-180': missingOpen }" />
        </button>
        <div v-if="missingOpen" class="divide-y divide-default border-t border-default">
          <div v-for="m in timetable.missing" :key="m.classId" class="px-4 py-3">
            <p class="mb-1.5 text-sm font-medium text-highlighted">{{ m.className }}</p>
            <div class="flex flex-wrap gap-1.5">
              <UButton v-for="s in m.subjects" :key="s.id" size="xs" variant="soft" color="warning" :icon="ADD_ICON"
                :label="s.name" @click="openPaper(null, { subjectId: s.id, classIds: classesMissing(s.id) })" />
            </div>
          </div>
        </div>
      </UCard>
      <UAlert v-else-if="canManage && timetable.missing && timetable.papers.length" class="print:hidden"
        color="success" variant="subtle" icon="i-lucide-circle-check" title="Every class has a paper for each of its subjects" />

      <!-- Filters and add -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <USelectMenu v-model="classId" :items="classFilterOptions" value-key="value" label-key="label"
            placeholder="All classes" class="w-full sm:w-48" />
          <USwitch v-if="isTeacher" v-model="mine" label="Only my invigilation" />
        </div>
        <UButton v-if="canManage" :icon="ADD_ICON" label="Add Paper" @click="openPaper(null)" />
      </div>

      <!-- Printed heading for the full timetable -->
      <div v-if="printMode === 'full'" class="hidden print:block">
        <h1 class="text-xl font-bold">{{ school?.name }}</h1>
        <p class="text-base font-semibold">{{ timetable.title }} · {{ timetable.termName }}</p>
        <p v-if="period" class="text-sm">{{ period }}</p>
      </div>

      <ExamOfficePapersByDay v-if="shownPapers.length" :class="printMode === 'classes' ? 'print:hidden' : ''"
        :papers="shownPapers" :can-manage="canManage" @edit="(p) => openPaper(p)" @remove="(p) => { deleting = p }" />

      <UCard v-else class="print:hidden">
        <div class="flex flex-col items-center gap-3 py-12 text-center">
          <UIcon name="i-lucide-calendar-x" class="size-8 text-muted" />
          <h3 class="font-semibold text-highlighted">
            {{ mine ? 'You have no papers to invigilate' : classId ? 'No papers for this class yet' : 'No papers yet' }}
          </h3>
          <p v-if="canManage && !mine" class="max-w-sm text-sm text-muted">
            Add each paper with its date, time, the classes sitting it, venue and invigilators.
          </p>
          <UButton v-if="canManage && !mine" :icon="ADD_ICON" label="Add Paper" @click="openPaper(null)" />
        </div>
      </UCard>

      <ExamOfficeClassSheets v-if="printMode === 'classes'" :timetable="timetable" :class-ids="classId ? [classId] : []" />
    </template>

    <ExamOfficeTimetableForm v-model:open="detailsOpen" :record="creating ? null : timetable" :term="currentTerm"
      :assessment-id="selected?.assessmentId ?? null" :assessment-name="selected?.assessmentName ?? ''"
      @saved="onTimetableSaved" />

    <ExamOfficePaperForm v-model:open="paperOpen" :record="editing" :timetable="timetable" :prefill="prefill"
      :class-options="classOptions" :subject-options="subjectOptions" :teacher-options="teacherOptions"
      @saved="onPaperSaved" />

    <UModal :open="!!deleting" title="Remove this paper?" @update:open="(v) => { if (!v) deleting = null }">
      <template #body>
        <p class="text-sm text-muted">
          {{ deleting?.subjectName }}<span v-if="deleting?.paper"> · {{ deleting?.paper }}</span> for
          {{ deleting?.classes.map(c => c.name).join(', ') }} on {{ deleting ? formatExamDay(deleting.examDate) : '' }}
          comes off the timetable.
        </p>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton color="error" :loading="removing" label="Remove" @click="removePaper" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="removing" @click="() => { deleting = null }" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="confirmPublish" :title="`Publish ${timetable?.title ?? 'timetable'}?`">
      <template #body>
        <div class="space-y-3 text-sm text-muted">
          <p>Teachers will see it, and parents of children in these classes get a notification and can see their child's papers.</p>
          <UAlert v-if="missingCount" color="warning" variant="subtle" icon="i-lucide-triangle-alert"
            :title="`${missingCount} ${missingCount === 1 ? 'subject still has' : 'subjects still have'} no paper`"
            description="You can publish anyway and add them later. Parents are told again when you republish." />
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton icon="i-lucide-send" :loading="publishing" label="Publish" @click="setPublished(true)" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="publishing" @click="() => { confirmPublish = false }" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="confirmDelete" title="Delete this timetable?">
      <template #body>
        <p class="text-sm text-muted">{{ timetable?.title }} and its {{ timetable?.papers.length ?? 0 }} papers are deleted. This can't be undone.</p>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton color="error" :loading="deletingTimetable" label="Delete" @click="removeTimetable" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="deletingTimetable" @click="() => { confirmDelete = false }" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
const api = ExamOfficeApi()
const termStore = useTermStore()
const subjectStore = useSubjectStore()
const teacherStore = useTeacherStore()
const { error: toastError, success: toastSuccess } = useNotify()
const { school, hydrateFromCache } = useSchoolInfo()
hydrateFromCache()

const isParent = computed(() => can(Role.PARENT))
const canManage = computed(() => can(EXAM_OFFICE_ROLES))
const isTeacher = computed(() => can(Role.TEACHER))

const termId = ref<string | undefined>()
const assessmentId = ref<string | undefined>()
const classId = ref<string | undefined>()
const mine = ref(false)

const summaries = ref<ExamTimetableSummary[]>([])
const timetable = ref<ExamTimetable | null>(null)
const loadingList = ref(true)
const loadingTimetable = ref(false)
const error = ref<string | null>(null)

const detailsOpen = ref(false)
const creating = ref(false)
const paperOpen = ref(false)
const editing = ref<ExamPaper | null>(null)
const prefill = ref<{ subjectId?: string, classIds?: string[] } | null>(null)
const deleting = ref<ExamPaper | null>(null)
const removing = ref(false)
const confirmPublish = ref(false)
const publishing = ref(false)
const confirmDelete = ref(false)
const deletingTimetable = ref(false)
const missingOpen = ref(false)
const printMode = ref<'full' | 'classes'>('full')

const currentTerm = computed(() => termStore.records.find(t => t.id === termId.value) ?? null)
const termOptions = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const selected = computed(() => summaries.value.find(s => s.assessmentId === assessmentId.value) ?? null)
// A school with more than one assessment setup (e.g. Primary and Secondary) gets the setup's name on each tab.
const showTemplates = computed(() => new Set(summaries.value.map(s => s.templateName)).size > 1)

const classOptions = computed(() => (timetable.value?.classes ?? []).map(c => ({ label: c.name, value: c.id })))
const classFilterOptions = computed(() => [{ label: 'All classes', value: undefined as string | undefined }, ...classOptions.value])
const subjectOptions = computed(() => subjectStore.records.map(s => ({ label: s.name, value: s.id })))
const teacherOptions = computed(() => teacherStore.records
  .filter(t => t.status === 'ACTIVE')
  .map(t => ({ label: `${t.user?.givenNames ?? ''} ${t.user?.familyName ?? ''}`.trim(), value: t.id })))

const shownPapers = computed(() => timetable.value?.papers ?? [])
const missingCount = computed(() => (timetable.value?.missing ?? []).reduce((n, m) => n + m.subjects.length, 0))
const instructionLines = computed(() => (timetable.value?.instructions ?? '').split('\n').map(l => l.trim()).filter(Boolean))
const period = computed(() => timetable.value?.startDate && timetable.value?.endDate
  ? `${formatDate(timetable.value.startDate)} – ${formatDate(timetable.value.endDate)}`
  : '')

const printItems = computed(() => [[
  { label: classId.value ? 'Class timetable (this class)' : 'Class timetables (a page per class)', icon: 'i-lucide-file-stack', onSelect: () => print('classes') },
  { label: 'Full timetable', icon: 'i-lucide-file-text', onSelect: () => print('full') },
]])

function statusLabel(status: ExamTimetableStatus | null) {
  return status === 'PUBLISHED' ? 'Published' : status === 'DRAFT' ? 'Draft' : 'Not set up'
}

function statusColor(status: ExamTimetableStatus | null) {
  return status === 'PUBLISHED' ? 'success' as const : status === 'DRAFT' ? 'warning' as const : 'neutral' as const
}

// Every class still missing this subject - one paper usually covers them all.
function classesMissing(subjectId: string) {
  return (timetable.value?.missing ?? []).filter(m => m.subjects.some(s => s.id === subjectId)).map(m => m.classId)
}

async function print(mode: 'full' | 'classes') {
  printMode.value = mode
  await nextTick()
  window.print()
}

function openDetails(isNew: boolean) {
  creating.value = isNew
  detailsOpen.value = true
}

function openPaper(paper: ExamPaper | null, fill: { subjectId?: string, classIds?: string[] } | null = null) {
  editing.value = paper
  prefill.value = fill
  paperOpen.value = true
}

async function loadList() {
  if (!termId.value) {
    loadingList.value = false
    summaries.value = []
    timetable.value = null
    return
  }
  loadingList.value = true
  error.value = null
  try {
    summaries.value = (await api.timetables(termId.value)) ?? []
    // Stay on the same assessment if it runs in this term too; otherwise the first one with a timetable.
    if (!summaries.value.some(s => s.assessmentId === assessmentId.value)) {
      assessmentId.value = (summaries.value.find(s => s.timetableId) ?? summaries.value[0])?.assessmentId
    }
    await loadTimetable()
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loadingList.value = false
  }
}

async function loadTimetable() {
  const id = selected.value?.timetableId
  if (!id) {
    timetable.value = null
    return
  }
  loadingTimetable.value = true
  try {
    timetable.value = (await api.timetable(id, { classId: classId.value, mine: mine.value })) ?? null
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loadingTimetable.value = false
  }
}

// Keeps the tab's status and paper count in step after a change.
function syncSummary(t: ExamTimetable) {
  const s = summaries.value.find(x => x.assessmentId === t.assessmentId)
  if (s) Object.assign(s, { timetableId: t.id, title: t.title, status: t.status, startDate: t.startDate, endDate: t.endDate })
}

async function onTimetableSaved(t: ExamTimetable) {
  syncSummary(t)
  if (classId.value || mine.value) await loadTimetable()
  else timetable.value = t
}

async function onPaperSaved(t: ExamTimetable) {
  syncSummary(t)
  // The save returns every paper; reload when a class / "mine" filter is on.
  if (classId.value || mine.value) await loadTimetable()
  else timetable.value = t
}

async function setPublished(publish: boolean) {
  if (!timetable.value) return
  publishing.value = true
  try {
    const t = await api.publishTimetable(timetable.value.id, publish)
    if (!t) return
    timetable.value = t
    syncSummary(t)
    confirmPublish.value = false
    toastSuccess(publish ? 'Published. Teachers and parents can now see it.' : 'Moved back to draft')
  } catch (err: any) {
    toastError(err?.message || 'Could not change the timetable')
  } finally {
    publishing.value = false
  }
}

async function removePaper() {
  if (!deleting.value) return
  removing.value = true
  try {
    const t = await api.deletePaper(deleting.value.id)
    toastSuccess('Paper removed')
    deleting.value = null
    if (t && !classId.value && !mine.value) timetable.value = t
    else await loadTimetable()
  } catch (err: any) {
    toastError(err?.message || 'Could not remove the paper')
  } finally {
    removing.value = false
  }
}

async function removeTimetable() {
  if (!timetable.value) return
  deletingTimetable.value = true
  try {
    await api.deleteTimetable(timetable.value.id)
    toastSuccess('Timetable deleted')
    confirmDelete.value = false
    const s = summaries.value.find(x => x.assessmentId === timetable.value?.assessmentId)
    if (s) Object.assign(s, { timetableId: null, title: null, status: null, startDate: null, endDate: null, paperCount: 0 })
    timetable.value = null
  } catch (err: any) {
    toastError(err?.message || 'Could not delete the timetable')
  } finally {
    deletingTimetable.value = false
  }
}

watch(termId, () => {
  classId.value = undefined
  loadList()
})
watch(assessmentId, (next, prev) => {
  if (prev === undefined || loadingList.value) return
  classId.value = undefined
  loadTimetable()
})
watch([classId, mine], loadTimetable)

onMounted(async () => {
  if (isParent.value) return
  useAppStore().setTitle('Exam Timetables')
  document.title = 'Exam Timetables | Skultem'
  if (canManage.value) {
    subjectStore.fetchAll(1, 500)
    teacherStore.fetchAll(1, 500)
  }
  await termStore.fetchAll(1, 100)
  // Start on the term that's running now.
  termId.value = termStore.records.find(t => t.status === 'ACTIVE')?.id ?? termStore.records[0]?.id
  if (!termId.value) loadingList.value = false
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT]
})
</script>
