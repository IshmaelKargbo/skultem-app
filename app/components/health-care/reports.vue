<script setup lang="ts">
type ReportKind = 'SUMMARY' | 'DAILY' | 'FREQUENT' | 'LIMITS'
type Preset = 'TODAY' | 'WEEK' | 'MONTH' | 'LAST_30' | 'CUSTOM'

// Each report has its own page (pages/health-care/reports/*), which fixes `kind`; without it a picker is shown.
const props = defineProps<{ kind?: ReportKind }>()

const { error: toastError, success: toastSuccess } = useNotify()
const { school } = useSchoolInfo()
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()

const reportOptions: { label: string, value: ReportKind, description: string }[] = [
  { label: 'Visits Summary', value: 'SUMMARY', description: 'Visits by class, outcome, complaint and day' },
  { label: 'Daily Log', value: 'DAILY', description: 'Every visit on one day, in order of arrival' },
  { label: 'Frequent Visitors', value: 'FREQUENT', description: 'Students with 3 or more visits' },
  { label: 'Limits & Turned Away', value: 'LIMITS', description: 'Visits let past a limit, and students turned away' }
]
const presetOptions: { label: string, value: Preset }[] = [
  { label: 'Today', value: 'TODAY' },
  { label: 'This week', value: 'WEEK' },
  { label: 'This month', value: 'MONTH' },
  { label: 'Last 30 days', value: 'LAST_30' },
  { label: 'Custom', value: 'CUSTOM' }
]

const today = schoolToday()
const report = ref<ReportKind>(props.kind ?? 'SUMMARY')
watch(() => props.kind, (k) => { if (k) report.value = k })
const preset = ref<Preset>('MONTH')
const from = ref(today.slice(0, 8) + '01')
const to = ref(today)
const day = ref(today)

watch(preset, (p) => {
  if (p === 'TODAY') { from.value = today; to.value = today }
  if (p === 'WEEK') { from.value = weekStart(today); to.value = today }
  if (p === 'MONTH') { from.value = today.slice(0, 8) + '01'; to.value = today }
  if (p === 'LAST_30') { from.value = addDays(today, -29); to.value = today }
})

const rangeError = computed(() => {
  if (report.value === 'DAILY') return day.value ? '' : 'Choose a day'
  if (!from.value || !to.value) return 'Choose a date range'
  if (to.value < from.value) return 'The end date must be on or after the start date'
  const days = (Date.parse(to.value) - Date.parse(from.value)) / 86400000
  return days >= 92 ? 'Choose a range of at most 92 days' : ''
})

const summary = ref<HealthCareSummary | null>(null)
const daily = ref<HealthCareVisit[]>([])
const frequent = ref<HealthCareFrequentVisitor[]>([])
const limits = ref<HealthCareLimitsReport | null>(null)
const loading = ref(false)

let request = 0
async function load() {
  if (rangeError.value) return
  const mine = ++request
  loading.value = true
  try {
    const api = HealthCareApi()
    if (report.value === 'SUMMARY') {
      const res = await api.summary(from.value, to.value)
      if (mine === request) summary.value = res
    } else if (report.value === 'DAILY') {
      const res = await api.dailyLog(day.value)
      if (mine === request) daily.value = res
    } else if (report.value === 'FREQUENT') {
      const res = await api.frequent(from.value, to.value)
      if (mine === request) frequent.value = res
    } else {
      const res = await api.limits(from.value, to.value)
      if (mine === request) limits.value = res
    }
  } catch (err: any) {
    if (mine === request) toastError(err?.message || 'Failed to load the report')
  } finally {
    if (mine === request) loading.value = false
  }
}

watch([report, from, to, day], load)

// What the document shows

const reportTitle = computed(() => reportOptions.find(r => r.value === report.value)?.label ?? 'Report')
const periodText = computed(() => report.value === 'DAILY'
  ? formatDayLabel(day.value)
  : from.value === to.value ? formatDayLabel(from.value) : `${formatDayLabel(from.value)} – ${formatDayLabel(to.value)}`)
const schoolName = computed(() => school.value?.name || 'Skultem')
const generatedDate = computed(() => new Date().toLocaleDateString())

const isEmpty = computed(() => {
  switch (report.value) {
    case 'SUMMARY': return !summary.value?.visits && !summary.value?.turnedAway
    case 'DAILY': return !daily.value.length
    case 'FREQUENT': return !frequent.value.length
    default: return !limits.value?.overLimit.length && !limits.value?.turnedAway.length
  }
})

