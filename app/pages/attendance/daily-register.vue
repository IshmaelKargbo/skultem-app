<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Daily Register"
      subtitle="View, print or export the attendance register for a class on a specific date.">
      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        :disabled="!register" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UFormField label="Academic Year">
          <USelectMenu v-model="filters.academicYearId" :items="academicYears" value-key="value" label-key="label"
            placeholder="Active year" class="w-full" />
        </UFormField>

        <UFormField label="Term">
          <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label"
            placeholder="Select term" class="w-full" />
        </UFormField>

        <UFormField label="Date">
          <UInput v-model="filters.date" type="date" class="w-full" />
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

    <UCard v-else-if="!filters.classSessionId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-clipboard-list" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Select a class and date</p>
        <p class="mt-1 max-w-sm text-xs text-muted">Choose a class above to view its attendance register.</p>
      </div>
    </UCard>

    <UCard v-else-if="!register || register.totalStudents === 0">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No attendance records found for this period.</p>
      </div>
    </UCard>

    <template v-else>
      <div id="daily-register-preview" class="rounded-lg bg-white text-gray-900 px-2">
        <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Daily Attendance Register</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span>Term: {{ termLabel }}</span>
            <span>Date: {{ formattedDate }}</span>
            <span>Class: {{ classLabel }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Present</p>
            <p class="text-xl font-bold text-primary-600">{{ register.presentCount }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Absent</p>
            <p class="text-xl font-bold text-primary-600">{{ absentTotal }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Late</p>
            <p class="text-xl font-bold text-primary-600">{{ register.lateCount }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Students</p>
            <p class="text-xl font-bold text-primary-600">{{ register.totalStudents }}</p>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Boys Present</p>
            <p class="text-lg font-bold text-primary-600">{{ register.presentBoys }} / {{ register.totalBoys }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Girls Present</p>
            <p class="text-lg font-bold text-primary-600">{{ register.presentGirls }} / {{ register.totalGirls }}</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Status</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Recorded By</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in register.records" :key="r.enrollmentId">
                <td class="border border-gray-200 p-2.5">{{ r.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ classLabel }}</td>
                <td class="border border-gray-200 p-2.5 font-semibold" :style="{ color: statusColor(r) }">
                  {{ statusLabel(r) }}
                </td>
                <td class="border border-gray-200 p-2.5">{{ r.recordedBy || '—' }}</td>
                <td class="border border-gray-200 p-2.5">{{ clockTime(r.recordedAt) }}</td>
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
const { can } = useAuth()
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const classSessionStore = useClassSessionStore()
const attendanceStore = useAttendanceStore()
const { school } = useSchoolInfo()

const filters = reactive({
  academicYearId: '',
  termId: '',
  date: todayISO(),
  classSessionId: ''
})

const loadingClasses = ref(false)
const localClassSessions = ref<ClassSession[]>([])
const downloading = ref(false)

const { success, error: toastError } = useNotify()

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const classSessions = computed(() => localClassSessions.value.map(e => {
  let label = `${e.clazz} (${e.sectionName})`
  if (e.streamName !== 'N/A') label += ` - ${e.streamName}`
  return { label, value: e.id }
}))

const register = computed(() => attendanceStore.dailyRegister)
const loading = computed(() => attendanceStore.loadingDailyRegister)

const absentTotal = computed(() => register.value ? register.value.absentCount + register.value.excusedCount : 0)

const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const termLabel = computed(() => terms.value.find(t => t.value === filters.termId)?.label || '—')
const classLabel = computed(() => classSessions.value.find(c => c.value === filters.classSessionId)?.label || '—')
const formattedDate = computed(() => filters.date
  ? new Date(filters.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  : '—')
const generatedDate = computed(() => new Date().toLocaleDateString())
const schoolName = computed(() => school.value?.name || 'Skultem')
const logoSrc = computed(() => school.value?.logo || '')

function todayISO() {
  return new Date().toISOString().split('T')[0] as string
}

function statusLabel(r: DailyAttendanceRegisterRecord) {
  if (!r.marked) return 'Not Marked'
  if (r.present && r.late) return 'Late'
  if (r.present) return 'Present'
  if (r.excused) return 'Excused'
  return 'Absent'
}

// Plain colored text, not a pill/badge - rounded-corner backgrounds at this size get mangled by
// html2canvas's capture (the padding visibly collapses in the exported PDF), same reason
// report-cards/[id].vue colors its grade column with a style binding instead of a badge.
function statusColor(r: DailyAttendanceRegisterRecord) {
  const label = statusLabel(r)
  return {
    Present: '#15803d',
    Late: '#b45309',
    Excused: '#1d4ed8',
    Absent: '#b91c1c',
    'Not Marked': '#4b5563'
  }[label]
}

function clockTime(value: string | null) {
  return value ? formatTime(value) : '—'
}

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function loadClasses() {
  loadingClasses.value = true
  try {
    if (can(Role.TEACHER) && !can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR])) {
      localClassSessions.value = await classSessionStore.fetchAllMe() || []
    } else {
      await classSessionStore.fetchAll(1, 200, filters.academicYearId || undefined)
      localClassSessions.value = classSessionStore.records
    }

    if (!filters.classSessionId) {
      filters.classSessionId = localClassSessions.value[0]?.id || ''
    }
  } finally {
    loadingClasses.value = false
  }
}

async function loadRegister() {
  if (!filters.classSessionId || !filters.date) return
  await attendanceStore.fetchDailyRegister(filters.classSessionId, filters.date)
}

function printRegister() {
  window.print()
}

async function downloadPdf() {
  if (!register.value) return
  downloading.value = true
  try {
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#daily-register-preview', `daily-register-${sanitizeFilename(filters.date)}`)
    success('Register downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

watch(() => [filters.classSessionId, filters.date], loadRegister)
watch(() => filters.academicYearId, loadClasses)

onMounted(async () => {
  useAppStore().setTitle('Daily Register')
  document.title = 'Daily Register | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  const active = await termStore.getActive()
  filters.termId = active?.id || termStore.records[0]?.id || ''

  await loadClasses()
  await loadRegister()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER]
})
</script>
