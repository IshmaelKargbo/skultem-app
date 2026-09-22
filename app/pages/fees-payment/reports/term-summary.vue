<template>
  <div class="space-y-4 px-4 md:px-6">
    <FeeReportSectionNav />

    <Heading title="Term Summary" subtitle="Where the school's fee money is expected, collected and still owed, class by class.">
      <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
        :disabled="!summary" @click="downloadPdf">
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
          <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label" clear
            placeholder="Whole year" class="w-full" />
        </UFormField>

        <UFormField label="Class">
          <USelectMenu v-model="filters.classSessionId" :items="classSessions" :loading="loadingClasses"
            value-key="value" label-key="label" clear placeholder="Every class" class="w-full" />
        </UFormField>

        <UFormField label="Fee Type">
          <USelectMenu v-model="filters.feeCategoryId" :items="feeCategories" value-key="value" label-key="label"
            clear placeholder="Every fee type" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <template v-else-if="summary">
      <div id="term-fee-summary-preview" class="rounded-lg bg-white text-gray-900 px-2">
        <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Term Fee Summary</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span>Term: {{ termLabel }}</span>
            <span v-if="filters.classSessionId">Class: {{ classLabel }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Expected</p>
            <p class="text-lg font-bold text-primary-600">{{ format(summary.totalExpected) }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Collected</p>
            <p class="text-lg font-bold text-primary-600">{{ format(summary.totalCollected) }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Outstanding</p>
            <p class="text-lg font-bold text-primary-600">{{ format(summary.totalOutstanding) }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Collection Rate</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.collectionRate }}%</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Fully Paid</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.fullyPaidStudents }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">With Balance</p>
            <p class="text-lg font-bold text-primary-600">{{ summary.studentsWithBalance }}</p>
          </div>
        </div>

        <FeeReportInsightSection title="Key Insights"
          :items="insight ? [{ text: insight, color: 'warning' }] : []" />

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Students</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Expected</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Collected</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Outstanding</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in summary.classes" :key="c.classSessionId || c.className"
                :class="c.outstanding > 0 ? 'bg-red-50' : ''">
                <td class="border border-gray-200 p-2.5">{{ c.className }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.totalStudents }}</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(c.expected) }}</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(c.collected) }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold"
                  :class="c.outstanding > 0 ? 'text-red-600' : 'text-gray-700'">{{ format(c.outstanding) }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.collectionRate }}%</td>
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
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No fee data found for this period.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const classSessionStore = useClassSessionStore()
const feeStore = useFeeStore()
const store = useFeeReportStore()
const { school } = useSchoolInfo()
const { format } = useMoney()
const { success, error: toastError } = useNotify()

const filters = reactive({
  academicYearId: '',
  termId: '',
  classSessionId: '',
  feeCategoryId: '',
})

const downloading = ref(false)
const loadingClasses = ref(false)
const localClassSessions = ref<ClassSession[]>([])

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const classSessions = computed(() => localClassSessions.value.map(e => {
  let label = `${e.clazz} (${e.sectionName})`
  if (e.streamName !== 'N/A') label += ` - ${e.streamName}`
  return { label, value: e.id }
}))
const feeCategories = computed(() => feeStore.records.map(c => ({ label: c.name, value: c.id })))

const summary = computed(() => store.termSummary)
const loading = computed(() => store.loading)

const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const termLabel = computed(() => terms.value.find(t => t.value === filters.termId)?.label || 'Whole Year')
const classLabel = computed(() => classSessions.value.find(c => c.value === filters.classSessionId)?.label || '—')
const generatedDate = computed(() => new Date().toLocaleDateString())
const schoolName = computed(() => school.value?.name || 'Skultem')
const { logoSrc, loadLogo } = useReportLogo()

// The class carrying the largest outstanding balance, if any - a plain derivation of the class
// table already on the page, not a separate backend computation.
const insight = computed(() => {
  const s = summary.value
  if (!s || !s.classes.length) return ''
  const worst = [...s.classes].sort((a, b) => b.outstanding - a.outstanding)[0]
  if (!worst || worst.outstanding <= 0) return ''
  return `${worst.className} has the highest outstanding balance at ${format(worst.outstanding)}.`
})

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

async function loadClasses() {
  loadingClasses.value = true
  try {
    await classSessionStore.fetchAll(1, 200, filters.academicYearId || undefined)
    localClassSessions.value = classSessionStore.records
  } finally {
    loadingClasses.value = false
  }
}

async function loadSummary() {
  await store.fetchTermSummary(filters.academicYearId || undefined, filters.termId || undefined,
    filters.classSessionId || undefined, filters.feeCategoryId || undefined)
}

async function downloadPdf() {
  if (!summary.value) return
  downloading.value = true
  try {
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#term-fee-summary-preview', `term-fee-summary-${sanitizeFilename(termLabel.value)}`)
    success('Summary downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

watch(() => [filters.termId, filters.classSessionId, filters.feeCategoryId], loadSummary)
watch(() => filters.academicYearId, async () => {
  await loadClasses()
  await loadSummary()
})

onMounted(async () => {
  loadLogo() // not awaited - fetches in the background, doesn't block the report's own data

  useAppStore().setTitle('Term Summary')
  document.title = 'Fees Term Summary | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  await feeStore.fetchAll(1, 100)

  await loadClasses()
  await loadSummary()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