const percent = (n: number, total: number) => total ? `${Math.round((n / total) * 100)}%` : '—'
const classTotals = computed(() => (summary.value?.classes ?? []).reduce((t, c) => ({
  visits: t.visits + c.visits, students: t.students + c.students, returnedToClass: t.returnedToClass + c.returnedToClass,
  sentHome: t.sentHome + c.sentHome, referred: t.referred + c.referred, stillOpen: t.stillOpen + c.stillOpen
}), { visits: 0, students: 0, returnedToClass: 0, sentHome: 0, referred: 0, stillOpen: 0 }))
const outcomeCount = (key: string) => summary.value?.byOutcome.find(o => o.key === key)?.count ?? 0
// A long range would list many empty days; the table shows the days that had visits.
const busyDays = computed(() => (summary.value?.days ?? []).filter(d => d.visits > 0))
const dailyOutcome = (o: HealthCareOutcome) => daily.value.filter(v => v.outcome === o).length

function outcomeText(v: HealthCareVisit) {
  if (v.status === 'OPEN') return v.needsFollowUp ? 'Needs follow-up' : 'Still in the sick bay'
  if (!v.outcome) return '—'
  let text = outcomeStyle[v.outcome].label
  if (v.referredTo) text += ` – ${v.referredTo}`
  if (v.collectedBy) text += ` (collected by ${v.collectedBy})`
  return text
}

// Exports

const downloading = ref(false)
async function downloadPdf() {
  downloading.value = true
  try {
    await logoReady() // the print-safe logo must be in before the PDF is drawn
    const { $generatePdf } = useNuxtApp()
    const period = report.value === 'DAILY' ? day.value : `${from.value}-to-${to.value}`
    await $generatePdf('#health-care-report', `health-care-${report.value.toLowerCase()}-${period}`)
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
    const api = HealthCareApi()
    if (report.value === 'SUMMARY') await api.exportSummary('csv', from.value, to.value)
    else if (report.value === 'DAILY') await api.exportDaily('csv', day.value)
    else if (report.value === 'FREQUENT') await api.exportFrequent('csv', from.value, to.value)
    else await api.exportLimits('csv', from.value, to.value)
  } catch (err: any) {
    toastError(err?.message || 'Failed to export')
  } finally {
    exportingCsv.value = false
  }
}

onMounted(() => {
  loadLogo() // in the background; the report's own data doesn't wait for it
  load()
})
</script>

