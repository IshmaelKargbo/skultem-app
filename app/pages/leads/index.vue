<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const { error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

// Filters live in these variables, not in the URL.
const view = ref<'open' | 'awaiting' | 'unassigned' | 'all'>('open')
const status = ref('ALL')
const assignee = ref('ALL')
const search = ref('')

const leads = ref<Lead[]>([])
const meta = ref<Meta>({} as Meta)
const summary = ref<LeadSummary>()
const staff = ref<StaffMember[]>([])
const loading = ref(false)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const res = await LeadApi().list({
      page: page.value, size: 10,
      status: status.value === 'ALL' ? undefined : status.value,
      assignedTo: assignee.value === 'ALL' ? undefined : assignee.value,
      search: search.value.trim() || undefined,
      view: view.value === 'all' ? undefined : view.value
    })
    leads.value = res?.data ?? []
    meta.value = res?.meta ?? ({} as Meta)
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  summary.value = await LeadApi().summary().catch(() => undefined)
}

const views = computed(() => [
  { value: 'open', label: 'Open', count: summary.value ? summary.value.total - (summary.value.byStatus.CONVERTED ?? 0) - (summary.value.byStatus.LOST ?? 0) : undefined },
  { value: 'awaiting', label: 'Awaiting follow-up', count: summary.value?.awaitingFollowUp, warn: true },
  { value: 'unassigned', label: 'Unassigned', count: summary.value?.unassigned },
  { value: 'all', label: 'All', count: summary.value?.total }
])

const statusItems = [{ label: 'Any status', value: 'ALL' }, ...LEAD_STATUSES.map(s => ({ label: s.label, value: s.value }))]
const staffItems = computed(() => [{ label: 'Anyone', value: 'ALL' }, ...staff.value.map(s => ({ label: s.name, value: s.id }))])

const columns: TableColumn<Lead>[] = [
  { id: 'lead', header: 'Lead' },
  { id: 'status', header: 'Status' },
  { id: 'assigned', header: 'Assigned to' },
  { id: 'followUp', header: 'Next follow-up' },
  { id: 'demo', header: 'Demo' },
  { id: 'actions', header: '' }
]

const overdue = (iso: string | null) => !!iso && new Date(iso).getTime() < Date.now() - 24 * 3600 * 1000

let timer: ReturnType<typeof setTimeout>
function reload() {
  clearTimeout(timer)
  if (page.value !== 1) page.value = 1
  else load()
}
watch([view, status, assignee], reload)
watch(search, () => { clearTimeout(timer); timer = setTimeout(reload, 350) })
watch(page, load)
onBeforeUnmount(() => clearTimeout(timer))

onMounted(async () => {
  useAppStore().setTitle('System Admin · Leads')
  useAppStore().setBack(false)
  document.title = 'Leads & Follow-ups | System Admin | Skultem'
  staff.value = await LeadApi().staff().catch(() => [])
  await Promise.all([load(), loadSummary()])
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Leads & Follow-ups" subtitle="Every enquiry from the marketing site, worked until it becomes a school.">
      <UButton icon="i-lucide-user-plus" label="Add Lead" to="/leads/add" />
    </Heading>

    <!-- Pipeline at a glance -->
    <div v-if="summary" class="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
      <button v-for="s in LEAD_STATUSES" :key="s.value" type="button"
        class="rounded-xl border p-3 text-left transition hover:border-primary/60"
        :class="status === s.value ? 'border-primary bg-primary/5' : 'border-default'"
        @click="status = status === s.value ? 'ALL' : s.value">
        <p class="flex items-center gap-1.5 text-[11px] text-muted"><UIcon :name="s.icon" class="size-3.5" /> {{ s.label }}</p>
        <p class="font-display text-xl font-semibold text-highlighted">{{ summary.byStatus[s.value] ?? 0 }}</p>
      </button>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="space-y-3">
          <div class="flex flex-wrap gap-1.5">
            <UButton v-for="v in views" :key="v.value" size="sm" :variant="view === v.value ? 'solid' : 'soft'"
              :color="view === v.value ? 'primary' : 'neutral'" @click="view = v.value as any">
              {{ v.label }}
              <UBadge v-if="v.count !== undefined" size="xs" variant="subtle"
                :color="v.warn && v.count ? 'warning' : 'neutral'" :label="v.count" />
            </UButton>
          </div>
          <div class="flex flex-wrap gap-2">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search name, school, email or phone" class="w-full sm:w-72" />
            <USelect v-model="status" :items="statusItems" value-key="value" class="w-44" />
            <USelect v-model="assignee" :items="staffItems" value-key="value" class="w-44" icon="i-lucide-user" />
          </div>
        </div>
      </template>

      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Leads could not be loaded" class="m-4">
        <template #actions>
          <UButton size="xs" color="error" variant="outline" label="Try again" @click="load" />
        </template>
      </UAlert>

      <UTable v-else :columns="columns" :data="leads" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-target" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No leads match.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #lead-cell="{ row }">
          <NuxtLink :to="`/leads/${row.original.id}`" class="block min-w-0">
            <p class="truncate font-medium text-highlighted hover:text-primary">{{ row.original.name }}</p>
            <p class="truncate text-xs text-muted">
              {{ [row.original.schoolName, row.original.city].filter(Boolean).join(' · ') || row.original.email || '—' }}
            </p>
            <p class="text-[11px] text-muted">{{ leadSourceLabel(row.original.source) }} · {{ formatDate(row.original.createdAt) }}</p>
          </NuxtLink>
        </template>

        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="leadStatus(row.original.status).color"
            :icon="leadStatus(row.original.status).icon" :label="leadStatus(row.original.status).label" />
        </template>

        <template #assigned-cell="{ row }">
          <p v-if="row.original.assignedToName" class="text-sm">{{ row.original.assignedToName }}</p>
          <UBadge v-else-if="!['CONVERTED', 'LOST'].includes(row.original.status)" size="sm" variant="outline" color="warning" label="Unassigned" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #followUp-cell="{ row }">
          <template v-if="row.original.nextFollowUpAt">
            <p class="text-sm" :class="row.original.awaitingFollowUp ? 'font-medium text-warning' : ''">
              {{ formatDateTime(row.original.nextFollowUpAt) }}
            </p>
            <p v-if="overdue(row.original.nextFollowUpAt) && row.original.awaitingFollowUp" class="text-[11px] text-error">Overdue</p>
          </template>
          <UBadge v-else-if="row.original.awaitingFollowUp" size="sm" variant="subtle" color="warning" label="Not contacted yet" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #demo-cell="{ row }">
          <p v-if="row.original.demoAt && row.original.demoStatus === 'SCHEDULED'" class="text-sm">{{ formatDateTime(row.original.demoAt) }}</p>
          <p v-else-if="row.original.demoStatus === 'COMPLETED'" class="text-sm text-success">Completed</p>
          <span v-else class="text-muted">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton :to="`/leads/${row.original.id}`" size="xs" variant="soft" color="neutral" label="Open"
              trailing-icon="i-lucide-arrow-right" />
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
