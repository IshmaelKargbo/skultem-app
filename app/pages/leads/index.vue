<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const { error: toastError, success } = useNotify()

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
const mode = ref<'board' | 'list'>('board')
const loading = ref(false)
const movingId = ref<string | null>(null)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const res = await LeadApi().list({
      page: mode.value === 'board' ? 1 : page.value, size: mode.value === 'board' ? 100 : 10,
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

// The board: one column per stage, left to right. Lost and converted only show when you look at everything.
const STAGE_ORDER: LeadStatus[] = ['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'INTERESTED', 'ONBOARDING', 'CONVERTED', 'LOST']
const STAGE_DOT: Record<LeadStatus, string> = {
  NEW: 'bg-gray-400', CONTACTED: 'bg-primary-300', DEMO_SCHEDULED: 'bg-amber-500', DEMO_COMPLETED: 'bg-orange-500',
  INTERESTED: 'bg-primary-500', ONBOARDING: 'bg-secondary-500', CONVERTED: 'bg-success', LOST: 'bg-gray-300'
}
const columns_board = computed(() => STAGE_ORDER
  .filter(s => view.value === 'all' || !['CONVERTED', 'LOST'].includes(s))
  .map(s => ({ ...leadStatus(s), leads: leads.value.filter(l => l.status === s) })))
const progress = computed(() => STAGE_ORDER.map(s => ({ s, n: summary.value?.byStatus[s] ?? 0 })).filter(x => x.n > 0))

// Cards move one stage at a time, and only where the server allows it. Closing a lead (won or lost) needs more than a
// click, so that stays on the lead's own page.
function stepTarget(l: Lead, dir: -1 | 1): LeadStatus | null {
  const target = STAGE_ORDER[STAGE_ORDER.indexOf(l.status) + dir]
  return target && !['CONVERTED', 'LOST'].includes(target) && l.nextStatuses.includes(target) ? target : null
}

async function step(l: Lead, dir: -1 | 1) {
  const target = stepTarget(l, dir)
  if (!target) return
  movingId.value = l.id
  try {
    const updated = await LeadApi().changeStatus(l.id, target)
    if (updated) leads.value = leads.value.map(x => x.id === l.id ? updated : x)
    success(`${l.name} moved to ${leadStatus(target).label.toLowerCase()}`)
    loadSummary()
  } catch (err: any) {
    toastError(err.message)
  } finally {
    movingId.value = null
  }
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')

const viewTabs = computed(() => views.value.map(v => ({ key: v.value, label: v.label, count: v.count, warn: v.warn })))
const modeTabs = [{ key: 'board', label: 'Board', icon: 'i-lucide-kanban' }, { key: 'list', label: 'List', icon: 'i-lucide-list' }]

const metrics = computed(() => {
  const sm = summary.value
  const converted = sm?.byStatus.CONVERTED ?? 0
  const open = views.value[0]!.count
  return [
    { key: 'open', label: 'Open leads', value: open, icon: 'i-lucide-target', color: 'primary' as const, hint: 'Still being worked', view: 'open' },
    { key: 'awaiting', label: 'Awaiting follow-up', value: sm?.awaitingFollowUp, icon: 'i-lucide-phone-call', color: 'warning' as const,
      hint: sm?.overdue ? `${sm.overdue} overdue` : 'Nothing overdue', hintWarn: !!sm?.overdue, view: 'awaiting' },
    { key: 'unassigned', label: 'Unassigned', value: sm?.unassigned, icon: 'i-lucide-user-x', color: 'neutral' as const, hint: 'Needs an owner', view: 'unassigned' },
    { key: 'converted', label: 'Converted', value: converted, icon: 'i-lucide-circle-check', color: 'success' as const,
      hint: sm?.total ? `${Math.round(converted / sm.total * 100)}% of all leads` : '—', view: 'all' }
  ]
})
const filtersActive = computed(() => status.value !== 'ALL' || assignee.value !== 'ALL' || !!search.value.trim())
function clearFilters() { status.value = 'ALL'; assignee.value = 'ALL'; search.value = '' }

const overdue = (iso: string | null) => !!iso && new Date(iso).getTime() < Date.now() - 24 * 3600 * 1000

let timer: ReturnType<typeof setTimeout>
function reload() {
  clearTimeout(timer)
  if (page.value !== 1) page.value = 1
  else load()
}
watch([view, status, assignee, mode], reload)
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
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Leads & Follow-ups" subtitle="Every enquiry from the marketing site, worked until it becomes a school.">
      <UButton icon="i-lucide-user-plus" label="Add Lead" to="/leads/add" />
    </Heading>

    <!-- Metrics -->
    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <button v-for="m in metrics" :key="m.key" type="button" class="rounded-2xl text-left transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary"
        :class="view === m.view && m.key !== 'converted' ? 'ring-2 ring-primary' : ''" @click="view = m.view as any">
        <Metric :record="{ label: m.label, value: m.value ?? 0, subtle: m.hint, subtileColor: m.hintWarn ? 'error' : undefined, icon: m.icon, color: m.color, isReady: m.value !== undefined }" />
      </button>
    </div>

    <!-- Pipeline at a glance -->
    <div v-if="progress.length" class="rounded-2xl bg-default p-4 shadow-sm ring-1 ring-default">
      <div class="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        <div v-for="p in progress" :key="p.s" :class="STAGE_DOT[p.s]" :style="{ flexGrow: p.n }" :title="`${leadStatus(p.s).label}: ${p.n}`" />
      </div>
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <button v-for="p in progress" :key="p.s" type="button" class="flex items-center gap-1.5 text-xs text-muted transition hover:text-highlighted"
          :class="status === p.s ? 'font-semibold text-highlighted' : ''" @click="status = status === p.s ? 'ALL' : p.s">
          <span class="size-2 rounded-full" :class="STAGE_DOT[p.s]" />{{ leadStatus(p.s).label }} <span class="font-semibold text-highlighted">{{ p.n }}</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <Tab v-model="view" :tabs="viewTabs" />
      <Tab v-model="mode" class="ml-auto" :tabs="modeTabs" />
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-default p-2 shadow-sm ring-1 ring-default">
      <UInput v-model="search" icon="i-lucide-search" variant="soft" size="lg" placeholder="Search name, school, email or phone" class="min-w-0 flex-1 sm:min-w-72" />
      <USelect v-model="status" :items="statusItems" value-key="value" variant="soft" size="lg" class="w-full sm:w-48" icon="i-lucide-list-filter" />
      <USelect v-model="assignee" :items="staffItems" value-key="value" variant="soft" size="lg" class="w-full sm:w-48" icon="i-lucide-user" />
      <UButton v-if="filtersActive" variant="ghost" color="neutral" icon="i-lucide-x" label="Clear" @click="clearFilters" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Leads could not be loaded" class="m-4">
        <template #actions>
          <UButton size="xs" color="error" variant="outline" label="Try again" @click="load" />
        </template>
      </UAlert>

      <div v-else-if="mode === 'board'" class="overflow-x-auto p-4">
        <div v-if="loading && !leads.length" class="flex gap-4"><USkeleton v-for="n in 4" :key="n" class="h-64 w-72 shrink-0 rounded-2xl" /></div>
        <div v-else class="flex items-start gap-4">
          <section v-for="c in columns_board" :key="c.value" class="w-72 shrink-0 rounded-2xl bg-elevated/60 p-3">
            <header class="mb-3 flex items-center justify-between gap-2 px-1">
              <h4 class="flex items-center gap-2 text-sm font-semibold text-highlighted">
                <span class="size-2.5 rounded-full" :class="STAGE_DOT[c.value]" />{{ c.label }}
              </h4>
              <span class="text-xs font-medium text-muted">{{ summary?.byStatus[c.value] ?? c.leads.length }} {{ (summary?.byStatus[c.value] ?? c.leads.length) === 1 ? 'lead' : 'leads' }}</span>
            </header>
            <ul class="space-y-2.5">
              <li v-for="l in c.leads" :key="l.id" class="rounded-xl bg-default p-3 shadow-sm ring-1 ring-default">
                <NuxtLink :to="`/leads/${l.id}`" class="block">
                  <p class="font-medium leading-snug text-highlighted hover:text-primary">{{ l.name }}</p>
                  <p class="mt-0.5 truncate text-xs text-muted">{{ [l.schoolName, l.city].filter(Boolean).join(' · ') || l.email || leadSourceLabel(l.source) }}</p>
                </NuxtLink>
                <p v-if="l.nextFollowUpAt || l.awaitingFollowUp" class="mt-2 flex items-center gap-1 text-[11px]" :class="l.awaitingFollowUp ? 'text-warning' : 'text-muted'">
                  <UIcon name="i-lucide-clock" class="size-3" />
                  {{ l.nextFollowUpAt ? formatDateTime(l.nextFollowUpAt) : 'Not contacted yet' }}<template v-if="overdue(l.nextFollowUpAt) && l.awaitingFollowUp"> · Overdue</template>
                </p>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <div class="flex gap-1.5">
                    <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-arrow-left" aria-label="Move back"
                      :disabled="!stepTarget(l, -1) || movingId === l.id" @click="step(l, -1)" />
                    <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-arrow-right" aria-label="Move forward"
                      :disabled="!stepTarget(l, 1) || movingId === l.id" :loading="movingId === l.id" @click="step(l, 1)" />
                  </div>
                  <span v-if="l.assignedToName" class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary" :title="l.assignedToName">{{ initials(l.assignedToName) }}</span>
                  <UBadge v-else-if="!['CONVERTED', 'LOST'].includes(l.status)" size="sm" variant="outline" color="warning" label="Unassigned" />
                </div>
              </li>
              <li v-if="!c.leads.length" class="rounded-xl border border-dashed border-default px-3 py-6 text-center text-xs text-muted">No leads here</li>
            </ul>
          </section>
        </div>
        <p v-if="meta.total && meta.total > leads.length" class="mt-3 text-xs text-muted">Showing the first {{ leads.length }} of {{ meta.total }} - narrow the filters to see the rest.</p>
      </div>

      <UTable v-else :columns="columns" :data="leads" :loading="loading"
        :ui="{ thead: 'bg-elevated/50', th: 'py-3 text-[11px] font-semibold uppercase tracking-wide text-muted', td: 'py-3.5', tr: 'hover:bg-primary/5 transition-colors' }">
        <template #empty>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-target" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No leads match.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #lead-cell="{ row }">
          <NuxtLink :to="`/leads/${row.original.id}`" class="group flex min-w-0 items-center gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{{ initials(row.original.name) || '?' }}</span>
            <span class="min-w-0">
              <span class="block truncate font-medium text-highlighted group-hover:text-primary">{{ row.original.name }}</span>
              <span class="block truncate text-xs text-muted">
                {{ [row.original.schoolName, row.original.city].filter(Boolean).join(' · ') || row.original.email || '—' }}
              </span>
              <span class="block text-[11px] text-muted">{{ leadSourceLabel(row.original.source) }} · {{ formatDate(row.original.createdAt) }}</span>
            </span>
          </NuxtLink>
        </template>

        <template #status-cell="{ row }">
          <span class="inline-flex items-center gap-2 rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-highlighted">
            <span class="size-2 rounded-full" :class="STAGE_DOT[row.original.status]" />{{ leadStatus(row.original.status).label }}
          </span>
        </template>

        <template #assigned-cell="{ row }">
          <div v-if="row.original.assignedToName" class="flex items-center gap-2">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-semibold text-secondary-700">{{ initials(row.original.assignedToName) }}</span>
            <span class="truncate text-sm">{{ row.original.assignedToName }}</span>
          </div>
          <UBadge v-else-if="!['CONVERTED', 'LOST'].includes(row.original.status)" size="sm" variant="subtle" color="warning" icon="i-lucide-user-x" label="Unassigned" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #followUp-cell="{ row }">
          <template v-if="row.original.nextFollowUpAt">
            <p class="flex items-center gap-1.5 text-sm" :class="row.original.awaitingFollowUp ? 'font-medium text-warning' : ''">
              <UIcon name="i-lucide-clock" class="size-3.5 shrink-0" />{{ formatDateTime(row.original.nextFollowUpAt) }}
            </p>
            <p v-if="overdue(row.original.nextFollowUpAt) && row.original.awaitingFollowUp" class="text-[11px] font-medium text-error">Overdue</p>
          </template>
          <UBadge v-else-if="row.original.awaitingFollowUp" size="sm" variant="subtle" color="warning" label="Not contacted yet" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #demo-cell="{ row }">
          <p v-if="row.original.demoAt && row.original.demoStatus === 'SCHEDULED'" class="flex items-center gap-1.5 text-sm">
            <UIcon name="i-lucide-calendar-clock" class="size-3.5 shrink-0 text-muted" />{{ formatDateTime(row.original.demoAt) }}
          </p>
          <UBadge v-else-if="row.original.demoStatus === 'COMPLETED'" size="sm" variant="subtle" color="success" icon="i-lucide-check" label="Completed" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton :to="`/leads/${row.original.id}`" size="sm" variant="ghost" color="neutral" icon="i-lucide-chevron-right" aria-label="Open lead" />
          </div>
        </template>
      </UTable>

      <template v-if="mode === 'list'" #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
