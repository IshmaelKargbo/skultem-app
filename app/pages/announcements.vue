<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const { success, error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const items = ref<PlatformAnnouncement[]>([])
const meta = ref<Meta>({} as Meta)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await AnnouncementApi().list(page.value, 10)
    items.value = res?.data ?? []
    meta.value = res?.meta ?? ({} as Meta)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

const columns: TableColumn<PlatformAnnouncement>[] = [
  { id: 'announcement', header: 'Announcement' },
  { id: 'severity', header: 'Level' },
  { id: 'window', header: 'Shown' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]

// <input type="datetime-local"> wants "yyyy-MM-ddTHH:mm" in the user's own time; the server stores a moment in time.
const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null)

type Form = { title: string, message: string, severity: AnnouncementSeverity, active: boolean, startsAt: string, endsAt: string }
const emptyForm = (): Form => ({ title: '', message: '', severity: 'INFO', active: true, startsAt: '', endsAt: '' })

const open = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<Form>(emptyForm())
const saving = ref(false)

function startCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  open.value = true
}

function startEdit(a: PlatformAnnouncement) {
  editingId.value = a.id
  Object.assign(form, {
    title: a.title, message: a.message, severity: a.severity, active: a.active,
    startsAt: toLocalInput(a.startsAt), endsAt: toLocalInput(a.endsAt)
  })
  open.value = true
}

const errors = computed(() => ({
  title: !form.title.trim() ? 'Title is required' : '',
  message: !form.message.trim() ? 'Message is required' : form.message.length > 2000 ? 'Keep the message under 2000 characters' : '',
  window: form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt) ? 'The end must be after the start' : ''
}))
const showErrors = ref(false)
const shown = (k: keyof typeof errors.value) => (showErrors.value && errors.value[k]) || undefined

const payload = (): SaveAnnouncementDto => ({
  title: form.title, message: form.message, severity: form.severity, active: form.active,
  startsAt: fromLocalInput(form.startsAt), endsAt: fromLocalInput(form.endsAt)
})

async function save() {
  showErrors.value = true
  const first = Object.values(errors.value).find(Boolean)
  if (first) {
    toastError(first)
    return
  }

  saving.value = true
  try {
    if (editingId.value) await AnnouncementApi().update(editingId.value, payload())
    else await AnnouncementApi().create(payload())
    success(editingId.value ? 'Announcement updated' : 'Announcement posted')
    open.value = false
    showErrors.value = false
    await load()
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

async function toggle(a: PlatformAnnouncement) {
  try {
    await AnnouncementApi().update(a.id, {
      title: a.title, message: a.message, severity: a.severity, active: !a.active,
      startsAt: a.startsAt, endsAt: a.endsAt
    })
    await load()
  } catch (err: any) {
    toastError(err.message)
  }
}

const deleteTarget = ref<PlatformAnnouncement | null>(null)
const deleteOpen = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await AnnouncementApi().remove(deleteTarget.value.id)
    success('Announcement deleted')
    await load()
  } catch (err: any) {
    toastError(err.message)
    throw err
  }
}

function rowActions(a: PlatformAnnouncement) {
  return [[
    { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => startEdit(a) },
    { label: a.active ? 'Switch off' : 'Switch on', icon: a.active ? 'i-lucide-eye-off' : 'i-lucide-eye', onSelect: () => toggle(a) }
  ], [
    { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => { deleteTarget.value = a; deleteOpen.value = true } }
  ]]
}

const windowText = (a: PlatformAnnouncement) => {
  if (!a.startsAt && !a.endsAt) return 'Until switched off'
  const f = (iso: string) => formatDateTime(iso)
  if (a.startsAt && a.endsAt) return `${f(a.startsAt)} → ${f(a.endsAt)}`
  return a.startsAt ? `From ${f(a.startsAt)}` : `Until ${f(a.endsAt!)}`
}

const statusOf = (a: PlatformAnnouncement) => {
  if (a.live) return { label: 'Live', color: 'success' as const }
  if (!a.active) return { label: 'Off', color: 'neutral' as const }
  if (a.endsAt && new Date(a.endsAt) <= new Date()) return { label: 'Ended', color: 'neutral' as const }
  return { label: 'Scheduled', color: 'info' as const }
}

watch(page, load)

onMounted(() => {
  useAppStore().setTitle('System Admin · Announcements')
  useAppStore().setBack(false)
  document.title = 'Announcements | System Admin | Skultem'
  load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Announcements" subtitle="Messages every user, in every school, sees on their notice board.">
      <UButton icon="i-lucide-megaphone" label="New Announcement" @click="startCreate" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="items" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-megaphone" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No announcements yet.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #announcement-cell="{ row }">
          <div class="min-w-0">
            <p class="truncate font-medium text-highlighted">{{ row.original.title }}</p>
            <p class="line-clamp-2 max-w-md text-xs text-muted">{{ row.original.message }}</p>
          </div>
        </template>

        <template #severity-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="announcementSeverity(row.original.severity).color"
            :icon="announcementSeverity(row.original.severity).icon" :label="announcementSeverity(row.original.severity).label" />
        </template>

        <template #window-cell="{ row }">
          <p class="text-xs text-muted">{{ windowText(row.original) }}</p>
        </template>

        <template #status-cell="{ row }">
          <UBadge size="sm" variant="subtle" :color="statusOf(row.original).color" :label="statusOf(row.original).label" />
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
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
            show-edges />
        </div>
      </template>
    </UCard>

    <USlideover v-model:open="open" :title="editingId ? 'Edit Announcement' : 'New Announcement'">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="save">
          <UFormField label="Title" required :error="shown('title')">
            <UInput v-model="form.title" maxlength="255" class="w-full" placeholder="e.g. Scheduled maintenance on Saturday" />
          </UFormField>

          <UFormField label="Message" required :error="shown('message')" :help="`${form.message.length}/2000`">
            <UTextarea v-model="form.message" :rows="5" autoresize maxlength="2000" class="w-full"
              placeholder="What do you want everyone to know?" />
          </UFormField>

          <UFormField label="Level">
            <div class="grid gap-2">
              <button v-for="s in ANNOUNCEMENT_SEVERITIES" :key="s.value" type="button"
                class="flex items-center gap-3 rounded-lg border p-3 text-left transition"
                :class="form.severity === s.value ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50'"
                @click="form.severity = s.value">
                <UBadge :color="s.color" variant="subtle" :icon="s.icon" class="shrink-0 rounded-lg p-2" />
                <span>
                  <span class="block text-sm font-medium text-highlighted">{{ s.label }}</span>
                  <span class="block text-xs text-muted">{{ s.hint }}</span>
                </span>
              </button>
            </div>
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Show from" help="Blank = straight away">
              <UInput v-model="form.startsAt" type="datetime-local" class="w-full" />
            </UFormField>
            <UFormField label="Show until" help="Blank = until switched off" :error="shown('window')">
              <UInput v-model="form.endsAt" type="datetime-local" class="w-full" />
            </UFormField>
          </div>

          <USwitch v-model="form.active" label="Switched on" />
        </UForm>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton icon="i-lucide-send" :label="editingId ? 'Save changes' : 'Post announcement'" :loading="saving" @click="save" />
          <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="open = false" />
        </div>
      </template>
    </USlideover>

    <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Announcement"
      :item-name="deleteTarget.title" :on-confirm="confirmDelete"
      description="This removes the announcement from everyone's notice board." />
  </div>
</template>
