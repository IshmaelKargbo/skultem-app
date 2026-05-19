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
  <div>
    <UCard
      :ui="{
        body: 'p-0 sm:p-0'
      }"
    >
      <UTable
        :ui="{
          loading: 'py-0'
        }"
        :columns="columns"
        :data="data"
        :loading="loading"
      >
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon
              name="ph:books-light"
              class="text-4xl text-gray-400"
            />

            <p class="text-gray-500">
              No users found.
            </p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :label="parseStatus[row.original.status]"
            variant="outline"
            :color="parseStatusColor[row.original.status]"
          />
        </template>

        <template #roles-cell="{ row }">
          <UBadge
            v-if="row.original.roles.length > 1"
            :label="`${row.original.roles.length} Roles`"
            color="neutral"
            variant="outline"
            trailing-icon="eos-icons:role-binding-outlined"
          />

          <UBadge
            v-else
            :label="`${parseRole[row.original.roles[0] || '']}`"
            :color="parseRoleColor[row.original.roles[0] || '']"
            variant="outline"
            :trailing-icon="parseRoleIcon[row.original.roles[0] || '']"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UTooltip
              :delay-duration="0"
              arrow
              text="Assign Role"
            >
              <UButton
                size="md"
                variant="ghost"
                color="info"
                icon="eos-icons:cluster-role-binding"
                @click="openAssignRole(row.original.id)"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />

          <UPagination
            v-model:page="page"
            size="sm"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
          />
        </div>
      </template>
    </UCard>

    <AuthUsersAssign
      v-model="showAssign"
      :user-id="selectedUserId"
      @success="fetchRecord"
    />
  </div>
</template>