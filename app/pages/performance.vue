<template>
  <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
    <Heading title="Performance Breakdown" subtitle="Create custom reports and explore your school data">
      <div class="flex md:space-x-3 space-x-2 md:w-1/3 w-full">
        <USelectMenu @change="change" :loading="loading" :items="children" value-key="value" v-model="state.student"
          placeholder="Select Student" />
        <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
          placeholder="Select Term" />
      </div>
    </Heading>
    <DashboardParentSubjectPerformance :term="term?.id || ''" :id="selected?.id || ''" />
    <UCard v-for="row in breakdown" :key="row.id" @click="toggle(row.id)">
      <template #header>
        <div class="flex justify-between cursor-pointer">
          <div class="flex space-x-3 items-center">
            <UAvatar size="lg" :alt="row.name" />

            <div>
              <p class="text-sm font-medium">{{ row.name }}</p>
              <p :class="`text-[11px] text-muted text-${parseTrend[row.trend].color}`">Trend: {{
                parseTrend[row.trend].label }}</p>
            </div>
          </div>
          <div class="flex space-x-3 items-center">
            <div class="flex flex-col items-end">
              <p class="text-xs text-mute">Term Total</p>
              <p class="font-semibold">{{ row.score }}</p>
            </div>

            <UIcon :name="expanded[row.id] ? 'iconoir:nav-arrow-down' : 'weui:arrow-outlined'" class="text-lg text-mute"
              variant="link" />
          </div>
        </div>
      </template>

      <template v-if="expanded[row.id]" #default>
        <div class="space-y-1.5">
          <div v-for="(score, i) in row.scores" :key="i" class="flex justify-between pb-1.5" :class="{
            'border-b border-gray-100':
              Number.parseInt(i) + 1 < row.scores.length
          }">
            <p class="text-sm">{{ score.name }}</p>
            <div class="flex space-x-2">
              <p class="text-sm font-medium">
                <span>{{ score.score ?? '-' }}</span>
                <span> ({{ score.weightScore ?? '-' }}) </span>
              </p>
              <p :class="`text-sm text-${parseTrend[score.trend].color}`"> | {{ parseTrend[score.trend].label }}</p>
            </div>
          </div>
        </div>
        <div v-if="row.scores.length <= 0">
          <p class="text-center text-xs text-mute">No Assessments Yet</p>
        </div>
      </template>
    </UCard>
    <UCard v-if="!assessmentLoading && breakdown.length === 0" class="py-14">
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

const expanded = ref<Record<string, boolean>>({})

const term = computed(() =>
  activeCycle.value?.terms.find(e => e.id === state.term)
)

function toggle(id: string) {
  expanded.value[id] = !expanded.value[id]
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
  () => [state.term, state.student],
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
    icon: IMPROVED_ICON,
    color: 'success',
    label: 'Improved'
  },
  STABLE: {
    icon: STABLE_ICON,
    color: 'neutral',
    label: 'Stable'
  },
  DROPPED: {
    icon: DROPPED_ICON,
    color: 'error',
    label: 'Dropped'
  }
}

const columns: TableColumn<any>[] = [
  {
    accessorKey: 'name',
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

    await store.runReport(payload, 1, 200)

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