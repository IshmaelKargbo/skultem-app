<script setup lang="ts">
const { error: toastError, success: toastSuccess } = useNotify()
const { school } = useSchoolInfo()
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()

const scopeOptions: { label: string, value: HealthCareTrendScope, description: string }[] = [
  { label: 'Month', value: 'MONTH', description: 'One month, week by week' },
  { label: 'Term', value: 'TERM', description: 'One term, month by month' },
  { label: 'Academic year', value: 'YEAR', description: 'One academic year, term by term' }
]

const scope = ref<HealthCareTrendScope>('TERM')
const month = ref(schoolToday().slice(0, 7))
const yearId = ref('')
const termId = ref('')

const periods = ref<HealthCarePeriods | null>(null)
const yearOptions = computed(() => (periods.value?.years ?? []).map(y => ({ label: y.name, value: y.id })))
const termOptions = computed(() => (periods.value?.years.find(y => y.id === yearId.value)?.terms ?? [])
  .map(t => ({ label: t.name, value: t.id })))

// Picking another year moves the term to that year's first term (or keeps it if it belongs to that year).
watch(yearId, () => {
  if (!termOptions.value.some(t => t.value === termId.value)) termId.value = termOptions.value[0]?.value ?? ''
})

const missing = computed(() => {
  if (scope.value === 'MONTH') return month.value ? '' : 'Choose a month'
  if (scope.value === 'TERM') return termId.value ? '' : (yearId.value ? 'This year has no terms yet' : 'Choose a term')
  return yearId.value ? '' : 'Choose an academic year'
})

const trends = ref<HealthCareTrends | null>(null)
const loading = ref(false)

function params() {
  if (scope.value === 'MONTH') return { month: month.value }
  if (scope.value === 'TERM') return { termId: termId.value }
  return { yearId: yearId.value }
}

let request = 0
async function load() {
  if (missing.value) {
    trends.value = null
    return
  }
  const mine = ++request
  loading.value = true
  try {
    const res = await HealthCareApi().trends(scope.value, params())
    if (mine === request) trends.value = res
  } catch (err: any) {
    if (mine === request) toastError(err?.message || 'Failed to load the trends')
  } finally {
    if (mine === request) loading.value = false
  }
}

watch([scope, month, termId, yearId], load)

// What the document shows

const visitsRow = computed(() => trends.value?.overview.find(r => r.key === 'Visits'))
const isEmpty = computed(() => !trends.value || (!visitsRow.value?.total && !trends.value.overview.find(r => r.key === 'Turned away')?.total))
const outcomeTotal = (label: string) => trends.value?.outcomes.find(r => r.label === label)?.total ?? 0
const overviewTotal = (key: string) => trends.value?.overview.find(r => r.key === key)?.total ?? 0
const scopeLabel = computed(() => scopeOptions.find(s => s.value === scope.value)?.label ?? '')
const columnLabel = computed(() => scope.value === 'MONTH' ? 'week' : scope.value === 'TERM' ? 'month' : 'term')
const schoolName = computed(() => school.value?.name || 'Skultem')
const generatedDate = computed(() => new Date().toLocaleDateString())

// The busiest column of each complaint, to say in words when it peaked.
function peak(row: HealthCareTrendRow) {
  if (!trends.value || !row.total) return '—'
  const max = Math.max(...row.counts)
  const i = row.counts.indexOf(max)
  return trends.value.buckets[i]?.label ?? '—'
}

// Shading: the busier a cell compared with the busiest cell of its table, the darker.
function maxOf(rows: HealthCareTrendRow[]) {
  return Math.max(1, ...rows.flatMap(r => r.counts))
}
function shade(count: number, max: number) {
  if (!count) return ''
  const ratio = count / max
  if (ratio > 0.75) return 'bg-primary-200 font-semibold'
  if (ratio > 0.5) return 'bg-primary-100 font-semibold'
  if (ratio > 0.25) return 'bg-primary-50'
  return ''
}
const complaintMax = computed(() => maxOf(trends.value?.complaints ?? []))
const classMax = computed(() => maxOf(trends.value?.classes ?? []))
const barMax = (counts: HealthCareCount[]) => Math.max(1, ...counts.map(c => c.count))
const percent = (n: number, total: number) => total ? `${Math.round((n / total) * 100)}%` : '—'

// Exports

const downloading = ref(false)
async function downloadPdf() {
  if (!trends.value) return
  downloading.value = true
  try {
    await logoReady()
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#health-care-trends', `health-care-trends-${trends.value.title.replace(/[^a-z0-9-_]/gi, '-')}`)
    toastSuccess('Report downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate the PDF')
  } finally {
    downloading.value = false
  }
}

