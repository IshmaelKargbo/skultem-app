<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useAcademicYearStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<AcademicYear | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const parseStaus: Record<string, string> = {
  OPENED: 'Opened',
  LOCKED: 'Closed',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
  OPENED: 'success',
  LOCKED: 'warning',
  DELETED: 'danger'
}

const parseStatusIcon: Record<string, string> = {
  OPENED: 'i-lucide-lock-open',
  LOCKED: 'i-lucide-lock',
  DELETED: 'i-lucide-x'
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }: any) => formatDate(row.original.startDate)
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }: any) => formatDate(row.original.endDate)
  },
  {
    accessorKey: 'active',
    header: 'Active',
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? 6),
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

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }

  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
})
</script>

<template>
  <!-- Desktop -->
  <UCard class="hidden md:block" :ui="{
    body: 'sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-gray-400" />

          <p class="text-sm text-gray-500">
            No academic years found
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #active-cell="{ row }">
        <UBadge :label="row.original.active ? 'Active' : 'Inactive'"
          :color="row.original.active ? 'success' : 'neutral'" variant="soft" />
      </template>

      <template #status-cell="{ row }">
        <UBadge variant="soft" :color="parseStatusColor[row.original.status]">
          <UIcon :name="parseStatusIcon[row.original.status]" class="mr-1" />
          {{ parseStaus[row.original.status] }}
        </UBadge>
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
      <UCard v-for="i in 4" :key="i" class="overflow-hidden">
        <div class="space-y-4 p-4">
          <div class="flex items-center gap-3">
            <USkeleton class="size-12 rounded-2xl" />

            <div class="space-y-2">
              <USkeleton class="h-3 w-32" />
              <USkeleton class="h-2 w-24" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
          </div>
        </div>
      </UCard>
    </template>


    <!-- Cards -->
    <template v-else-if="data?.length">
      <UCard v-for="item in data" :key="item.id" class="overflow-hidden rounded-3xl shadow-sm" :ui="{ body: 'p-0' }">
        <div class="space-y-4 p-4">

          <!-- Header -->
          <div class="flex items-start justify-between gap-3">

            <div class="flex items-center gap-3 min-w-0">

              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="i-lucide-calendar-range" class="size-5 text-primary" />
              </div>

              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">
                  {{ item.name }}
                </h3>

                <p class="mt-1 text-xs text-muted">
                  Academic Year
                </p>
              </div>

            </div>
          </div>

          <!-- Date Range -->
          <div class="rounded-2xl bg-muted p-4">

            <div class="flex items-start gap-3">

              <div class="mt-1 flex flex-col items-center">
                <div class="size-2 rounded-full bg-primary" />
                <div class="h-8 w-px bg-default" />
                <div class="size-2 rounded-full bg-primary" />
              </div>

              <div class="flex-1 space-y-4">

                <div>
                  <p class="text-[11px] text-muted">
                    Start Date
                  </p>

                  <p class="text-sm font-medium text-highlighted">
                    {{ formatDate(item.startDate) }}
                  </p>
                </div>

                <div>
                  <p class="text-[11px] text-muted">
                    End Date
                  </p>

                  <p class="text-sm font-medium text-highlighted">
                    {{ formatDate(item.endDate) }}
                  </p>
                </div>

              </div>

            </div>

          </div>

          <!-- Status -->
          <div class="grid grid-cols-2 gap-3">

            <div class="rounded-2xl border border-default p-3">
              <p class="mb-2 text-[11px] text-muted">
                Active
              </p>

              <UBadge :label="item.active ? 'Active' : 'Inactive'" :color="item.active ? 'success' : 'neutral'"
                variant="soft" />
            </div>

            <div class="rounded-2xl border border-default p-3">
              <p class="mb-2 text-[11px] text-muted">
                Status
              </p>

              <UBadge :color="parseStatusColor[item.status]" variant="soft">
                <UIcon :name="parseStatusIcon[item.status]" class="mr-1" />

                {{ parseStaus[item.status] }}
              </UBadge>
            </div>

          </div>

        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <UCard class="overflow-hidden">
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-gray-400" />

          <p class="text-sm text-gray-500">
            No academic years found
          </p>
        </div>
      </UCard>
    </template>

  <!-- Pagination -->
      <div v-if="!loading && data?.length" class="flex flex-col items-center gap-3 pt-2">
        <Showing :meta="meta" />

        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
  </div>
</template>
