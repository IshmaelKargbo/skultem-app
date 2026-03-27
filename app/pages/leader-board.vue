<template>
  <div class="p-7 overflow-y-auto h-full space-y-5">
    <!-- Header -->
    <Heading title="Leader Board" subtitle="Create custom reports and explore your school data">
      <div class="flex w-1/2 space-x-3">
        <USelectMenu v-model="state.classId" :items="classes" value-key="value" class="w-full"
          placeholder="Select Class" />
        <USelectMenu v-model="state.termId" :items="terms" value-key="value" class="w-full" placeholder="Select Term" />
      </div>
    </Heading>

    <!-- Leaderboard Table -->
    <UCard>
      <UTable :columns="columns" :data="leaderboard">
        <template #trend-cell="{ row }">
          <div class="flex justify-end items-center gap-2">
            <UBadge variant="outline" :label="parseTrend[row.original.trend]?.label"
              :color="parseTrend[row.original.trend]?.color || 'primary'"
              :trailing-icon="parseTrend[row.original.trend]?.icon" />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

// Stores
const reportStore = useReportStore()
const { leaderboard } = storeToRefs(reportStore)

const studentStore = useStudentStore()
const { activeCycle } = storeToRefs(studentStore)

const classStore = useClassSessionStore()

// State
const state = reactive({
  classId: '',
  termId: ''
})

const term = ref<Term | undefined>()

// Computed
const terms = computed(() =>
  activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })) || []
)

const classes = computed(() =>
  records.value.map((e: ClassSession) => {
    let label = `${e.clazz} (${e.sectionName}) - ${e.totalStudent}`
    if (e.streamName !== 'N/A') label = `${e.clazz} (${e.sectionName} - ${e.streamName}) - ${e.totalStudent}`
    return { label, value: e.clazzId }
  })
)

// Columns
const columns: TableColumn<LeaderBoard>[] = [
  { accessorKey: 'rank', header: 'Rank' },
  { accessorKey: 'name', header: 'Student' },
  { accessorKey: 'score', header: 'Score' },
  { accessorKey: 'weight', header: 'Weighted' },
  { accessorKey: 'grade', header: 'Grade' },
  { accessorKey: 'trend', header: '' }
]

// Trend icon & color mapping
const parseTrend: Record<string, { icon: string; color: string, label: string }> = {
  IMPROVED: { icon: 'lucide:arrow-up', color: 'success', label: 'Improved' },
  DROPPED: { icon: 'lucide:arrow-down', color: 'danger', label: 'Dropped' },
  STABLE: { icon: 'lucide:minus', color: 'warning', label: 'Stable' }
}

// Records
const records = ref<ClassSession[]>([])

// Lifecycle
onMounted(async () => {
  useAppStore().setTitle('Leader Board')
  document.title = 'Leader Board | Skultem'

  const res = await classStore.fetchAllMe()
  records.value = res
  await fetchCycle()
})

// Watchers
watch(() => [state.termId, state.classId], async () => {
  if (state.classId && state.termId) await loadAverageData()
}, { immediate: true })

watch(() => state.classId, fetchCycle, { immediate: true })

watch(() => classes.value, () => {
  if (classes.value.length > 0) state.classId = classes.value[0]?.value || ''
}, { immediate: true })

// Functions
async function fetchCycle() {
  if (!state.classId) return
  await studentStore.fetchActiveCycle('all')
  const active = activeCycle.value?.terms.find(e => e.status === 'ACTIVE')
  if (!active) return
  const termIndex = terms.value.findIndex(e => e.value === active.id)
  state.termId = terms.value[termIndex]?.value || ''
  term.value = active
}

async function loadAverageData() {
  try {
    const payload = {
      entity: 'leaderboard',
      title: 'Class Performance',
      filters: [
        { field: 'cycle.term.id', value: state.termId, operator: 'EQUALS', type: 'select' },
        { field: 'studentAssessment.enrollment.clazz.id', value: state.classId, operator: 'EQUALS', type: 'select' }
      ]
    }
    await reportStore.runReport(payload, 0, 0)
  } catch (err) {
    console.error('Failed to load class performance', err)
  }
}

// Page meta
definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.TEACHER]
})
</script>