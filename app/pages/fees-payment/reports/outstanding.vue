<template>
  <div class="space-y-4 px-4 md:px-6">
    <FeeReportSectionNav />

    <Heading title="Outstanding Fees" subtitle="A focused view of money still owed to the school.">
      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        :disabled="!report" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Academic Year">
          <USelectMenu v-model="filters.academicYearId" :items="academicYears" value-key="value" label-key="label"
            placeholder="Active year" class="w-full" />
        </UFormField>
        <UFormField label="Term">
          <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label" clear
            placeholder="Whole year" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <template v-else-if="report && report.totalOutstanding > 0">
      <div id="outstanding-fees-preview" class="rounded-lg bg-white text-gray-900 px-2">
        <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Outstanding Fees Report</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span>Term: {{ termLabel }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Total Outstanding</p>
            <p class="text-lg font-bold text-primary-600">{{ format(report.totalOutstanding) }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Students With Outstanding</p>
            <p class="text-lg font-bold text-primary-600">{{ report.studentsWithOutstanding }}</p>
          </div>
        </div>

        <FeeReportInsightSection title="Key Insights"
          :items="insights.map((text) => ({ text, color: 'warning' }))" />

        <p class="mb-2 text-sm font-semibold text-gray-700">Outstanding by Class</p>
        <div class="mb-6 overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Outstanding</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Students</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in report.byClass" :key="c.classSessionId || c.className">
                <td class="border border-gray-200 p-2.5">{{ c.className }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold text-red-600">{{ format(c.outstanding) }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.studentsWithOutstanding }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mb-2 text-sm font-semibold text-gray-700">Outstanding by Fee Type</p>
        <div class="mb-6 overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Fee Type</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Outstanding</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Students</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in report.byFeeType" :key="f.feeCategoryId">
                <td class="border border-gray-200 p-2.5">{{ f.feeCategoryName }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold text-red-600">{{ format(f.outstanding) }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ f.studentsWithOutstanding }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mb-2 text-sm font-semibold text-gray-700">Top Students by Outstanding Balance</p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in report.topStudents" :key="s.studentId">
                <td class="border border-gray-200 p-2.5">{{ s.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ s.className }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold text-red-600">{{ format(s.balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-6 text-center text-[10px] uppercase tracking-widest text-gray-300">
          Generated by Skultem &middot; {{ generatedDate }}
        </p>
      </div>
    </template>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-check-circle" class="mb-3 size-10 text-success" />
        <p class="text-sm font-medium text-highlighted">No outstanding balances for this period.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const store = useFeeReportStore()
const { school } = useSchoolInfo()
const { format } = useMoney()
const { success, error: toastError } = useNotify()

const filters = reactive({
  academicYearId: '',
  termId: '',
})

const downloading = ref(false)

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))

const report = computed(() => store.outstanding)
const loading = computed(() => store.loading)

const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const termLabel = computed(() => terms.value.find(t => t.value === filters.termId)?.label || 'Whole Year')
const generatedDate = computed(() => new Date().toLocaleDateString())
const schoolName = computed(() => school.value?.name || 'Skultem')
const { logoSrc, loadLogo } = useReportLogo()

const insights = computed(() => {
  const r = report.value
  if (!r) return []
  const list: string[] = []
  if (r.studentsWithOutstanding > 0) {
    list.push(`${r.studentsWithOutstanding} student${r.studentsWithOutstanding === 1 ? '' : 's'} currently ${r.studentsWithOutstanding === 1 ? 'has' : 'have'} outstanding balances.`)
  }
  if (r.byClass.length) {
    const worst = r.byClass[0]
    list.push(`${worst.className} has the highest outstanding balance at ${format(worst.outstanding)}.`)
  }
  if (r.byFeeType.length) {
    const worst = r.byFeeType[0]
    list.push(`${worst.feeCategoryName} accounts for the largest share of outstanding fees, at ${format(worst.outstanding)}.`)
  }
  return list
})

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function loadReport() {
  await store.fetchOutstanding(filters.academicYearId || undefined, filters.termId || undefined)
}

async function downloadPdf() {
  if (!report.value) return
  downloading.value = true
  try {
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#outstanding-fees-preview', `outstanding-fees-${sanitizeFilename(termLabel.value)}`)
    success('Report downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

watch(() => [filters.academicYearId, filters.termId], loadReport)

onMounted(async () => {
  loadLogo() // not awaited - fetches in the background, doesn't block the report's own data

  useAppStore().setTitle('Outstanding Fees')
  document.title = 'Outstanding Fees | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  await loadReport()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
