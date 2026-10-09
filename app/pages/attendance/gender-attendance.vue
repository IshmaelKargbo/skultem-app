<template>
  <div class="space-y-4 px-4 md:px-6">
    <UCard>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UButton v-for="p in periods" :key="p.value" :label="p.label" size="sm"
            :variant="filters.period === p.value ? 'solid' : 'outline'" @click="filters.period = p.value" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField v-if="filters.period === 'WEEK'" label="Week of">
            <UInput v-model="filters.date" type="date" class="w-full" />
          </UFormField>

          <UFormField v-else-if="filters.period === 'MONTH'" label="Month">
            <UInput v-model="filters.month" type="month" class="w-full" />
          </UFormField>

          <UFormField v-else-if="filters.period === 'TERM'" label="Term">
            <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label"
              placeholder="Select term" class="w-full" />
          </UFormField>

          <UFormField label="Class">
            <USelectMenu v-model="filters.classId" :items="classes" :loading="classStore.loading" value-key="value"
              label-key="label" class="w-full" />
          </UFormField>
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
            <h2 class="font-semibold">{{ filters.classId === ALL ? 'Every class' : summary.classes[0]?.className }}</h2>
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
              <tr v-for="c in sortedClasses" :key="c.classId">
                <td class="border border-default p-2.5">{{ c.className }}</td>
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
    <template v-if="filters.period === 'WEEK' && filters.classId !== ALL">
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
const ALL = '__all'

const academicYearStore = useAcademicYearStore()
const classStore = useClassStore()
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

const filters = reactive({
  period: 'WEEK' as 'WEEK' | 'MONTH' | 'TERM' | 'YEAR',
  academicYearId: '',
  classId: ALL,
  date: today,
  month: today.slice(0, 7),
  termId: ''
})

const academicYears = computed(() => academicYearStore.list)
const classes = computed(() => [
  { label: 'All classes', value: ALL },
  ...classStore.records.map(c => ({ label: c.name, value: c.id }))
])
const terms = computed(() => termStore.records
  .filter(t => !filters.academicYearId || t.academicYear?.id === filters.academicYearId)
  .map(t => ({ label: t.name, value: t.id })))

// Highest overall attendance first.
const sortedClasses = computed(() => sortByDesc(summary.value?.classes, c => c.totals.overallAttendancePercentage))

const classIdParam = () => (filters.classId === ALL ? undefined : filters.classId)

async function loadReport() {
  if (filters.period === 'TERM' && !filters.termId) return

  await reportStore.fetchGenderAttendanceSummary({
    period: filters.period,
    academicYearId: filters.academicYearId || undefined,
    termId: filters.period === 'TERM' ? filters.termId : undefined,
    classId: classIdParam(),
    date: filters.period === 'MONTH' ? `${filters.month}-01` : filters.date || undefined
  })

  if (filters.period === 'WEEK' && filters.classId !== ALL) {
    await reportStore.fetchWeeklyGenderAttendance(filters.classId, {
      academicYearId: filters.academicYearId || undefined,
      weekOf: filters.date || undefined
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

watch(() => [filters.period, filters.classId, filters.date, filters.month, filters.termId, filters.academicYearId], loadReport)

// No year dropdown on this page: reports follow the header's year switcher (viewing year).
watch(() => academicYearStore.viewingYearId || academicYearStore.activeYear?.id || '', (id) => { filters.academicYearId = id })

onMounted(async () => {
  useAppStore().setTitle('Attendance by Gender')
  document.title = 'Attendance by Gender | Skultem'

  await Promise.all([academicYearStore.fetchAll(1, 100), classStore.fetchAll(1, 200), termStore.fetchAll(1, 100)])
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await loadReport()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
