<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { success, error: toastError } = useNotify()

const id = computed(() => route.params.id as string)

const lead = ref<Lead>()
const notes = ref<LeadNote[]>([])
const staff = ref<StaffMember[]>([])
const loading = ref(true)
const notFound = ref(false)
const busy = ref(false)

// ---- loading ----
function apply(detail?: LeadDetail) {
  if (!detail) return
  lead.value = detail.lead
  notes.value = detail.notes
  fillForm(detail.lead)
}

async function load() {
  try {
    apply(await LeadApi().detail(id.value))
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

// An action returns the fresh lead; the history is read again so the system's own entries show up.
async function act<T>(run: () => Promise<T>, done: string) {
  busy.value = true
  try {
    await run()
    success(done)
    apply(await LeadApi().detail(id.value))
  } catch (err: any) {
    toastError(err.message)
  } finally {
    busy.value = false
  }
}

// ---- details form ----
const form = reactive<SaveLeadDto>({
  name: '', schoolName: '', email: '', phone: '', city: '', source: 'MANUAL', summary: '',
  assignedToId: null, nextFollowUpAt: null
})
const followUp = ref('')

const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fillForm(l: Lead) {
  Object.assign(form, {
    name: l.name, schoolName: l.schoolName ?? '', email: l.email ?? '', phone: l.phone ?? '', city: l.city ?? '',
    source: l.source, summary: l.summary ?? '', assignedToId: l.assignedToId
  })
  followUp.value = toLocalInput(l.nextFollowUpAt)
}

const formErrors = computed(() => ({
  name: !form.name.trim() ? 'Name is required' : '',
  email: form.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email address' : '',
  phone: form.phone && !/^[0-9+ ]{7,20}$/.test(form.phone) ? 'Digits, spaces and + only (7 to 20)' : ''
}))
const showErrors = ref(false)
const shown = (k: keyof typeof formErrors.value) => (showErrors.value && formErrors.value[k]) || undefined
const dirty = computed(() => {
  const l = lead.value
  if (!l) return false
  return form.name !== l.name || form.schoolName !== (l.schoolName ?? '') || form.email !== (l.email ?? '')
    || form.phone !== (l.phone ?? '') || form.city !== (l.city ?? '') || form.summary !== (l.summary ?? '')
    || form.assignedToId !== l.assignedToId || followUp.value !== toLocalInput(l.nextFollowUpAt)
})

function saveDetails() {
  showErrors.value = true
  const first = Object.values(formErrors.value).find(Boolean)
  if (first) return toastError(first)
  return act(() => LeadApi().update(id.value, {
    ...form, nextFollowUpAt: followUp.value ? new Date(followUp.value).toISOString() : null
  }), 'Lead updated')
}

// ---- status ----
const lostOpen = ref(false)
const lostReason = ref('')

function moveTo(status: LeadStatus) {
  if (status === 'LOST') {
    lostReason.value = ''
    lostOpen.value = true
    return
  }
  return act(() => LeadApi().changeStatus(id.value, status), `Moved to ${leadStatus(status).label.toLowerCase()}`)
}

async function confirmLost() {
  if (!lostReason.value.trim()) return toastError('Say why this lead was lost')
  await act(() => LeadApi().changeStatus(id.value, 'LOST', lostReason.value.trim()), 'Marked as lost')
  lostOpen.value = false
}

// ---- demo ----
const demoAt = ref('')

function scheduleDemo() {
  if (!demoAt.value) return toastError('Pick the date and time of the demo')
  return act(() => LeadApi().demo(id.value, 'SCHEDULED', new Date(demoAt.value).toISOString()), 'Demo scheduled')
}

// ---- notes ----
const noteKind = ref<LeadNoteKind>('NOTE')
const noteBody = ref('')

async function addNote() {
  if (!noteBody.value.trim()) return toastError('Write something first')
  await act(() => LeadApi().addNote(id.value, noteKind.value, noteBody.value.trim()), 'Added to the history')
  noteBody.value = ''
}

// ---- onboarding & conversion ----
const closed = computed(() => lead.value ? ['CONVERTED', 'LOST'].includes(lead.value.status) : false)

async function startOnboarding() {
  busy.value = true
  try {
    const onboarding = await LeadApi().startOnboarding(id.value)
    success('Onboarding started')
    await router.push(`/onboarding/${onboarding!.id}`)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    busy.value = false
  }
}

const convertOpen = ref(false)
const schoolSearch = ref('')
const schoolId = ref('')
const schools = ref<{ label: string, value: string }[]>([])
const schoolsLoading = ref(false)

async function findSchools(term: string) {
  schoolsLoading.value = true
  try {
    const res = await SystemApi().listSchools(1, 20, { query: term.trim() || undefined }) as any
    schools.value = (res?.data ?? []).map((s: any) => ({ label: `${s.name} (${s.domain})`, value: s.id }))
  } finally {
    schoolsLoading.value = false
  }
}

let schoolTimer: ReturnType<typeof setTimeout>
watch(schoolSearch, (t) => { clearTimeout(schoolTimer); schoolTimer = setTimeout(() => findSchools(t), 300) })
watch(convertOpen, (open) => { if (open) { schoolId.value = ''; findSchools('') } })
onBeforeUnmount(() => clearTimeout(schoolTimer))

async function confirmConvert() {
  if (!schoolId.value) return toastError('Choose the school this lead became')
  await act(() => LeadApi().convert(id.value, schoolId.value), 'Lead converted')
  convertOpen.value = false
}

const canConvert = computed(() => !!lead.value && ['DEMO_COMPLETED', 'INTERESTED', 'ONBOARDING'].includes(lead.value.status))
const canOnboard = computed(() => !!lead.value && !lead.value.onboardingId && !closed.value)

onMounted(async () => {
  useAppStore().setTitle('System Admin · Lead')
  useAppStore().setBack('/leads')
  document.title = 'Lead | Leads | System Admin | Skultem'
  staff.value = await LeadApi().staff().catch(() => [])
  await load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <UCard v-if="notFound">
      <div class="flex flex-col items-center gap-2 py-10">
        <UIcon name="i-lucide-user-x" class="text-4xl text-gray-400" />
        <p class="text-gray-500">This lead doesn't exist any more.</p>
        <UButton to="/leads" variant="soft" label="Back to leads" />
      </div>
    </UCard>

    <template v-else>
      <Heading :title="lead?.name || 'Lead'"
        :subtitle="lead ? [lead.schoolName, lead.city].filter(Boolean).join(' · ') || leadSourceLabel(lead.source) : ''">
        <UBadge v-if="lead" size="lg" variant="subtle" :color="leadStatus(lead.status).color" :icon="leadStatus(lead.status).icon"
          :label="leadStatus(lead.status).label" />
        <UButton v-if="lead?.onboardingId" icon="i-lucide-list-checks" variant="soft" label="Open onboarding"
          :to="`/onboarding/${lead.onboardingId}`" />
        <UButton v-else-if="canOnboard" icon="i-lucide-rocket" label="Start onboarding" :loading="busy" @click="startOnboarding" />
      </Heading>

      <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
        <USkeleton class="h-96 lg:col-span-2" />
        <USkeleton class="h-96" />
      </div>

      <div v-else-if="lead" class="grid items-start gap-4 lg:grid-cols-3">
        <!-- Left: history -->
        <div class="space-y-4 lg:col-span-2">
          <UAlert v-if="lead.status === 'LOST'" color="neutral" variant="soft" icon="i-lucide-circle-x" title="Lost"
            :description="lead.lostReason || 'No reason recorded.'">
            <template #actions>
              <UButton size="xs" variant="outline" color="neutral" label="Reopen" :loading="busy" @click="moveTo('CONTACTED')" />
            </template>
          </UAlert>
          <UAlert v-if="lead.status === 'CONVERTED'" color="success" variant="soft" icon="i-lucide-circle-check"
            title="Converted into a school"
            :description="`${lead.convertedSchoolName || 'A school'}${lead.convertedAt ? ' on ' + formatDate(lead.convertedAt) : ''}`" />
          <UAlert v-if="lead.awaitingFollowUp" color="warning" variant="soft" icon="i-lucide-bell-ring"
            :title="lead.nextFollowUpAt ? 'Follow-up due' : 'Not contacted yet'"
            :description="lead.nextFollowUpAt ? `Due ${formatDateTime(lead.nextFollowUpAt)}.` : 'Reach out, then log it below.'" />

          <UCard v-if="lead.summary">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">What they asked for</p>
            <p class="mt-1 whitespace-pre-wrap text-sm">{{ lead.summary }}</p>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-messages-square" class="text-primary" />
                <span class="font-semibold">Notes & history</span>
              </div>
            </template>

            <div class="space-y-3">
              <div class="flex flex-wrap gap-1.5">
                <UButton v-for="k in LEAD_NOTE_KINDS" :key="k.value" size="xs" :icon="k.icon" :label="k.label"
                  :variant="noteKind === k.value ? 'solid' : 'soft'" :color="noteKind === k.value ? 'primary' : 'neutral'"
                  @click="noteKind = k.value" />
              </div>
              <UTextarea v-model="noteBody" :rows="3" autoresize maxlength="5000" class="w-full"
                :placeholder="noteKind === 'CALL' ? 'What was said on the call?' : noteKind === 'EMAIL' ? 'What was sent or received?' : noteKind === 'MEETING' ? 'What was discussed?' : 'Add a note for the team'" />
              <div class="flex justify-end">
                <UButton icon="i-lucide-plus" label="Add to history" :loading="busy" :disabled="!noteBody.trim()" @click="addNote" />
              </div>
            </div>

            <ol class="mt-5 space-y-4 border-l border-default pl-5">
              <li v-for="n in notes" :key="n.id" class="relative">
                <span class="absolute -left-[30px] flex size-5 items-center justify-center rounded-full bg-elevated ring-4 ring-default">
                  <UIcon :name="leadNoteIcon(n.kind)" class="size-3 text-muted" />
                </span>
                <p class="whitespace-pre-wrap text-sm" :class="['SYSTEM', 'STATUS_CHANGE'].includes(n.kind) ? 'text-toned' : 'text-highlighted'">{{ n.body }}</p>
                <p class="text-[11px] text-muted">
                  {{ n.createdByName || 'System' }} · {{ formatDateTime(n.createdAt) }}
                </p>
              </li>
              <li v-if="!notes.length" class="text-sm text-muted">Nothing yet.</li>
            </ol>
          </UCard>
        </div>

        <!-- Right: actions and details -->
        <div class="space-y-4 lg:sticky lg:top-6">
          <UCard v-if="lead.nextStatuses.length || canConvert">
            <template #header>
              <div class="flex items-center gap-2"><UIcon name="i-lucide-route" class="text-primary" /><span class="font-semibold">Move this lead</span></div>
            </template>
            <div class="flex flex-wrap gap-2">
              <UButton v-for="s in lead.nextStatuses" :key="s" size="sm" :icon="leadStatus(s).icon"
                :label="s === 'LOST' ? 'Mark as lost' : leadStatus(s).label" :loading="busy"
                :variant="s === 'LOST' ? 'ghost' : 'soft'" :color="s === 'LOST' ? 'error' : 'neutral'" @click="moveTo(s)" />
              <UButton v-if="canConvert" size="sm" icon="i-lucide-circle-check" label="Convert to school" color="success"
                variant="soft" @click="convertOpen = true" />
            </div>
          </UCard>

          <UCard v-if="!closed">
            <template #header>
              <div class="flex items-center gap-2"><UIcon name="i-lucide-presentation" class="text-primary" /><span class="font-semibold">Demo</span></div>
            </template>
            <div class="space-y-3 text-sm">
              <p v-if="lead.demoStatus === 'SCHEDULED' && lead.demoAt">
                Scheduled for <span class="font-medium">{{ formatDateTime(lead.demoAt) }}</span>
              </p>
              <p v-else-if="lead.demoStatus === 'COMPLETED'" class="text-success">Demo completed.</p>
              <p v-else-if="lead.demoStatus === 'CANCELLED'" class="text-muted">The last demo was cancelled.</p>
              <p v-else class="text-muted">No demo yet.</p>

              <template v-if="lead.demoStatus !== 'COMPLETED'">
                <UInput v-model="demoAt" type="datetime-local" class="w-full" />
                <div class="flex flex-wrap gap-2">
                  <UButton size="sm" icon="i-lucide-calendar-plus" :label="lead.demoStatus === 'SCHEDULED' ? 'Reschedule' : 'Schedule demo'"
                    :loading="busy" @click="scheduleDemo" />
                  <UButton v-if="lead.demoStatus === 'SCHEDULED'" size="sm" variant="soft" color="success" icon="i-lucide-check"
                    label="Mark completed" :loading="busy" @click="act(() => LeadApi().demo(id, 'COMPLETED'), 'Demo marked as completed')" />
                  <UButton v-if="lead.demoStatus === 'SCHEDULED'" size="sm" variant="ghost" color="neutral" icon="i-lucide-x"
                    label="Cancel" :loading="busy" @click="act(() => LeadApi().demo(id, 'CANCELLED'), 'Demo cancelled')" />
                </div>
              </template>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2"><UIcon name="i-lucide-contact" class="text-primary" /><span class="font-semibold">Details</span></div>
            </template>
            <UForm :state="form" class="space-y-4" @submit="saveDetails">
              <UFormField label="Contact person" required :error="shown('name')"><UInput v-model="form.name" class="w-full" /></UFormField>
              <UFormField label="School"><UInput v-model="form.schoolName" class="w-full" /></UFormField>
              <UFormField label="Email" :error="shown('email')"><UInput v-model="form.email" type="email" class="w-full" /></UFormField>
              <UFormField label="Phone" :error="shown('phone')"><UInput v-model="form.phone" class="w-full" /></UFormField>
              <UFormField label="City"><UInput v-model="form.city" class="w-full" /></UFormField>
              <UFormField label="Assigned to">
                <USelect v-model="form.assignedToId" class="w-full" value-key="value" placeholder="Nobody yet" icon="i-lucide-user-check"
                  :items="staff.map(s => ({ label: s.name, value: s.id }))" />
              </UFormField>
              <UFormField v-if="!closed" label="Next follow-up"><UInput v-model="followUp" type="datetime-local" class="w-full" /></UFormField>
              <UFormField label="Summary"><UTextarea v-model="form.summary" :rows="3" autoresize class="w-full" /></UFormField>
              <UButton icon="i-lucide-save" label="Save changes" :loading="busy" :disabled="!dirty" block @click="saveDetails" />
            </UForm>
          </UCard>
        </div>
      </div>
    </template>

    <!-- Why it was lost -->
    <UModal v-model:open="lostOpen" title="Mark as lost" description="Say why, so the team can learn from it.">
      <template #body>
        <UTextarea v-model="lostReason" :rows="3" class="w-full" placeholder="e.g. Chose another system, no budget this year" autofocus />
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton color="error" label="Mark as lost" :loading="busy" @click="confirmLost" />
          <UButton variant="outline" color="neutral" label="Cancel" @click="lostOpen = false" />
        </div>
      </template>
    </UModal>

    <!-- Which school it became -->
    <UModal v-model:open="convertOpen" title="Convert to school"
      description="Link this lead to the school it became on Skultem. The lead is then closed as converted.">
      <template #body>
        <UFormField label="School" required>
          <USelectMenu v-model="schoolId" v-model:search-term="schoolSearch" :items="schools" value-key="value" ignore-filter
            :loading="schoolsLoading" class="w-full" placeholder="Search schools" icon="i-lucide-school" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton color="success" icon="i-lucide-circle-check" label="Convert" :loading="busy" :disabled="!schoolId" @click="confirmConvert" />
          <UButton variant="outline" color="neutral" label="Cancel" @click="convertOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
