<template>
  <div class="md:p-7 overflow-y-auto h-full md:space-y-5 space-y-3 p-3">
    <Heading class="hidden md:flex" title="Grade Entry"
      subtitle="Enter scores for the active test. Locked assessments are read-only">
      <div v-if="hasDraftAssessments" class="flex flex-wrap gap-2 md:justify-end">
        <UButton icon="lucide:save" label="Save Grades" :loading="saving" :disabled="disableActions"
          @click="saveGrades" />
        <UButton icon="lucide:check-circle" label="Complete Assessment" color="success" :loading="completing"
          variant="subtle" :disabled="disableActions || !hasDraftAssessments" @click="completeAssessment" />
      </div>
    </Heading>
    <UCard class="hidden md:block">
      <div class="flex space-x-3">
        <USelectMenu value-key="value" :loading="loadingTerm" :items="terms" placeholder="Select Term"
          v-model="state.termId" @change="fetchStudents" />
        <USelectMenu value-key="value" :items="classes" :loading="loadingClass" placeholder="Select Class"
          v-model="state.classId" @change="fetchRecord" />
        <USelectMenu value-key="value" :items="teachers" :loading="loadingSubject" placeholder="Select Subject"
          v-model="state.teacherSubjectId" @change="fetchStudents" />
      </div>
    </UCard>
    <div class="grid gap-3 grid-cols-2 md:hidden">
      <USelectMenu value-key="value" :items="terms" placeholder="Select Term" v-model="state.termId"
        @change="fetchStudents" />
      <USelectMenu value-key="value" :items="classes" placeholder="Select Class" v-model="state.classId"
        @change="fetchRecord" />
      <USelectMenu class="col-span-2" value-key="value" :items="teachers" placeholder="Select Subject"
        v-model="state.teacherSubjectId" @change="fetchStudents" />
    </div>
    <UCard v-if="assessments.length && state.teacherSubjectId">
      <div class="space-y-3">
        <div class="flex gap-3 md:flex-row items-center justify-between mb-3">
          <div class="flex space-x-2">
            <p class="text-sm text-gray-500">State:</p>
            <p class="text-sm font-semibold text-gray-800">
              {{ workflowLabel }}
            </p>
          </div>
          <UBadge :label="`Progress ${workflowProgress}%`" :color="workflowProgress === 100 ? 'success' : 'warning'"
            variant="outline" icon="mdi:chart-timeline-variant" />
        </div>
        <UProgress :color="workflowProgress === 100 ? 'success' : 'warning'" v-model="workflowProgress" />
      </div>
    </UCard>
    <UCard class="hidden md:block" :ui="{
      body: 'sm:p-0'
    }">
      <UTable :columns="columns" :data="rows" :loading="loading" scrollable class="w-full">
        <template #loading>
          <TableLoading :size="7" />
        </template>
      </UTable>
    </UCard>
    <div v-if="state.teacherSubjectId && rows.length > 0" class="grid gap-3 md:hidden">
      <UCard :ui="{
        body: 'p-0 sm:p-0'
      }" v-for="student in rows" :key="student.id">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ student.name }}</p>
              <p class="text-xs text-gray-500">
                Position: {{ hasSubmittedAssessments ? (rankingMap[student.id] || '-') : 'N/A' }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs text-gray-500">Total</p>
              <p class="text-sm font-semibold">{{ calculateTotal(student) }}</p>
            </div>
          </div>
        </template>
        <div class="">
          <div class="grid">
            <div v-for="assessment in assessments" :key="assessment.id" class="border-b border-gray-200 p-3 py-2">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 space-y-1">
                  <p class="text-xs font-medium text-gray-900 truncate">{{ assessment.name }}</p>
                  <p class="text-xs text-gray-500">Weight {{ assessment.weight }}</p>
                </div>
                <div v-if="isEditableStatus(getStudentScore(student, assessment.id)?.status as ScoreStatus)">
                  <UInput :model-value="getStudentScore(student, assessment.id)?.score" type="number" min="0" max="100"
                    size="sm" @update:model-value="updateStudentScore(student, assessment.id, $event)" />
                </div>
                <div v-else class="space-y-1">
                  <UBadge size="xs" variant="outline" :color="statusBadgeColor(assessment.status)">
                    {{ clean(assessment.status) }}
                  </UBadge>
                  <p class="font-medium">{{ getStudentScore(student, assessment.id)?.score ?? '-' }} ({{
                    getStudentScore(student, assessment.id)?.weightScore ?? '-' }})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <div class="grid gap-3 grid-cols-2 lg:grid-cols-5">
      <Metric :class="{
        'col-span-2 md:col-span-1': (i + 1 == statusSummary.length)
      }" v-for="(summary, i) in statusSummary" :key="summary.status" :record="{
        color: summary.color,
        icon: summary.icon,
        label: summary.label,
        value: summary.count,
        isReady: !loading
      }" />
    </div>
    <UCard v-if="hasDraftAssessments">
      <div class="grid w-full gap-2 grid-cols-2 md:w-auto md:flex-wrap md:justify-end">
        <UButton class="flex justify-center" icon="lucide:save" label="Save Grades" :loading="saving"
          :disabled="disableActions" @click="saveGrades" />
        <UButton class="flex justify-center" icon="lucide:check-circle" label="Complete Assessment" color="success"
          :loading="completing" variant="subtle" :disabled="disableActions || !hasDraftAssessments"
          @click="completeAssessment" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type GradeAssessmentForm = {
  classId: string
  teacherSubjectId: string
  termId: string
}

