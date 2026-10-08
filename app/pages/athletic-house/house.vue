<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()

const store = useHouseStore()

const loading = ref(false)

const { records, meta } = storeToRefs(store)

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

function updateQuery(newQuery: Record<string, any>) {
  router.replace({
    query: {
      ...route.query,
      ...newQuery
    }
  })
}


async function fetchRecord() {
  loading.value = true
  try {
    await store.fetchAll(page.value, size.value)
  } finally {
    loading.value = false
  }
}

watchEffect(() => {
  fetchRecord()
})

onMounted(() => {
  updateQuery({
    page: page.value
  })

  useAppStore().setTitle('Athletic Management');
  document.title = 'Athletic Houses | Athletic Management | Skultem';
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})

const { success: toastSuccess, error: toastError } = useNotify()

const editOpen = ref(false)
const editTarget = ref<House>()
const deleteOpen = ref(false)
const deleteTarget = ref<House>()

function rowActions(house: House) {
  return [[
    {
      label: 'Edit House', icon: 'i-lucide-pencil',
      onSelect: () => { editTarget.value = house; nextTick(() => { editOpen.value = true }) }
    },
    {
      label: 'Delete House', icon: 'i-lucide-trash-2', color: 'error' as const,
      onSelect: () => { deleteTarget.value = house; deleteOpen.value = true }
    }
  ]]
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await store.delete(deleteTarget.value.id)
    toastSuccess('House deleted')
    await fetchRecord()
  } catch (err: any) {
    // Left open on purpose: the backend's reason (e.g. students still assigned) is what to read.
    toastError(err?.message || 'Unable to delete the house')
    throw err
  }
}

const columns = [
  {
    accessorKey: 'name',
    header: 'House Name'
  },
  {
    accessorKey: 'motto',
    header: 'Motto'
  },
  {
    accessorKey: 'houseMasters',
    header: 'House Masters'
  },
  {
    id: 'actions',
    meta: { class: { td: 'text-right' } }
  }
]
</script>

<template>
  <div class="px-4 md:px-6 space-y-4">
    <AthleticSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-between space-x-3">
          <div class="flex space-x-3 flex-1">
            <UInput placeholder="Search by name . . ." />
            <AthleticCategoryAdd />
          </div>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="records" :loading="loading">
        <!-- Empty -->
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-12">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-home" class="text-2xl text-gray-400" />
            </div>

            <div class="text-center">
              <p class="font-medium text-gray-900 dark:text-white">
                No houses found
              </p>
              <p class="text-sm text-gray-500">
                Houses will appear here once created.
              </p>
            </div>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <!-- Name -->
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="size-5 rounded" :style="{ backgroundColor: row.original.color }" />
            <p class="font-medium text-gray-900 dark:text-white">
              {{ row.original.name }}
            </p>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="xs" variant="ghost" />
            </UDropdownMenu>
          </div>
        </template>

        <!-- House Masters -->
        <template #houseMasters-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="m in row.original.houseMasters" :key="m.id" size="sm" color="neutral" variant="soft">
              {{ m.user?.givenNames }} {{ m.user?.familyName }}
            </UBadge>
          </div>
        </template>
      </UTable>

      <!-- ===================== -->
      <!-- MOBILE VIEW -->
      <!-- ===================== -->
      <div class="p-4 space-y-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 4" :key="i" variant="outline">
            <div class="space-y-4 p-4">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 rounded-2xl" />
                <div class="space-y-2">
                  <USkeleton class="h-3 w-28" />
                  <USkeleton class="h-2 w-40" />
                </div>
              </div>

              <USkeleton class="h-16 rounded-2xl" />
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="records?.length">
          <UCard v-for="item in records" :key="item.id" variant="outline" :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <template #header>
              <div class="flex items-center gap-3">
                <div class="size-10 bg-gray-50 rounded-xl items-center flex justify-center">
                  <div class="size-full rounded-xl shadow-sm" :style="{ backgroundColor: item.color }" />
                </div>

                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-gray-500">
                    Athletic House
                  </p>
                </div>

                <UDropdownMenu :items="rowActions(item)" :content="{ align: 'end' }">
                  <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="sm" variant="ghost" />
                </UDropdownMenu>
              </div>
            </template>

            <!-- Content -->
            <div class="p-4 space-y-3">
              <!-- Motto -->
              <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 dark:bg-neutral-800">
                <p class="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {{ item.motto || 'No motto provided.' }}
                </p>
              </div>

              <!-- Masters -->
              <div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 mb-2">
                  House Masters
                </p>

                <div class="flex flex-wrap gap-1">
                  <UBadge v-for="m in item.houseMasters" :key="m.id" size="sm" color="neutral" variant="soft">
                    {{ m.user?.givenNames }} {{ m.user?.familyName }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="flex flex-col items-center justify-center py-14 col-span-full">
            <div class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-home" class="text-3xl text-gray-400" />
            </div>

            <p class="font-medium text-gray-900 dark:text-white">
              No houses found
            </p>

            <p class="mt-1 text-sm text-gray-500">
              Create a house to start organizing students.
            </p>
          </div>
        </template>

      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <AthleticCategoryAdd v-if="editTarget" v-model:open="editOpen" :house="editTarget" />

    <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete House"
      :item-name="deleteTarget.name" confirm-label="Delete house"
      description="Deletes this house and its house master assignments. Only possible while no students are assigned to it - reassign them first."
      :on-confirm="confirmDelete" />
  </div>
</template>