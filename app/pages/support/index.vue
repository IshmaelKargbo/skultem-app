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
const view = ref<'open' | 'unassigned' | 'all'>('open')
const status = ref('ALL')
const priority = ref('ALL')
const assignee = ref('ALL')
const search = ref('')

const tickets = ref<SupportTicket[]>([])
const summary = ref<SupportSummary>()
const staff = ref<StaffMember[]>([])
const meta = ref<Meta>({} as Meta)
const loading = ref(false)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const res = await SupportApi().tickets({
      page: page.value, size: 10, view: view.value === 'all' ? undefined : view.value,
      status: status.value === 'ALL' ? undefined : status.value,
      priority: priority.value === 'ALL' ? undefined : priority.value,
      assignedTo: assignee.value === 'ALL' ? undefined : assignee.value,
      search: search.value.trim() || undefined
    })
    tickets.value = res?.data ?? []
    meta.value = res?.meta ?? ({} as Meta)
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

const views = computed(() => [
  { value: 'open', label: 'Open', count: summary.value ? summary.value.open + summary.value.inProgress + summary.value.waiting : undefined },
  { value: 'unassigned', label: 'Unassigned', count: summary.value?.unassigned, warn: true },
  { value: 'all', label: 'All', count: summary.value ? Object.values(summary.value.byStatus).reduce((a, b) => a + b, 0) : undefined }
])

const statusItems = [{ label: 'Any status', value: 'ALL' }, ...TICKET_STATUSES.map(s => ({ label: s.label, value: s.value }))]
const priorityItems = [{ label: 'Any priority', value: 'ALL' }, ...TICKET_PRIORITIES.map(p => ({ label: p.label, value: p.value }))]
const staffItems = computed(() => [{ label: 'Anyone', value: 'ALL' }, ...staff.value.map(s => ({ label: s.name, value: s.id }))])

const viewTabs = computed(() => views.value.map(v => ({ key: v.value, label: v.label, count: v.count, warn: v.warn })))

const metrics = computed(() => {
  const sm = summary.value
  const open = sm ? sm.open + sm.inProgress + sm.waiting : undefined
  return [
    { label: 'Open tickets', value: open, icon: 'i-lucide-life-buoy', color: 'primary' as const, subtle: sm ? `${sm.inProgress} in progress · ${sm.waiting} waiting on school` : '', view: 'open' },
    { label: 'Urgent', value: sm?.urgent, icon: 'i-lucide-siren', color: (sm?.urgent ? 'error' : 'success') as 'error' | 'success', subtle: sm?.urgent ? 'Needs attention first' : 'Nothing urgent', view: 'open' },
    { label: 'Unassigned', value: sm?.unassigned, icon: 'i-lucide-user-x', color: (sm?.unassigned ? 'warning' : 'neutral') as 'warning' | 'neutral', subtle: 'Nobody has these yet', view: 'unassigned' },
    { label: 'Resolved', value: sm?.resolved, icon: 'i-lucide-circle-check', color: 'success' as const, subtle: 'Waiting to be closed', view: 'all' }
  ]
})
const filtersActive = computed(() => status.value !== 'ALL' || priority.value !== 'ALL' || assignee.value !== 'ALL' || !!search.value.trim())
function clearFilters() { status.value = 'ALL'; priority.value = 'ALL'; assignee.value = 'ALL'; search.value = '' }

