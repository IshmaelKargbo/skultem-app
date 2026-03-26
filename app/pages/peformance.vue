<template>
  <div class="p-7 overflow-y-auto h-full space-y-5">
    <Heading title="Performance Breakdown" subtitle="Create custom reports and explore your school data">
      <div class="flex space-x-3 w-1/3">
        <USelectMenu @change="change" :loading="loading" :items="children" value-key="value" v-model="state.student"
          placeholder="Select Student" />
        <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
          placeholder="Select Term" />
      </div>
    </Heading>
    <DashboardParentSubjectPerformance :term="term?.id || ''" :id="selected?.id || ''" />
    <UCard v-for="value in data">
      <div>
        <div class="flex justify-between items-center cursor-pointer" @click="toggleSubject(value.id)">
          <div class="flex space-x-2.5 items-center">
            <UAvatar :alt="value.subject" />
            <p class="text-base">{{ value.subject }}</p>
          </div>
          <div class="w-1/3 flex space-x-5 items-center">
            <div class="flex space-x-3 flex-1 items-center">
              <UProgress color="neutral" size="md" :max="100" v-model="value.weight" />
              <p>{{ value.weight }}%</p>
            </div>
            <div class="flex space-x-5 items-center">
              <UBadge :label="value.grade" variant="outline" />
              <UBadge :label="value.trend" :color="parseTrend[value.trend].color"
                :trailing-icon="parseTrend[value.trend].icon" variant="outline" />
              <UButton variant="link" :icon="value.show ? 'iconoir:nav-arrow-down' : 'weui:arrow-outlined'" />
            </div>
          </div>
        </div>
        <div v-if="expanded.has(value.id)" class="mt-3 border-gray-200 border-t">
          <UTable :columns="columns" :data="value.assessments">
            <template #trend-cell="{ row }">
              <div class="flex justify-end">
                <UBadge variant="outline" :label="row.original.trend" :color="parseTrend[row.original.trend].color"
                  :trailing-icon="parseTrend[row.original.trend].icon" />
              </div>
            </template>
          </UTable>
        </div>
      </div>
    </UCard>
    <UCard v-if="!assessmentLoading && data.length === 0" class="py-14">
      <div class="flex flex-col items-center justify-center text-center space-y-4">

        <UIcon name="i-heroicons-document-text" class="text-4xl text-muted" />

        <div class="space-y-1">
          <p class="text-lg font-semibold">
            No Assessments Yet
          </p>
          <p class="text-sm text-muted">
            No assessments have been submitted for this student in the selected term.
          </p>
        </div>

      </div>
    </UCard>
  </div>
</template>
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const store = useReportStore()
const parentStore = useParentStore()
const studentStore = useStudentStore()

const { students, loading } = storeToRefs(parentStore)
const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)
const { breakdown } = storeToRefs(store)

const assessmentLoading = ref(false)

const selected = ref<Student | undefined>()

const state = reactive({
  student: '',
  term: ''
})

const expanded = ref<Set<string>>(new Set())

const term = computed(() =>
  activeCycle.value?.terms.find(e => e.id === state.term)
)

function toggleSubject(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}

const terms = computed(() =>
  activeCycle.value?.terms.map(e => ({
    label: e.name,
    value: e.id
  })) || []
)

const children = computed(() =>
  students.value.map(e => ({
    label: `${e.givenNames} ${e.familyName} - ${e.className}`,
    value: e.id
  }))
)

const data = computed(() =>
  parseAssessmentData(breakdown.value)
)

function change() {
  const select = students.value.find(e => e.id === state.student)
  selected.value = select
}

async function fetchRecord() {
  await parentStore.fetchAllStudents(0, 0)
}

async function fetchCycle() {
  if (!selected.value) return

  await studentStore.fetchActiveCycle(selected.value.sessionId)

  if (!activeCycle.value) return

  const active = activeCycle.value.terms.find(e => e.status === "ACTIVE")

  if (!active) return

  const termIndex = terms.value.findIndex(e => e.value === active.id)

  state.term = terms.value[termIndex]?.value || ''
}

watch(
  () => children.value,
  () => {
    state.student = children.value[0]?.value || ''
    change()
  },
  { immediate: true }
)

watch(
  () => selected.value,
  async () => {
    await fetchCycle()
  },
  { immediate: true }
)

watch(
  () => state.term,
  async () => {
    await loadAvarageData()
  },
  { immediate: true }
)

onMounted(async () => {
  useAppStore().setTitle('Performance')
  document.title = 'Performance | Skultem'

  await fetchRecord()
})

const parseTrend: Record<string, any> = {
  IMPROVED: {
    icon: 'i-heroicons-arrow-trending-up',
    color: 'success'
  },
  STABLE: {
    icon: 'i-heroicons-minus',
    color: 'neutral'
  },
  DROPPED: {
    icon: 'i-heroicons-arrow-trending-down',
    color: 'error'
  }
}

const pareseState: Record<string, any> = {
  COMPLETED: 'Completed',
  APPREOVED: 'Approved'
}

function parseAssessmentData(records: any[]) {

  if (!records || records.length === 0) return []

  const subjects: Record<string, any> = {}

  for (const item of records) {

    if (!subjects[item.subject]) {
      subjects[item.subject] = {
        id: item.subject,
        subject: item.subject,
        weight: 0,
        score: 0,
        grade: item.grade,
        trend: parseTrend['STABLE'],
        show: false,
        assessments: []
      }
    }

    subjects[item.subject].assessments.push({
      assessment: item.name,
      score: item.score,
      weightScore: item.weightScore,
      weight: item.weight,
      grade: item.grade,
      level: item.level,
      status: pareseState[item.status],
      trend: item.trend
    })

    subjects[item.subject].weight += item.weightScore
    subjects[item.subject].score += item.score
  }

  const result = Object.values(subjects)

  result.forEach((subject: any) => {

    subject.assessments.sort((a: any, b: any) => a.level - b.level)

    const last = subject.assessments[subject.assessments.length - 1]

    subject.trend = last?.trend || "STABLE"

    subject.weight = Math.round(subject.weight)
  })

  return result
}

const columns: TableColumn<any>[] = [
  {
    accessorKey: 'assessment',
    header: 'Assessment'
  },
  {
    accessorKey: 'score',
    header: 'Score'
  },
  {
    accessorKey: 'weight',
    header: 'Weighted'
  },
  {
    accessorKey: 'weightScore',
    header: 'Weight Score'
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'level',
    header: 'Level'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'trend',
    header: ''
  }
]

async function loadAvarageData() {
  try {

    if (!state.term || !state.student) return

    assessmentLoading.value = true

    const payload = {
      entity: "breakdown",
      title: "Class Performance",
      filters: [
        {
          field: 'cycle.term.id',
          value: state.term,
          operator: "EQUALS",
          type: "select"
        },
        {
          field: 'studentAssessment.enrollment.student.id',
          value: state.student,
          operator: "EQUALS",
          type: "select"
        }
      ]
    }

    await store.runReport(payload, 0, 0)

  } catch (err) {

    console.error("Failed to load class performance", err)

  } finally {

    assessmentLoading.value = false
  }
}

definePageMeta({
  role: [Role.PARENT]
})
</script>