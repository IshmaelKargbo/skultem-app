<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useUserStore()
const appStore = useAppStore()

const { records: data, meta, loading } = storeToRefs(store)

const { user: me } = storeToRefs(store)

const showAssign = ref(false)
const selectedUserId = ref('')

// Only owner-level staff can change someone's section access (see AssignStaffManagementSectionsUseCase),
// and it's only meaningful once the school has actually split itself into sections.
const { can } = useAuth()
const { isSectionBased, load: loadStructure } = useSchoolStructure()

function scopableRoles(user: User) {
  return user.roles.filter(r => isScopableRole(r))
}

function canManageSections(user: User) {
  return can([Role.OWNER, Role.PROPRIETOR]) && isSectionBased.value && !!scopableRoles(user).length
}

const sectionsTarget = ref<User | null>(null)
const showManageSections = computed<boolean>({
  get: () => sectionsTarget.value !== null,
  set: (v) => { if (!v) sectionsTarget.value = null }
})

function openManageSections(user: User) {
  sectionsTarget.value = user
}

const statusTarget = ref<User | null>(null)
const showStatus = computed<boolean>({
  get: () => statusTarget.value !== null,
  set: (v) => { if (!v) statusTarget.value = null }
})

function openStatusPrompt(user: User) {
  statusTarget.value = user
}

const resetPasswordTarget = ref<User | null>(null)
const showResetPassword = computed<boolean>({
  get: () => resetPasswordTarget.value !== null,
  set: (v) => { if (!v) resetPasswordTarget.value = null }
})

function openResetPasswordPrompt(user: User) {
  resetPasswordTarget.value = user
}

const parseStatus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  RESET_PASSWORD: 'Reset Password',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, 'success' | 'warning' | 'neutral' | 'error'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  RESET_PASSWORD: 'neutral',
  DELETED: 'error'
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => {
      return `${row.original.givenNames} ${row.original.familyName}`
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'roles',
    header: 'Roles'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    id: 'actions'
  }
]

// --- Filters: the same row as Transactions and the Student Ledger. There's no server-side user
// search, so these narrow the users on the page that's loaded. -------------------------------------
const search = ref('')
const role = ref('')
const status = ref('')
const filterState = ref(false) // the filter row's open/closed state on mobile

const roleOptions = Object.entries(parseRole).map(([value, label]) => ({ label, value }))
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

const hasActiveFilters = computed(() => !!search.value || !!role.value || !!status.value)

function resetFilters() {
  search.value = ''
  role.value = ''
  status.value = ''
}

function statusOf(user: User) {
  return user.schoolStatus ?? user.status
}

const filtered = computed(() => {
  const text = search.value.trim().toLowerCase()

  return (data.value ?? []).filter((user) => {
    if (role.value && !user.roles.includes(role.value as any)) return false
    if (status.value && statusOf(user) !== status.value) return false
    if (!text) return true

    return `${user.givenNames} ${user.familyName}`.toLowerCase().includes(text)
      || user.email?.toLowerCase().includes(text)
  })
})

// The most a row/card shows before collapsing the rest into "+n" - keeps a many-role user to one line.
const MAX_ROLES_SHOWN = 2

function shownRoles(user: User) {
  return user.roles.slice(0, MAX_ROLES_SHOWN)
}

function hiddenRoleCount(user: User) {
  return Math.max(user.roles.length - MAX_ROLES_SHOWN, 0)
}

function fullName(user: User) {
  return `${user.givenNames} ${user.familyName}`
}

