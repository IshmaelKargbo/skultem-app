<script setup lang="ts">
import type { FilterField } from '~/components/filter/Drawer.vue'
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const store = useUserStore()
const appStore = useAppStore()

const { records: data, meta, loading } = storeToRefs(store)

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

const search = ref('')
const role = ref('')
const status = ref('')

const roleOptions = Object.entries(parseRole).map(([value, label]) => ({ label, value }))
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

// Role and status live in the shared filter drawer (same as the class list); search stays in the header.
const filters = computed<Record<string, string>>({
  get: () => ({ role: role.value, status: status.value }),
  set: (v) => {
    role.value = v.role ?? ''
    status.value = v.status ?? ''
  }
})
const filterFields = computed<FilterField[]>(() => [
  { key: 'role', label: 'Role', type: 'select', options: roleOptions, placeholder: 'All Roles' },
  { key: 'status', label: 'Status', type: 'select', options: statusOptions, placeholder: 'All Statuses' }
])

const hasActiveFilters = computed(() => !!search.value || !!role.value || !!status.value)

function statusOf(user: User) {
  return user.schoolStatus ?? user.status
}

// The server does the searching and filtering across every page, so the list shows as loaded.
const filtered = computed(() => data.value ?? [])

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

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

async function fetchRecord() {
  await store.fetchAll(page.value, size.value, {
    query: search.value,
    role: role.value,
    status: status.value,
  })
}

watch(page, () => {
  updateQuery({ page: page.value })
  fetchRecord()
})

// A new search or filter starts again from page 1 - otherwise page 3 of a two-page result is empty.
function applyFilters() {
  if (page.value !== 1) page.value = 1 // the page watcher fetches
  else fetchRecord()
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(applyFilters, 350)
})
watch([role, status], applyFilters)
onBeforeUnmount(() => clearTimeout(searchTimer))

onMounted(async () => {
  if (!route.query.page) {
    updateQuery({ page: page.value })
  }

  fetchRecord()
  appStore.setTitle('Auth Management')
  document.title = 'Users | Auth | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <AuthSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <AuthUsersAdd />
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search by name or email" class="min-w-0 flex-1" />
            <FilterDrawer v-model="filters" :fields="filterFields" title="Filter users"
              description="Narrow the list by role or status" />
          </div>

          <div class="flex items-center gap-2">
            <TableViewToggle v-model="view" />
          </div>
        </div>
      </template>

      <!-- Desktop table -->
      <UTable v-if="view === 'table'" class="hidden md:block" :ui="{
        loading: 'py-0'
      }" :columns="columns" :data="filtered" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center gap-3 py-14">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-users" class="size-7 text-gray-400" />
            </div>

            <div class="text-center">
              <p class="font-medium text-gray-900 dark:text-white">
                No users found
              </p>

              <p class="text-sm text-gray-500">
                {{ hasActiveFilters ? 'No user matches your search or filters.' : 'Users will appear here once created.'
                }}
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
          <div class="flex justify-end">
            <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-chevron-right"
              :to="`/auth/${row.original.id}`" />
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
              <UButton :to="`/auth/${item.id}`" icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm"
                aria-label="View user" />
            </div>
          </div>
        </template>

        <div v-else class="flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-users" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No user matches your search or filters.' : 'No users found.' }}
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
          <div v-for="item in filtered" :key="item.id" class="overflow-hidden rounded-2xl border border-default"
            :ui="{ body: 'p-0 sm:p-0' }">
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

            </div>
          </div>
        </div>

        <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-users" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No user matches your search or filters.' : 'No users found.' }}
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

  </div>
</template>