type AssessmentStatus = "DRAFT" | "SUBMITTED" | "RETURNED" | "APPROVED" | "COMPLETED" | "LOCKED"
type ScoreStatus = AssessmentStatus
type StatusCard = {
  status: AssessmentStatus
  label: string
  count: number
  icon: string
  color: "warning" | "info" | "error" | "success" | "neutral"
  textClass: string
}

const state = reactive<GradeAssessmentForm>({
  classId: '',
  teacherSubjectId: '',
  termId: ''
})

const loadingTerm = ref(false)
const loadingClass = ref(false)
const loadingSubject = ref(false)

const loading = ref(false)
const saving = ref(false)
const completing = ref(false)
const columns = ref<any[]>([])
const rows = ref<StudentAssessment[]>([])
const assessments = ref<Assessment[]>([])

const teacherStore = useTeacherSubjectStore()
const classSessionStore = useClassSessionStore()
const termStore = useTermStore()
const store = useAssessmentStore()

const UInput = resolveComponent('UInput')
const UBadge = resolveComponent('UBadge')
const { error: toastError, success: toastSuccess, info } = useNotify()

const teachers = ref<{ label: string, value: string }[]>([])
const terms = computed(() => termStore.records.map(e => ({ label: e.name, value: e.id })))
const classes = computed(() => classSessionStore.records.map(e => ({ label: parseClassSession(e), value: e.id })))
const editableAssessments = computed(() => assessments.value.filter(a => isEditableStatus(a.status as ScoreStatus)))

const disableActions = computed(() => !state.teacherSubjectId || !state.termId || !state.classId || !rows.value.length || loading.value)
const hasDraftAssessments = computed(() => editableAssessments.value.length > 0)
const gradingBands = computed(() => store.gradingScale?.bands || [])

function getStudentScore(student: StudentAssessment, assessmentId: string) {
  return student.scores.find(score => score.assessment === assessmentId)
}

function updateStudentScore(student: StudentAssessment, assessmentId: string, value: unknown) {
  const score = getStudentScore(student, assessmentId)
  if (!score) return
  score.score = toNumberInRange(value, 0, 100)
}

function statusBadgeColor(status: any) {
  switch (status) {
    case "DRAFT":
      return "warning"
    case "SUBMITTED":
      return "info"
    case "RETURNED":
      return "error"
    case "APPROVED":
    case "COMPLETED":
      return "success"
    case "LOCKED":
    default:
      return "neutral"
  }
}

const completedAssessmentIds = computed(() => {
  return assessments.value
    .filter(assessment => {
      const state = assessment.status
      return state === "SUBMITTED" || state === "APPROVED" || state === "COMPLETED"
    })
    .map(assessment => assessment.id)
})

