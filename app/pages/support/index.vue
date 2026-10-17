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

const columns: TableColumn<SupportTicket>[] = [
  { id: 'ticket', header: 'Ticket' },
  { id: 'school', header: 'School' },
  { id: 'priority', header: 'Priority' },
  { id: 'status', header: 'Status' },
  { id: 'assigned', header: 'Assigned to' },
  { id: 'opened', header: 'Opened' }
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

    <div v-if="summary" class="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <button v-for="s in TICKET_STATUSES" :key="s.value" type="button"
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
              <UBadge v-if="v.count !== undefined" size="xs" variant="subtle" :color="v.warn && v.count ? 'warning' : 'neutral'" :label="v.count" />
            </UButton>
          </div>
          <div class="flex flex-wrap gap-2">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search number, subject, person or school" class="w-full sm:w-72" />
            <USelect v-model="status" :items="statusItems" value-key="value" class="w-44" />
            <USelect v-model="priority" :items="priorityItems" value-key="value" class="w-40" />
            <USelect v-model="assignee" :items="staffItems" value-key="value" class="w-44" icon="i-lucide-user" />
          </div>
        </div>
      </template>

      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Tickets could not be loaded" class="m-4">
        <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
      </UAlert>

      <UTable v-else :columns="columns" :data="tickets" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-life-buoy" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No tickets match.</p>
          </div>
        </template>
        <template #loading><TableLoading :size="columns.length" /></template>

        <template #ticket-cell="{ row }">
          <NuxtLink :to="`/support/${row.original.id}`" class="block min-w-0">
            <p class="truncate font-medium text-highlighted hover:text-primary">{{ row.original.subject }}</p>
            <p class="truncate text-xs text-muted">{{ row.original.number }} · {{ ticketCategoryLabel(row.original.category) }} · {{ row.original.requesterName }}</p>
          </NuxtLink>
        </template>
        <template #school-cell="{ row }"><p class="text-sm">{{ row.original.schoolName || '—' }}</p></template>
        <template #priority-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="ticketPriority(row.original.priority).color" :label="ticketPriority(row.original.priority).label" />
        </template>
        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="ticketStatus(row.original.status).color" :icon="ticketStatus(row.original.status).icon" :label="ticketStatus(row.original.status).label" />
        </template>
        <template #assigned-cell="{ row }">
          <p v-if="row.original.assignedToName" class="text-sm">{{ row.original.assignedToName }}</p>
          <UBadge v-else-if="row.original.unassigned" size="sm" variant="outline" color="warning" label="Unassigned" />
          <span v-else class="text-muted">—</span>
        </template>
        <template #opened-cell="{ row }"><p class="whitespace-nowrap text-xs text-muted">{{ formatDateTime(row.original.createdAt) }}</p></template>
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
