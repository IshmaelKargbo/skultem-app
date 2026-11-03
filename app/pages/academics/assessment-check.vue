<template>
  <div class="space-y-3 px-4 md:px-6">
    <AcademicsSectionNav />

    <Heading title="Assessment Check"
      :subtitle="`Every student should have the assessments their class's template gives them${data ? ` - ${data.academicYearName}` : ''}. Fix any class that's missing some.`">
      <UButton v-if="fixable.length" :icon="REFRESH_ICON" :loading="fixingAll" :disabled="!!fixing"
        :label="`Fix ${fixable.length} ${fixable.length === 1 ? 'class' : 'classes'}`" @click="fixAll" />
    </Heading>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Metric v-for="m in metrics" :key="m.label" :record="m" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div class="flex gap-1">
            <UButton v-for="tab in tabs" :key="tab.value" size="sm" :label="`${tab.label} (${tab.count})`"
              :variant="view === tab.value ? 'soft' : 'ghost'" :color="view === tab.value ? 'primary' : 'neutral'"
              @click="() => { view = tab.value }" />
          </div>
          <UButton :icon="REFRESH_ICON" size="sm" variant="ghost" color="neutral" label="Check again"
            :loading="loading" @click="load" />
        </div>
      </template>

      <div v-if="loading && !data" class="divide-y divide-default">
        <div v-for="i in 5" :key="i" class="flex items-center justify-between gap-3 px-4 py-4">
          <div class="space-y-2">
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-3 w-64" />
          </div>
          <USkeleton class="h-8 w-28" />
        </div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center gap-3 px-4 py-14 text-center">
        <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
        <p class="text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" variant="soft" @click="load" />
      </div>

      <div v-else-if="shown.length" class="divide-y divide-default">
        <div v-for="row in shown" :key="row.classId"
          class="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink :to="`/classes/${row.classId}`" class="font-semibold text-highlighted hover:underline">
                {{ row.className }}
              </NuxtLink>
              <UBadge :color="COVERAGE_STATUS[row.status].color" variant="subtle" size="sm"
                :label="COVERAGE_STATUS[row.status].label" />
            </div>
            <p class="text-xs text-muted">
              {{ row.templateName ? `Template: ${row.templateName}` : 'No assessment template' }}
              · {{ row.students }} {{ row.students === 1 ? 'student' : 'students' }}
            </p>
            <ul class="space-y-0.5 text-sm">
              <li v-for="line in explain(row)" :key="line" class="text-muted">• {{ line }}</li>
            </ul>
            <p v-if="results[row.classId]" class="text-sm text-success">{{ results[row.classId] }}</p>
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <UButton v-if="row.status === 'MISSING' || row.status === 'INCOMPLETE'" :icon="REFRESH_ICON" size="sm"
              label="Create missing" :loading="fixing === row.classId" :disabled="fixingAll || (!!fixing && fixing !== row.classId)"
              @click="fix(row)" />
            <UButton v-if="row.status === 'NO_TEMPLATE'" icon="i-lucide-clipboard-list" size="sm" variant="soft"
              label="Set template" @click="setTemplate(row)" />
            <UButton v-if="row.status === 'EMPTY_TEMPLATE'" to="/academics/assessment-templates" size="sm"
              variant="soft" label="Add tests to template" trailing-icon="i-lucide-arrow-right" />
            <UButton v-if="row.status === 'NO_SUBJECTS'" to="/subjects/class-subjects" size="sm" variant="soft"
              label="Add class subjects" trailing-icon="i-lucide-arrow-right" />
            <UButton v-if="row.status === 'LATER_START' || (row.startsInTerm > 1 && data?.activeTermNumber && row.startsInTerm > data.activeTermNumber)"
              to="/academics/assessment-templates" size="sm" variant="soft" color="neutral"
              label="Change start term" trailing-icon="i-lucide-arrow-right" />
            <UButton v-if="row.subjectsWithoutTeacher.length" to="/subjects/teacher-assignment" size="sm"
              variant="ghost" color="neutral" label="Assign teachers" trailing-icon="i-lucide-arrow-right" />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-2 px-4 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-success/10">
          <UIcon name="i-lucide-check-check" class="size-7 text-success" />
        </div>
        <p class="font-semibold text-highlighted">
          {{ view === 'attention' ? 'Every class is set up' : 'No classes yet' }}
        </p>
        <p class="max-w-sm text-sm text-muted">
          {{ view === 'attention' ? 'Every enrolled student has the assessments their class\'s template gives them.' : '' }}
        </p>
      </div>
    </UCard>

    <!-- The class edit panel, opened from "Set template" - saving a template creates the students' assessments. -->
    <ClassEdit v-if="editingClassId" :key="editingClassId" ref="classEditRef" :class-id="editingClassId" hide-trigger
      @updated="load" />
  </div>
</template>

<script setup lang="ts">
const { success: toastSuccess, error: toastError } = useNotify()
const classStore = useClassStore()

const data = ref<AssessmentCoverage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const view = ref<'attention' | 'all'>('attention')
const fixing = ref<string | null>(null)
const fixingAll = ref(false)
// What the last fix did, per class - shown under the class until the next check.
const results = reactive<Record<string, string>>({})

const editingClassId = ref<string | null>(null)
const classEditRef = ref<{ openEdit: () => void } | null>(null)

