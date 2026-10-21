<script setup lang="ts">
// Moves a student to a different guardian - see ChangeStudentGuardianUseCase. Three ways to pick who:
//   existing: a guardian already at the school
//   user:     anyone with an account at the school (a teacher who is also a parent, say) - their
//             account gets a guardian profile if it doesn't have one, so they keep a single login
//   new:      someone not in the system yet - created as a guardian first, then linked
const props = defineProps<{
  studentId: string
  studentName: string
  currentGuardianId?: string
  currentRelationship?: string
}>()
const emit = defineEmits<{ changed: [] }>()

const store = useStudentStore()
const { success, error: toastError } = useNotify()

type Mode = 'existing' | 'user' | 'new'
const modes: { label: string, description: string, value: Mode, icon: string }[] = [
  { label: 'Existing guardian', description: 'Already a parent or guardian at the school', value: 'existing', icon: 'i-lucide-users' },
  { label: 'Someone at the school', description: 'A teacher or staff member - keeps their own login', value: 'user', icon: 'i-lucide-user-cog' },
  { label: 'New guardian', description: 'Not in the system yet - add their details', value: 'new', icon: 'i-lucide-user-plus' }
]

// The same codes the add-student form stores; an older free-text value still shows as an option.
const relationshipOptions = computed(() => {
  const current = props.currentRelationship
  return current && !RELATIONSHIPS.some(r => r.value === current)
    ? [...RELATIONSHIPS, { label: current, value: current }]
    : RELATIONSHIPS
})

const open = ref(false)
const saving = ref(false)
const problem = ref('')
const mode = ref<Mode>('existing')
const relationship = ref('')

// --- Existing guardian: every guardian at the school (the ones this user can see), filtered as you type ---
const parentId = ref('')
const parents = ref<Parent[]>([])
const loadingParents = ref(false)
const parentOptions = computed(() => parents.value.map(p => {
  const isCurrent = p.id === props.currentGuardianId
  return {
    label: `${p.name}${p.phone ? ` · ${p.phone}` : ''}${isCurrent ? ' (current)' : ''}`,
    value: p.id,
    disabled: isCurrent
  }
}))

async function loadParents() {
  if (parents.value.length) return
  loadingParents.value = true
  try {
    // size 0 = all of them (still limited to the caller's sections), alphabetical.
    const res = await ParentApi().getAll(1, 0, undefined, 'user.givenName', 'asc') as any
    parents.value = res?.data ?? []
  } catch {
    parents.value = []
  } finally {
    loadingParents.value = false
  }
}

// --- Someone at the school: every account here, filtered as you type ---
const userId = ref('')
const users = ref<User[]>([])
const loadingUsers = ref(false)
const userName = (u: User) => `${u.givenNames} ${u.familyName}`.trim()
const userOptions = computed(() => users.value.map(u => ({
  label: `${userName(u)}${u.roles?.length ? ` · ${u.roles.map(r => clean(String(r))).join(', ')}` : ''}`,
  value: u.id
})))
const selectedUser = computed(() => users.value.find(u => u.id === userId.value))
// No guardian role yet means no guardian profile here - the backend needs a phone and address to make one.
const userNeedsProfile = computed(() => !!selectedUser.value && !(selectedUser.value.roles || []).map(String).includes('PARENT'))

