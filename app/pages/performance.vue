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
      <Metric :record="{
        label: 'Term Average', color: 'success', value: termAverage == null ? 'N/A' : `${termAverage}%`,
        isReady: !assessmentLoading, icon: STUDENT_ICON,
        subtle: termAverage == null ? 'No approved assessments yet'
          : `Across ${assessedSubjects.length} subject${assessedSubjects.length === 1 ? '' : 's'}`
      }" />
      <Metric :record="{
        label: 'Class Rank', color: 'primary', value: rank, isReady: rankReady, icon: LEADER_ICON,
        subtle: selected ? `Out of ${selected.classSize} in ${selected.className}` : undefined
      }" />
      <DashboardParentAttendance class="md:col-span-1 col-span-2" :id="state.student" :term="state.term" />
      <Metric class="md:col-span-1 col-span-2" :record="{
        label: 'Best Subject', color: 'success', value: topSubject?.name || 'N/A', isReady: !assessmentLoading,
        icon: TARGET_ICON, subtle: topSubject ? `${topSubject.score}% this term` : 'No approved assessments yet'
      }" />
    </div>

    <!-- The one thing worth acting on -->
    <div v-if="!assessmentLoading && bottomSubject"
      class="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
        <UIcon name="lucide:life-buoy" class="size-5" />
      </span>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted">Needs support in {{ bottomSubject.name }}</p>
        <p class="text-xs text-muted">
          {{ studentFirstName || 'The student' }} is at {{ bottomSubject.score }}%
          ({{ bottomSubject.grade || 'no grade' }}), below the {{ bottomSubject.passMark }}% pass mark{{
            bottomSubject.trend === 'DROPPED' ? ' and dropped on the latest test' : '' }}.
        </p>
      </div>
    </div>

    <!-- Trends -->
    <div class="grid gap-4 md:grid-cols-2 md:gap-5">
      <DashboardParentGradeTrend :id="state.student" />
      <DashboardParentSubjectPerformance :term="state.term" :id="state.student" :rows="chartRows"
        :loading="assessmentLoading" />
    </div>

    <!-- Subject breakdown -->
    <UCard v-if="sortedBreakdown.length" :ui="{ header: 'px-4 py-3', body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold text-highlighted">Subject breakdown</h3>
          <p class="text-xs text-muted">Highest first · tap a subject for its assessments</p>
        </div>
      </template>

      <ul class="divide-y divide-default">
        <li v-for="row in sortedBreakdown" :key="row.id">
          <button type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-elevated/40"
            :aria-expanded="!!expanded[row.id]" @click="toggle(row.id)">
            <UIcon :name="expanded[row.id] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              class="size-4 shrink-0 text-muted" />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-highlighted">{{ row.name }}</p>
              <p class="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                <span>{{ row.assessed }} of {{ row.total }} assessment{{ row.total === 1 ? '' : 's' }} graded</span>
                <template v-if="row.trend && parseTrend[row.trend]">
                  <span>&middot;</span>
                  <span class="flex items-center gap-1" :class="parseTrend[row.trend].text">
                    <UIcon :name="parseTrend[row.trend].icon" class="size-3.5" />
                    {{ parseTrend[row.trend].label }}
                  </span>
                </template>
              </p>
            </div>

            <div class="hidden w-40 sm:block">
              <div v-if="row.score != null" class="h-1.5 overflow-hidden rounded-full bg-elevated">
                <div class="h-full rounded-full" :class="barOf(row.score, row.passMark)"
                  :style="{ width: `${Math.min(100, row.score)}%` }" />
              </div>
            </div>
            <p class="w-12 shrink-0 text-right text-sm font-semibold tabular-nums"
              :class="row.score == null ? 'text-muted' : 'text-highlighted'">
              {{ row.score == null ? '-' : `${row.score}%` }}</p>
            <UBadge class="w-9 shrink-0 justify-center" variant="subtle" size="md"
              :color="row.grade ? gradeColor(row.grade) : 'neutral'" :label="row.grade || '-'" />
          </button>

          <div v-if="expanded[row.id]" class="border-l-2 border-t border-l-primary/40 border-t-default bg-neutral-100 px-4 py-3 shadow-inner dark:bg-neutral-800/60 sm:pl-11">
            <template v-if="row.scores.length">
              <div class="grid grid-cols-[1fr_auto_auto] gap-x-4 pb-1 text-[11px] uppercase tracking-wide text-muted">
                <span>Assessment</span><span class="text-right">Score</span>
                <span class="w-16 text-right">Change</span>
              </div>
              <div v-for="(score, i) in row.scores" :key="i"
                class="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-default/60 py-1.5 text-sm first:border-0">
                <div class="min-w-0">
                  <p class="truncate">{{ score.name }}</p>
                  <div v-if="score.score != null" class="mt-1 h-1 w-full max-w-48 overflow-hidden rounded-full bg-elevated">
                    <div class="h-full rounded-full" :class="barOf(Number(score.score), row.passMark)"
                      :style="{ width: `${Math.min(100, Number(score.score))}%` }" />
                  </div>
                </div>
                <span class="text-right tabular-nums">
                  <span class="font-medium text-highlighted">{{ score.score ?? '-' }}%</span>
                  <span v-if="score.weight" class="block text-[11px] text-muted">
                    {{ score.weightScore }} of {{ score.weight }} pts</span>
                </span>
                <span class="w-16 text-right text-xs font-medium tabular-nums"
                  :class="changeAt(row.scores, i) === null ? 'text-muted' : changeAt(row.scores, i)! > 0 ? 'text-success' : changeAt(row.scores, i)! < 0 ? 'text-error' : 'text-muted'">
                  <template v-if="changeAt(row.scores, i) === null">-</template>
                  <template v-else>{{ changeAt(row.scores, i)! > 0 ? '+' : '' }}{{ changeAt(row.scores, i) }} pts</template>
                </span>
              </div>
              <p v-if="spanOf(row.scores) !== null" class="border-t border-default/60 pt-2 text-xs text-muted">
                First to latest:
                <span class="font-semibold"
                  :class="spanOf(row.scores)! > 0 ? 'text-success' : spanOf(row.scores)! < 0 ? 'text-error' : 'text-highlighted'">
                  {{ spanOf(row.scores)! > 0 ? '+' : '' }}{{ spanOf(row.scores) }} pts</span>
              </p>
            </template>
            <p v-else class="py-2 text-xs text-muted">
              No approved assessments yet - {{ row.total }} still being marked or awaiting approval.</p>
          </div>
        </li>
      </ul>
    </UCard>

    <div v-else-if="assessmentLoading" class="space-y-3">
      <USkeleton class="mx-1 h-4 w-32" />
      <UCard v-for="i in 4" :key="i" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center space-x-3">
            <USkeleton class="size-10 rounded-full" />
            <div class="space-y-1.5">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-16" />
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <USkeleton class="h-5 w-10" />
            <USkeleton class="h-5 w-8 rounded-full" />
          </div>
        </div>
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
const { scoreValue } = useScoreFormat()
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
const assessedSubjects = computed(() =>
  breakdown.value.filter((row): row is Breakdown & { score: number } => row.score != null)
)

