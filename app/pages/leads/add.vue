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

    <UCard class="max-w-3xl">
      <UForm :state="form" class="grid gap-5 md:grid-cols-2" @submit="save">
        <UFormField label="Contact person" required :error="shown('name')">
          <UInput v-model="form.name" class="w-full" icon="i-lucide-user" placeholder="Jane Doe" />
        </UFormField>
        <UFormField label="School">
          <UInput v-model="form.schoolName" class="w-full" icon="i-lucide-school" placeholder="Bright Future Academy" />
        </UFormField>
        <UFormField label="Email" :error="shown('email') || shown('contact')">
          <UInput v-model="form.email" type="email" class="w-full" icon="i-lucide-mail" placeholder="jane@school.edu" />
        </UFormField>
        <UFormField label="Phone" :error="shown('phone')">
          <UInput v-model="form.phone" class="w-full" icon="i-lucide-phone" placeholder="+23276000000" />
        </UFormField>
        <UFormField label="City">
          <UInput v-model="form.city" class="w-full" icon="i-lucide-map-pin" placeholder="Freetown" />
        </UFormField>
        <UFormField label="How did they find us?">
          <USelect v-model="form.source" class="w-full" value-key="value"
            :items="LEAD_SOURCES.filter(s => ['MANUAL', 'REFERRAL', 'OTHER'].includes(s.value))" />
        </UFormField>
        <UFormField label="Assigned to">
          <USelect v-model="form.assignedToId" class="w-full" value-key="value" placeholder="Nobody yet" icon="i-lucide-user-check"
            :items="staff.map(s => ({ label: s.name, value: s.id }))" />
        </UFormField>
        <UFormField label="Follow up on" help="Blank = straight away">
          <UInput v-model="followUp" type="datetime-local" class="w-full" />
        </UFormField>
        <UFormField label="What are they looking for?" class="md:col-span-2">
          <UTextarea v-model="form.summary" :rows="4" autoresize maxlength="5000" class="w-full"
            placeholder="Their school, their challenge, anything useful for the first call" />
        </UFormField>
      </UForm>
    </UCard>
  </div>
</template>
