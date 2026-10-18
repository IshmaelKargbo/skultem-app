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
const search = ref('')
const status = ref('ALL')
const from = ref('')
const to = ref('')

const rows = ref<AuditEntry[]>([])
const meta = ref<Meta>({} as Meta)
const loading = ref(false)
const failed = ref(false)

// A date picker gives a day; the range runs from the start of "from" to the end of "to".
const startOf = (d: string) => (d ? new Date(`${d}T00:00:00`).toISOString() : undefined)
const endOf = (d: string) => (d ? new Date(new Date(`${d}T00:00:00`).getTime() + 86400000).toISOString() : undefined)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const res = await PlatformApi().auditLogs({
      page: page.value, size: 20, search: search.value.trim() || undefined,
      status: status.value === 'ALL' ? undefined : status.value, from: startOf(from.value), to: endOf(to.value)
    })
    rows.value = res?.data ?? []
    meta.value = res?.meta ?? ({} as Meta)
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

// A fixed layout that always fits the screen: the action takes the free width, the school sits with the person.
const col = (w: string) => ({ meta: { class: { th: w, td: w } } })
const columns: TableColumn<AuditEntry>[] = [
  { id: 'when', header: 'When', ...col('w-36') },
  { id: 'action', header: 'Action' },
  { id: 'who', header: 'Who', ...col('w-[24%]') },
  { id: 'source', header: 'From', ...col('w-36') },
  { id: 'status', header: 'Result', ...col('w-32') }
]

const statusTabs = [
  { key: 'ALL', label: 'All activity', icon: 'i-lucide-list' },
  { key: 'SUCCESS', label: 'Succeeded', icon: 'i-lucide-circle-check' },
  { key: 'FAILURE', label: 'Failed', icon: 'i-lucide-circle-x' }
]
const rangePicks = [{ label: 'Today', days: 0 }, { label: '7 days', days: 6 }, { label: '30 days', days: 29 }]
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
function pickRange(days: number) {
  const end = new Date(), start = new Date()
  start.setDate(start.getDate() - days)
  from.value = ymd(start)
  to.value = ymd(end)
}
const rangeActive = (days: number) => { const s = new Date(); s.setDate(s.getDate() - days); return from.value === ymd(s) && to.value === ymd(new Date()) }
const filtersActive = computed(() => status.value !== 'ALL' || !!from.value || !!to.value || !!search.value.trim())
function clearFilters() { status.value = 'ALL'; from.value = ''; to.value = ''; search.value = '' }

// Actions that change who can get in or what they can do deserve a second look.
const SENSITIVE = /LOGIN|PASSWORD|ROLE|PERMISSION|DELETE|REMOVED|WIPE|STATUS_CHANGED|SESSION|ADMIN/
const isSensitive = (a: string) => SENSITIVE.test(a)
function actionIcon(a: string) {
  if (/LOGIN|LOGOUT|SESSION|PASSWORD/.test(a)) return 'i-lucide-key-round'
  if (/ROLE|PERMISSION|ADMIN/.test(a)) return 'i-lucide-shield'
  if (/DELETE|REMOVED|WIPE/.test(a)) return 'i-lucide-trash-2'
  if (/CREATED|ADDED/.test(a)) return 'i-lucide-plus-circle'
  if (/UPDATED|CHANGED|EDITED/.test(a)) return 'i-lucide-pencil'
  if (/PAYMENT|FEE|INVOICE/.test(a)) return 'i-lucide-banknote'
  return 'i-lucide-activity'
}
const initials = (name?: string | null) => (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?'
const sourceOf = (e: AuditEntry) => [e.browser, e.os].filter(Boolean).join(' · ')
function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days < 31 ? `${days} d ago` : formatDate(iso)
}

