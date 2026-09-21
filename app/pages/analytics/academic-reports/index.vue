<template>
  <div class="space-y-4 px-4 md:px-6">
    <AnalyticsAcademicFilterBar :filters="filters" :terms="terms" :class-options="classOptions"
      :subject-options="subjectOptions" :level-options="levelOptions" :class-loading="classStore.loading"
      :subject-loading="subjectStore.loading" />

    <AnalyticsAcademicTabNav :query="queryString" />

    <UCard v-if="!filters.termId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-graduation-cap" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Select a term to generate a report.</p>
      </div>
    </UCard>

    <div v-else class="space-y-4">
      
      <div class="grid grid-cols-2 gap-4 px-2 sm:grid-cols-3 lg:grid-cols-4">
        <Metric :record="{ label: 'Total Students', value: overview?.totalStudents ?? 0, isReady: !loadingReport, icon: 'i-lucide-users', color: 'primary' }" />
        <Metric :record="{ label: 'Students Assessed', value: overview?.studentsAssessed ?? 0, isReady: !loadingReport, icon: 'i-lucide-user-check', color: 'info' }" />
        <Metric :record="{ label: 'Assessments', value: overview?.totalAssessments ?? 0, isReady: !loadingReport, icon: 'i-lucide-clipboard-list', color: 'info' }" />
        <Metric :record="{ label: 'Approved', value: overview?.completedAssessments ?? 0, isReady: !loadingReport, icon: 'i-lucide-check-circle', color: 'success' }" />
        <Metric :record="{ label: filters.classId ? 'Class Average' : 'School Average', value: overview ? `${overview.classAverage}%` : '—', isReady: !loadingReport, icon: 'i-lucide-percent', color: 'primary' }" />
        <Metric class="lg:col-span-2" :record="{ label: 'Pass Rate', value: overview ? `${overview.passRate}%` : '—', subtle: passMarkNote, isReady: !loadingReport, icon: 'i-lucide-trending-up', color: 'success' }" />
        <Metric :record="{ label: 'Needs Support', value: overview?.studentsNeedingSupport ?? 0, subtle: overview ? 'Below the pass mark' : undefined, isReady: !loadingReport, icon: 'i-lucide-life-buoy', color: 'warning' }" />
      </div>

      <div v-if="overview && overview.studentsAssessed === 0" class="px-2">
        <UAlert color="neutral" variant="soft" icon="i-lucide-info" title="No approved results yet"
          description="Nothing has been approved for this selection yet, so there's nothing to report on." />
      </div>

      <!-- Insights - the headline from each other tab, so the Overview page is a real summary, not
           just a row of numbers. Each card links straight into the tab it's pulled from. -->
      <div v-if="overview && overview.studentsAssessed > 0" class="px-2">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">What needs your attention</h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-if="weakestClass" :to="classesTabTo" class="block">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
              <div class="flex items-start gap-3">
                <UBadge variant="subtle" color="warning" size="xl" class="shrink-0 p-1.5" icon="i-lucide-school" />
                <div class="min-w-0">
                  <p class="text-xs text-muted">Class needing the most support</p>
                  <p class="truncate font-semibold">{{ weakestClass.className }} &middot; {{ weakestClass.averageScore }}%</p>
                  <p class="truncate text-xs text-muted">{{ weakestClass.passRate }}% pass rate &middot; compare all classes</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink v-if="weakestSubject" :to="subjectsTabTo" class="block">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
              <div class="flex items-start gap-3">
                <UBadge variant="subtle" color="error" size="xl" class="shrink-0 p-1.5" icon="i-lucide-book-open" />
                <div class="min-w-0">
                  <p class="text-xs text-muted">Subject needing the most support</p>
                  <p class="truncate font-semibold">{{ weakestSubject.subjectName }} &middot; {{ weakestSubject.averageScore }}%</p>
                  <p class="truncate text-xs text-muted">{{ weakestSubject.passRate }}% pass rate &middot; see all subjects</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink :to="attentionTabTo" class="block">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
              <div class="flex items-start gap-3">
                <UBadge variant="subtle" :color="attention && attention.flaggedCount > 0 ? 'error' : 'success'" size="xl"
                  class="shrink-0 p-1.5" :icon="loadingAttention ? 'i-lucide-loader-circle animate-spin' : 'i-lucide-alert-triangle'" />
                <div class="min-w-0">
                  <p class="text-xs text-muted">Students requiring attention</p>
                  <p class="truncate font-semibold">{{ attention?.flaggedCount ?? 0 }} of {{ attention?.totalStudents ?? 0 }} students</p>
                  <p class="truncate text-xs text-muted">Low scores, low attendance, missing work or a declining trend</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink :to="completionTabTo" class="block">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
              <div class="flex items-start gap-3">
                <UBadge variant="subtle" :color="pendingCompletionCount > 0 ? 'warning' : 'success'" size="xl"
                  class="shrink-0 p-1.5" :icon="loadingCompletion ? 'i-lucide-loader-circle animate-spin' : 'i-lucide-clipboard-check'" />
                <div class="min-w-0">
                  <p class="text-xs text-muted">Assessments awaiting action</p>
                  <p class="truncate font-semibold">{{ pendingCompletionCount }} pending or returned</p>
                  <p class="truncate text-xs text-muted">{{ approvedCompletionCount }} of {{ completion.length }} approved so far</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink :to="trendsTabTo" class="block">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
              <div class="flex items-start gap-3">
                <UBadge variant="subtle" :color="trendBadge?.color || 'neutral'" size="xl" class="shrink-0 p-1.5"
                  :icon="loadingAcademicTrend ? 'i-lucide-loader-circle animate-spin' : 'i-lucide-line-chart'" />
                <div class="min-w-0">
                  <p class="text-xs text-muted">Performance trend</p>
                  <p class="truncate font-semibold">{{ trendBadge?.text || 'Not enough data yet' }}</p>
                  <p class="truncate text-xs text-muted">Across this term's assessments so far</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink v-if="!filters.classId && classes.length" :to="classesTabTo" class="block">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
              <div class="flex items-start gap-3">
                <UBadge variant="subtle" color="primary" size="xl" class="shrink-0 p-1.5" icon="i-lucide-list" />
                <div class="min-w-0">
                  <p class="text-xs text-muted">Classes reported on</p>
                  <p class="truncate font-semibold">{{ classes.length }} classes compared</p>
                  <p class="truncate text-xs text-muted">Open the Classes tab to compare them side by side</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const reportStore = useAcademicReportStore()
