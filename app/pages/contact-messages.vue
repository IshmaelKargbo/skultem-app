<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useMarketingStore()
const { messages, messagesMeta, loading } = storeToRefs(store)
const { success, error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

// Filtering lives in this variable, not the URL.
const status = ref<string>('ALL')
const statusFilters = [{ label: 'All', value: 'ALL' }, ...CONTACT_STATUS_OPTIONS.map(o => ({ label: o.label, value: o.value }))]
const statusColor = (s: ContactStatus) => CONTACT_STATUS_OPTIONS.find(o => o.value === s)?.color ?? 'neutral'
const statusLabel = (s: ContactStatus) => CONTACT_STATUS_OPTIONS.find(o => o.value === s)?.label ?? s

const columns: TableColumn<ContactMessage>[] = [
  { id: 'from', header: 'From' },
  { id: 'school', header: 'School' },
  { id: 'challenge', header: 'Main challenge' },
  { id: 'status', header: 'Status' },
  { id: 'lead', header: 'Lead' },
  { accessorKey: 'createdAt', header: 'Received' },
  { id: 'actions', header: '' }
]

const load = () => store.fetchMessages(page.value, 10, status.value === 'ALL' ? undefined : status.value)

const selected = ref<ContactMessage | null>(null)
const detailOpen = ref(false)

async function setStatus(m: ContactMessage, next: ContactStatus) {
  try {
    await MarketingApi().updateMessageStatus(m.id, next)
    if (selected.value?.id === m.id) selected.value = { ...selected.value, status: next }
    await Promise.all([load(), store.fetchUnread()])
  } catch (err: any) {
    toastError(err.message)
  }
}

// Opening a new message marks it read.
async function view(m: ContactMessage) {
  selected.value = m
  detailOpen.value = true
  if (m.status === 'NEW') await setStatus(m, 'READ')
}

const deleteTarget = ref<ContactMessage | null>(null)
const deleteOpen = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await MarketingApi().deleteMessage(deleteTarget.value.id)
    success('Message deleted')
    detailOpen.value = false
    await Promise.all([load(), store.fetchUnread()])
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

function rowActions(m: ContactMessage) {
  return [[
    { label: 'View', icon: 'i-lucide-eye', onSelect: () => view(m) },
    ...CONTACT_STATUS_OPTIONS.filter(o => o.value !== m.status)
      .map(o => ({ label: `Mark ${o.label.toLowerCase()}`, icon: 'i-lucide-tag', onSelect: () => setStatus(m, o.value) }))
  ], [
    {
      label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const,
      onSelect: () => { deleteTarget.value = m; deleteOpen.value = true }
    }
  ]]
}

watch(page, load)
watch(status, () => {
  if (page.value !== 1) page.value = 1
  else load()
})

onMounted(() => {
  useAppStore().setTitle('System Admin · Contact Messages')
  useAppStore().setBack(false)
  document.title = 'Contact Messages | System Admin | Skultem'
  load()
  store.fetchUnread()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Contact Messages" subtitle="Messages sent from the marketing site's contact form.">
      <UBadge v-if="store.unread" color="primary" variant="subtle" size="lg">{{ store.unread }} new</UBadge>
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <USelect v-model="status" :items="statusFilters" class="w-44" />
      </template>

      <UTable :columns="columns" :data="messages" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-inbox" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No messages.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #from-cell="{ row }">
          <div class="space-y-0.5">
            <p class="font-medium" :class="row.original.status === 'NEW' ? 'text-highlighted' : ''">{{ row.original.name }}</p>
            <a :href="`mailto:${row.original.email}`" class="block text-xs text-primary">{{ row.original.email }}</a>
            <a v-if="row.original.phone" :href="`tel:${row.original.phone}`" class="block text-xs text-muted">{{ row.original.phone }}</a>
          </div>
        </template>

        <template #school-cell="{ row }">
          <p class="text-sm font-medium text-highlighted">{{ row.original.school || '—' }}</p>
        </template>

        <template #challenge-cell="{ row }">
          <button type="button" class="block max-w-md text-left" @click="view(row.original)">
            <p class="line-clamp-2 text-sm text-muted">{{ row.original.challenge }}</p>
          </button>
        </template>

        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="statusColor(row.original.status)" :label="statusLabel(row.original.status)" />
        </template>

        <template #lead-cell="{ row }">
          <div v-if="row.original.lead" class="space-y-0.5">
            <UBadge size="xs" variant="subtle" :color="leadStatus(row.original.lead.status).color" :label="leadStatus(row.original.lead.status).label" />
            <p class="text-xs text-muted">{{ row.original.lead.assignedToName || 'Unassigned' }}</p>
          </div>
          <span v-else class="text-xs text-muted">—</span>
        </template>

        <template #createdAt-cell="{ row }">
          <p class="text-xs text-muted">{{ formatDateTime(row.original.createdAt) }}</p>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
            </UDropdownMenu>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="messagesMeta" />
          <UPagination v-model:page="page" size="sm" :page-size="messagesMeta.size"
            :items-per-page="messagesMeta.size" :total="messagesMeta.total" show-edges />
        </div>
      </template>
    </UCard>

    <USlideover v-model:open="detailOpen" :title="selected?.school || selected?.name || 'Message'">
      <template #body>
        <div v-if="selected" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-semibold text-highlighted">{{ selected.name }}</p>
              <a :href="`mailto:${selected.email}`" class="block text-sm text-primary">{{ selected.email }}</a>
              <a v-if="selected.phone" :href="`tel:${selected.phone}`" class="block text-sm text-muted">{{ selected.phone }}</a>
            </div>
            <UBadge variant="subtle" :color="statusColor(selected.status)" :label="statusLabel(selected.status)" />
          </div>
          <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt class="text-xs text-muted">School</dt>
              <dd class="font-medium text-highlighted">{{ selected.school || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Received</dt>
              <dd class="font-medium text-highlighted">{{ formatDateTime(selected.createdAt) }}</dd>
            </div>
          </dl>
          <div class="space-y-1.5">
            <p class="text-xs text-muted">Main challenge</p>
            <p class="whitespace-pre-wrap rounded-lg bg-elevated/40 p-4 text-sm">{{ selected.challenge }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <div v-if="selected" class="flex flex-wrap gap-2">
          <UButton icon="i-lucide-mail" label="Reply by email" :href="`mailto:${selected.email}?subject=${encodeURIComponent(`Re: your Skultem enquiry${selected.school ? ` (${selected.school})` : ''}`)}`"
            @click="setStatus(selected, 'REPLIED')" />
          <UButton v-if="selected.lead" :to="`/leads/${selected.lead.id}`" label="Open lead" variant="soft" color="neutral" icon="i-lucide-target" />
          <UButton label="Archive" variant="outline" color="neutral" icon="i-lucide-archive"
            @click="setStatus(selected, 'ARCHIVED')" />
          <UButton label="Delete" variant="ghost" color="error" icon="i-lucide-trash-2"
            @click="deleteTarget = selected; deleteOpen = true" />
        </div>
      </template>
    </USlideover>

    <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Message"
      :item-name="deleteTarget.name" :on-confirm="confirmDelete"
      description="This permanently removes the message." />
  </div>
</template>
