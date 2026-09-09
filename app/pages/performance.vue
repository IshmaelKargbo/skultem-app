<template>
  <div class="px-4 sm:px-6 space-y-4">
    <Heading title="Performance Insights" :subtitle="subtitle">
      <div class="flex md:space-x-3 space-x-2">
        <USelectMenu @change="change" :loading="loading" :items="children" value-key="value" v-model="state.student"
          placeholder="Select Student" />
        <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
          placeholder="Select Term" />
      </div>
    </Heading>

    <!-- At a glance -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      <DashboardParentAvarage :term="term" :session-id="selected?.sessionId || ''" :id="state.student" />
      <Metric :record="{
        label: 'Class Rank', color: 'primary', value: rank, isReady: rankReady, icon: LEADER_ICON,
        subtle: selected ? `Out of ${selected.classSize} in ${selected.className}` : undefined
      }" />
      <DashboardParentAttendance :id="state.student" />
      <Metric :record="{
        label: 'Best Subject', color: 'success', value: topSubject?.name || 'N/A', isReady: !assessmentLoading,
        icon: TARGET_ICON, subtle: topSubject ? `${Math.round(topSubject.score)}% this term` : 'No assessments yet'
      }" />
    </div>

    <!-- Plain-language summary of the two stats above that actually matter to a parent -
         which subject to praise, which one needs a bit of help at home. -->
    <UCard v-if="!assessmentLoading && (topSubject || bottomSubject)">
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-if="topSubject" class="flex items-start gap-3 rounded-xl bg-success-50 p-4 dark:bg-success-500/10">
          <UIcon name="lucide:trophy" class="mt-0.5 size-5 shrink-0 text-success" />
          <div class="space-y-0.5">
            <p class="text-sm font-semibold text-success">Doing great in {{ topSubject.name }}</p>
            <p class="text-xs text-muted">
              {{ studentFirstName }} is scoring {{ Math.round(topSubject.score) }}% ({{ topSubject.grade || '—' }})
              - the strongest subject this term.
            </p>
          </div>
        </div>

        <div v-if="bottomSubject" class="flex items-start gap-3 rounded-xl bg-warning-50 p-4 dark:bg-warning-500/10">
          <UIcon name="lucide:life-buoy" class="mt-0.5 size-5 shrink-0 text-warning" />
          <div class="space-y-0.5">
            <p class="text-sm font-semibold text-warning">Could use some support in {{ bottomSubject.name }}</p>
            <p class="text-xs text-muted">
              Currently at {{ Math.round(bottomSubject.score) }}% ({{ bottomSubject.grade || '—' }}){{
                bottomSubject.trend === 'DROPPED' ? ' and trending down' : '' }} - worth checking in on together.
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Trends -->
    <div class="grid gap-4 md:grid-cols-2 md:gap-5">
      <DashboardParentGradeTrend :id="state.student" />
      <DashboardParentSubjectPerformance :term="state.term" :id="state.student" />
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
</template>
<script setup lang="ts">
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

const studentFirstName = computed(() => selected.value?.givenNames || '')

const subtitle = computed(() =>
  studentFirstName.value
    ? `A clear picture of how ${studentFirstName.value} is doing${term.value ? ` in ${term.value.name}` : ''}`
    : 'A clear picture of your child\'s progress, term by term'
)

// The subjects with the highest/lowest score this term - only counted once real assessments
// exist for them, so a freshly-added subject with no grades yet doesn't get flagged as "needs
// support" just for being empty.
const assessedSubjects = computed(() => breakdown.value.filter(row => row.scores.length > 0))

const topSubject = computed(() =>
  assessedSubjects.value.length
    ? assessedSubjects.value.reduce((best, row) => row.score > best.score ? row : best)
    : undefined
)

// Only an actually-failing subject counts as "needs support" - the lowest-scoring subject out
// of a passing bunch (e.g. 78%/B, just not this student's best) isn't something to flag.
const bottomSubject = computed(() => {
  const failing = assessedSubjects.value.filter(row => row.passed === false)
  if (!failing.length) return undefined
  const worst = failing.reduce((w, row) => row.score < w.score ? row : w)
  // Don't show the same subject as both the highlight and the thing to work on.
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

  const cycleTerms = activeCycle.value.terms
  if (!cycleTerms.length) return

  // The student's current session isn't always in the school's currently-active academic
  // year (e.g. their class hasn't been rolled over to the new year yet) - that cycle's terms
  // are then all CLOSED, none ACTIVE, and this used to leave state.term blank forever, which
  // silently starved everything below (rank, average, subject chart, the breakdown list) since
  // they all guard on state.term being set. Fall back to the most advanced term on record
  // (highest termNumber) so a past/closed cycle still shows its last real data instead of a
  // permanently empty page.
  const active = cycleTerms.find(e => e.status === "ACTIVE")
    ?? cycleTerms.reduce((latest, t) => t.termNumber > latest.termNumber ? t : latest)

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
    await loadRank()
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

// A local ready-flag, not studentStore.loading - that flag is shared with the term selector's
// own "cycleLoading" state, and fetchRank() flips it too, so reusing it here would make the
// term dropdown flash into a loading state every time the rank refetches.
const rankReady = ref(false)
const rank = ref('—')

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return `${n}${(s[(v - 20) % 10] || s[v] || s[0])}`
}

async function loadRank() {
  if (!state.term || !state.student) return

  rankReady.value = false
  try {
    const res = await studentStore.fetchRank(state.student, state.term)
    rank.value = res ? ordinal(Number(res)) : '—'
  } finally {
    rankReady.value = true
  }
}

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