const hasSubmittedAssessments = computed(() => completedAssessmentIds.value.length > 0)
const completedWeight = computed(() => {
  return assessments.value
    .filter(assessment => completedAssessmentIds.value.includes(assessment.id))
    .reduce((sum, assessment) => sum + Number(assessment.weight || 0), 0)
})


const workflowMetrics = computed(() => {
  let total = 0, draft = 0, submitted = 0, returned = 0, approved = 0, approvedLocked = 0, locked = 0

  assessments.value.forEach(a => {
    total++
    switch (a.status) {
      case "DRAFT": draft++; break
      case "SUBMITTED": submitted++; break
      case "RETURNED": returned++; break
      case "APPROVED": approved++; break
      case "COMPLETED": approvedLocked++; break
      case "LOCKED": locked++; break
    }
  })

  return { total, draft, submitted, returned, approved, approvedLocked, locked }
})

const workflowProgress = computed(() => {
  const total = assessments.value.length
  if (!total) return 0

  const score = assessments.value.reduce((sum, a) => {
    switch (a.status) {
      case "APPROVED": return sum + 1
      case "COMPLETED": return sum + 1
      case "SUBMITTED": return sum + 0.5
      default: return sum
    }
  }, 0)

  return Math.round((score / total) * 100)
})

const workflowLabel = computed(() => {
  const { total, draft, submitted, approved, approvedLocked, returned, locked } = workflowMetrics.value
  const completed = approved + approvedLocked

  if (!total) return "No assessments"
  if (completed === total) return "Fully approved"
  if (submitted > 0 && draft === 0) return "Awaiting approval"
  if (submitted > 0 && draft > 0) return "Partially submitted"
  if (returned > 0) return "Returned for correction"
  if (draft === total) return "Draft in progress"
  if (locked === total) return "All assessments locked"

  return "In progress"
})

const statusSummary = computed<StatusCard[]>(() => {
  const counts = assessments.value.reduce((acc, assessment) => {
    const status = assessment.status as AssessmentStatus
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<AssessmentStatus, number>)

  return [
    {
      status: "DRAFT",
      label: "Draft",
      count: counts.DRAFT || 0,
      icon: "lucide:clock",
      color: "warning",
      textClass: "text-amber-600"
    },
    {
      status: "SUBMITTED",
      label: "Submitted",
      count: counts.SUBMITTED || 0,
      icon: "iconoir:submit-document",
      color: "info",
      textClass: "text-blue-600"
    },
    {
      status: "RETURNED",
      label: "Returned",
      count: counts.RETURNED || 0,
      icon: "hugeicons:delivery-return-01",
      color: "error",
      textClass: "text-red-600"
    },
    {
      status: "APPROVED",
      label: "Approved",
      count: (counts.APPROVED || 0) + (counts.COMPLETED || 0),
      icon: "lucide:badge-check",
      color: "success",
      textClass: "text-emerald-600"
    },
    {
      status: "LOCKED",
      label: "Locked",
      count: counts.LOCKED || 0,
      icon: LOCK_ICON,
      color: "neutral",
      textClass: "text-gray-600"
    }
  ]
})

function calculateWeightedTotal(row: any) {
  return completedAssessmentIds.value.reduce((sum, assessmentId) => {
    const score = row.scores.find((s: any) => s.assessment === assessmentId)
    return sum + score.weightScore
  }, 0)
}

function calculateTotal(row: any) {
  return calculateWeightedTotal(row)
}

function calculateGrade(total: number, row: any) {
  const termAssessmentIds = assessments.value.map(a => a.id)

  const allCompleted = termAssessmentIds.every(id =>
    (row.original.scores as any[]).every((s: any) => s.status == "COMPLETED")
  )

  if (!allCompleted) return '-'

  const band = gradingBands.value.find(item => total >= item.minScore && total <= item.maxScore)
  return band?.grade || '-'
}

const rankingMap = computed(() => {
  if (!hasSubmittedAssessments.value) return {} as Record<string, number>

  const ranked = rows.value
    .map(student => ({ id: student.id, total: calculateTotal(student) }))
    .sort((a, b) => b.total - a.total)

  const ranks: Record<string, number> = {}
  let currentRank = 0
  let previousTotal: number | null = null

  ranked.forEach((item, index) => {
    if (previousTotal === null || item.total !== previousTotal) {
      currentRank = index + 1
      previousTotal = item.total
    }
    ranks[item.id] = currentRank
  })

  return ranks
})

function isEditableStatus(status: ScoreStatus) {
  return status === "DRAFT" || status === "RETURNED"
}

function toNumberInRange(value: unknown, min: number, max: number) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return min
  return Math.min(max, Math.max(min, parsed))
}

