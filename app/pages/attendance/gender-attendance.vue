<template>
  <div class="space-y-3 px-4 md:px-6">
    <!-- Toolbar in the Classes page style: period + date stay visible, the rest is in the filter drawer -->
    <UCard :ui="{ body: 'px-4 py-3 sm:px-4 sm:py-3' }">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <UButton v-for="p in periods" :key="p.value" :label="p.label" size="sm"
            :variant="filters.period === p.value ? 'solid' : 'outline'" @click="filters.period = p.value" />
        </div>

        <div class="flex items-center gap-2">
          <UInput v-if="filters.period === 'WEEK'" v-model="filters.date" type="date" aria-label="Week of"
            class="flex-1 md:w-44 md:flex-none" />
          <UInput v-else-if="filters.period === 'MONTH'" v-model="filters.month" type="month" aria-label="Month"
            class="flex-1 md:w-44 md:flex-none" />
          <USelectMenu v-else-if="filters.period === 'TERM'" v-model="filters.termId" :items="terms" value-key="value"
            label-key="label" placeholder="Select term" class="flex-1 md:w-44 md:flex-none" />
          <div v-else class="flex-1" />

          <AttendanceGenderFilterDrawer v-model:level="filters.level" v-model:class-id="filters.classId"
            v-model:section-id="filters.sectionId" v-model:stream-id="filters.streamId" :classes="classStore.records"
            :section-options="sectionOptions" :stream-options="streamOptions" :active-count="activeFilterCount" />
        </div>
      </div>
    </UCard>

    <UCard v-if="loadingSummary">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 5" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!summary || !summary.classes.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No attendance records found for this period.</p>
      </div>
    </UCard>

    <template v-else>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric :record="{ label: 'Boys Present', value: summary.totals.boysPresent, isReady: true, icon: 'i-lucide-user', color: 'info' }" />
        <Metric :record="{ label: 'Girls Present', value: summary.totals.girlsPresent, isReady: true, icon: 'i-lucide-user', color: 'primary' }" />
        <Metric :record="{ label: 'Boys Attendance', value: `${summary.totals.boysAttendancePercentage}%`, isReady: true, icon: 'i-lucide-percent', color: 'info' }" />
        <Metric :record="{ label: 'Girls Attendance', value: `${summary.totals.girlsAttendancePercentage}%`, isReady: true, icon: 'i-lucide-percent', color: 'primary' }" />
      </div>

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">{{ scopeLabel }}</h2>
            <p class="text-sm text-muted">{{ summary.startDate }} – {{ summary.endDate }} · present = present or late, counted per student per day</p>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-elevated">
                <th class="border border-default p-2.5 text-left font-semibold">Class</th>
                <th class="border border-default p-2.5 text-center font-semibold">Boys Present</th>
                <th class="border border-default p-2.5 text-center font-semibold">Girls Present</th>
                <th class="border border-default p-2.5 text-center font-semibold">Total Present</th>
                <th class="border border-default p-2.5 text-center font-semibold">Boys %</th>
                <th class="border border-default p-2.5 text-center font-semibold">Girls %</th>
                <th class="border border-default p-2.5 text-center font-semibold">Overall</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in sortedClasses" :key="genderClassRowKey(c)">
                <td class="border border-default p-2.5">{{ genderClassRowLabel(c) }}</td>
                <td class="border border-default p-2.5 text-center">{{ c.totals.boysPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ c.totals.girlsPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ c.totals.boysPresent + c.totals.girlsPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ c.totals.boysAttendancePercentage }}%</td>
                <td class="border border-default p-2.5 text-center">{{ c.totals.girlsAttendancePercentage }}%</td>
                <td class="border border-default p-2.5 text-center font-semibold">{{ c.totals.overallAttendancePercentage }}%</td>
              </tr>
            </tbody>
            <tfoot v-if="summary.classes.length > 1">
              <tr class="bg-elevated font-semibold">
                <td class="border border-default p-2.5">All classes</td>
                <td class="border border-default p-2.5 text-center">{{ summary.totals.boysPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ summary.totals.girlsPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ summary.totals.boysPresent + summary.totals.girlsPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ summary.totals.boysAttendancePercentage }}%</td>
                <td class="border border-default p-2.5 text-center">{{ summary.totals.girlsAttendancePercentage }}%</td>
                <td class="border border-default p-2.5 text-center">{{ summary.totals.overallAttendancePercentage }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </UCard>
    </template>

    <!-- Day-by-day breakdown, only for a single class in week view -->
    <template v-if="filters.period === 'WEEK' && filters.classId">
    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 5" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!report">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No attendance records found for this week.</p>
      </div>
    </UCard>

    <template v-else>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric :record="{ label: 'Boys Enrolled', value: report.boysEnrolled, isReady: true, icon: 'i-lucide-user', color: 'info' }" />
        <Metric :record="{ label: 'Girls Enrolled', value: report.girlsEnrolled, isReady: true, icon: 'i-lucide-user', color: 'primary' }" />
        <Metric :record="{ label: 'Boys Attendance', value: `${report.boysAttendancePercentage}%`, isReady: true, icon: 'i-lucide-percent', color: 'info' }" />
        <Metric :record="{ label: 'Girls Attendance', value: `${report.girlsAttendancePercentage}%`, isReady: true, icon: 'i-lucide-percent', color: 'primary' }" />
      </div>

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">{{ report.className }}</h2>
            <p class="text-sm text-muted">Week: {{ report.weekStart }} – {{ report.weekEnd }}</p>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-elevated">
                <th class="border border-default p-2.5 text-left font-semibold">Day</th>
                <th class="border border-default p-2.5 text-center font-semibold">Boys Present</th>
                <th class="border border-default p-2.5 text-center font-semibold">Boys Absent</th>
                <th class="border border-default p-2.5 text-center font-semibold">Girls Present</th>
                <th class="border border-default p-2.5 text-center font-semibold">Girls Absent</th>
                <th class="border border-default p-2.5 text-center font-semibold">Overall</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in report.days" :key="day.date">
                <td class="border border-default p-2.5">{{ day.dayLabel }}</td>
                <td class="border border-default p-2.5 text-center">{{ day.boysPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ day.boysAbsent }}</td>
                <td class="border border-default p-2.5 text-center">{{ day.girlsPresent }}</td>
                <td class="border border-default p-2.5 text-center">{{ day.girlsAbsent }}</td>
                <td class="border border-default p-2.5 text-center font-semibold">
                  {{ day.overallAttendancePercentage }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
    </template>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const classStore = useClassStore()
const sectionStore = useSectionStore()
const streamStore = useStreamStore()
const termStore = useTermStore()
const reportStore = useAcademicReportStore()

const {
  weeklyGenderAttendance: report,
  loadingWeeklyGenderAttendance: loading,
  genderAttendanceSummary: summary,
  loadingGenderAttendanceSummary: loadingSummary
} = storeToRefs(reportStore)

const periods = [
  { label: 'Week', value: 'WEEK' },
  { label: 'Month', value: 'MONTH' },
  { label: 'Term', value: 'TERM' },
  { label: 'Year', value: 'YEAR' }
] as const

const today = new Date().toISOString().slice(0, 10)

// level/classId/sectionId/streamId: '' means all, as in the Classes page filter drawer.
const filters = reactive({
  period: 'WEEK' as 'WEEK' | 'MONTH' | 'TERM' | 'YEAR',
  academicYearId: '',
  level: '',
  classId: '',
  sectionId: '',
  streamId: '',
  date: today,
  month: today.slice(0, 7),
  termId: ''
})

const sectionOptions = computed(() => sectionStore.records.map(e => ({ label: e.name, value: e.id })))
const streamOptions = computed(() => streamStore.records.map(e => ({ label: e.name, value: e.id })))
const activeFilterCount = computed(() =>
  [filters.level, filters.classId, filters.sectionId, filters.streamId].filter(Boolean).length)

const terms = computed(() => termStore.records
  .filter(t => !filters.academicYearId || t.academicYear?.id === filters.academicYearId)
  .map(t => ({ label: t.name, value: t.id })))

// Title for the per-class card, e.g. "JSS 1 · A · Science" or "Every class".
const scopeLabel = computed(() => {
  const parts = [
    classStore.records.find(c => c.id === filters.classId)?.name,
    sectionStore.records.find(s => s.id === filters.sectionId)?.name,
    streamStore.records.find(s => s.id === filters.streamId)?.name
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Every class'
})

// Lowest class rank first (JSS 1 before JSS 2 ...), the order set on the Classes page. The sort is
// stable, so a class's section/stream rows keep the server's section order within it.
const sortedClasses = computed(() => {
  const rank = new Map(classStore.records.map(c => [c.id, c.levelOrder]))
  const of = (id: string) => rank.get(id) ?? Number.MAX_SAFE_INTEGER
  return [...(summary.value?.classes ?? [])].sort((a, b) => of(a.classId) - of(b.classId))
})

async function loadReport() {
  if (filters.period === 'TERM' && !filters.termId) return

  const scope = {
    sectionId: filters.sectionId || undefined,
    streamId: filters.streamId || undefined
  }

  await reportStore.fetchGenderAttendanceSummary({
    period: filters.period,
    academicYearId: filters.academicYearId || undefined,
    termId: filters.period === 'TERM' ? filters.termId : undefined,
    classId: filters.classId || undefined,
    level: filters.level || undefined,
    ...scope,
    date: filters.period === 'MONTH' ? `${filters.month}-01` : filters.date || undefined
  })

  if (filters.period === 'WEEK' && filters.classId) {
    await reportStore.fetchWeeklyGenderAttendance(filters.classId, {
      academicYearId: filters.academicYearId || undefined,
      weekOf: filters.date || undefined,
      ...scope
    })
  }
}

// Switching year invalidates the chosen term; pick that year's active (or first) term.
watch(() => filters.academicYearId, () => {
  if (!terms.value.some(t => t.value === filters.termId)) {
    const active = termStore.records.find(t => t.academicYear?.id === filters.academicYearId && t.status === 'ACTIVE')
    filters.termId = active?.id || terms.value[0]?.value || ''
  }
})

watch(() => [filters.period, filters.level, filters.classId, filters.sectionId, filters.streamId, filters.date,
  filters.month, filters.termId, filters.academicYearId], loadReport)

// No year dropdown on this page: reports follow the header's year switcher (viewing year).
watch(() => academicYearStore.viewingYearId || academicYearStore.activeYear?.id || '', (id) => { filters.academicYearId = id })

onMounted(async () => {
  useAppStore().setTitle('Attendance by Gender')
  document.title = 'Attendance by Gender | Skultem'

  await Promise.all([
    academicYearStore.fetchAll(1, 100),
    classStore.fetchAll(1, 200),
    termStore.fetchAll(1, 100),
    sectionStore.fetchAll(0, 0),
    streamStore.fetchAll(0, 0)
  ])
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await loadReport()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
