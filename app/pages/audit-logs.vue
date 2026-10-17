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

const columns: TableColumn<AuditEntry>[] = [
  { id: 'when', header: 'When' },
  { id: 'action', header: 'Action' },
  { id: 'who', header: 'Who' },
  { id: 'school', header: 'School' },
  { id: 'status', header: 'Result' }
]

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

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap gap-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search action, person or details" class="w-full sm:w-72" />
          <USelect v-model="status" value-key="value" class="w-40"
            :items="[{ label: 'Any result', value: 'ALL' }, { label: 'Succeeded', value: 'SUCCESS' }, { label: 'Failed', value: 'FAILURE' }]" />
          <UInput v-model="from" type="date" class="w-40" aria-label="From" />
          <UInput v-model="to" type="date" class="w-40" aria-label="To" />
        </div>
      </template>

      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="The audit log could not be loaded" class="m-4">
        <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
      </UAlert>

      <UTable v-else :columns="columns" :data="rows" :loading="loading" @select="(_e: any, row: any) => view(row.original)">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-scroll-text" class="text-4xl text-gray-400" />
            <p class="text-gray-500">Nothing recorded for these filters.</p>
          </div>
        </template>
        <template #loading><TableLoading :size="columns.length" /></template>

        <template #when-cell="{ row }"><p class="whitespace-nowrap text-xs text-muted">{{ row.original.createdAt ? formatDateTime(row.original.createdAt) : '' }}</p></template>
        <template #action-cell="{ row }">
          <button type="button" class="block text-left" @click="view(row.original)">
            <p class="text-sm font-medium text-highlighted hover:text-primary">{{ humanize(row.original.action) }}</p>
            <p class="max-w-md truncate text-xs text-muted">{{ row.original.details }}</p>
          </button>
        </template>
        <template #who-cell="{ row }">
          <p class="text-sm">{{ row.original.userName || '—' }}</p>
          <p class="text-xs text-muted">{{ row.original.userEmail || '' }}</p>
        </template>
        <template #school-cell="{ row }"><p class="text-sm">{{ row.original.schoolName || 'Platform' }}</p></template>
        <template #status-cell="{ row }">
          <UBadge size="xs" variant="subtle" :color="row.original.status === 'FAILURE' ? 'error' : 'success'"
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
