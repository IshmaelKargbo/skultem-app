<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useUserStore()

const { records: data, meta, loading } = storeToRefs(store)

const showAssign = ref(false)
const selectedUserId = ref('')

const UButton = resolveComponent('UButton')

const parseStatus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  RESET_PASSWORD: 'Reset Password',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  RESET_PASSWORD: 'neutral',
  DELETED: 'danger'
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

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

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
})
</script>

<template>
  <div class="space-y-4">
    <!-- Desktop -->
    <UCard class="hidden md:block" :ui="{
      body: 'p-0 sm:p-0'
    }">
      <UTable :ui="{
        loading: 'py-0'
      }" :columns="columns" :data="data" :loading="loading">
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
                Users will appear here once created.
              </p>
            </div>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="`${row.original.givenNames} ${row.original.familyName}`" size="md" />

            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.givenNames }}
                {{ row.original.familyName }}
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
          <UBadge :label="parseStatus[row.original.status]" variant="soft"
            :color="parseStatusColor[row.original.status]" />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UTooltip :delay-duration="0" arrow text="Assign Role">
              <UButton size="sm" variant="soft" color="primary" icon="eos-icons:cluster-role-binding" class="rounded-xl"
                @click="openAssignRole(row.original.id)" />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <!-- Mobile -->
    <div class="space-y-4 md:hidden">
      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 4" :key="i" class="overflow-hidden ">
          <div class="space-y-4 p-4">
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-3 w-32" />
                <USkeleton class="h-2 w-44" />
              </div>

              <USkeleton class="size-8 rounded-xl" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id" class="overflow-hidden " :ui="{
          body: 'p-0'
        }">
          <!-- Header -->
          <div class="border-b border-gray-100 p-4 dark:border-gray-800">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar :alt="`${item.givenNames} ${item.familyName}`" size="lg" />

                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.givenNames }}
                    {{ item.familyName }}
                  </h3>

                  <p class="truncate text-xs text-gray-500">
                    {{ item.email }}
                  </p>
                </div>
              </div>

              <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-settings-2" class="rounded-xl"
                @click="openAssignRole(item.id)" />
            </div>
          </div>

          <!-- Content -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Status
              </p>

              <UBadge :label="parseStatus[item.status]" variant="soft" size="sm"
                :color="parseStatusColor[item.status]" />
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Roles
              </p>

              <UBadge v-if="item.roles.length > 1" :label="`${item.roles.length} Roles`" color="neutral" size="sm"
                variant="soft" />

              <UBadge v-else :label="`${parseRole[item.roles[0] || '']}`" :color="parseRoleColor[item.roles[0] || '']"
                size="sm" variant="soft" />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            <div>
              <p class="text-xs text-gray-500">
                User Account
              </p>

              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.roles.length }} assigned role(s)
              </p>
            </div>

            <UButton label="Assign Role" size="sm" color="primary" variant="soft" icon="eos-icons:cluster-role-binding"
              class="rounded-xl" @click="openAssignRole(item.id)" />
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-14">
          <div class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800">
            <UIcon name="i-lucide-users" class="size-8 text-gray-400" />
          </div>

          <p class="font-medium text-gray-900 dark:text-white">
            No users found
          </p>

          <p class="mt-1 text-sm text-gray-500">
            User records will appear here.
          </p>
        </div>
      </template>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-3 md:hidden">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>

    <AuthUsersAssign v-model="showAssign" :user-id="selectedUserId" @success="fetchRecord" />
  </div>
</template>