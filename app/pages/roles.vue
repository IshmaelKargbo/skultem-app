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
const roleFilter = ref('ALL')
const me = computed(() => useUserStore().user?.id)
const shownStaff = computed(() => {
  const q = search.value.trim().toLowerCase()
  return staff.value.filter(p =>
    (roleFilter.value === 'ALL' || p.role === roleFilter.value) && (!q || `${p.name} ${p.email}`.toLowerCase().includes(q)))
})
const filterItems = computed(() => [{ label: 'All roles', value: 'ALL' }, ...roleItems.value])

// The platform always keeps one owner, so the only one left can't be moved to another role.
const soleOwner = (p: PlatformStaff) => p.role === 'OWNER' && staff.value.filter(x => x.role === 'OWNER').length === 1

const roleDescription = (role: string) => roles.value.find(r => r.role === role)?.description ?? ''

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

    <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
      <USkeleton class="h-80 lg:col-span-2" /><USkeleton class="h-80" />
    </div>

    <template v-else-if="!failed">
      <div class="grid items-start gap-5 lg:grid-cols-3">
        <!-- Administrators -->
        <UCard class="lg:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="font-semibold text-highlighted">Platform administrators</h3>
                  <p class="text-xs text-muted">{{ staff.length }} {{ staff.length === 1 ? 'person' : 'people' }} can sign in to this portal.</p>
                </div>
              </div>
              <div class="flex flex-col gap-2 sm:flex-row">
                <UInput v-model="search" icon="i-lucide-search" placeholder="Search name or email" class="flex-1" />
                <USelect v-model="roleFilter" :items="filterItems" value-key="value" class="w-full sm:w-44" icon="i-lucide-shield" />
              </div>
            </div>
          </template>

          <ul class="divide-y divide-default">
            <li v-for="p in shownStaff" :key="p.userId" class="px-4 py-4">
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
              <p class="mt-2 pl-14 text-xs text-muted">{{ roleDescription(p.role) }}</p>
            </li>
            <li v-if="!shownStaff.length" class="px-4 py-10 text-center text-sm text-muted">
              {{ staff.length ? 'No one matches your search or filter.' : 'No platform administrators found.' }}
            </li>
          </ul>
        </UCard>

        <!-- Roles -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div>
              <h3 class="font-semibold text-highlighted">Roles</h3>
              <p class="text-xs text-muted">Someone with no role is an owner. At least one owner is always kept.</p>
            </div>
          </template>
          <ul class="divide-y divide-default">
            <li v-for="r in roles" :key="r.role" class="px-4 py-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-highlighted">{{ r.label }}</p>
                <span class="inline-flex items-center gap-1 text-xs text-muted"><UIcon name="i-lucide-users" class="size-3.5" />{{ membersOf(r.role) }}</span>
              </div>
              <p class="mt-0.5 text-xs text-muted">{{ r.description }}</p>
            </li>
          </ul>
        </UCard>
      </div>

      <!-- What each role can open -->
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div>
            <h3 class="font-semibold text-highlighted">What each role can open</h3>
            <p class="text-xs text-muted">A tick means the role can open that area and make changes in it.</p>
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-sm">
            <thead>
              <tr class="border-b border-default text-left text-xs text-muted">
                <th class="px-4 py-2.5 font-medium">Area</th>
                <th v-for="r in roles" :key="r.role" class="px-3 py-2.5 text-center font-medium">{{ r.label }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="perm in allPermissions" :key="perm" class="hover:bg-elevated/40">
                <td class="px-4 py-2.5 text-highlighted">{{ PERMISSION_LABELS[perm] }}</td>
                <td v-for="r in roles" :key="r.role" class="px-3 py-2.5 text-center">
                  <UIcon v-if="r.permissions.includes(perm as PlatformPermission)" name="i-lucide-check" class="size-4 text-success" />
                  <span v-else class="text-muted/50">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>

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
