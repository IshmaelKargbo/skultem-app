<template>
  <StudentView>
    <div class="space-y-4">
      <UCard>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold">Performance</h3>
            <p class="text-sm text-muted">{{ subtitle }}</p>
          </div>
          <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
            placeholder="Select Term" class="w-full sm:w-56" />
        </div>
      </UCard>

      <!-- At a glance -->
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        <DashboardParentAvarage :term="term" :session-id="record?.sessionId || ''" :id="studentId" />
        <Metric :record="{
          label: 'Class Rank', color: 'primary', value: rank, isReady: rankReady, icon: LEADER_ICON,
          subtle: record ? `Out of ${record.classSize} in ${record.className}` : undefined
        }" />
        <DashboardParentAttendance :id="studentId" />
        <Metric :record="{
          label: 'Best Subject', color: 'success', value: topSubject?.name || 'N/A', isReady: !assessmentLoading,
          icon: TARGET_ICON, subtle: topSubject ? `${Math.round(topSubject.score)}% this term` : 'No assessments yet'
        }" />
      </div>

      <!-- Plain-language summary of the two stats above - which subject to call out, which one
           needs a closer look - same read a teacher would otherwise have to build by scanning
           every row of the breakdown below. -->
      <UCard v-if="!assessmentLoading && (topSubject || bottomSubject)">
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-if="topSubject" class="flex items-start gap-3 rounded-xl bg-success-50 p-4 dark:bg-success-500/10">
            <UIcon name="lucide:trophy" class="mt-0.5 size-5 shrink-0 text-success" />
            <div class="space-y-0.5">
              <p class="text-sm font-semibold text-success">Strongest in {{ topSubject.name }}</p>
              <p class="text-xs text-muted">
                {{ studentFirstName }} is scoring {{ Math.round(topSubject.score) }}% ({{ topSubject.grade || '—' }})
                - the strongest subject this term.
              </p>
            </div>
          </div>

          <div v-if="bottomSubject" class="flex items-start gap-3 rounded-xl bg-warning-50 p-4 dark:bg-warning-500/10">
            <UIcon name="lucide:life-buoy" class="mt-0.5 size-5 shrink-0 text-warning" />
            <div class="space-y-0.5">
              <p class="text-sm font-semibold text-warning">Failing {{ bottomSubject.name }}</p>
              <p class="text-xs text-muted">
                Currently at {{ Math.round(bottomSubject.score) }}% ({{ bottomSubject.grade || '—' }}){{
                  bottomSubject.trend === 'DROPPED' ? ' and trending down' : '' }} - may need extra support.
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Trends -->
      <div class="grid gap-4 md:grid-cols-2 md:gap-5">
        <DashboardParentGradeTrend :id="studentId" />
        <DashboardParentSubjectPerformance :term="state.term" :id="studentId" />
      </div>

      <!-- Subject breakdown -->
      <div v-if="breakdown.length" class="space-y-3">
        <h3 class="px-1 text-sm font-semibold text-highlighted">Subject Breakdown</h3>

        <UCard :ui="{ body: 'p-0 sm:p-0' }" v-for="row in breakdown" :key="row.id" class="cursor-pointer"
          @click="toggle(row.id)">
          <div class="flex items-center justify-between p-3">
            <div class="flex min-w-0 space-x-3 items-center">
              <UAvatar size="lg" :alt="row.name" />

              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ row.name }}</p>
                <div class="flex items-center gap-1.5">
                  <UIcon :name="parseTrend[row.trend]?.icon" :class="`size-3.5 text-${parseTrend[row.trend]?.color}`" />
                  <p :class="`text-[11px] text-${parseTrend[row.trend]?.color}`">{{ parseTrend[row.trend]?.label }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-end space-x-3">
              <div class="flex items-center">
                <UBadge v-if="row.grade" :label="row.grade" :color="gradeColor(row.grade)" variant="subtle" />
              </div>
              <div class="flex space-x-2 items-center">
                <div class="hidden w-28 flex-col items-end gap-1 sm:flex">
                  <p class="text-sm font-semibold">{{ Math.round(row.score) }}%</p>
                  <UProgress :model-value="row.score" :color="gradeColor(row.grade)" size="sm" />
                </div>

                <UIcon :name="expanded[row.id] ? 'iconoir:nav-arrow-down' : 'weui:arrow-outlined'"
                  class="text-lg text-mute" variant="link" />
              </div>
            </div>
          </div>

          <template v-if="expanded[row.id]" #footer>
            <div v-if="row.scores.length" class="space-y-1.5 p-3">
              <div v-for="(score, i) in row.scores" :key="i" class="flex items-center justify-between py-1.5" :class="{
                'border-b border-gray-100 dark:border-gray-800': i + 1 < row.scores.length
              }">
                <p class="text-sm">{{ score.name }}</p>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium">
                    <span>{{ score.score ?? '-' }}</span>
                    <span class="text-muted"> ({{ score.weightScore ?? '-' }})</span>
                  </p>
                  <UIcon v-if="score.trend" :name="parseTrend[score.trend]?.icon"
                    :class="`size-3.5 text-${parseTrend[score.trend]?.color}`" />
                </div>
              </div>
            </div>
            <p v-else class="py-2 text-center text-xs text-muted">No assessments yet for this subject.</p>
          </template>
        </UCard>
      </div>

      <UCard v-else-if="!assessmentLoading" class="py-14">
        <div class="flex flex-col items-center justify-center text-center space-y-4">
          <UIcon name="i-heroicons-document-text" class="text-4xl text-muted" />

          <div class="space-y-1">
            <p class="text-lg font-semibold">
              No Assessments Yet
            </p>
            <p class="text-sm text-muted">
              {{ studentFirstName ? `${studentFirstName} has` : 'This student has' }} no recorded assessments for the
              selected term yet - check back once grading gets underway.
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </StudentView>
</template>
<script setup lang="ts">
const route = useRoute()
const store = useReportStore()
const studentStore = useStudentStore()