// Mean of the subject scores, the way a report card averages a term.
const termAverage = computed(() =>
  assessedSubjects.value.length
    ? scoreValue(assessedSubjects.value.reduce((sum, row) => sum + row.score, 0) / assessedSubjects.value.length)
    : null
)

const chartRows = computed(() => assessedSubjects.value.map(row => ({ name: row.name, score: row.score })))

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
  IMPROVED: { icon: IMPROVED_ICON, text: 'text-success', label: 'Improved' },
  STABLE: { icon: STABLE_ICON, text: 'text-muted', label: 'Steady' },
  DROPPED: { icon: DROPPED_ICON, text: 'text-error', label: 'Dropped' }
}

// Highest first; subjects with nothing approved yet last.
const sortedBreakdown = computed(() => [...breakdown.value].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)))
// Points gained or lost against the assessment before it; null for the first one or when a mark is missing.
function changeAt(scores: any[], i: number): number | null {
  const cur = scores[i]?.score
  const prev = scores[i - 1]?.score
  if (i === 0 || cur == null || prev == null) return null
  return Math.round((Number(cur) - Number(prev)) * 10) / 10
}

// Overall movement from the first marked assessment to the latest one.
function spanOf(scores: any[]): number | null {
  const marked = scores.filter(x => x.score != null)
  if (marked.length < 2) return null
  return Math.round((Number(marked[marked.length - 1].score) - Number(marked[0].score)) * 10) / 10
}

const barOf = (score: number, passMark = 50) => score < passMark ? 'bg-error' : score < 70 ? 'bg-warning' : 'bg-success'

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
