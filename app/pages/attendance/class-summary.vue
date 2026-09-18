<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Class Summary" subtitle="Compare attendance across every class in the school at once.">
      <UButton icon="i-lucide-printer" variant="outline" color="neutral" class="justify-center"
        :disabled="!summary" @click="printSummary">
        Print
      </UButton>
      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        :disabled="!summary" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <UCard>
      <UFormField label="Term" class="max-w-xs">
        <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label"
          placeholder="All Terms" class="w-full" />
      </UFormField>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!summary || !summary.classes.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No attendance records found for this period.</p>
      </div>
    </UCard>

    <template v-else>
      <div id="class-summary-preview" class="rounded-lg bg-white text-gray-900 px-2">
        <div class="mb-4 border-b-4 border-primary-500 px-6 pb-5 pt-6 text-center sm:px-8 sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Class Attendance Summary</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span>Period: {{ summary.termLabel || 'All Terms' }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Classes</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.totalClasses }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Students</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.totalStudents }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">School Average</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.schoolAverageAttendance }}%</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Below {{ threshold }}%</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.classesBelowThreshold }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Boys Attendance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.presentBoys }} / {{ summary.totalBoys }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Girls Attendance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.presentGirls }} / {{ summary.totalGirls }}</p>
          </div>
        </div>

        <div>
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Students</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Boys</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Girls</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Present</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Absent</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Late</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in summary.classes" :key="`${c.classId}-${c.sectionId}-${c.streamId}`"
                :class="c.belowThreshold ? 'bg-red-50' : ''">
                <td class="border border-gray-200 p-2.5">{{ c.className }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.totalStudents }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.totalBoys }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.totalGirls }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.present }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.absent }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.late }}</td>
                <td class="border border-gray-200 p-2.5 text-center font-semibold"
                  :class="c.belowThreshold ? 'text-red-600' : 'text-gray-700'">
                  {{ c.attendancePercentage != null ? `${c.attendancePercentage}%` : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-6 text-center text-[10px] uppercase tracking-widest text-gray-300">
          Generated by Skultem &middot; {{ generatedDate }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const attendanceStore = useAttendanceStore()
const { school } = useSchoolInfo()
const { threshold } = useAttendanceThreshold()

const ALL_TERMS_VALUE = 'ALL'

const filters = reactive({
  academicYearId: '',
  termId: ALL_TERMS_VALUE
})

const downloading = ref(false)
const { success, error: toastError } = useNotify()

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => [
  { label: 'All Terms', value: ALL_TERMS_VALUE },
  ...termStore.records.map(t => ({ label: t.name, value: t.id }))
])

const summary = computed(() => attendanceStore.classSummary)
const loading = computed(() => attendanceStore.loadingClassSummary)

const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const generatedDate = computed(() => new Date().toLocaleDateString())
const schoolName = computed(() => school.value?.name || 'Skultem')
const logoSrc = ref('')

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function loadSummary() {
  const termId = filters.termId === ALL_TERMS_VALUE ? undefined : filters.termId
  await attendanceStore.fetchClassSummary(filters.academicYearId || undefined, termId)
}

function printSummary() {
  window.print()
}

async function downloadPdf() {
  if (!summary.value) return
  downloading.value = true
  try {
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#class-summary-preview', `class-summary-${sanitizeFilename(summary.value.termLabel || 'all-terms')}`)
    success('Summary downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

watch(() => filters.termId, loadSummary)

onMounted(async () => {
  useAppStore().setTitle('Class Summary')
  document.title = 'Class Summary | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  const active = await termStore.getActive()
  filters.termId = active?.id || ALL_TERMS_VALUE

  await loadSummary()

  const assets = await SchoolApi().getBrandingAssets()
  logoSrc.value = assets?.logo || school.value?.logo || ''
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
