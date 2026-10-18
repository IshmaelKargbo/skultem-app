<script setup lang="ts">
const router = useRouter()
const { success, error: toastError } = useNotify()

const staff = ref<StaffMember[]>([])
const saving = ref(false)
const showErrors = ref(false)

const form = reactive<SaveLeadDto>({
  name: '', schoolName: '', email: '', phone: '', city: '', source: 'MANUAL', summary: '',
  assignedToId: null, nextFollowUpAt: null
})
// <input type="datetime-local"> text; turned into a moment in time on save.
const followUp = ref('')

// Quick picks for "follow up on": today at 9:00 on the chosen day, written the way <input type="datetime-local"> wants it.
function inDays(days: number | null) {
  if (days === null) return ''
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(9, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const followUpPicks = [
  { label: 'Straight away', days: null as number | null },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 }
]
const SOURCE_ICONS: Record<string, string> = { MANUAL: 'i-lucide-phone-call', REFERRAL: 'i-lucide-handshake', OTHER: 'i-lucide-ellipsis' }
const sources = LEAD_SOURCES.filter(s => ['MANUAL', 'REFERRAL', 'OTHER'].includes(s.value))
const initials = computed(() => form.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join(''))

const errors = computed(() => ({
  name: !form.name.trim() ? 'Name is required' : '',
  email: form.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email address' : '',
  phone: form.phone && !/^[0-9+ ]{7,20}$/.test(form.phone) ? 'Digits, spaces and + only (7 to 20)' : '',
  contact: !form.email.trim() && !form.phone.trim() ? 'Give an email address or a phone number so someone can follow up' : ''
}))
const shown = (k: keyof typeof errors.value) => (showErrors.value && errors.value[k]) || undefined

async function save() {
  showErrors.value = true
  const first = Object.values(errors.value).find(Boolean)
  if (first) {
    toastError(first)
    return
  }
  saving.value = true
  try {
    const lead = await LeadApi().create({
      ...form,
      nextFollowUpAt: followUp.value ? new Date(followUp.value).toISOString() : null
    })
    success('Lead added')
    await router.push(`/leads/${lead!.id}`)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('System Admin · Add Lead')
  useAppStore().setBack('/leads')
  document.title = 'Add Lead | Leads | System Admin | Skultem'
  staff.value = await LeadApi().staff().catch(() => [])
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Add Lead" subtitle="For someone who got in touch another way - a call, a visit or a referral.">
      <UButton variant="soft" color="neutral" to="/leads" label="Cancel" :disabled="saving" />
      <UButton icon="i-lucide-save" label="Save Lead" :loading="saving" @click="save" />
    </Heading>

    <UForm :state="form" class="grid items-start gap-5 lg:grid-cols-[1fr_22rem]" @submit="save">
      <div class="space-y-5">
        <!-- Contact -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                <template v-if="initials">{{ initials }}</template><UIcon v-else name="i-lucide-user" class="size-5" />
              </span>
              <div>
                <h3 class="font-semibold text-highlighted">Who are they?</h3>
                <p class="text-xs text-muted">The person we will be talking to.</p>
              </div>
            </div>
          </template>
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Contact person" required :error="shown('name')" class="md:col-span-2">
              <UInput v-model="form.name" size="lg" class="w-full" icon="i-lucide-user" placeholder="Jane Doe" />
            </UFormField>
            <UFormField label="Email" :error="shown('email') || shown('contact')">
              <UInput v-model="form.email" size="lg" type="email" class="w-full" icon="i-lucide-mail" placeholder="jane@school.edu" />
            </UFormField>
            <UFormField label="Phone" :error="shown('phone')">
              <UInput v-model="form.phone" size="lg" class="w-full" icon="i-lucide-phone" placeholder="+23276000000" />
            </UFormField>
            <p class="-mt-2 flex items-center gap-1.5 text-xs text-muted md:col-span-2">
              <UIcon name="i-lucide-info" class="size-3.5 shrink-0" />An email address or a phone number is needed so someone can follow up.
            </p>
          </div>
        </UCard>

        <!-- School -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary-600"><UIcon name="i-lucide-school" class="size-5" /></span>
              <div>
                <h3 class="font-semibold text-highlighted">Their school</h3>
                <p class="text-xs text-muted">Optional, but it helps the first call.</p>
              </div>
            </div>
          </template>
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="School">
              <UInput v-model="form.schoolName" size="lg" class="w-full" icon="i-lucide-school" placeholder="Bright Future Academy" />
            </UFormField>
            <UFormField label="City">
              <UInput v-model="form.city" size="lg" class="w-full" icon="i-lucide-map-pin" placeholder="Freetown" />
            </UFormField>
            <UFormField label="What are they looking for?" class="md:col-span-2">
              <UTextarea v-model="form.summary" :rows="4" autoresize maxlength="5000" class="w-full"
                placeholder="Their school, their challenge, anything useful for the first call" />
              <p class="mt-1 text-right text-[11px] text-muted">{{ form.summary.length }}/5000</p>
            </UFormField>
          </div>
        </UCard>
      </div>

      <!-- Pipeline settings -->
      <div class="space-y-5 lg:sticky lg:top-4">
        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">How did they find us?</h3>
          </template>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="src in sources" :key="src.value" type="button"
              class="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition"
              :class="form.source === src.value ? 'border-primary bg-primary/5 text-primary' : 'border-default text-muted hover:border-primary/50'"
              @click="form.source = src.value">
              <UIcon :name="SOURCE_ICONS[src.value] ?? 'i-lucide-circle'" class="size-5" />{{ src.label }}
            </button>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">Who follows up?</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Assigned to">
              <USelect v-model="form.assignedToId" size="lg" class="w-full" value-key="value" placeholder="Nobody yet" icon="i-lucide-user-check"
                :items="staff.map(s => ({ label: s.name, value: s.id }))" />
            </UFormField>
            <UFormField label="Follow up on" help="Blank = straight away">
              <div class="mb-2 flex flex-wrap gap-1.5">
                <button v-for="p in followUpPicks" :key="p.label" type="button"
                  class="rounded-full border px-3 py-1 text-xs font-medium transition"
                  :class="followUp === inDays(p.days) ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:border-primary/50'"
                  @click="followUp = inDays(p.days)">{{ p.label }}</button>
              </div>
              <UInput v-model="followUp" type="datetime-local" size="lg" class="w-full" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton block icon="i-lucide-save" label="Save Lead" :loading="saving" type="submit" />
            </div>
          </template>
        </UCard>
      </div>
    </UForm>
  </div>
</template>