// The actions menu used by the mobile rows and the cards - the table keeps its own icon buttons.
function userActions(user: User) {
  const own = me.value?.id === user.id
  const active = user.schoolStatus === 'ACTIVE'

  return [
    [
      { label: 'View profile', icon: 'i-lucide-eye', to: `/auth/${user.id}` },
      { label: 'Assign role', icon: 'eos-icons:cluster-role-binding', onClick: () => openAssignRole(user.id) },
      ...(canManageSections(user)
        ? [{ label: 'Manage sections', icon: 'lucide:layers', onClick: () => openManageSections(user) }]
        : []),
    ],
    ...(own
      ? []
      : [[
        { label: 'Reset password', icon: 'lucide:key-round', onClick: () => openResetPasswordPrompt(user) },
        {
          label: active ? 'Deactivate' : 'Reactivate',
          icon: active ? 'lucide:user-x' : 'lucide:user-check',
          color: active ? 'error' as const : 'success' as const,
          onClick: () => openStatusPrompt(user)
        },
      ]]),
  ]
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

function openAssignRole(userId: string) {
  selectedUserId.value = userId
  showAssign.value = true
}

async function fetchRecord() {
  loading.value = true

  await store.fetchAll(page.value, size.value)

  loading.value = false
}

watch(
  () => page.value,
  () => {
    router.replace({
      query: {
        page: page.value
      }
    })

    fetchRecord()
  },
  { immediate: true }
)

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecord()
  loadStructure()
  appStore.setTitle('Auth Management')
  document.title = 'Users | Auth | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <AuthSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p class="font-semibold">Users</p>
              <p class="text-xs-base text-muted">Everyone with access to your school</p>
            </div>

            <div class="flex items-center gap-2">
              <TableViewToggle v-model="view" />
              <UButton @click="filterState = !filterState" :icon="!filterState ? FILTER_ICON : CLOSE_ICON"
                variant="outline" :color="!filterState ? 'info' : 'error'" class="md:hidden" />
              <AuthUsersAdd />
            </div>
          </div>

          <!-- Always shown from md up; on mobile it opens with the filter button -->
          <div :class="filterState ? 'flex' : 'hidden'"
            class="md:flex flex-wrap items-center justify-between gap-3 border-t border-default p-4">
            <div class="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3">
              <USelectMenu class="w-full" v-model="role" value-key="value" label-key="label" :items="roleOptions"
                placeholder="All Roles" clear />
              <USelectMenu class="w-full" v-model="status" value-key="value" label-key="label"
                :items="statusOptions" placeholder="All Statuses" clear />
              <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search this page by name or email" />
            </div>
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
        </div>
      </template>

      <!-- Desktop table -->
      <UTable v-if="view === 'table'" class="hidden md:block" :ui="{
        loading: 'py-0'
      }" :columns="columns" :data="filtered" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-14">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-users" class="size-7 text-gray-400" />
            </div>

            <div class="text-center">
              <p class="font-medium text-gray-900 dark:text-white">
                No users found
              </p>

              <p class="text-sm text-gray-500">
                {{ hasActiveFilters ? 'No user on this page matches your filters.' : 'Users will appear here once created.' }}
              </p>
            </div>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="fullName(row.original)" size="md" />

            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ fullName(row.original) }}
              </p>

              <p class="text-xs text-gray-500">
                {{ row.original.email }}
              </p>
            </div>
          </div>
        </template>

        <template #roles-cell="{ row }">
          <UBadge v-if="row.original.roles.length > 1" :label="`${row.original.roles.length} Roles`" color="neutral"
            variant="soft" trailing-icon="eos-icons:role-binding-outlined" />

          <UBadge v-else :label="`${parseRole[row.original.roles[0] || '']}`"
            :color="parseRoleColor[row.original.roles[0] || '']" variant="soft"
            :trailing-icon="parseRoleIcon[row.original.roles[0] || '']" />
        </template>

        <template #status-cell="{ row }">
          <UBadge :label="parseStatus[statusOf(row.original)]" variant="soft"
            :color="parseStatusColor[statusOf(row.original)]" />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1.5">
            <UTooltip :delay-duration="0" arrow text="View Profile">
              <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-eye" class="rounded-xl"
                :to="`/auth/${row.original.id}`" />
            </UTooltip>

            <UTooltip :delay-duration="0" arrow text="Assign Role">
              <UButton size="sm" variant="soft" color="primary" icon="eos-icons:cluster-role-binding" class="rounded-xl"
                @click="openAssignRole(row.original.id)" />
            </UTooltip>

            <UTooltip v-if="canManageSections(row.original)" :delay-duration="0" arrow text="Manage Sections">
              <UButton size="sm" variant="soft" color="info" icon="lucide:layers" class="rounded-xl"
                @click="openManageSections(row.original)" />
            </UTooltip>

            <UTooltip v-if="me?.id !== row.original.id" :delay-duration="0" arrow text="Reset Password">
              <UButton size="sm" variant="soft" color="warning" icon="lucide:key-round" class="rounded-xl"
                @click="openResetPasswordPrompt(row.original)" />
            </UTooltip>

            <UTooltip v-if="me?.id !== row.original.id" :delay-duration="0" arrow
              :text="row.original.schoolStatus === 'ACTIVE' ? 'Deactivate' : 'Reactivate'">
              <UButton size="sm" variant="soft" :color="row.original.schoolStatus === 'ACTIVE' ? 'error' : 'success'"
                :icon="row.original.schoolStatus === 'ACTIVE' ? 'lucide:user-x' : 'lucide:user-check'"
                class="rounded-xl" @click="openStatusPrompt(row.original)" />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <!-- Mobile list: one clean row per user -->
      <div class="md:hidden">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="flex items-center gap-3 border-b border-default px-4 py-3 last:border-0">
            <USkeleton class="size-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-44" />
            </div>
            <USkeleton class="h-5 w-14 rounded-full" />
          </div>
        </template>

        <template v-else-if="filtered.length">
          <div v-for="item in filtered" :key="item.id"
            class="flex items-center gap-3 border-b border-default px-4 py-3 last:border-0">
            <NuxtLink :to="`/auth/${item.id}`" class="flex min-w-0 flex-1 items-center gap-3">
              <UAvatar :alt="fullName(item)" size="lg" class="shrink-0" />

              <div class="min-w-0 space-y-1">
                <p class="truncate text-sm font-semibold text-highlighted">{{ fullName(item) }}</p>
                <p class="truncate text-xs text-muted">{{ item.email }}</p>

                <div class="flex flex-wrap items-center gap-1">
                  <UBadge v-for="r in shownRoles(item)" :key="r" size="sm" variant="subtle"
                    :color="parseRoleColor[r] as any" :label="parseRole[r] || r" />
                  <span v-if="hiddenRoleCount(item)" class="text-xs text-muted">+{{ hiddenRoleCount(item) }}</span>
                </div>
              </div>
            </NuxtLink>

            <div class="flex shrink-0 flex-col items-end gap-1.5">
              <UBadge size="sm" variant="soft" :label="parseStatus[statusOf(item)]"
                :color="parseStatusColor[statusOf(item)]" />
              <UDropdownMenu :items="userActions(item)" :content="{ align: 'end' }">
                <UButton icon="lucide:ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                  aria-label="User actions" />
              </UDropdownMenu>
            </div>
          </div>
        </template>

        <div v-else class="flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-users" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No user on this page matches your filters.' : 'No users found.' }}
          </p>
        </div>
      </div>

      <!-- Card view -->
      <div v-if="view === 'card'" class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i">
            <div class="animate-pulse space-y-4">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 rounded-full" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-32" />
                  <USkeleton class="h-3 w-40" />
                </div>
              </div>
              <USkeleton class="h-5 w-24" />
            </div>
          </UCard>
        </template>

        <div class="hidden md:block" v-else-if="filtered.length">
          <div v-for="item in filtered" :key="item.id"
            class="overflow-hidden rounded-2xl border border-default" :ui="{ body: 'p-0 sm:p-0' }">
            <div class="space-y-4 p-5">
              <div class="flex items-start gap-3">
                <UAvatar :alt="fullName(item)" size="xl" class="shrink-0" />

                <div class="min-w-0 flex-1">
                  <NuxtLink :to="`/auth/${item.id}`"
                    class="block truncate font-display font-semibold text-highlighted hover:text-primary">
                    {{ fullName(item) }}
                  </NuxtLink>
                  <p class="truncate text-sm text-muted">{{ item.email }}</p>
                </div>

                <UBadge size="sm" variant="soft" :label="parseStatus[statusOf(item)]"
                  :color="parseStatusColor[statusOf(item)]" />
              </div>

              <div class="flex flex-wrap items-center gap-1.5">
                <UBadge v-for="r in item.roles" :key="r" size="sm" variant="subtle" :color="parseRoleColor[r] as any"
                  :label="parseRole[r] || r" :trailing-icon="parseRoleIcon[r]" />
                <span v-if="!item.roles.length" class="text-xs text-muted">No roles assigned</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 border-t border-default bg-elevated/40 px-5 py-3">
              <UButton :to="`/auth/${item.id}`" label="View profile" variant="ghost" color="neutral" size="sm"
                trailing-icon="i-lucide-arrow-right" />

              <div class="flex items-center gap-1.5">
                <UTooltip :delay-duration="0" arrow text="Assign Role">
                  <UButton size="sm" variant="soft" color="primary" icon="eos-icons:cluster-role-binding"
                    class="rounded-xl" @click="openAssignRole(item.id)" />
                </UTooltip>
                <UTooltip v-if="canManageSections(item)" :delay-duration="0" arrow text="Manage Sections">
                  <UButton size="sm" variant="soft" color="info" icon="lucide:layers" class="rounded-xl"
                    @click="openManageSections(item)" />
                </UTooltip>
                <UDropdownMenu v-if="me?.id !== item.id" :items="userActions(item).slice(1)"
                  :content="{ align: 'end' }">
                  <UButton icon="lucide:ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                    aria-label="More actions" />
                </UDropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-users" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No user on this page matches your filters.' : 'No users found.' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <AuthUsersAssign v-model="showAssign" :user-id="selectedUserId" @success="fetchRecord" />

    <AuthUsersManageSections
      v-if="sectionsTarget"
      v-model="showManageSections"
      :user-id="sectionsTarget.id"
      :user-name="`${sectionsTarget.givenNames} ${sectionsTarget.familyName}`"
      :roles="scopableRoles(sectionsTarget)"
      @success="fetchRecord"
    />

    <AuthUsersStatusPrompt v-if="statusTarget" v-model:open="showStatus" :user-id="statusTarget.id"
      :user-name="`${statusTarget.givenNames} ${statusTarget.familyName}`"
      :active="statusTarget.schoolStatus === 'ACTIVE'" />

    <AuthUsersResetPasswordPrompt v-if="resetPasswordTarget" v-model:open="showResetPassword"
      :user-id="resetPasswordTarget.id"
      :user-name="`${resetPasswordTarget.givenNames} ${resetPasswordTarget.familyName}`" />
  </div>
</template>
