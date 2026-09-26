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
      <UAlert color="info" variant="subtle" icon="i-lucide-info" title="Early warning from classwork"
        description="Students Requiring Attention only sees an assessment once it is submitted. This reads the CA recordings as they are made, so a low or falling classwork average shows up while there is still time to help." />

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Metric :record="{ label: 'CA assessments', value: report?.summary.assessments ?? 0, isReady: !loading, icon: 'i-lucide-list-checks', color: 'primary' }" />
        <Metric :record="{ label: 'Fully recorded', value: report?.summary.fullyRecorded ?? 0, subtle: report ? `${report.summary.inProgress} still recording` : undefined, isReady: !loading, icon: 'i-lucide-check-circle', color: 'success' }" />
        <Metric :record="{ label: 'Class CA average', value: report?.summary.averageCa != null ? `${report.summary.averageCa}%` : '—', isReady: !loading, icon: 'i-lucide-percent', color: 'info' }" />
        <Metric :record="{ label: 'Class test average', value: report?.summary.averageFormal != null ? `${report.summary.averageFormal}%` : '—', isReady: !loading, icon: 'i-lucide-percent', color: 'info' }" />
        <Metric :record="{ label: 'Worth a look', value: report?.summary.flagged ?? 0, subtle: 'students flagged', isReady: !loading, icon: 'i-lucide-life-buoy', color: 'warning' }" />
      </div>

      <UCard v-if="!loading && report && !report.summary.assessments">
        <div class="py-10 text-center text-sm text-muted">
          No continuous-assessment tests for this selection yet. They appear here once a section set to CA + formal
          test has assessments open.
        </div>
      </UCard>

      <template v-else>
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="font-semibold">Students to look at</h2>
          </template>

          <div v-if="loading" class="space-y-3 p-4">
            <USkeleton v-for="i in 3" :key="i" class="h-14 w-full rounded-xl" />
          </div>
          <div v-else-if="!report?.students.length" class="py-10 text-center text-sm text-muted">
            Nobody is flagged from the classwork right now.
          </div>
          <div v-else>
            <div v-for="(s, i) in report.students" :key="`${studentPage}-${i}`" class="border-b border-default p-4 last:border-0">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-medium text-highlighted">{{ s.student }}</p>
                  <p class="text-xs text-muted">{{ s.clazz }} · {{ s.subject }} · {{ s.assessment }}</p>
                </div>
                <div class="flex items-center gap-3 text-xs text-muted">
                  <span>CA <span class="font-semibold text-highlighted">{{ s.caAverage ?? '-' }}{{ s.caAverage != null ? '%' : '' }}</span></span>
                  <span>Test <span class="font-semibold text-highlighted">{{ s.formalScore ?? '-' }}{{ s.formalScore != null ? '%' : '' }}</span></span>
                  <span>{{ s.recordings.map(v => v ?? '-').join(' · ') }}</span>
                </div>
              </div>
              <div class="mt-1.5 flex flex-wrap gap-2">
                <UBadge v-for="r in s.reasons" :key="r" size="sm" variant="subtle"
                  :color="r.includes('trending down') ? 'warning' : 'error'">{{ r }}</UBadge>
              </div>
            </div>
          </div>
          <template v-if="report?.students.length" #footer>
            <div class="flex items-center justify-between gap-2">
              <Showing :meta="studentMeta" />
              <UPagination v-model:page="studentPage" size="sm" :page-size="studentPageSize"
                :items-per-page="studentPageSize" :total="report?.studentsTotal ?? 0" show-edges />
            </div>
          </template>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="font-semibold">Progress by assessment</h2>
          </template>
          <!-- Phone: a card per assessment instead of the sideways table. -->
          <div class="md:hidden">
            <div v-for="a in report?.assessments" :key="a.cycleId" class="space-y-2 border-b border-default p-4 last:border-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">{{ a.clazz }} · {{ a.subject }}</p>
                  <p class="truncate text-xs text-muted">{{ a.assessment }} · {{ a.teacher }}</p>
                </div>
                <UBadge size="sm" variant="subtle" color="neutral">{{ clean(a.status) }}</UBadge>
              </div>
              <div class="flex items-center gap-2">
                <UProgress :model-value="a.recordedPercent" size="sm" class="flex-1"
                  :color="a.recordedPercent === 100 ? 'success' : 'warning'" />
                <span class="text-xs text-muted">{{ a.recordedPercent }}% recorded</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div><p class="text-muted">CA avg</p><p class="font-semibold text-highlighted">{{ a.averageCa != null ? `${a.averageCa}%` : '-' }}</p></div>
                <div><p class="text-muted">Test avg</p><p class="font-semibold text-highlighted">{{ a.averageFormal != null ? `${a.averageFormal}%` : '-' }}</p></div>
                <div><p class="text-muted">Trend</p><p class="font-semibold"><span class="text-success">{{ a.improving }} up</span> · <span class="text-error">{{ a.declining }} down</span></p></div>
              </div>
              <p class="text-xs text-muted">{{ a.caSubmitted ? 'CA submitted' : `${a.lockedWeeks}/${a.expectedWeeks} weeks locked` }}</p>
            </div>
          </div>

          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-max text-sm">
              <thead>
                <tr class="text-left text-[11px] uppercase tracking-wide text-muted">
                  <th class="px-4 py-2">Class</th>
                  <th class="px-4 py-2">Subject</th>
                  <th class="px-4 py-2">Teacher</th>
                  <th class="px-4 py-2">Recording</th>
                  <th class="px-4 py-2">Locked</th>
                  <th class="px-4 py-2 text-right">CA avg</th>
                  <th class="px-4 py-2 text-right">Test avg</th>
                  <th class="px-4 py-2 text-right">Trend</th>
                  <th class="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in report?.assessments" :key="a.cycleId" class="border-t border-default">
                  <td class="px-4 py-2.5 font-medium">{{ a.clazz }}</td>
                  <td class="px-4 py-2.5">{{ a.subject }} <span class="text-muted">· {{ a.assessment }}</span></td>
                  <td class="px-4 py-2.5 text-muted">{{ a.teacher }}</td>
                  <td class="px-4 py-2.5">
                    <div class="flex items-center gap-2">
                      <UProgress :model-value="a.recordedPercent" size="sm" class="w-24"
                        :color="a.recordedPercent === 100 ? 'success' : 'warning'" />
                      <span class="text-xs text-muted">{{ a.recordedPercent }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-2.5 text-xs text-muted">
                    {{ a.caSubmitted ? 'CA submitted' : `${a.lockedWeeks}/${a.expectedWeeks} weeks` }}
                  </td>
                  <td class="px-4 py-2.5 text-right">{{ a.averageCa != null ? `${a.averageCa}%` : '-' }}</td>
                  <td class="px-4 py-2.5 text-right">{{ a.averageFormal != null ? `${a.averageFormal}%` : '-' }}</td>
                  <td class="px-4 py-2.5 text-right text-xs">
                    <span class="text-success">{{ a.improving }} up</span> ·
                    <span class="text-error">{{ a.declining }} down</span>
                  </td>
                  <td class="px-4 py-2.5"><UBadge size="sm" variant="subtle" color="neutral">{{ clean(a.status) }}</UBadge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { filters, terms, classOptions, subjectOptions, levelOptions, queryString, apiFilters, ensureLoaded,
  classStore, subjectStore } = useAcademicReportFilters()

const loading = ref(false)
const report = ref<any>(null)
const studentPage = ref(1)
const studentPageSize = 10
const studentMeta = computed(() => useMeta({
  page: report.value?.page ?? 1,
  size: report.value?.size ?? studentPageSize,
  count: report.value?.studentsTotal ?? 0
}))

async function load() {
  if (!filters.termId) return
  loading.value = true
  try {
    report.value = await AcademicReportApi().getContinuousAssessmentReport({
      termId: filters.termId, classId: apiFilters.value.classId, level: apiFilters.value.level,
      page: studentPage.value, size: studentPageSize
    })
  } finally {
    loading.value = false
  }
}

// A new selection starts again from the first page; turning the page reloads just that.
watch(apiFilters, () => {
  studentPage.value = 1
  load()
})
watch(studentPage, load)

onMounted(async () => {
  useAppStore().setTitle('CA + Test Report')
  document.title = 'CA + Test Report | Skultem'
  await ensureLoaded()
  await load()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
