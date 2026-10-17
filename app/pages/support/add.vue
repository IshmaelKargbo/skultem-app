<script setup lang="ts">
const router = useRouter()
const { success, error: toastError } = useNotify()

const staff = ref<StaffMember[]>([])
const saving = ref(false)
const showErrors = ref(false)

const form = reactive<CreateTicketDto>({
  schoolId: null, requesterName: '', requesterEmail: '', requesterPhone: '', category: 'OTHER', priority: 'NORMAL',
  subject: '', description: '', assignedToId: null
})

// The school is searched on the server as you type.
const schoolSearch = ref('')
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
let timer: ReturnType<typeof setTimeout>
watch(schoolSearch, (t) => { clearTimeout(timer); timer = setTimeout(() => findSchools(t), 300) })
onBeforeUnmount(() => clearTimeout(timer))

const errors = computed(() => ({
  requesterName: !form.requesterName.trim() ? 'Who is asking?' : '',
  email: form.requesterEmail && !/^\S+@\S+\.\S+$/.test(form.requesterEmail) ? 'Enter a valid email address' : '',
  phone: form.requesterPhone && !/^[0-9+ ]{7,20}$/.test(form.requesterPhone) ? 'Digits, spaces and + only (7 to 20)' : '',
  subject: !form.subject.trim() ? 'Give the ticket a subject' : form.subject.length > 255 ? 'Keep the subject under 255 characters' : '',
  description: !form.description.trim() ? 'Describe the problem' : ''
}))
const shown = (k: keyof typeof errors.value) => (showErrors.value && errors.value[k]) || undefined

async function save() {
  showErrors.value = true
  const first = Object.values(errors.value).find(Boolean)
  if (first) return toastError(first)

  saving.value = true
  try {
    const res = await SupportApi().create({ ...form })
    success(`Ticket ${res!.ticket.number} opened`)
    await router.push(`/support/${res!.ticket.id}`)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('System Admin · Open Ticket')
  useAppStore().setBack('/support')
  document.title = 'Open Ticket | Support | System Admin | Skultem'
  findSchools('')
  staff.value = await LeadApi().staff().catch(() => [])
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Open Ticket" subtitle="Record a request for help that came in by phone, email or in person.">
      <UButton variant="soft" color="neutral" to="/support" label="Cancel" :disabled="saving" />
      <UButton icon="i-lucide-save" label="Open ticket" :loading="saving" @click="save" />
    </Heading>

    <UCard class="max-w-3xl">
      <UForm :state="form" class="grid gap-5 md:grid-cols-2" @submit="save">
        <UFormField label="School" class="md:col-span-2" help="Leave empty for a question that isn't about one school">
          <USelectMenu v-model="form.schoolId" v-model:search-term="schoolSearch" :items="schools" value-key="value" ignore-filter
            :loading="schoolsLoading" class="w-full" placeholder="Search schools" icon="i-lucide-school" />
        </UFormField>
        <UFormField label="Who is asking" required :error="shown('requesterName')">
          <UInput v-model="form.requesterName" class="w-full" icon="i-lucide-user" placeholder="Jane Doe" />
        </UFormField>
        <UFormField label="Email" :error="shown('email')"><UInput v-model="form.requesterEmail" type="email" class="w-full" icon="i-lucide-mail" /></UFormField>
        <UFormField label="Phone" :error="shown('phone')"><UInput v-model="form.requesterPhone" class="w-full" icon="i-lucide-phone" /></UFormField>
        <UFormField label="Assigned to">
          <USelect v-model="form.assignedToId" class="w-full" value-key="value" placeholder="Nobody yet" icon="i-lucide-user-check"
            :items="staff.map(s => ({ label: s.name, value: s.id }))" />
        </UFormField>
        <UFormField label="Category"><USelect v-model="form.category" :items="TICKET_CATEGORIES" value-key="value" class="w-full" /></UFormField>
        <UFormField label="Priority"><USelect v-model="form.priority" :items="TICKET_PRIORITIES" value-key="value" class="w-full" /></UFormField>
        <UFormField label="Subject" required :error="shown('subject')" class="md:col-span-2">
          <UInput v-model="form.subject" maxlength="255" class="w-full" placeholder="e.g. Teachers can't mark attendance" />
        </UFormField>
        <UFormField label="What is wrong" required :error="shown('description')" class="md:col-span-2">
          <UTextarea v-model="form.description" :rows="6" autoresize maxlength="10000" class="w-full" placeholder="What happened, what they expected, anything they tried" />
        </UFormField>
      </UForm>
    </UCard>
  </div>
</template>