const PRIORITY_DOT: Record<string, string> = { LOW: 'bg-gray-400', NORMAL: 'bg-primary-400', HIGH: 'bg-amber-500', URGENT: 'bg-error' }
const initials = (name?: string | null) => (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?'

// "3 h ago" - the exact time is in the tooltip.
function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return mins < 1 ? 'Just now' : `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days < 31 ? `${days} d ago` : formatDate(iso)
}

const columns: TableColumn<SupportTicket>[] = [
  { id: 'ticket', header: 'Ticket' },
  { id: 'school', header: 'School' },
  { id: 'priority', header: 'Priority' },
  { id: 'status', header: 'Status' },
  { id: 'assigned', header: 'Assigned to' },
  { id: 'opened', header: 'Opened' },
  { id: 'actions', header: '' }
]

let timer: ReturnType<typeof setTimeout>
function reload() {
  if (page.value !== 1) page.value = 1
  else load()
}
watch([view, status, priority, assignee], reload)
watch(search, () => { clearTimeout(timer); timer = setTimeout(reload, 350) })
watch(page, load)
onBeforeUnmount(() => clearTimeout(timer))

onMounted(async () => {
  useAppStore().setTitle('System Admin · Support Tickets')
  useAppStore().setBack(false)
  document.title = 'Support Tickets | System Admin | Skultem'
  staff.value = await LeadApi().staff().catch(() => [])
  summary.value = await SupportApi().summary().catch(() => undefined)
  await load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Support Tickets" subtitle="Schools asking for help. Replies are recorded here; reach the school by email or phone and note it on the ticket.">
      <UButton icon="i-lucide-plus" label="Open Ticket" to="/support/add" />
    </Heading>

    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <button v-for="m in metrics" :key="m.label" type="button" class="rounded-2xl text-left transition hover:-translate-y-0.5" @click="view = m.view as any">
        <Metric :record="{ label: m.label, value: m.value ?? 0, subtle: m.subtle, icon: m.icon, color: m.color, isReady: m.value !== undefined }" />
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Tab v-model="view" :tabs="viewTabs" />
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-default p-2 shadow-sm ring-1 ring-default">
      <UInput v-model="search" icon="i-lucide-search" variant="soft" size="lg" placeholder="Search number, subject, person or school" class="min-w-0 flex-1 sm:min-w-72" />
      <USelect v-model="status" :items="statusItems" value-key="value" variant="soft" size="lg" class="w-full sm:w-44" icon="i-lucide-list-filter" />
      <USelect v-model="priority" :items="priorityItems" value-key="value" variant="soft" size="lg" class="w-full sm:w-40" icon="i-lucide-flag" />
      <USelect v-model="assignee" :items="staffItems" value-key="value" variant="soft" size="lg" class="w-full sm:w-44" icon="i-lucide-user" />
      <UButton v-if="filtersActive" variant="ghost" color="neutral" icon="i-lucide-x" label="Clear" @click="clearFilters" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Tickets could not be loaded" class="m-4">
        <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
      </UAlert>

      <UTable v-else :columns="columns" :data="tickets" :loading="loading"
        :ui="{ thead: 'bg-elevated/50', th: 'py-3 text-[11px] font-semibold uppercase tracking-wide text-muted', td: 'py-3.5', tr: 'hover:bg-primary/5 transition-colors' }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-life-buoy" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No tickets match.</p>
          </div>
        </template>
        <template #loading><TableLoading :size="columns.length" /></template>

        <template #ticket-cell="{ row }">
          <NuxtLink :to="`/support/${row.original.id}`" class="group flex min-w-0 items-center gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UIcon name="i-lucide-ticket" class="size-5" /></span>
            <span class="min-w-0">
              <span class="block truncate font-medium text-highlighted group-hover:text-primary">{{ row.original.subject }}</span>
              <span class="block truncate text-xs text-muted">{{ row.original.number }} · {{ ticketCategoryLabel(row.original.category) }} · {{ row.original.requesterName }}</span>
            </span>
          </NuxtLink>
        </template>
        <template #school-cell="{ row }">
          <p v-if="row.original.schoolName" class="flex items-center gap-1.5 text-sm"><UIcon name="i-lucide-school" class="size-3.5 shrink-0 text-muted" />{{ row.original.schoolName }}</p>
          <span v-else class="text-muted">—</span>
        </template>
        <template #priority-cell="{ row }">
          <span class="inline-flex items-center gap-2 text-sm">
            <span class="size-2 rounded-full" :class="PRIORITY_DOT[row.original.priority]" />{{ ticketPriority(row.original.priority).label }}
          </span>
        </template>
        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="ticketStatus(row.original.status).color" :icon="ticketStatus(row.original.status).icon" :label="ticketStatus(row.original.status).label" />
        </template>
        <template #assigned-cell="{ row }">
          <div v-if="row.original.assignedToName" class="flex items-center gap-2">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-semibold text-secondary-700">{{ initials(row.original.assignedToName) }}</span>
            <span class="truncate text-sm">{{ row.original.assignedToName }}</span>
          </div>
          <UBadge v-else-if="row.original.unassigned" size="sm" variant="subtle" color="warning" icon="i-lucide-user-x" label="Unassigned" />
          <span v-else class="text-muted">—</span>
        </template>
        <template #opened-cell="{ row }"><p class="whitespace-nowrap text-xs text-muted" :title="formatDateTime(row.original.createdAt)">{{ ago(row.original.createdAt) }}</p></template>
        <template #actions-cell="{ row }">
          <div class="text-right"><UButton :to="`/support/${row.original.id}`" size="sm" variant="ghost" color="neutral" icon="i-lucide-chevron-right" aria-label="Open ticket" /></div>
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