const exportingCsv = ref(false)
async function downloadCsv() {
  exportingCsv.value = true
  try {
    await HealthCareApi().exportTrends('csv', scope.value, params())
  } catch (err: any) {
    toastError(err?.message || 'Failed to export')
  } finally {
    exportingCsv.value = false
  }
}

onMounted(async () => {
  loadLogo()
  try {
    periods.value = await HealthCareApi().periods()
    yearId.value = periods.value.activeYearId ?? periods.value.years[0]?.id ?? ''
    await nextTick()
    termId.value = periods.value.activeTermId ?? termOptions.value[0]?.value ?? ''
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the academic years')
  }
  load()
})
</script>

<template>
  <div class="space-y-3">
    <Heading title="Health Trends"
      subtitle="What students come in with, and when - by week, month or term.">
      <UButton icon="i-lucide-file-spreadsheet" variant="outline" color="neutral" class="justify-center"
        :loading="exportingCsv" :disabled="!!missing || loading || isEmpty" @click="downloadCsv">
        Export CSV
      </UButton>
      <UButton :icon="DOWNLOAD_ICON" color="primary" class="justify-center" :loading="downloading"
        :disabled="!!missing || loading || isEmpty" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UFormField label="View" :help="scopeOptions.find(s => s.value === scope)?.description">
          <USelectMenu v-model="scope" :items="scopeOptions" value-key="value" :search-input="false" class="w-full" />
        </UFormField>

        <UFormField v-if="scope === 'MONTH'" label="Month">
          <UInput v-model="month" type="month" class="w-full" />
        </UFormField>
        <template v-else>
          <UFormField label="Academic Year">
            <USelectMenu v-model="yearId" :items="yearOptions" value-key="value" placeholder="Select year"
              :search-input="false" class="w-full" />
          </UFormField>
          <UFormField v-if="scope === 'TERM'" label="Term">
            <USelectMenu v-model="termId" :items="termOptions" value-key="value" placeholder="Select term"
              :search-input="false" class="w-full" />
          </UFormField>
        </template>
      </div>
      <p v-if="missing && !loading" class="mt-3 text-sm text-muted">{{ missing }}</p>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="!missing && isEmpty">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon :name="HEALTH_CARE_ICON" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No sick bay visits in this period.</p>
      </div>
    </UCard>

    <!-- The document: what the PDF shows -->
    <div v-else-if="trends" id="health-care-trends" class="rounded-lg bg-white px-2 text-gray-900">
      <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
        <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
        <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
        <p class="mt-1 text-sm font-semibold text-gray-600">Health Care · Health Trends</p>
        <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{{ scopeLabel }}: {{ trends.title }}</span>
          <span>{{ formatDayLabel(trends.from) }} – {{ formatDayLabel(trends.to) }}</span>
          <span>By {{ columnLabel }}</span>
          <span>Voided visits not counted</span>
        </div>
      </div>

      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div v-for="tile in [
          { label: 'Visits', value: overviewTotal('Visits') },
          { label: 'Students Seen', value: overviewTotal('Students seen') },
          { label: 'Urgent', value: overviewTotal('Urgent') },
          { label: 'Sent Home', value: outcomeTotal('Sent home') },
          { label: 'Referred', value: outcomeTotal('Referred') },
          { label: 'Turned Away', value: overviewTotal('Turned away') }
        ]" :key="tile.label" class="rounded-xl bg-primary-50 p-3 text-center">
          <p class="text-xs text-gray-500">{{ tile.label }}</p>
          <p class="text-lg font-bold text-primary-600">{{ tile.value }}</p>
        </div>
      </div>

      <!-- Complaints by period -->
      <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Complaints by {{ columnLabel }}</h3>
      <div class="overflow-x-auto">
        <table class="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-200 p-2.5 text-left font-semibold">Complaint</th>
              <th v-for="b in trends.buckets" :key="b.key" class="border border-gray-200 p-2.5 text-center font-semibold">
                {{ b.label }}
              </th>
              <th class="border border-gray-200 p-2.5 text-center font-semibold">Total</th>
              <th class="border border-gray-200 p-2.5 text-center font-semibold">% of Visits</th>
              <th class="border border-gray-200 p-2.5 text-left font-semibold">Busiest</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in trends.complaints" :key="r.key">
              <td class="border border-gray-200 p-2.5">
                {{ r.label }}
                <span v-if="r.urgent" class="ml-1 rounded bg-red-100 px-1.5 text-[10px] font-semibold uppercase text-red-700">Urgent</span>
              </td>
              <td v-for="(c, i) in r.counts" :key="i" class="border border-gray-200 p-2.5 text-center"
                :class="shade(c, complaintMax)">{{ c || '–' }}</td>
              <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ r.total }}</td>
              <td class="border border-gray-200 p-2.5 text-center">{{ percent(r.total, visitsRow?.total ?? 0) }}</td>
              <td class="border border-gray-200 p-2.5 text-xs">{{ peak(r) }}</td>
            </tr>
            <tr class="bg-gray-50 font-semibold">
              <td class="border border-gray-200 p-2.5">Visits</td>
              <td v-for="(c, i) in visitsRow?.counts ?? []" :key="i" class="border border-gray-200 p-2.5 text-center">{{ c }}</td>
              <td class="border border-gray-200 p-2.5 text-center">{{ visitsRow?.total ?? 0 }}</td>
              <td class="border border-gray-200 p-2.5" colspan="2" />
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-1 text-[11px] text-gray-500">A visit can have more than one complaint, so complaints can add up to more than the visits.</p>

      <!-- Overview and outcomes by period -->
      <h3 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-gray-700">Visits and Outcomes by {{ columnLabel }}</h3>
      <div class="overflow-x-auto">
        <table class="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-200 p-2.5 text-left font-semibold" />
              <th v-for="b in trends.buckets" :key="b.key" class="border border-gray-200 p-2.5 text-center font-semibold">
                {{ b.label }}
              </th>
              <th class="border border-gray-200 p-2.5 text-center font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in [...trends.overview, ...trends.outcomes]" :key="r.key"
              :class="r.key === 'Visits' ? 'font-semibold' : ''">
              <td class="border border-gray-200 p-2.5">{{ r.label }}</td>
              <td v-for="(c, i) in r.counts" :key="i" class="border border-gray-200 p-2.5 text-center"
                :class="(r.key === 'Referred' && c) ? 'font-semibold text-red-600' : (r.key === 'Sent home' && c) ? 'text-amber-700' : ''">
                {{ c }}
              </td>
              <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ r.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Classes by period -->
      <h3 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-gray-700">Visits by Class</h3>
      <div class="overflow-x-auto">
        <table class="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
              <th v-for="b in trends.buckets" :key="b.key" class="border border-gray-200 p-2.5 text-center font-semibold">
                {{ b.label }}
              </th>
              <th class="border border-gray-200 p-2.5 text-center font-semibold">Total</th>
              <th class="border border-gray-200 p-2.5 text-center font-semibold">% of Visits</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in trends.classes" :key="r.key">
              <td class="border border-gray-200 p-2.5">{{ r.label }}</td>
              <td v-for="(c, i) in r.counts" :key="i" class="border border-gray-200 p-2.5 text-center"
                :class="shade(c, classMax)">{{ c || '–' }}</td>
              <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ r.total }}</td>
              <td class="border border-gray-200 p-2.5 text-center">{{ percent(r.total, visitsRow?.total ?? 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <!-- Medicines -->
        <div>
          <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Medicines Given</h3>
          <p v-if="!trends.medicines.length" class="text-sm text-gray-500">No medicine was recorded.</p>
          <table v-else class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Medicine</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Times</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Students</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in trends.medicines" :key="m.name">
                <td class="border border-gray-200 p-2.5">{{ m.name }}</td>
                <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ m.times }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ m.students }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Busiest days and hours -->
        <div v-for="group in [
          { title: 'Busiest Days', counts: trends.byWeekday },
          { title: 'Busiest Hours', counts: trends.byHour }
        ]" :key="group.title">
          <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">{{ group.title }}</h3>
          <p v-if="!group.counts.some(c => c.count)" class="text-sm text-gray-500">No visits.</p>
          <ul v-else class="space-y-2">
            <li v-for="c in group.counts" :key="c.key" class="space-y-1">
              <div class="flex items-center justify-between gap-2 text-sm">
                <span>{{ c.label }}</span>
                <span class="font-semibold">{{ c.count }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-gray-100">
                <div class="h-1.5 rounded-full bg-primary-500" :style="{ width: `${(c.count / barMax(group.counts)) * 100}%` }" />
              </div>
            </li>
          </ul>
        </div>
      </div>

      <p class="mt-6 text-center text-[10px] uppercase tracking-widest text-gray-300">
        Generated by Skultem &middot; {{ generatedDate }}
      </p>
    </div>
  </div>
</template>
