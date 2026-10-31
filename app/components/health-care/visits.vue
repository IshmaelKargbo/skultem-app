<script setup lang="ts">
// Every sick bay visit, newest first, with filters (docs/HEALTH_CARE.md §8). Voided visits show struck through.
const { canRecord } = useHealthCareAccess()
const { loadSettings, settings, changeVersion } = useHealthCare()
const { error: toastError } = useNotify()
const route = useRoute()

const today = schoolToday()
// The last 30 days, any status. `?status=` (e.g. from the dashboard) starts with that status.
const defaults: HealthCareVisitFilters = {
  status: 'ALL', outcome: '', complaint: '', overLimit: false, from: addDays(today, -30), to: today
}
const initialStatus = String(route.query.status || 'ALL').toUpperCase() as HealthCareVisitFilter
const filters = ref<HealthCareVisitFilters>({
  ...defaults,
  status: visitFilterOptions.some(o => o.value === initialStatus) ? initialStatus : 'ALL'
})
const searchValue = ref('')
const search = ref('')
const page = ref(1)
const size = runtimeConf().limit

const data = ref<HealthCareVisit[]>([])
const meta = ref<any>({})
const loading = ref(false)

const complaintOptions = computed(() => (settings.value?.complaintList ?? []).map(c => ({ label: c.label, value: c.code })))

let request = 0
async function load() {
  const mine = ++request
  loading.value = true
  try {
    const res = await HealthCareApi().listVisits(page.value, size, {
      status: filters.value.status,
      from: filters.value.from,
      to: filters.value.to,
      outcome: filters.value.outcome,
      complaint: filters.value.complaint,
      overLimit: filters.value.overLimit || undefined,
      search: search.value
    })
    if (mine !== request) return
    data.value = res.data
    meta.value = res.meta
  } catch (err: any) {
    if (mine === request) toastError(err?.message || 'Failed to load visits')
  } finally {
    if (mine === request) loading.value = false
  }
}

const columns = [
  { id: 'student', header: 'Student' },
  { id: 'arrived', header: 'Arrived' },
  { id: 'complaint', header: 'Complaint' },
  { id: 'state', header: 'Outcome' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

let timer: ReturnType<typeof setTimeout>
watch(searchValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => { search.value = val.trim() }, 400)
})

watch([filters, search], () => {
  if (page.value === 1) load()
  else page.value = 1
})
watch(page, load)
watch(changeVersion, load)
onMounted(() => {
  load()
  loadSettings().catch(() => { })
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="space-y-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="font-semibold">Sick Bay Visits</h3>
            <p class="text-xs text-muted">Newest first. Open a visit to see its full record.</p>
          </div>
          <HealthCareStartVisit v-if="canRecord" />
        </div>
        <div class="flex items-center gap-2">
          <UInput v-model="searchValue" :icon="SEARCH_ICON" placeholder="Search by student or class" class="flex-1" />
          <HealthCareFilterDrawer v-model="filters" :defaults="defaults" :complaint-options="complaintOptions" />
        </div>
        <p class="text-xs text-muted">
          {{ formatDayLabel(filters.from) }} – {{ formatDayLabel(filters.to) }}
          <template v-if="filters.status !== 'ALL'"> · {{ visitFilterOptions.find(o => o.value === filters.status)?.label }}</template>
          <template v-if="filters.outcome"> · {{ outcomeStyle[filters.outcome].label }}</template>
          <template v-if="filters.complaint"> · {{ complaintOptions.find(o => o.value === filters.complaint)?.label }}</template>
          <template v-if="filters.overLimit"> · Over a limit only</template>
        </p>
      </div>
    </template>

    <UTable :columns="columns" :data="data" :loading="loading">
      <template #student-cell="{ row }">
        <div :class="row.original.status === 'VOIDED' ? 'line-through opacity-60' : ''">
          <ULink :to="`/health-care/visits/${row.original.id}`" class="font-medium text-gray-900 hover:text-primary dark:text-white">
            {{ row.original.studentName }}
          </ULink>
          <p class="text-xs text-muted">{{ row.original.studentClass }}</p>
        </div>
      </template>

      <template #arrived-cell="{ row }">
        <p class="text-sm">{{ formatDateTime(row.original.arrivedAt) }}</p>
        <p v-if="row.original.minutesIn !== null" class="text-xs text-muted">{{ formatMinutes(row.original.minutesIn) }}</p>
      </template>

      <template #complaint-cell="{ row }">
        <div class="flex max-w-72 items-center gap-1.5">
          <UIcon v-if="row.original.urgent" :name="URGENT_ICON" class="size-4 shrink-0 text-error" />
          <span class="truncate text-sm" :title="complaintText(row.original)">{{ complaintText(row.original) }}</span>
        </div>
        <UBadge v-if="row.original.overLimit" size="xs" variant="soft" color="warning" class="mt-1"
          :label="`Over limit: ${row.original.overLimit.ruleName}`" />
      </template>

      <template #state-cell="{ row }">
        <UBadge size="sm" variant="soft" :color="visitBadge(row.original).color" :label="visitBadge(row.original).label" />
      </template>

      <template #actions-cell="{ row }">
        <UButton :to="`/health-care/visits/${row.original.id}`" size="xs" variant="ghost" color="neutral" :icon="VIEW_ICON" aria-label="Open visit" />
      </template>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="HEALTH_CARE_VISITS_ICON" class="text-4xl text-primary-500" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">No visits found</h3>
            <p class="mt-1 text-sm text-gray-500">Try a wider date range or fewer filters.</p>
          </div>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>

    <template v-if="meta.total" #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
