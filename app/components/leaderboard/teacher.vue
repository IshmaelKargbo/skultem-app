<template>
  <div class="p-7 overflow-y-auto h-full space-y-5">
    <!-- Page Header -->
    <Heading 
      title="Leaderboard" 
      subtitle="View class performance and explore detailed student reports"
    >
      <div class="flex w-1/2 space-x-3">
        <USelectMenu 
          v-model="state.classId" 
          :items="classes" 
          value-key="value" 
          class="w-full"
          placeholder="Select Class" 
        />

        <USelectMenu 
          v-model="state.termId" 
          :items="terms" 
          value-key="value" 
          class="w-full"
          placeholder="Select Term" 
        />
      </div>
    </Heading>

    <!-- Leaderboard Table -->
    <UCard>
      <UTable :columns="columns" :data="leaderboard">

        <!-- Trend Column -->
        <template #trend-cell="{ row }">
          <div class="flex justify-end items-center gap-2">
            <UBadge
              variant="outline"
              :label="parseTrend[row.original.trend]?.label"
              :color="parseTrend[row.original.trend]?.color || 'primary'"
              :trailing-icon="parseTrend[row.original.trend]?.icon"
            />
          </div>
        </template>

      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const reportStore = useReportStore()
const { leaderboard } = storeToRefs(reportStore)

const studentStore = useStudentStore()
const { activeCycle } = storeToRefs(studentStore)

const classStore = useClassSessionStore()

const state = reactive({
  classId: '',
  termId: ''
})

const term = ref<Term | undefined>()
const records = ref<ClassSession[]>([])

/* Compute dynamic assessment columns based on the leaderboard data */
const assessmentColumns = computed(() => {
  if (!leaderboard.value?.length) return []

  const map = new Map<string, any>()

  leaderboard.value.forEach(student => {
    student.assessments?.forEach(a => {
      if (!map.has(a.assessmentId)) {
        map.set(a.assessmentId, { name: a.assessmentName, weight: a.weight })
      }
    })
  })

  return Array.from(map.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    weight: data.weight
  }))
})

/* Table Columns for the Leaderboard */
const columns = computed<TableColumn<LeaderBoard>[]>(() => [
  { accessorKey: 'rank', header: 'Rank' },
  { accessorKey: 'name', header: 'Student' },

  // Assessment Scores (Dynamic Columns)
  ...assessmentColumns.value.map(a => ({
    id: a.id,
    header: a.name,
    cell: ({ row }: any) => {
      const assessment = row.original.assessments?.find(x => x.assessmentId === a.id)
      return assessment?.score ?? '-'
    }
  })),

  { accessorKey: 'score', header: 'Total Score' },
  { accessorKey: 'trend', header: '' }
])

/* Trend mapping for badges */
const parseTrend: Record<string, { icon: string; color: string; label: string }> = {
  IMPROVED: { icon: 'lucide:arrow-up', color: 'success', label: 'Improved' },
  DROPPED:  { icon: 'lucide:arrow-down', color: 'error', label: 'Dropped' },
  STABLE:   { icon: 'lucide:minus', color: 'warning', label: 'Stable' }
}

/* Prepare class dropdown options */
const classes = computed(() =>
  records.value.map(e => {
    let label = `${e.clazz} (${e.sectionName}) - ${e.totalStudent}`
    if (e.streamName !== 'N/A') {
      label = `${e.clazz} (${e.sectionName} - ${e.streamName}) - ${e.totalStudent}`
    }
    return { label, value: e.clazzId }
  })
)

/* Prepare term dropdown options */
const terms = computed(() =>
  activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })) || []
)

/* Lifecycle: Fetch initial data */
onMounted(async () => {
  useAppStore().setTitle('Leaderboard')
  document.title = 'Leaderboard | Skultem'

  records.value = await classStore.fetchAllMe()
  await fetchActiveTerm()
})

/* Watch for changes and reload leaderboard */
watch(() => [state.termId, state.classId], async () => {
  if (state.classId && state.termId) await loadLeaderboardData()
}, { immediate: true })

watch(() => state.classId, fetchActiveTerm, { immediate: true })

watch(() => classes.value, () => {
  if (classes.value.length) state.classId = classes.value[0].value
}, { immediate: true })

/* Fetch the active term for the selected class */
async function fetchActiveTerm() {
  if (!state.classId) return

  await studentStore.fetchActiveCycle('all')
  const active = activeCycle.value?.terms.find(e => e.status === 'ACTIVE')
  if (!active) return

  const termIndex = terms.value.findIndex(e => e.value === active.id)
  state.termId = terms.value[termIndex]?.value || ''
  term.value = active
}

/* Load leaderboard report data */
async function loadLeaderboardData() {
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
    console.error('Failed to load leaderboard', err)
  }
}

definePageMeta({ role: [Role.TEACHER] })
</script>