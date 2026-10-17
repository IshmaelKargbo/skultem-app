<template>
  <StudentView>
    <div class="space-y-4">
      <UCard>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold">Performance</h3>
            <p class="text-xs-base text-muted">{{ subtitle }}</p>
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
        <DashboardParentAttendance class="md:col-span-1 col-span-2" :id="studentId" />
        <Metric class="md:col-span-1 col-span-2" :record="{
          label: 'Best Subject', color: 'success', value: topSubject?.name || 'N/A', isReady: !assessmentLoading,
          icon: TARGET_ICON, subtle: topSubject ? `${Math.round(topSubject.score)}% this term` : 'No assessments yet'
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
            {{ studentFirstName || 'The student' }} is at {{ Math.round(bottomSubject.score) }}%
            ({{ bottomSubject.grade || 'no grade' }}), below the 50% pass line{{
              bottomSubject.trend === 'DROPPED' ? ' and still dropping' : '' }}.
          </p>
        </div>
      </div>

      <!-- Trends -->
      <div class="grid gap-4 md:grid-cols-2 md:gap-5">
        <DashboardParentGradeTrend :id="studentId" />
        <DashboardParentSubjectPerformance :term="state.term" :id="studentId" />
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
                <p v-if="parseTrend[row.trend]" class="mt-0.5 flex items-center gap-1 text-[11px]"
                  :class="parseTrend[row.trend].text">
                  <UIcon :name="parseTrend[row.trend].icon" class="size-3.5" />
                  {{ parseTrend[row.trend].label }}
                </p>
              </div>

              <div class="hidden w-40 sm:block">
                <div class="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div class="h-full rounded-full" :class="barOf(row.score)"
                    :style="{ width: `${Math.min(100, Math.round(row.score))}%` }" />
                </div>
              </div>
              <p class="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-highlighted">
                {{ Math.round(row.score) }}%</p>
              <UBadge class="w-9 shrink-0 justify-center" variant="subtle" size="md"
                :color="row.grade ? gradeColor(row.grade) : 'neutral'" :label="row.grade || '-'" />
            </button>

            <div v-if="expanded[row.id]" class="border-l-2 border-t border-l-primary/40 border-t-default bg-neutral-100 px-4 py-3 shadow-inner dark:bg-neutral-800/60 sm:pl-11">
              <template v-if="row.scores.length">
                <div class="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 pb-1 text-[11px] uppercase tracking-wide text-muted">
                  <span>Assessment</span><span class="text-right">Score</span>
                  <span class="w-16 text-right">Change</span><span class="w-5" />
                </div>
                <div v-for="(score, i) in row.scores" :key="i"
                  class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-t border-default/60 py-1.5 text-sm first:border-0">
                  <div class="min-w-0">
                    <p class="truncate">{{ score.name }}</p>
                    <div v-if="score.score != null" class="mt-1 h-1 w-full max-w-48 overflow-hidden rounded-full bg-elevated">
                      <div class="h-full rounded-full" :class="barOf(Number(score.score))"
                        :style="{ width: `${Math.min(100, Number(score.score))}%` }" />
                    </div>
                  </div>
                  <span class="text-right tabular-nums">
                    <span class="font-medium text-highlighted">{{ score.score ?? '-' }}</span>
                    <span class="text-xs text-muted"> counts {{ score.weightScore ?? '-' }}</span>
                  </span>
                  <span class="w-16 text-right text-xs font-medium tabular-nums"
                    :class="changeAt(row.scores, i) === null ? 'text-muted' : changeAt(row.scores, i)! > 0 ? 'text-success' : changeAt(row.scores, i)! < 0 ? 'text-error' : 'text-muted'">
                    <template v-if="changeAt(row.scores, i) === null">-</template>
                    <template v-else>{{ changeAt(row.scores, i)! > 0 ? '+' : '' }}{{ changeAt(row.scores, i) }} pts</template>
                  </span>
                  <span class="flex w-5 justify-center">
                    <UIcon v-if="score.trend && parseTrend[score.trend]" :name="parseTrend[score.trend].icon"
                      class="size-3.5" :class="parseTrend[score.trend].text" />
                  </span>
                </div>
                <p v-if="spanOf(row.scores) !== null" class="border-t border-default/60 pt-2 text-xs text-muted">
                  First to latest:
                  <span class="font-semibold"
                    :class="spanOf(row.scores)! > 0 ? 'text-success' : spanOf(row.scores)! < 0 ? 'text-error' : 'text-highlighted'">
                    {{ spanOf(row.scores)! > 0 ? '+' : '' }}{{ spanOf(row.scores) }} pts</span>
                </p>
              </template>
              <p v-else class="py-2 text-xs text-muted">No assessments yet for this subject.</p>
            </div>
          </li>
        </ul>
      </UCard>

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

const assessedSubjects = computed(() => breakdown.value.filter(row => row.scores.length > 0))

const topSubject = computed(() =>
  assessedSubjects.value.length
    ? assessedSubjects.value.reduce((best, row) => row.score > best.score ? row : best)
    : undefined
)

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
  IMPROVED: { icon: IMPROVED_ICON, text: 'text-success', label: 'Improved' },
  STABLE: { icon: STABLE_ICON, text: 'text-muted', label: 'Steady' },
  DROPPED: { icon: DROPPED_ICON, text: 'text-error', label: 'Dropped' }
}

const sortedBreakdown = computed(() => [...breakdown.value].sort((a, b) => b.score - a.score))
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

const barOf = (score: number) => score < 50 ? 'bg-error' : score < 70 ? 'bg-warning' : 'bg-success'

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
  useAppStore().setTitle('View Student')
  useAppStore().setBack((route.query.back as string) || '/students')
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