async function fetchRecord() {
  if (!state.classId) return
  state.teacherSubjectId = ""
  rows.value = []
  assessments.value = []
  columns.value = []
  try {
    const res = await teacherStore.fetchAllByClass(state.classId, 0, 0)
    teachers.value = (res || []).map((e: TeacherSubject) => ({ label: `${e.subjectName} (${e.teacherName})`, value: e.id }))
    if (teachers.value.length > 0)
      state.teacherSubjectId = teachers.value[0]?.value || ""
    await fetchStudents()
  } catch (error: any) {
    teachers.value = []
    toastError(error?.data?.message || error?.message || 'Failed to load class subjects')
  }
}

async function fetchStudents() {
  if (!state.termId || !state.teacherSubjectId || !state.classId) return
  loading.value = true
  rows.value = []
  try {
    const [students, cycles] = await Promise.all([
      store.fetchAllStudentAssessments(state.teacherSubjectId, state.termId),
      store.fetchAllAssessments(state.teacherSubjectId, state.termId)
    ])
    rows.value = students || []
    assessments.value = (cycles || []).map((assessment: Assessment) => ({
      ...assessment,
      status: assessment.status as ScoreStatus
    }))

    rows.value.forEach(student => {
      student.scores.sort((a, b) => {
        const assessmentA = getAssessment(a.assessment)
        const assessmentB = getAssessment(b.assessment)
        return (assessmentA?.position || 0) - (assessmentB?.position || 0)
      })
    })

    if (hasSubmittedAssessments.value) {
      rows.value.sort((a, b) => {
        const rankA = rankingMap.value[a.id] || 9999
        const rankB = rankingMap.value[b.id] || 9999
        return rankA - rankB
      })
    }

    buildColumns()
  } catch (error: any) {
    rows.value = []
    assessments.value = []
    columns.value = []
    toastError(error?.data?.message || error?.message || 'Failed to load grading data')
  } finally {
    loading.value = false
  }
}

function getAssessment(id: string) {
  return assessments.value.find(e => e.id === id)
}

