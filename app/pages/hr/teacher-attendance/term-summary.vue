<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Term Summary" subtitle="Staff attendance performance for every teacher over a full term.">
      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        :disabled="!summary" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <HrSectionNav />

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Term">
          <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label"
            placeholder="Select term" class="w-full" />
        </UFormField>
        <UFormField label="Teacher (optional)">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search teacher..." class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!filters.termId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Select a term</p>
      </div>
    </UCard>

    <UCard v-else-if="!summary || !filteredTeachers.length">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No attendance records found for this period.</p>
      </div>
    </UCard>

    <template v-else>
      <div id="teacher-term-summary-preview" class="rounded-lg bg-white text-gray-900 px-2">
        <div class="mb-4 border-b-4 border-primary-500 px-6 pb-5 pt-6 text-center sm:px-8 sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Staff Term Attendance Summary</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Term: {{ summary.termLabel }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div class="rounded-xl bg-gray-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Teachers</p>
            <p class="text-lg font-bold text-gray-700">{{ summary.totalTeachers }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Avg. Attendance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.averageAttendance }}%</p>
          </div>
          <div class="rounded-xl bg-green-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Present</p>
            <p class="text-lg font-bold text-green-600">{{ summary.totalPresent }}</p>
          </div>
          <div class="rounded-xl bg-red-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Absent</p>
            <p class="text-lg font-bold text-red-600">{{ summary.totalAbsent }}</p>
          </div>
          <div class="rounded-xl bg-amber-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Late</p>
            <p class="text-lg font-bold text-amber-600">{{ summary.totalLate }}</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Teacher</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Working Days</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Present</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Absent</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Late</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in filteredTeachers" :key="t.teacherId">
                <td class="border border-gray-200 p-2.5">{{ t.teacherName }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ t.workingDays }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ t.present }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ t.absent }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ t.late }}</td>
                <td class="border border-gray-200 p-2.5 text-center font-semibold text-gray-700">
                  {{ t.attendancePercentage != null ? `${t.attendancePercentage}%` : '—' }}
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
const termStore = useTermStore()
const teacherAttendanceStore = useTeacherAttendanceStore()
const { school } = useSchoolInfo()

const filters = reactive({
  termId: ''
})

const search = ref('')
const downloading = ref(false)
const { success, error: toastError } = useNotify()

const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))

const summary = computed(() => teacherAttendanceStore.termSummary)
const loading = computed(() => teacherAttendanceStore.loadingTermSummary)

const filteredTeachers = computed(() => {
  const teachers = summary.value?.teachers || []
  if (!search.value.trim()) return teachers

  const query = search.value.trim().toLowerCase()
  return teachers.filter(t => t.teacherName.toLowerCase().includes(query))
})

const generatedDate = computed(() => new Date().toLocaleDateString())
const schoolName = computed(() => school.value?.name || 'Skultem')
const logoSrc = ref('')

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function loadSummary() {
  if (!filters.termId) return
  await teacherAttendanceStore.fetchTermSummary(filters.termId)
}

function printSummary() {
  window.print()
}

async function downloadPdf() {
  if (!summary.value) return
  downloading.value = true
  try {
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#teacher-term-summary-preview', `teacher-term-summary-${sanitizeFilename(summary.value.termLabel)}`)
    success('Summary downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

watch(() => filters.termId, loadSummary)

onMounted(async () => {
  useAppStore().setTitle('Human Resource')
  useAppStore().setBack('/hr')
  document.title = 'Term Summary | HR | Skultem'

  await termStore.fetchAll(1, 100)
  const active = await termStore.getActive()
  filters.termId = active?.id || ''

  await loadSummary()

  const assets = await SchoolApi().getBrandingAssets()
  logoSrc.value = assets?.logo || school.value?.logo || ''
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
