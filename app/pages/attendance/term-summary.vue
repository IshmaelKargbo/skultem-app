<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Term Summary" subtitle="Attendance performance for every student in a class over a full term.">
      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        :disabled="!summary" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-3">
        <UFormField label="Academic Year">
          <USelectMenu v-model="filters.academicYearId" :items="academicYears" value-key="value" label-key="label"
            placeholder="Active year" class="w-full" />
        </UFormField>

        <UFormField label="Term">
          <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label"
            placeholder="Select term" class="w-full" />
        </UFormField>

        <UFormField label="Class">
          <USelectMenu v-model="filters.classSessionId" :items="classSessions" :loading="loadingClasses"
            value-key="value" label-key="label" placeholder="Select class" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!filters.classSessionId || !filters.termId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Select a class and term</p>
      </div>
    </UCard>

    <UCard v-else-if="!summary || !summary.students.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No attendance records found for this period.</p>
      </div>
    </UCard>

    <template v-else>
      <div id="term-summary-preview" class="rounded-lg bg-white text-gray-900 px-2">
        <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Term Attendance Summary</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span>Term: {{ termLabel }}</span>
            <span>Class: {{ classLabel }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Students</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.totalStudents }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Avg. Attendance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.averageAttendance }}%</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Below {{ threshold }}%</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.studentsBelowThreshold }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Present</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.totalPresent }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Absent</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.totalAbsent }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Late</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.totalLate }}</p>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Boys Attendance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.presentBoys }} / {{ summary.totalBoys }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Girls Attendance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.presentGirls }} / {{ summary.totalGirls }}</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">School Days</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Present</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Absent</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Late</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in summary.students" :key="s.studentId" :class="s.belowThreshold ? 'bg-red-50' : ''">
                <td class="border border-gray-200 p-2.5">{{ s.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ s.className }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ s.schoolDays }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ s.present }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ s.absent }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ s.late }}</td>
                <td class="border border-gray-200 p-2.5 text-center font-semibold"
                  :class="s.belowThreshold ? 'text-red-600' : 'text-gray-700'">
                  {{ s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—' }}
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
const classSessionStore = useClassSessionStore()
const attendanceStore = useAttendanceStore()
const { school } = useSchoolInfo()
const { threshold } = useAttendanceThreshold()

const filters = reactive({
  academicYearId: '',
  termId: '',
  classSessionId: ''
})

const downloading = ref(false)
const loadingClasses = ref(false)
const localClassSessions = ref<ClassSession[]>([])
const { success, error: toastError } = useNotify()

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
// Class sessions, not plain classes - "SSS 1 Science" and "SSS 1 Art" are different sessions of
// the same class, matching the Daily Register class dropdown exactly.
const classSessions = computed(() => localClassSessions.value.map(e => {
  let label = `${e.clazz} (${e.sectionName})`
  if (e.streamName !== 'N/A') label += ` - ${e.streamName}`
  return { label, value: e.id }
}))

const summary = computed(() => attendanceStore.termSummary)
const loading = computed(() => attendanceStore.loadingTermSummary)

const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const termLabel = computed(() => terms.value.find(t => t.value === filters.termId)?.label || '—')
const classLabel = computed(() => classSessions.value.find(c => c.value === filters.classSessionId)?.label || '—')
const generatedDate = computed(() => new Date().toLocaleDateString())
const schoolName = computed(() => school.value?.name || 'Skultem')
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function loadClasses() {
  loadingClasses.value = true
  try {
    await classSessionStore.fetchAll(1, 200, filters.academicYearId || undefined)
    localClassSessions.value = classSessionStore.records
    if (!filters.classSessionId) filters.classSessionId = localClassSessions.value[0]?.id || ''
  } finally {
    loadingClasses.value = false
  }
}

async function loadSummary() {
  if (!filters.classSessionId || !filters.termId) return
  await attendanceStore.fetchTermSummary(filters.classSessionId, filters.termId)
}

async function downloadPdf() {
  if (!summary.value) return
  downloading.value = true
  try {
    await logoReady() // the print-safe logo must be in before the PDF is drawn
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#term-summary-preview', `term-summary-${sanitizeFilename(termLabel.value)}`)
    success('Summary downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

watch(() => [filters.classSessionId, filters.termId], loadSummary)
watch(() => filters.academicYearId, loadClasses)

watch(() => filters.classSessionId, id => loadLogo(localClassSessions.value.find(c => c.id === id)?.classLevel ?? null)) // that class's section logo

onMounted(async () => {
  loadLogo() // not awaited - fetches in the background, doesn't block the report's own data

  useAppStore().setTitle('Term Summary')
  document.title = 'Term Summary | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  const active = await termStore.getActive()
  filters.termId = active?.id || termStore.records[0]?.id || ''

  await loadClasses()
  await loadSummary()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