const { filters, terms, classOptions, subjectOptions, levelOptions, queryString, apiFilters, ensureLoaded,
  classStore, subjectStore } = useAcademicReportFilters()

const { report, loadingReport, attention, loadingAttention, completion, loadingCompletion,
  academicTrend, loadingAcademicTrend } = storeToRefs(reportStore)

const overview = computed(() => report.value?.overview || null)

// Says which pass mark the pass rate (and "Needs Support") was measured against - each class's own
// assessment template pass mark. A single number when the report covers classes that share it.
const passMarkNote = computed(() => {
  if (!overview.value) return undefined
  return overview.value.passMark != null
    ? `Pass mark: ${overview.value.passMark}%`
    : 'Pass marks differ by class'
})
const classes = computed(() => report.value?.classes || [])
const subjects = computed(() => report.value?.subjects || [])

// Lowest-average class/subject - the ones a principal would actually want flagged, not just a list.
const weakestClass = computed(() => classes.value.length
  ? [...classes.value].sort((a, b) => a.averageScore - b.averageScore)[0]
  : null)
const weakestSubject = computed(() => subjects.value.length
  ? [...subjects.value].sort((a, b) => a.averageScore - b.averageScore)[0]
  : null)

const pendingCompletionCount = computed(() =>
  completion.value.filter(c => c.status === 'SUBMITTED' || c.status === 'RETURNED').length)
const approvedCompletionCount = computed(() =>
  completion.value.filter(c => c.status === 'APPROVED' || c.status === 'COMPLETED').length)

const trendLabelMap: Record<string, { text: string, color: 'success' | 'error' | 'neutral' | 'warning' }> = {
  IMPROVING: { text: 'Improving', color: 'success' },
  DECLINING: { text: 'Declining', color: 'error' },
  STABLE: { text: 'Stable', color: 'neutral' },
  INSUFFICIENT_DATA: { text: 'Not enough data yet', color: 'warning' }
}
const trendBadge = computed(() => academicTrend.value ? trendLabelMap[academicTrend.value.trend] : null)

const classesTabTo = computed(() => `/analytics/academic-reports/classes?${queryString.value}`)
const subjectsTabTo = computed(() => `/analytics/academic-reports/subjects?${queryString.value}`)
const attentionTabTo = computed(() => `/analytics/academic-reports/attention?${queryString.value}`)
const completionTabTo = computed(() => `/analytics/academic-reports/completion?${queryString.value}`)
const trendsTabTo = computed(() => `/analytics/academic-reports/trends?${queryString.value}`)

async function loadReport() {
  if (!filters.termId) return
  await Promise.all([
    reportStore.fetchReport({ ...apiFilters.value, page: 1, size: 1 }),
    reportStore.fetchStudentsRequiringAttention(apiFilters.value),
    reportStore.fetchCompletionReport(apiFilters.value),
    reportStore.fetchAcademicTrend(apiFilters.value)
  ])
}

watch(apiFilters, loadReport)

onMounted(async () => {
  useAppStore().setTitle('Academic Reports')
  document.title = 'Academic Reports | Skultem'
  await ensureLoaded()
  await loadReport()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