async function loadUsers() {
  if (users.value.length) return
  loadingUsers.value = true
  try {
    const res = await UserApi().getAll(1, 500) as any
    users.value = res?.data ?? []
  } catch {
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Phone/address: for a user without a guardian profile, and for a brand-new guardian.
const contact = reactive({ phone: '', street: '', city: '' })
const person = reactive({ givenNames: '', familyName: '', email: '' })

watch(mode, (m) => { problem.value = ''; if (m === 'user') loadUsers() })

const canSave = computed(() => {
  if (mode.value === 'existing') return !!parentId.value
  if (mode.value === 'user') return !!userId.value && (!userNeedsProfile.value || !!contact.phone.trim())
  return !!person.givenNames.trim() && !!person.familyName.trim() && !!contact.phone.trim()
    && !!contact.street.trim() && !!contact.city.trim()
})

defineExpose({
  open: () => {
    mode.value = 'existing'
    parentId.value = ''
    userId.value = ''
    relationship.value = props.currentRelationship ?? ''
    Object.assign(contact, { phone: '', street: '', city: '' })
    Object.assign(person, { givenNames: '', familyName: '', email: '' })
    problem.value = ''
    open.value = true
    loadParents()
  }
})

function close() {
  open.value = false
}

async function save() {
  saving.value = true
  problem.value = ''
  try {
    let payload: ChangeGuardianDto
    if (mode.value === 'existing') {
      payload = { parentId: parentId.value }
    } else if (mode.value === 'user') {
      payload = { userId: userId.value, ...(userNeedsProfile.value ? { ...contact } : {}) }
    } else {
      // Created as a guardian first (same rules as anywhere else a guardian is added), then linked.
      const created = await ParentApi().create({
        ...person,
        ...contact,
        email: person.email.trim(),
        relationship: relationship.value || 'GUARDIAN'
      } as any) as any
      const newId = created?.data?.id
      if (!newId) throw new Error('The guardian could not be created')
      payload = { parentId: newId }
    }

    const res = await store.changeGuardian(props.studentId, { ...payload, relationship: relationship.value || undefined })
    if (!res) return
    success(`${props.studentName}'s guardian was updated`)
    emit('changed')
    // A guardian may have just been created (or given a profile) - reload the list next time it opens.
    if (mode.value !== 'existing') parents.value = []
    open.value = false
  } catch (err: any) {
    problem.value = err?.message || 'The guardian could not be changed'
    toastError('Guardian not changed')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <USlideover v-model:open="open" title="Change guardian"
    :description="`Who ${studentName} is linked to - they see them in their portal and get attendance, behaviour and results notices.`">
    <template #body>
      <div class="space-y-5">
        <!-- Who: three clear options, the chosen one highlighted -->
        <div class="space-y-2" role="radiogroup" aria-label="Choose the new guardian from">
          <p class="text-sm font-medium text-highlighted">Choose from</p>
          <button v-for="m in modes" :key="m.value" type="button" role="radio" :aria-checked="mode === m.value"
            :disabled="saving"
            class="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-60"
            :class="mode === m.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-default hover:bg-elevated/60'"
            @click="mode = m.value">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-lg"
              :class="mode === m.value ? 'bg-primary text-inverted' : 'bg-elevated text-muted'">
              <UIcon :name="m.icon" class="size-4.5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-highlighted">{{ m.label }}</span>
              <span class="block text-xs text-muted">{{ m.description }}</span>
            </span>
            <UIcon v-if="mode === m.value" name="i-lucide-circle-check" class="size-5 shrink-0 text-primary" />
          </button>
        </div>

        <USeparator />

        <!-- Existing guardian -->
        <UFormField v-if="mode === 'existing'" label="Guardian" required
          :help="loadingParents ? undefined : `${parents.length} guardian${parents.length === 1 ? '' : 's'} at the school`">
          <USelectMenu v-model="parentId" :items="parentOptions" value-key="value" :loading="loadingParents"
            placeholder="Search by name or phone" icon="i-lucide-search" virtualize class="w-full" />
        </UFormField>

        <!-- Someone at the school -->
        <template v-else-if="mode === 'user'">
          <UFormField label="User" required help="Anyone with an account at this school - they keep the same login.">
            <USelectMenu v-model="userId" :items="userOptions" value-key="value" :loading="loadingUsers"
              placeholder="Search staff and users" icon="i-lucide-search" class="w-full" />
          </UFormField>
          <template v-if="userNeedsProfile">
            <UAlert color="info" variant="soft" icon="i-lucide-info"
              :title="`${selectedUser ? userName(selectedUser) : 'They'} isn't a guardian yet`"
              description="Add their phone and address - they'll be set up as a guardian on their existing account." />
            <div class="grid gap-3">
              <UFormField label="Phone" required>
                <UInput v-model="contact.phone" placeholder="e.g. +232 76 000000" class="w-full" />
              </UFormField>
              <UFormField label="City">
                <UInput v-model="contact.city" class="w-full" />
              </UFormField>
              <UFormField label="Address">
                <UInput v-model="contact.street" class="w-full" />
              </UFormField>
            </div>
          </template>
        </template>

        <!-- New guardian -->
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Given names" required>
            <UInput v-model="person.givenNames" class="w-full" />
          </UFormField>
          <UFormField label="Family name" required>
            <UInput v-model="person.familyName" class="w-full" />
          </UFormField>
          <UFormField label="Phone" required>
            <UInput v-model="contact.phone" placeholder="e.g. +232 76 000000" class="w-full" />
          </UFormField>
          <UFormField label="Email" help="Optional - gives them portal access by email">
            <UInput v-model="person.email" type="email" class="w-full" />
          </UFormField>
          <UFormField label="City" required>
            <UInput v-model="contact.city" class="w-full" />
          </UFormField>
          <UFormField label="Address" required>
            <UInput v-model="contact.street" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Relationship to the student"
          :help="currentRelationship ? 'Kept as it is unless you pick another' : undefined">
          <USelectMenu v-model="relationship" :items="relationshipOptions" value-key="value" label-key="label"
            placeholder="Select relationship" :search-input="false" class="w-full" />
        </UFormField>

        <UAlert v-if="problem" color="error" variant="soft" icon="i-lucide-circle-alert" title="Not changed"
          :description="problem" />
      </div>
    </template>

    <template #footer>
      <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:justify-end">
        <UButton label="Cancel" color="neutral" variant="outline" class="justify-center" :disabled="saving"
          @click="close" />
        <UButton label="Change guardian" icon="i-lucide-save" class="justify-center" :loading="saving"
          :disabled="!canSave" @click="save" />
      </div>
    </template>
  </USlideover>
</template>