function buildColumns() {

  const baseColumn = [
    {
      id: "student",
      accessorKey: "name",
      header: "Student",
      footer: () => "Test Status",
      pin: "left"
    }
  ]

  const assessmentColumns = assessments.value.map(a => ({
    id: a.id,
    header: `${a.name} (${a.weight})`,
    accessorKey: a.id,

    cell: ({ row }: any) => {

      const idx = row.original.scores.findIndex(
        (s: any) => s.assessment === a.id
      )

      if (idx < 0)
        return h("div", { class: "text-gray-400" }, "-")

      const score = row.original.scores[idx]
      const assessmentState = a.status

      if (assessmentState === "LOCKED")
        return h("div", { class: "text-gray-400 font-medium" }, "-")

      const status = score.status as ScoreStatus

      if (!isEditableStatus(status))
        return h("div", { class: "text-gray-500 font-medium" }, score.weightScore)

      return h(UInput, {
        modelValue: score.score,
        type: "number",
        min: 0,
        max: 100,
        size: "sm",
        class: "w-20",

        "onUpdate:modelValue": (val: number) => {
          row.original.scores[idx].score = toNumberInRange(val, 0, 100)
        }
      })
    },

    footer: (res: any) => {
      const ass = getAssessment(res.header.id)

      let color = "info"
      let icon = ""
      let name = ""

      switch (ass?.status) {

        case "DRAFT":
          color = "warning"
          icon = "lucide:clock"
          name = "Draft"
          break

        case "SUBMITTED":
          color = "info"
          icon = "mdi:progress-pencil"
          name = "Awaiting approval"
          break

        case "RETURNED":
          color = "error"
          icon = "mdi:arrow-u-left-top"
          name = "Returned for correction"
          break

        case "APPROVED":
          color = "success"
          icon = "lucide:check-circle"
          name = "Approved"
          break

        case "COMPLETED":
          color = "success"
          icon = "lucide:lock"
          name = "Completed"
          break

        case "LOCKED":
          color = "neutral"
          icon = LOCK_ICON
          name = "Locked"
          break
      }

      return h(UBadge, {
        label: name,
        variant: "outline",
        color,
        icon
      })
    }
  }))

  const summaryColumns = [
    {
      id: "total",
      header: "Total",
      pin: "right",

      cell: ({ row }: any) => `${calculateTotal(row.original)}`,

      footer: () =>
        hasSubmittedAssessments.value
          ? `Over ${completedWeight.value}%`
          : "No submitted assessments"
    },
    {
      id: "position",
      header: "Position",
      pin: "right",

      cell: ({ row }: any) =>
        hasSubmittedAssessments.value
          ? `${rankingMap.value[row.original.id] || "-"}`
          : "-",

      footer: () =>
        hasSubmittedAssessments.value
          ? "Ranked"
          : "Ranking pending submission"
    },
    {
      id: "grade",
      header: "Grade",
      pin: "right",

      cell: ({ row }: any) => {
        const total = calculateTotal(row.original)
        const grade = calculateGrade(total, row)

        return h(UBadge, { variant: 'outline', color: 'neutral' }, grade)
      },

      footer: () =>
        "Term Grade"
    },
  ]

  columns.value = [
    ...baseColumn,
    ...assessmentColumns,
    ...summaryColumns
  ]
}

function buildAssessmentGrades(assessmentId: string) {
  return rows.value.map(student => student.scores.find(s => s.assessment === assessmentId))
    .filter((s): s is AssessmentScore => Boolean(s))
    .map(s => ({ id: s.id, score: Number(s.score || 0) }))
}

async function persistDraftGrades(showToast: boolean) {
  if (disableActions.value) return
  const editable = editableAssessments.value
  if (!editable.length) { info('No editable assessments available'); return }
  saving.value = true
  try {
    await Promise.all(editable.map(a => store.grade(state.teacherSubjectId, { assessmentId: a.id, termId: state.termId, grades: buildAssessmentGrades(a.id) })))
    await fetchStudents()
    if (showToast) toastSuccess('Grades saved successfully')
    return true
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to save grades')
    return false
  } finally { saving.value = false }
}

async function saveGrades() { await persistDraftGrades(true) }

async function completeAssessment() {
  if (disableActions.value || !hasDraftAssessments.value) return
  completing.value = true
  try {
    const success = await persistDraftGrades(false)
    if (!success) return
    const editable = editableAssessments.value
    await Promise.all(editable.map(a => store.submit(state.teacherSubjectId, { assessmentId: a.id, termId: state.termId, note: 'Submitted from grade entry' })))
    await fetchStudents()
    toastSuccess('Assessment submitted for approval')
  } catch (error: any) {
    toastError(error?.data?.message || error?.message || 'Failed to submit assessments')
  } finally { completing.value = false }
}


onMounted(async () => {
  useAppStore().setTitle('Grade Assignment')
  document.title = 'Grade Assignment | Grades | Skultem'

  loadingTerm.value = true
  loadingClass.value = true
  loadingSubject.value = true

  await teacherStore.fetchAll(0, 0)
  await classSessionStore.fetchAll(0, 0)
  await termStore.fetchAll(0, 0)
  await store.fetchGradingScale().catch(() => null)

  loadingTerm.value = false
  loadingSubject.value = false
  loadingClass.value = false

  if (terms.value.length > 0) {
    state.termId = terms.value[0]?.value || ''
  }

  // default select first class and trigger teacher fetch
  if (classSessionStore.records.length) {
    state.classId = classSessionStore.records[0]?.id || ''
    await fetchRecord()
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