const { record, activeCycle, loading: cycleLoading } = storeToRefs(studentStore)
const { breakdown } = storeToRefs(store)

const studentId = computed(() => String(route.params.id))
const assessmentLoading = ref(false)

const state = reactive({
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

const studentFirstName = computed(() => record.value?.givenNames || '')

const subtitle = computed(() =>
  studentFirstName.value
    ? `A clear picture of how ${studentFirstName.value} is doing${term.value ? ` in ${term.value.name}` : ''}`
    : "A clear picture of this student's progress, term by term"
)

// Same rule as the parent Performance page - only counted once real assessments exist, so a
// freshly-added subject with no grades yet doesn't get flagged either way.
const assessedSubjects = computed(() => breakdown.value.filter(row => row.scores.length > 0))

const topSubject = computed(() =>
  assessedSubjects.value.length
    ? assessedSubjects.value.reduce((best, row) => row.score > best.score ? row : best)
    : undefined
)

// Only an actually-failing subject counts as a flag - the lowest-scoring subject out of a
// passing bunch isn't something a teacher needs surfaced as a problem.
const bottomSubject = computed(() => {
  const failing = assessedSubjects.value.filter(row => row.passed === false)
  if (!failing.length) return undefined
  const worst = failing.reduce((w, row) => row.score < w.score ? row : w)
  return worst.id === topSubject.value?.id ? undefined : worst
})

function gradeColor(grade?: string): 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  const letter = grade?.trim().charAt(0).toUpperCase()
  if (letter === 'A') return 'success'
  if (letter === 'B') return 'info'
  if (letter === 'C') return 'warning'
  if (letter === 'D' || letter === 'E' || letter === 'F') return 'error'
  return 'neutral'
}

async function fetchCycle() {
  if (!record.value) return

  await studentStore.fetchActiveCycle(record.value.sessionId)

  if (!activeCycle.value) return

  const cycleTerms = activeCycle.value.terms
  if (!cycleTerms.length) return

  // Same fallback as the parent Performance page - a cycle with no term marked ACTIVE (e.g. a
  // class that hasn't rolled into the school's current term yet) would otherwise leave
  // state.term blank forever and starve everything below.
  const active = cycleTerms.find(e => e.status === "ACTIVE")
    ?? cycleTerms.reduce((latest, t) => t.termNumber > latest.termNumber ? t : latest)

  const termIndex = terms.value.findIndex(e => e.value === active.id)

  state.term = terms.value[termIndex]?.value || ''
}

watch(
  () => record.value?.id,
  async () => {
    await fetchCycle()
  },
  { immediate: true }
)

watch(
  () => [state.term, studentId.value],
  async () => {
    await loadAvarageData()
    await loadRank()
  },
  { immediate: true }
)

const parseTrend: Record<string, any> = {
  IMPROVED: { icon: IMPROVED_ICON, color: 'success', label: 'Improved' },
  STABLE: { icon: STABLE_ICON, color: 'neutral', label: 'Stable' },
  DROPPED: { icon: DROPPED_ICON, color: 'error', label: 'Dropped' }
}

// Local ready-flag, not studentStore.loading - that flag is shared with the term dropdown's own
// "cycleLoading" state (and the student profile banner above), so reusing it here would flash
// the whole page into a loading state every time the rank refetches.
const rankReady = ref(false)
const rank = ref('—')

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return `${n}${(s[(v - 20) % 10] || s[v] || s[0])}`
}

async function loadRank() {
  if (!state.term || !studentId.value) return

  rankReady.value = false
  try {
    const res = await studentStore.fetchRank(studentId.value, state.term)
    rank.value = res ? ordinal(Number(res)) : '—'
  } finally {
    rankReady.value = true
  }
}

async function loadAvarageData() {
  try {
    if (!state.term || !studentId.value) return

    assessmentLoading.value = true

    const payload = {
      entity: "breakdown",
      title: "Class Performance",
      filters: [
        { field: 'cycle.term.id', value: state.term, operator: "EQUALS", type: "select" },
        { field: 'studentAssessment.enrollment.student.id', value: studentId.value, operator: "EQUALS", type: "select" }
      ]
    }

    await store.runReport(payload, 1, 200)
  } catch (err) {
    console.error("Failed to load student performance", err)
  } finally {
    assessmentLoading.value = false
  }
}

onMounted(() => {
  document.title = 'Performance | Student | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
