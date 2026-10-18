<script setup lang="ts">
const { success, error: toastError } = useNotify()
const platform = usePlatformAccess()

const roles = ref<PlatformRoleInfo[]>([])
const staff = ref<PlatformStaff[]>([])
const loading = ref(true)
const failed = ref(false)
const busy = ref<string | null>(null)

async function load() {
  failed.value = false
  try {
    const res = await PlatformApi().roles()
    roles.value = res?.roles ?? []
    staff.value = res?.staff ?? []
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

// Changing someone's role asks first: it changes what they can open the next time they load a page.
const pending = ref<{ person: PlatformStaff, role: string } | null>(null)
const confirmOpen = ref(false)

function choose(person: PlatformStaff, role: string) {
  if (role === person.role) return
  pending.value = { person, role }
  confirmOpen.value = true
}

async function confirmChange() {
  const change = pending.value
  if (!change) return
  busy.value = change.person.userId
  try {
    await PlatformApi().assignRole(change.person.userId, change.role)
    success(`${change.person.name} is now ${roleLabel(change.role).toLowerCase()}`)
    confirmOpen.value = false
    await Promise.all([load(), platform.load(true)])
  } catch (err: any) {
    toastError(err.message)
  } finally {
    busy.value = null
  }
}

const search = ref('')
const me = computed(() => useUserStore().user?.id)

// The platform always keeps one owner, so the only one left can't be moved to another role.
const soleOwner = (p: PlatformStaff) => p.role === 'OWNER' && staff.value.filter(x => x.role === 'OWNER').length === 1

// "Signed in 3 days ago" - the exact time is in the tooltip.
function since(iso: string | null) {
  if (!iso) return 'Never signed in'
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'Signed in just now'
  if (mins < 60) return `Signed in ${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `Signed in ${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return days < 31 ? `Signed in ${days} day${days === 1 ? '' : 's'} ago` : `Signed in ${formatDate(iso)}`
}
const membersOf = (role: string) => staff.value.filter(p => p.role === role).length
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?'

const roleLabel = (role: string) => roles.value.find(r => r.role === role)?.label ?? role
const roleItems = computed(() => roles.value.map(r => ({ label: r.label, value: r.role })))

const PERMISSION_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard', SCHOOLS: 'Schools & calendar', ADMINS: 'Admins', BILLING: 'Platform fee collection',
  MARKETING: 'Leads, onboarding & marketing', COMMUNICATION: 'Announcements', SUPPORT: 'Support', SETTINGS: 'Platform settings',
  AUDIT: 'Audit logs', ROLES: 'Roles & permissions', HEALTH: 'System health'
}

const allPermissions = Object.keys(PERMISSION_LABELS)

const PERMISSION_GROUPS: { title: string, hint: string, items: PlatformPermission[] }[] = [
  { title: 'Overview', hint: 'Dashboard and system status', items: ['DASHBOARD', 'HEALTH'] },
  { title: 'Schools', hint: 'Schools, admins and platform fees', items: ['SCHOOLS', 'ADMINS', 'BILLING'] },
  { title: 'Growth & communication', hint: 'Leads, announcements and support', items: ['MARKETING', 'COMMUNICATION', 'SUPPORT'] },
  { title: 'Governance', hint: 'Settings, audit and access', items: ['SETTINGS', 'AUDIT', 'ROLES'] }
]

// New role: an owner picks a name and the areas it can open. Owner-only areas can't be handed out this way.
const OWNER_ONLY: PlatformPermission[] = ['ROLES', 'SETTINGS', 'ADMINS']
const drafting = ref(false)
const reviewOpen = ref(false)
const creating = ref(false)
const form = reactive({ label: '', description: '', permissions: [] as PlatformPermission[] })
const nameTouched = ref(false)
const nameError = computed(() => form.label.trim().length < 3 ? 'Role name must be at least 3 characters' : '')
const canSave = computed(() => !nameError.value && form.permissions.length > 0)
const lockedPerm = (perm: PlatformPermission) => perm === 'DASHBOARD' || OWNER_ONLY.includes(perm)
const groupAvailable = (g: { items: PlatformPermission[] }) => g.items.filter(p => !lockedPerm(p))
const groupSelected = (g: { items: PlatformPermission[] }) => g.items.filter(p => p === 'DASHBOARD' || form.permissions.includes(p)).length

function openCreate() {
  Object.assign(form, { label: '', description: '', permissions: [] })
  nameTouched.value = false
  tab.value = 'permissions'
  drafting.value = true
}

function discard() {
  drafting.value = false
  reviewOpen.value = false
}

function selectAll(g: { items: PlatformPermission[] }) {
  form.permissions = [...new Set([...form.permissions, ...groupAvailable(g)])]
}

function clearAll(g: { items: PlatformPermission[] }) {
  form.permissions = form.permissions.filter(p => !g.items.includes(p))
}

function togglePerm(perm: PlatformPermission, on: boolean | 'indeterminate') {
  form.permissions = on === true ? [...new Set([...form.permissions, perm])] : form.permissions.filter(p => p !== perm)
}

async function createRole() {
  creating.value = true
  try {
    const made = await PlatformApi().createRole({ label: form.label, description: form.description, permissions: form.permissions })
    success(`${form.label.trim()} role created`)
    reviewOpen.value = false
    drafting.value = false
    await load()
    if (made) { selectedRole.value = made.role; tab.value = 'permissions' }
  } catch (err: any) {
    toastError(err.message)
  } finally {
    creating.value = false
  }
}

const roleSearch = ref('')
const selectedRole = ref('')
const tab = ref('permissions')
const shownRoles = computed(() => {
  const q = roleSearch.value.trim().toLowerCase()
  return roles.value.filter(r => !q || `${r.label} ${r.description}`.toLowerCase().includes(q))
})
const current = computed(() => roles.value.find(r => r.role === selectedRole.value) ?? roles.value[0])
const has = (perm: PlatformPermission) => !!current.value?.permissions.includes(perm)
const groupCount = (g: { items: PlatformPermission[] }) => g.items.filter(has).length
const roleMembers = computed(() => staff.value.filter(p => p.role === current.value?.role))
const tabs = computed(() => [
  { label: 'Permissions', value: 'permissions' },
  { label: `Members (${roleMembers.value.length})`, value: 'members' }
])

onMounted(() => {
  useAppStore().setTitle('System Admin · Roles & Permissions')
  useAppStore().setBack(false)
  document.title = 'Roles & Permissions | System Admin | Skultem'
  load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-5 px-4 md:px-6">
    <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Roles could not be loaded">
      <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
    </UAlert>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <USkeleton class="h-80" /><USkeleton class="h-80" />
    </div>

    <template v-else-if="!failed && current">
      <div class="grid items-start gap-5 lg:grid-cols-[18rem_1fr]">
        <!-- Role list -->
        <UCard class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto" :ui="{ body: 'p-2 sm:p-2' }">
          <UInput v-model="roleSearch" icon="i-lucide-search" placeholder="Search roles" class="mb-2 w-full" />
          <ul class="space-y-1">
            <li>
              <button type="button" class="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition"
                :class="drafting ? 'border-primary bg-primary/10 text-primary' : 'border-dashed border-default text-muted hover:border-primary hover:text-primary'"
                @click="drafting ? null : openCreate()">
                <span class="inline-flex items-center gap-2"><UIcon name="i-lucide-plus" class="size-4" />New role</span>
                <span v-if="drafting" class="text-[11px] font-normal text-secondary-600">Unsaved</span>
              </button>
            </li>
            <li v-for="r in shownRoles" :key="r.role">
              <button type="button" class="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition"
                :class="r.role === current.role && !drafting ? 'bg-primary text-white shadow-sm' : 'hover:bg-elevated'" @click="drafting = false; selectedRole = r.role">
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium">{{ r.label }}</span>
                  <span class="block text-[11px] opacity-70">{{ r.permissions.length }} of {{ allPermissions.length }} permissions</span>
                </span>
                <span class="inline-flex shrink-0 items-center gap-1 text-xs opacity-70">
                  <UIcon :name="r.custom ? 'i-lucide-user-cog' : 'i-lucide-lock'" class="size-3" /><UIcon name="i-lucide-users" class="size-3" />{{ membersOf(r.role) }}
                </span>
              </button>
            </li>
            <li v-if="!shownRoles.length" class="px-3 py-6 text-center text-xs text-muted">No roles match.</li>
          </ul>
        </UCard>

        <!-- New role (unsaved draft) -->
        <UCard v-if="drafting" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header><h3 class="font-semibold text-highlighted">New role</h3></template>
          <div class="space-y-4 p-4">
            <UFormField label="Role name" required :error="nameTouched ? nameError : undefined">
              <UInput v-model="form.label" placeholder="e.g. Field Verification Lead" maxlength="60" class="w-full" @blur="nameTouched = true" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="form.description" :rows="2" placeholder="What is this role responsible for?" class="w-full" />
            </UFormField>

            <div v-for="g in PERMISSION_GROUPS" :key="g.title" class="overflow-hidden rounded-xl border border-default">
              <div class="flex items-center justify-between gap-2 bg-primary/5 px-3 py-2">
                <div>
                  <p class="text-xs font-semibold text-primary">{{ g.title }} <span class="font-normal text-muted">{{ groupSelected(g) }}/{{ g.items.length }}</span></p>
                  <p class="text-[11px] text-muted">{{ g.hint }}</p>
                </div>
                <div class="flex gap-3 text-xs font-medium">
                  <button type="button" class="text-primary hover:underline disabled:opacity-40" :disabled="!groupAvailable(g).length" @click="selectAll(g)">Select all</button>
                  <button type="button" class="text-muted hover:underline" @click="clearAll(g)">Clear all</button>
                </div>
              </div>
              <ul class="divide-y divide-default">
                <li v-for="perm in g.items" :key="perm" class="flex items-center gap-6 px-3 py-2.5 text-sm">
                  <span class="w-56 shrink-0 text-highlighted">{{ PERMISSION_LABELS[perm] }}</span>
                  <UCheckbox :model-value="perm === 'DASHBOARD' || form.permissions.includes(perm)" color="primary" :disabled="lockedPerm(perm)"
                    label="Open & change" @update:model-value="togglePerm(perm, $event)" />
                  <span v-if="OWNER_ONLY.includes(perm)" class="text-[11px] text-muted">Owner only</span>
                </li>
              </ul>
            </div>
          </div>
          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs text-warning">Unsaved changes · +{{ form.permissions.length }} / −0</p>
              <div class="flex gap-2">
                <UButton variant="outline" color="neutral" label="Discard" @click="discard" />
                <UButton icon="i-lucide-save" label="Review & save" :disabled="!canSave" @click="reviewOpen = true" />
              </div>
            </div>
          </template>
        </UCard>

        <!-- Role detail -->
        <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-highlighted">{{ current.label }}</h3>
              <UBadge size="sm" variant="subtle" :color="current.custom ? 'secondary' : 'primary'" :label="current.custom ? 'Custom' : 'Predefined'" />
            </div>
            <p v-if="!current.custom" class="mt-1 flex items-center gap-1 text-xs text-warning"><UIcon name="i-lucide-lock" class="size-3" />Protected system role - cannot be modified.</p>
          </template>

          <div class="border-b border-default px-4">
            <UTabs v-model="tab" :items="tabs" :content="false" variant="link" color="primary" size="sm" />
          </div>

          <div v-if="tab === 'permissions'" class="space-y-4 p-4">
            <div class="space-y-1">
              <label class="text-xs font-medium text-muted">Role name</label>
              <UInput :model-value="current.label" readonly class="w-full" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-muted">Description</label>
              <UTextarea :model-value="current.description" readonly :rows="2" class="w-full" />
            </div>

            <div v-for="g in PERMISSION_GROUPS" :key="g.title" class="overflow-hidden rounded-xl border border-default">
              <div class="bg-primary/5 px-3 py-2">
                <p class="text-xs font-semibold text-primary">{{ g.title }} <span class="font-normal text-muted">{{ groupCount(g) }}/{{ g.items.length }}</span></p>
                <p class="text-[11px] text-muted">{{ g.hint }}</p>
              </div>
              <ul class="divide-y divide-default">
                <li v-for="perm in g.items" :key="perm" class="flex items-center gap-6 px-3 py-2.5 text-sm">
                  <span class="w-56 shrink-0 text-highlighted">{{ PERMISSION_LABELS[perm] }}</span>
                  <UCheckbox :model-value="has(perm)" disabled color="primary" label="Open & change" />
                </li>
              </ul>
            </div>
          </div>

          <!-- Members -->
          <div v-else>
            <div class="flex flex-col gap-2 border-b border-default p-4 sm:flex-row">
              <UInput v-model="search" icon="i-lucide-search" placeholder="Search name or email" class="flex-1" />
            </div>
            <ul class="divide-y divide-default">
              <li v-for="p in roleMembers.filter(m => !search.trim() || `${m.name} ${m.email}`.toLowerCase().includes(search.trim().toLowerCase()))" :key="p.userId" class="px-4 py-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="flex min-w-0 items-start gap-3">
                    <div class="relative shrink-0">
                      <div class="flex size-11 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-toned">{{ initials(p.name) }}</div>
                      <span class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-default"
                        :class="p.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'" :title="p.status === 'ACTIVE' ? 'Active' : 'Needs attention'" />
                    </div>
                    <div class="min-w-0">
                      <p class="flex flex-wrap items-center gap-2 text-sm font-semibold text-highlighted">
                        {{ p.name }}
                        <UBadge v-if="p.userId === me" size="sm" variant="subtle" color="neutral" label="You" />
                        <UBadge v-if="p.status !== 'ACTIVE'" size="sm" variant="subtle" color="warning" :label="p.status === 'RESET_PASSWORD' ? 'Password reset pending' : 'Inactive'" />
                      </p>
                      <p class="flex items-center gap-1.5 truncate text-xs text-muted"><UIcon name="i-lucide-mail" class="size-3.5 shrink-0" />{{ p.email }}</p>
                      <p class="flex items-center gap-1.5 text-xs text-muted" :title="p.lastLoginAt ? formatDateTime(p.lastLoginAt) : ''">
                        <UIcon name="i-lucide-clock" class="size-3.5 shrink-0" />{{ since(p.lastLoginAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="w-full sm:w-52">
                    <UTooltip :text="soleOwner(p) ? 'The platform always keeps at least one owner' : ''" :disabled="!soleOwner(p)">
                      <USelect :model-value="p.role" :items="roleItems" value-key="value" class="w-full" icon="i-lucide-shield-check"
                        :disabled="busy === p.userId || soleOwner(p)" @update:model-value="choose(p, $event as string)" />
                    </UTooltip>
                    <p v-if="!p.explicit" class="mt-1 text-[11px] text-muted">No role set yet - an owner by default.</p>
                  </div>
                </div>
              </li>
              <li v-if="!roleMembers.length" class="px-4 py-10 text-center text-sm text-muted">No one has this role.</li>
            </ul>
          </div>
        </UCard>
      </div>
    </template>

    <UModal v-model:open="reviewOpen" :title="`Create ${form.label.trim()}?`" description="Review what this role will be able to open. You can give it to people from the Members tab.">
      <template #body>
        <div class="space-y-2 text-sm">
          <p v-if="form.description.trim()" class="text-muted">{{ form.description }}</p>
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="p in ['DASHBOARD', ...form.permissions]" :key="p" size="sm" variant="subtle" color="primary" :label="PERMISSION_LABELS[p] ?? p" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton label="Create role" :loading="creating" @click="createRole" />
          <UButton variant="outline" color="neutral" label="Back" @click="reviewOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="confirmOpen" :title="`Make ${pending?.person.name} ${pending ? roleLabel(pending.role).toLowerCase() : ''}?`"
      description="Their access changes the next time they load a page. This is recorded in the audit log.">
      <template #body>
        <div v-if="pending" class="space-y-2 text-sm">
          <p class="text-muted">They will be able to open:</p>
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="p in roles.find(r => r.role === pending!.role)?.permissions ?? []" :key="p" size="sm" variant="subtle" color="neutral" :label="PERMISSION_LABELS[p] ?? p" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton label="Change role" :loading="!!busy" @click="confirmChange" />
          <UButton variant="outline" color="neutral" label="Cancel" @click="confirmOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