const rows = computed(() => data.value?.rows ?? [])
const needsAttention = (r: AssessmentCoverageRow) => r.status !== 'OK' && r.status !== 'NO_STUDENTS'
const attention = computed(() => rows.value.filter(needsAttention))
const shown = computed(() => view.value === 'attention' ? attention.value : rows.value)
// The classes "Fix" can do something about right now (the others need a template or teachers first).
const fixable = computed(() => rows.value.filter(r => r.status === 'MISSING' || r.status === 'INCOMPLETE'))

const tabs = computed(() => [
  { label: 'Needs attention', value: 'attention' as const, count: attention.value.length },
  { label: 'All classes', value: 'all' as const, count: rows.value.length },
])

const metrics = computed(() => {
  const ready = !loading.value || !!data.value
  const without = rows.value.reduce((n, r) => n + (r.templateId ? r.withoutAssessments : 0), 0)
  const noTeacher = new Set(rows.value.flatMap(r => r.subjectsWithoutTeacher.map(s => `${r.classId}|${s}`))).size
  return [
    { label: 'Classes needing attention', value: attention.value.length, icon: 'i-lucide-school', color: attention.value.length ? 'warning' as const : 'success' as const, isReady: ready },
    { label: 'Students without assessments', value: without, icon: 'i-lucide-user-x', color: without ? 'error' as const : 'success' as const, isReady: ready },
    { label: 'Classes without a template', value: rows.value.filter(r => r.status === 'NO_TEMPLATE').length, icon: 'i-lucide-clipboard-list', color: 'warning' as const, isReady: ready },
    { label: 'Subjects without a teacher', value: noTeacher, subtle: 'their assessments wait for a teacher', icon: 'i-lucide-user-round-x', color: noTeacher ? 'warning' as const : 'success' as const, isReady: ready },
  ]
})

function explain(row: AssessmentCoverageRow): string[] {
  const lines: string[] = []
  switch (row.status) {
    case 'NO_TEMPLATE':
      lines.push('No template is set, so its students have no assessments. Set one and they are created straight away.')
      break
    case 'EMPTY_TEMPLATE':
      lines.push(`"${row.templateName}" has no tests yet. Add its tests and the class's assessments are created.`)
      break
    case 'NO_SUBJECTS':
      lines.push('No subjects are assigned to this class, so there is nothing to create assessments for. Add its subjects, then use "Create missing".')
      break
    case 'LATER_START':
      lines.push(`"${row.templateName}" starts grading in term ${row.startsInTerm}, and it's term ${data.value?.activeTermNumber} now - so there is nothing to enter this term. If this class should be graded now, change the template's start term to ${data.value?.activeTermNumber}; its assessments are created straight away.`)
      break
    case 'NO_STUDENTS':
      lines.push('No students enrolled this year - their assessments are created when they join.')
      break
  }
  if (row.templateId && row.templateTests && row.withoutAssessments) {
    lines.push(`${row.withoutAssessments} of ${row.students} ${row.students === 1 ? 'student has' : 'students have'} no assessments at all.`)
  }
  if (row.incomplete) {
    lines.push(`${row.incomplete} ${row.incomplete === 1 ? 'student is' : 'students are'} missing some subjects their classmates have.`)
  }
  if (row.subjectsWithoutTeacher.length) {
    lines.push(`No teacher yet for ${row.subjectsWithoutTeacher.join(', ')} - assessments for ${row.subjectsWithoutTeacher.length === 1 ? 'it' : 'them'} are created when a teacher is assigned.`)
  }
  if (row.status === 'OK') lines.push('Every student has their assessments.')
  return lines
}

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = (await ClassApi().assessmentCoverage()) ?? null
  } catch (err: any) {
    error.value = err?.message || 'Could not check the classes. Please try again.'
  } finally {
    loading.value = false
  }
}

async function syncOne(row: AssessmentCoverageRow) {
  const res = await classStore.syncAssessments(row.classId)
  if (res) results[row.classId] = assessmentSyncMessage(res)
  return res
}

async function fix(row: AssessmentCoverageRow) {
  fixing.value = row.classId
  try {
    const res = await syncOne(row)
    if (res) toastSuccess(`${row.className}: ${assessmentSyncMessage(res)}`)
    await load()
  } catch (err: any) {
    toastError(err?.message || `Could not fix ${row.className}`)
  } finally {
    fixing.value = null
  }
}

// One class at a time, so a problem in one is reported against it and the rest still go through.
async function fixAll() {
  fixingAll.value = true
  let fixed = 0, failed = 0
  for (const row of fixable.value) {
    fixing.value = row.classId
    try {
      const res = await syncOne(row)
      if (res?.assessmentsCreated) fixed++
    } catch (err: any) {
      failed++
      results[row.classId] = err?.message || 'Could not create its assessments'
    }
  }
  fixing.value = null
  fixingAll.value = false
  await load()
  if (failed) toastError(`${failed} ${failed === 1 ? 'class' : 'classes'} could not be fixed - see the notes under each.`)
  else toastSuccess(fixed ? `Created missing assessments in ${fixed} ${fixed === 1 ? 'class' : 'classes'}.` : 'Nothing new to create.')
}

async function setTemplate(row: AssessmentCoverageRow) {
  editingClassId.value = row.classId
  await nextTick()
  classEditRef.value?.openEdit()
}

onMounted(() => {
  useAppStore().setTitle('Assessment Check')
  document.title = 'Assessment Check | Academics | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
