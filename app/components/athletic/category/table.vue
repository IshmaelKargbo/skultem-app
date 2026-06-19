<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useHouseStore()

const loading = ref(false)

const { records, meta } = storeToRefs(store)

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? 6),
  set: (val) => updateQuery({ size: val })
})

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
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }
})

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
    id: 'actions'
  }
]
</script>

<template>
  <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
    <UTable :columns="columns" :data="records" :loading="loading">
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
          <div class="size-5 rounded border shadow-sm" :style="{ backgroundColor: row.original.color }" />
          <p class="font-medium text-gray-900 dark:text-white">
            {{ row.original.name }}
          </p>
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

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between">
        <Showing :meta="meta" />

        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>

  <!-- ===================== -->
  <!-- MOBILE VIEW -->
  <!-- ===================== -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard v-for="i in 4" :key="i"
        class="rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-neutral-900">
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
      <UCard v-for="item in records" :key="item.id"
        class="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900"
        :ui="{ body: 'p-0' }">
        <!-- Header -->
        <div class="flex items-start justify-between border-b p-4 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="size-4 rounded-full border shadow-sm" :style="{ backgroundColor: item.color }" />

            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ item.name }}
              </h3>
              <p class="text-xs text-gray-500">
                Athletic House
              </p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-3">
          <!-- Motto -->
          <div class="rounded-2xl bg-gray-50 p-4 dark:bg-neutral-800">
            <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Motto
            </p>

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
      <div class="flex flex-col items-center justify-center py-14">
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

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-3">
      <Showing :meta="meta" />

      <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>