<template>
  <div class="space-y-3">
    <Heading :title="props.kind ? reportTitle : 'Health Care Reports'"
      :subtitle="props.kind ? (reportOptions.find(r => r.value === report)?.description ?? '') : 'Sick bay visits for a period, ready to print or share.'">
      <UButton icon="i-lucide-file-spreadsheet" variant="outline" color="neutral" class="justify-center"
        :loading="exportingCsv" :disabled="!!rangeError || loading || isEmpty" @click="downloadCsv">
        Export CSV
      </UButton>
      <UButton :icon="DOWNLOAD_ICON" color="primary" class="justify-center" :loading="downloading"
        :disabled="!!rangeError || loading || isEmpty" @click="downloadPdf">
        Export PDF
      </UButton>
    </Heading>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UFormField v-if="!props.kind" label="Report" :help="reportOptions.find(r => r.value === report)?.description">
          <USelectMenu v-model="report" :items="reportOptions" value-key="value" :search-input="false" class="w-full" />
        </UFormField>

        <UFormField v-if="report === 'DAILY'" label="Day">
          <UInput v-model="day" type="date" :max="today" class="w-full" />
        </UFormField>
        <template v-else>
          <UFormField label="Period">
            <USelectMenu v-model="preset" :items="presetOptions" value-key="value" :search-input="false" class="w-full" />
          </UFormField>
          <UFormField label="From">
            <UInput v-model="from" type="date" :max="to" class="w-full" @update:model-value="() => { preset = 'CUSTOM' }" />
          </UFormField>
          <UFormField label="To">
            <UInput v-model="to" type="date" :min="from" :max="today" class="w-full" @update:model-value="() => { preset = 'CUSTOM' }" />
          </UFormField>
        </template>
      </div>
      <p v-if="rangeError" class="mt-3 text-sm text-error">{{ rangeError }}</p>
    </UCard>

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <UCard v-else-if="isEmpty">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon :name="HEALTH_CARE_ICON" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">
          {{ report === 'FREQUENT' ? 'Nobody visited 3 or more times in this period.'
            : report === 'LIMITS' ? 'No visit went over a limit in this period.'
              : 'No sick bay visits in this period.' }}
        </p>
      </div>
    </UCard>

    <!-- The document: what the PDF shows -->
    <div v-else id="health-care-report" class="rounded-lg bg-white px-2 text-gray-900">
      <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
        <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
        <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
        <p class="mt-1 text-sm font-semibold text-gray-600">Health Care · {{ reportTitle }}</p>
        <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{{ report === 'DAILY' ? 'Day' : 'Period' }}: {{ periodText }}</span>
          <span>Voided visits not counted</span>
        </div>
      </div>

      <!-- Visits summary -->
      <template v-if="report === 'SUMMARY' && summary">
        <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="tile in [
            { label: 'Visits', value: summary.visits },
            { label: 'Students Seen', value: summary.students },
            { label: 'Sent Home', value: outcomeCount('SENT_HOME') },
            { label: 'Referred', value: outcomeCount('REFERRED') },
            { label: 'Urgent', value: summary.urgent },
            { label: 'Average Stay', value: summary.averageMinutes !== null ? formatMinutes(summary.averageMinutes) : '—' },
            { label: 'Over a Limit', value: summary.overLimit },
            { label: 'Turned Away', value: summary.turnedAway }
          ]" :key="tile.label" class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">{{ tile.label }}</p>
            <p class="text-lg font-bold text-primary-600">{{ tile.value }}</p>
          </div>
        </div>

        <h3 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-gray-700">By Class</h3>
        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Visits</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Students</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Returned to Class</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Sent Home</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Referred</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Still Open</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in summary.classes" :key="c.className">
                <td class="border border-gray-200 p-2.5">{{ c.className }}</td>
                <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ c.visits }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.students }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.returnedToClass }}</td>
                <td class="border border-gray-200 p-2.5 text-center" :class="c.sentHome ? 'text-amber-700' : ''">{{ c.sentHome }}</td>
                <td class="border border-gray-200 p-2.5 text-center" :class="c.referred ? 'font-semibold text-red-600' : ''">{{ c.referred }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ c.stillOpen }}</td>
              </tr>
              <tr class="bg-gray-50 font-semibold">
                <td class="border border-gray-200 p-2.5">Total</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ classTotals.visits }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ summary.students }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ classTotals.returnedToClass }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ classTotals.sentHome }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ classTotals.referred }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ classTotals.stillOpen }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">By Complaint</h3>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Complaint</th>
                  <th class="border border-gray-200 p-2.5 text-center font-semibold">Visits</th>
                  <th class="border border-gray-200 p-2.5 text-center font-semibold">% of Visits</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in summary.byComplaint" :key="c.key">
                  <td class="border border-gray-200 p-2.5">{{ c.label }}</td>
                  <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ c.count }}</td>
                  <td class="border border-gray-200 p-2.5 text-center">{{ percent(c.count, summary.visits) }}</td>
                </tr>
              </tbody>
            </table>
            <p class="mt-1 text-[11px] text-gray-500">A visit can have more than one complaint.</p>
          </div>

          <div class="space-y-6">
            <div>
              <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">By Outcome</h3>
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-200 p-2.5 text-left font-semibold">Outcome</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">Visits</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">% of Visits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in summary.byOutcome" :key="o.key">
                    <td class="border border-gray-200 p-2.5">{{ o.label }}</td>
                    <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ o.count }}</td>
                    <td class="border border-gray-200 p-2.5 text-center">{{ percent(o.count, summary.visits) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="busyDays.length">
              <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Day by Day</h3>
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-200 p-2.5 text-left font-semibold">Day</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">Visits</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">Sent Home</th>
                    <th class="border border-gray-200 p-2.5 text-center font-semibold">Referred</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in busyDays" :key="d.date">
                    <td class="border border-gray-200 p-2.5">{{ formatDayLabel(d.date) }}</td>
                    <td class="border border-gray-200 p-2.5 text-center font-semibold">{{ d.visits }}</td>
                    <td class="border border-gray-200 p-2.5 text-center">{{ d.sentHome }}</td>
                    <td class="border border-gray-200 p-2.5 text-center">{{ d.referred }}</td>
                  </tr>
                </tbody>
              </table>
              <p class="mt-1 text-[11px] text-gray-500">Days without visits are not listed.</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Daily log -->
      <template v-else-if="report === 'DAILY'">
        <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="tile in [
            { label: 'Visits', value: daily.length },
            { label: 'Returned to Class', value: dailyOutcome('RETURNED_TO_CLASS') },
            { label: 'Sent Home', value: dailyOutcome('SENT_HOME') },
            { label: 'Referred', value: dailyOutcome('REFERRED') }
          ]" :key="tile.label" class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">{{ tile.label }}</p>
            <p class="text-lg font-bold text-primary-600">{{ tile.value }}</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">In</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Out</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Complaint</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Treatment</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Medication</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Outcome</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Seen By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in daily" :key="v.id" :class="v.outcome === 'REFERRED' ? 'bg-red-50' : v.outcome === 'SENT_HOME' ? 'bg-amber-50' : ''">
                <td class="border border-gray-200 p-2.5">{{ formatTime(v.arrivedAt) }}</td>
                <td class="border border-gray-200 p-2.5">{{ v.leftAt ? formatTime(v.leftAt) : '—' }}</td>
                <td class="border border-gray-200 p-2.5 font-medium">{{ v.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ v.studentClass }}</td>
                <td class="max-w-56 border border-gray-200 p-2.5">{{ complaintText(v) }}</td>
                <td class="max-w-56 border border-gray-200 p-2.5">{{ v.treatment || '—' }}</td>
                <td class="max-w-48 border border-gray-200 p-2.5">{{ v.medications.map(medicationLine).join('; ') || '—' }}</td>
                <td class="max-w-48 border border-gray-200 p-2.5">{{ outcomeText(v) }}</td>
                <td class="border border-gray-200 p-2.5">{{ v.openedByName || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-[11px] text-gray-500 print:hidden">Rows in red were referred; rows in amber were sent home.</p>
      </template>

      <!-- Frequent visitors -->
      <template v-else-if="report === 'FREQUENT'">
        <p class="mb-3 text-xs text-gray-500">
          {{ frequent.length }} {{ frequent.length === 1 ? 'student' : 'students' }} with 3 or more visits. Rows in red had 5 or more.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-center font-semibold">#</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Visits</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Dates</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Complaints</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, i) in frequent" :key="f.studentId" :class="f.visits >= 5 ? 'bg-red-50' : ''">
                <td class="border border-gray-200 p-2.5 text-center">{{ i + 1 }}</td>
                <td class="border border-gray-200 p-2.5 font-medium">{{ f.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ f.studentClass }}</td>
                <td class="border border-gray-200 p-2.5 text-center font-semibold" :class="f.visits >= 5 ? 'text-red-600' : ''">{{ f.visits }}</td>
                <td class="max-w-64 border border-gray-200 p-2.5 text-xs">{{ f.dates.map(d => formatDateTime(d)).join(', ') }}</td>
                <td class="max-w-64 border border-gray-200 p-2.5">{{ f.complaints.join(', ') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Limits -->
      <template v-else-if="report === 'LIMITS' && limits">
        <div class="mb-4 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Visits Over a Limit</p>
            <p class="text-lg font-bold text-primary-600">{{ limits.overLimit.length }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">Turned Away</p>
            <p class="text-lg font-bold text-primary-600">{{ limits.turnedAway.length }}</p>
          </div>
        </div>

        <template v-if="limits.overLimit.length">
          <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Visits Over a Limit</h3>
          <div class="overflow-x-auto">
            <table class="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Date</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Rule</th>
                  <th class="border border-gray-200 p-2.5 text-center font-semibold">Earlier Visits</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Allowed Because</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in limits.overLimit" :key="v.id">
                  <td class="border border-gray-200 p-2.5">{{ formatDateTime(v.arrivedAt) }}</td>
                  <td class="border border-gray-200 p-2.5 font-medium">{{ v.studentName }}</td>
                  <td class="border border-gray-200 p-2.5">{{ v.studentClass }}</td>
                  <td class="border border-gray-200 p-2.5">{{ v.overLimit?.ruleName }} ({{ v.overLimit ? ruleSummary(v.overLimit) : '' }})</td>
                  <td class="border border-gray-200 p-2.5 text-center">{{ v.overLimit?.count }}</td>
                  <td class="max-w-64 border border-gray-200 p-2.5">
                    {{ v.overLimit?.urgent ? 'Urgent complaint' : v.overLimit?.reason ? `Reason: ${v.overLimit.reason}` : 'Warned only' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-if="limits.turnedAway.length">
          <h3 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-gray-700">Turned Away</h3>
          <div class="overflow-x-auto">
            <table class="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Date</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Rule</th>
                  <th class="border border-gray-200 p-2.5 text-center font-semibold">Visits Before</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Complaint</th>
                  <th class="border border-gray-200 p-2.5 text-left font-semibold">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in limits.turnedAway" :key="t.id">
                  <td class="border border-gray-200 p-2.5">{{ formatDateTime(t.at) }}</td>
                  <td class="border border-gray-200 p-2.5 font-medium">{{ t.studentName }}</td>
                  <td class="border border-gray-200 p-2.5">{{ t.studentClass }}</td>
                  <td class="border border-gray-200 p-2.5">{{ t.ruleName }} ({{ t.maxVisits }} a {{ periodLabel[t.period] }})</td>
                  <td class="border border-gray-200 p-2.5 text-center">{{ t.visitCount }}</td>
                  <td class="max-w-64 border border-gray-200 p-2.5">{{ t.complaints }}</td>
                  <td class="border border-gray-200 p-2.5">{{ t.recordedByName || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>

      <p class="mt-6 text-center text-[10px] uppercase tracking-widest text-gray-300">
        Generated by Skultem &middot; {{ generatedDate }}
      </p>
    </div>
  </div>
</template>
