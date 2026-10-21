<script setup lang="ts">
const route = useRoute()
const { success, error: toastError } = useNotify()

const id = computed(() => route.params.id as string)

const detail = ref<TicketDetail>()
const staff = ref<StaffMember[]>([])
const loading = ref(true)
const notFound = ref(false)
const busy = ref(false)

const ticket = computed(() => detail.value?.ticket)
const closed = computed(() => ticket.value?.status === 'CLOSED')

async function load() {
  try {
    detail.value = await SupportApi().ticket(id.value)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

// Every action returns the ticket fresh, so the history and status always match what is recorded.
async function act(run: () => Promise<TicketDetail | undefined>, done?: string) {
  busy.value = true
  try {
    const next = await run()
    if (next) detail.value = next
    if (done) success(done)
    return true
  } catch (err: any) {
    toastError(err.message)
    return false
  } finally {
    busy.value = false
  }
}

const staffItems = computed(() => staff.value.map(s => ({ label: s.name, value: s.id })))
const assignee = computed({
  get: () => ticket.value?.assignedToId ?? undefined,
  set: (v) => act(() => SupportApi().update(id.value, v ? { assignedToId: v } : { clearAssignee: true }), 'Assignment updated')
})
const priority = computed({
  get: () => ticket.value?.priority,
  set: (v) => act(() => SupportApi().update(id.value, { priority: v }), 'Priority updated')
})
const category = computed({
  get: () => ticket.value?.category,
  set: (v) => act(() => SupportApi().update(id.value, { category: v }), 'Category updated')
})

// ---- status (resolving asks how it was fixed) ----
const resolveOpen = ref(false)
const resolution = ref('')
function moveTo(status: TicketStatus) {
  if (status === 'RESOLVED') {
    resolution.value = ''
    resolveOpen.value = true
    return
  }
  return act(() => SupportApi().changeStatus(id.value, status), `Moved to ${ticketStatus(status).label.toLowerCase()}`)
}
async function confirmResolve() {
  if (!resolution.value.trim()) return toastError('Say how it was resolved')
  const ok = await act(() => SupportApi().changeStatus(id.value, 'RESOLVED', resolution.value.trim()), 'Ticket resolved')
  if (ok) resolveOpen.value = false
}

// ---- conversation ----
type Kind = 'REPLY' | 'FROM_SCHOOL' | 'INTERNAL'
const kinds: { value: Kind, label: string, icon: string, hint: string }[] = [
  { value: 'REPLY', label: 'Reply to school', icon: 'i-lucide-reply', hint: 'What you told the school. It is recorded here - send it by email or phone as well.' },
  { value: 'FROM_SCHOOL', label: 'From the school', icon: 'i-lucide-message-square-text', hint: 'What the school said back. Moves a waiting or resolved ticket back to in progress.' },
  { value: 'INTERNAL', label: 'Internal note', icon: 'i-lucide-lock', hint: 'Only staff see this.' }
]
const kind = ref<Kind>('REPLY')
const body = ref('')

async function send() {
  if (!body.value.trim()) return toastError('Write something first')
  const ok = await act(() => SupportApi().addMessage(id.value, kind.value, body.value.trim()), 'Added to the ticket')
  if (ok) body.value = ''
}

const mailto = computed(() => ticket.value?.requesterEmail
  ? `mailto:${ticket.value.requesterEmail}?subject=${encodeURIComponent(`Re: ${ticket.value.subject} (${ticket.value.number})`)}`
  : undefined)

const kindStyle = (k: TicketMessageKind) => ({
  REPLY: { label: 'Reply to school', icon: 'i-lucide-reply', ring: 'ring-primary/40' },
  FROM_SCHOOL: { label: 'From the school', icon: 'i-lucide-message-square-text', ring: 'ring-success/40' },
  INTERNAL: { label: 'Internal note', icon: 'i-lucide-lock', ring: 'ring-warning/40' },
  SYSTEM: { label: 'Update', icon: 'i-lucide-info', ring: 'ring-default' }
}[k])

onMounted(async () => {
  useAppStore().setTitle('System Admin · Ticket')
  useAppStore().setBack('/support')
  document.title = 'Ticket | Support | System Admin | Skultem'
  staff.value = await LeadApi().staff().catch(() => [])
  await load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <UCard v-if="notFound">
      <div class="flex flex-col items-center gap-2 py-10">
        <UIcon name="i-lucide-ticket-x" class="text-4xl text-gray-400" />
        <p class="text-gray-500">This ticket doesn't exist any more.</p>
        <UButton to="/support" variant="soft" label="Back to tickets" />
      </div>
    </UCard>

    <template v-else>
      <Heading :title="ticket?.subject || 'Ticket'" :subtitle="ticket ? `${ticket.number} · ${ticketCategoryLabel(ticket.category)}` : ''">
        <UBadge v-if="ticket" size="lg" variant="subtle" :color="ticketStatus(ticket.status).color" :icon="ticketStatus(ticket.status).icon" :label="ticketStatus(ticket.status).label" />
      </Heading>

      <div v-if="loading" class="grid gap-4 lg:grid-cols-3"><USkeleton class="h-96 lg:col-span-2" /><USkeleton class="h-72" /></div>

      <div v-else-if="ticket" class="grid items-start gap-4 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <UAlert v-if="ticket.status === 'RESOLVED'" color="success" variant="soft" icon="i-lucide-circle-check" title="Resolved"
            :description="ticket.resolutionNote || undefined">
            <template #actions><UButton size="xs" variant="outline" color="success" label="Reopen" :loading="busy" @click="moveTo('OPEN')" /></template>
          </UAlert>

          <UCard>
            <p class="text-xs font-medium uppercase tracking-wide text-muted">What is wrong</p>
            <p class="mt-1 whitespace-pre-wrap text-sm">{{ ticket.description }}</p>
          </UCard>

          <UCard>
            <template #header><div class="flex items-center gap-2"><UIcon name="i-lucide-messages-square" class="text-primary" /><span class="font-semibold">Conversation</span></div></template>

            <div v-if="!closed" class="space-y-3">
              <div class="flex flex-wrap gap-1.5">
                <UButton v-for="k in kinds" :key="k.value" size="xs" :icon="k.icon" :label="k.label"
                  :variant="kind === k.value ? 'solid' : 'soft'" :color="kind === k.value ? 'primary' : 'neutral'" @click="kind = k.value" />
              </div>
              <p class="text-xs text-muted">{{ kinds.find(k => k.value === kind)?.hint }}</p>
              <UTextarea v-model="body" :rows="3" autoresize maxlength="10000" class="w-full" />
              <div class="flex flex-wrap items-center justify-end gap-2">
                <UButton v-if="mailto && kind === 'REPLY'" :href="mailto" size="sm" variant="ghost" color="neutral" icon="i-lucide-mail" label="Open email" />
                <UButton icon="i-lucide-plus" label="Add to ticket" :loading="busy" :disabled="!body.trim()" @click="send" />
              </div>
            </div>
            <p v-else class="text-sm text-muted">This ticket is closed.</p>

            <ol class="mt-5 space-y-3">
              <li v-for="m in [...detail!.messages].reverse()" :key="m.id" class="rounded-lg p-3 ring-1" :class="[kindStyle(m.kind).ring, m.kind === 'SYSTEM' ? 'bg-transparent' : 'bg-elevated/40']">
                <p class="flex items-center gap-1.5 text-[11px] font-medium text-muted"><UIcon :name="kindStyle(m.kind).icon" class="size-3.5" /> {{ kindStyle(m.kind).label }}</p>
                <p class="mt-1 whitespace-pre-wrap text-sm" :class="m.kind === 'SYSTEM' ? 'text-toned' : 'text-highlighted'">{{ m.body }}</p>
                <p class="mt-1 text-[11px] text-muted">{{ m.createdByName || 'System' }} · {{ formatDateTime(m.createdAt) }}</p>
              </li>
            </ol>
          </UCard>
        </div>

        <div class="space-y-4 lg:sticky lg:top-6">
          <UCard v-if="ticket.nextStatuses.length">
            <template #header><span class="font-semibold">Move this ticket</span></template>
            <div class="flex flex-wrap gap-2">
              <UButton v-for="s in ticket.nextStatuses" :key="s" size="sm" :icon="ticketStatus(s).icon" :label="ticketStatus(s).label"
                :variant="'soft'" :color="ticketStatus(s).color" :loading="busy" @click="moveTo(s)" />
            </div>
          </UCard>

          <UCard>
            <template #header><span class="font-semibold">Details</span></template>
            <div class="space-y-4">
              <UFormField label="Assigned to">
                <USelect v-model="assignee" :items="staffItems" value-key="value" class="w-full" placeholder="Nobody yet" icon="i-lucide-user-check" :disabled="busy || closed" />
              </UFormField>
              <UFormField label="Priority"><USelect v-model="priority" :items="TICKET_PRIORITIES" value-key="value" class="w-full" :disabled="busy || closed" /></UFormField>
              <UFormField label="Category"><USelect v-model="category" :items="TICKET_CATEGORIES" value-key="value" class="w-full" :disabled="busy || closed" /></UFormField>
            </div>
          </UCard>

          <UCard>
            <template #header><span class="font-semibold">Who asked</span></template>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3"><dt class="text-muted">Name</dt><dd class="text-right">{{ ticket.requesterName }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-muted">School</dt><dd class="text-right">{{ ticket.schoolName || '—' }}</dd></div>
              <div v-if="ticket.requesterEmail" class="flex justify-between gap-3"><dt class="text-muted">Email</dt><dd><a :href="`mailto:${ticket.requesterEmail}`" class="text-primary">{{ ticket.requesterEmail }}</a></dd></div>
              <div v-if="ticket.requesterPhone" class="flex justify-between gap-3"><dt class="text-muted">Phone</dt><dd><a :href="`tel:${ticket.requesterPhone}`" class="text-primary">{{ ticket.requesterPhone }}</a></dd></div>
              <div class="flex justify-between gap-3"><dt class="text-muted">Opened</dt><dd class="text-right">{{ formatDateTime(ticket.createdAt) }}{{ ticket.createdByName ? ' by ' + ticket.createdByName : '' }}</dd></div>
            </dl>
          </UCard>
        </div>
      </div>
    </template>

    <UModal v-model:open="resolveOpen" title="Resolve ticket" description="Say how it was fixed so the next person knows.">
      <template #body><UTextarea v-model="resolution" :rows="3" maxlength="5000" class="w-full" placeholder="e.g. Cleared the cache and reset the teacher's password" autofocus /></template>
      <template #footer>
        <div class="flex gap-2">
          <UButton color="success" icon="i-lucide-check" label="Mark resolved" :loading="busy" @click="confirmResolve" />
          <UButton variant="outline" color="neutral" label="Cancel" @click="resolveOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