const humanize = (action: string) => {
  const text = action.toLowerCase().replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const selected = ref<AuditEntry | null>(null)
const open = ref(false)
const view = (e: AuditEntry) => { selected.value = e; open.value = true }

let timer: ReturnType<typeof setTimeout>
function reload() {
  if (page.value !== 1) page.value = 1
  else load()
}
watch([status, from, to], reload)
watch(search, () => { clearTimeout(timer); timer = setTimeout(reload, 350) })
watch(page, load)
onBeforeUnmount(() => clearTimeout(timer))

onMounted(() => {
  useAppStore().setTitle('System Admin · Audit Logs')
  useAppStore().setBack(false)
  document.title = 'Audit Logs | System Admin | Skultem'
  load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Audit Logs" subtitle="What happened on the platform, and who did it. Entries can't be changed or removed." />

    <div class="flex flex-wrap items-center gap-3">
      <Tab v-model="status" :tabs="statusTabs" />
      <div class="ml-auto flex flex-wrap gap-1.5">
        <button v-for="r in rangePicks" :key="r.label" type="button" class="rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="rangeActive(r.days) ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:border-primary/50'"
          @click="pickRange(r.days)">{{ r.label }}</button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-default p-2 shadow-sm ring-1 ring-default">
      <UInput v-model="search" icon="i-lucide-search" variant="soft" size="lg" placeholder="Search action, person or details" class="min-w-0 flex-1 sm:min-w-72" />
      <UInput v-model="from" type="date" variant="soft" size="lg" class="w-full sm:w-44" aria-label="From" />
      <UInput v-model="to" type="date" variant="soft" size="lg" class="w-full sm:w-44" aria-label="To" />
      <UButton v-if="filtersActive" variant="ghost" color="neutral" icon="i-lucide-x" label="Clear" @click="clearFilters" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="The audit log could not be loaded" class="m-4">
        <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
      </UAlert>

      <UTable v-else :columns="columns" :data="rows" :loading="loading" @select="(_e: any, row: any) => view(row.original)"
        :meta="{ class: { tr: (row: any) => row.original.status === 'FAILURE' ? 'bg-error/5 cursor-pointer' : 'cursor-pointer' } }"
        :ui="{ base: 'table-fixed w-full', thead: 'bg-elevated/50', th: 'py-3 text-[11px] font-semibold uppercase tracking-wide text-muted', td: 'py-3.5 align-top', tr: 'hover:bg-primary/5 transition-colors' }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-scroll-text" class="text-4xl text-gray-400" />
            <p class="text-gray-500">Nothing recorded for these filters.</p>
          </div>
        </template>
        <template #loading><TableLoading :size="columns.length" /></template>

        <template #when-cell="{ row }">
          <template v-if="row.original.createdAt">
            <p class="whitespace-nowrap text-sm text-highlighted">{{ ago(row.original.createdAt) }}</p>
            <p class="whitespace-nowrap text-[11px] text-muted">{{ formatDateTime(row.original.createdAt) }}</p>
          </template>
        </template>

        <template #action-cell="{ row }">
          <button type="button" class="flex w-full max-w-lg items-start gap-3 text-left" @click="view(row.original)">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-xl"
              :class="row.original.status === 'FAILURE' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'">
              <UIcon :name="actionIcon(row.original.action)" class="size-4" />
            </span>
            <span class="min-w-0">
              <span class="flex flex-wrap items-center gap-1.5">
                <span class="text-sm font-medium text-highlighted">{{ humanize(row.original.action) }}</span>
                <UBadge v-if="isSensitive(row.original.action)" size="sm" variant="subtle" color="warning" icon="i-lucide-shield-alert" label="Sensitive" />
              </span>
              <span class="mt-0.5 line-clamp-2 block text-xs" :class="row.original.status === 'FAILURE' ? 'font-medium text-error' : 'text-muted'">{{ row.original.details }}</span>
            </span>
          </button>
        </template>

        <template #who-cell="{ row }">
          <div class="flex min-w-0 items-start gap-2.5">
            <span v-if="row.original.userName || row.original.userEmail" class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[11px] font-semibold text-secondary-700">{{ initials(row.original.userName || row.original.userEmail) }}</span>
            <span v-else class="flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated text-muted"><UIcon name="i-lucide-cpu" class="size-4" /></span>
            <div class="min-w-0">
              <p class="truncate text-sm">{{ row.original.userName || row.original.userEmail || 'System' }}</p>
              <p class="flex items-center gap-1 truncate text-xs text-muted">
                <UIcon :name="row.original.schoolName ? 'i-lucide-school' : 'i-lucide-globe'" class="size-3 shrink-0" />{{ row.original.schoolName || 'Platform' }}
              </p>
            </div>
          </div>
        </template>

        <template #source-cell="{ row }">
          <p v-if="row.original.ipAddress" class="font-mono text-xs text-highlighted">{{ row.original.ipAddress }}</p>
          <p class="max-w-44 truncate text-[11px] text-muted" :title="sourceOf(row.original)">{{ sourceOf(row.original) || '—' }}</p>
        </template>

        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="row.original.status === 'FAILURE' ? 'error' : 'success'"
            :icon="row.original.status === 'FAILURE' ? 'i-lucide-circle-x' : 'i-lucide-circle-check'"
            :label="row.original.status === 'FAILURE' ? 'Failed' : 'Succeeded'" />
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <USlideover v-model:open="open" :title="selected ? humanize(selected.action) : 'Entry'">
      <template #body>
        <dl v-if="selected" class="space-y-3 text-sm">
          <div><dt class="text-xs text-muted">When</dt><dd>{{ selected.createdAt ? formatDateTime(selected.createdAt) : '—' }}</dd></div>
          <div><dt class="text-xs text-muted">Result</dt>
            <dd><UBadge size="xs" variant="subtle" :color="selected.status === 'FAILURE' ? 'error' : 'success'" :label="selected.status === 'FAILURE' ? 'Failed' : 'Succeeded'" /></dd></div>
          <div><dt class="text-xs text-muted">Who</dt><dd>{{ selected.userName || '—' }}<span v-if="selected.userEmail" class="text-muted"> · {{ selected.userEmail }}</span></dd></div>
          <div><dt class="text-xs text-muted">School</dt><dd>{{ selected.schoolName || 'Platform' }}</dd></div>
          <div><dt class="text-xs text-muted">Details</dt><dd class="whitespace-pre-wrap break-words">{{ selected.details || '—' }}</dd></div>
          <div><dt class="text-xs text-muted">From</dt><dd>{{ [selected.browser, selected.os, selected.device].filter(Boolean).join(' · ') || '—' }}<span v-if="selected.ipAddress" class="text-muted"> · {{ selected.ipAddress }}</span></dd></div>
          <p class="text-xs font-mono text-muted">{{ selected.action }} · {{ selected.id }}</p>
        </dl>
      </template>
    </USlideover>
  </div>
</template>
