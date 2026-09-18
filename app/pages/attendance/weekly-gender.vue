<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Weekly Attendance by Gender" subtitle="Boys/girls attendance for a class, one week at a time." />

    <UCard>
      <div class="grid gap-4 sm:grid-cols-3">
        <UFormField label="Academic Year">
          <USelectMenu v-model="filters.academicYearId" :items="academicYears" value-key="value" label-key="label"
            class="w-full" />
        </UFormField>

        <UFormField label="Class">
          <USelectMenu v-model="filters.classId" :items="classes" :loading="classStore.loading" value-key="value"
            label-key="label" placeholder="Select class" class="w-full" />
        </UFormField>

        <UFormField label="Week of">
          <UInput v-model="filters.weekOf" type="date" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 5" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!filters.classId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Select a class</p>
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
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const classStore = useClassStore()
const reportStore = useAcademicReportStore()

const { weeklyGenderAttendance: report, loadingWeeklyGenderAttendance: loading } = storeToRefs(reportStore)

const filters = reactive({
  academicYearId: '',
  classId: '',
  weekOf: new Date().toISOString().slice(0, 10)
})

const academicYears = computed(() => academicYearStore.list)
const classes = computed(() => classStore.records.map(c => ({ label: c.name, value: c.id })))

async function loadReport() {
  if (!filters.classId) return
  await reportStore.fetchWeeklyGenderAttendance(filters.classId, {
    academicYearId: filters.academicYearId || undefined,
    weekOf: filters.weekOf || undefined
  })
}

watch(() => [filters.classId, filters.weekOf, filters.academicYearId], loadReport)

onMounted(async () => {
  useAppStore().setTitle('Weekly Attendance by Gender')
  document.title = 'Weekly Attendance by Gender | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await classStore.fetchAll(1, 200)
  filters.classId = classStore.records[0]?.id || ''

  await loadReport()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
