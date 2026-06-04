<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useTermStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<Term | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const parseStaus: Record<string, string> = {
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
}

const parseStatusColor: Record<string, string> = {
  UPCOMING: 'warning',
  ACTIVE: 'success',
  CLOSED: 'danger'
}

const parseStatusIcon: Record<string, string> = {
  UPCOMING: 'i-lucide-clock',
  ACTIVE: 'i-lucide-check-circle',
  CLOSED: 'i-lucide-lock'
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
  <UCard
    class="hidden md:block"
    :ui="{
      body: 'p-0 sm:p-0'
    }"
  >
    <UTable
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
            No terms found.
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #academicYearId-cell="{ row }">
        <p>{{ row.original.academicYear.name }}</p>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          variant="subtle"
          :color="parseStatusColor[row.original.status]"
        >
          <UIcon
            :name="parseStatusIcon[row.original.status]"
            class="mr-1"
          />

          {{ parseStaus[row.original.status] }}
        </UBadge>
      </template>
    </UTable>

    <template #footer>
      <div class="flex items-center justify-between">
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

  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard
        v-for="i in 4"
        :key="i"
        class="overflow-hidden"
      >
        <div class="space-y-4 p-4">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-24" />
            </div>

            <USkeleton class="h-6 w-20 rounded-full" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
          </div>

          <USkeleton class="h-12 rounded-2xl" />
        </div>
      </UCard>
    </template>

    <!-- Data -->
    <template v-else-if="data?.length">
      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-800 dark:bg-neutral-900"
        :ui="{
          body: 'p-0'
        }"
      >
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              >
                <UIcon
                  name="i-lucide-calendar-days"
                  class="size-6"
                />
              </div>

              <div class="min-w-0">
                <h3
                  class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {{ item.name }}
                </h3>

                <p class="truncate text-xs text-gray-500">
                  {{ item.academicYear?.name }}
                </p>
              </div>
            </div>

            <UDropdownMenu
              :items="getRowItems({ original: item } as any)"
              :content="{ align: 'end' }"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                class="rounded-xl"
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Content -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p
              class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500"
            >
              Start Date
            </p>

            <p class="text-sm font-medium">
              {{ formatDate(item.startDate) }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p
              class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500"
            >
              End Date
            </p>

            <p class="text-sm font-medium">
              {{ formatDate(item.endDate) }}
            </p>
          </div>

          <div
            class="col-span-2 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800"
          >
            <p
              class="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-500"
            >
              Status
            </p>

            <UBadge
              variant="soft"
              :color="parseStatusColor[item.status]"
            >
              <UIcon
                :name="parseStatusIcon[item.status]"
                class="mr-1"
              />

              {{ parseStaus[item.status] }}
            </UBadge>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div class="min-w-0">
            <p
              class="truncate text-sm font-medium text-gray-900 dark:text-white"
            >
              Academic Year
            </p>

            <p class="truncate text-xs text-gray-500">
              {{ item.academicYear?.name || 'N/A' }}
            </p>
          </div>

          <UButton
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-xl"
          />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon
          name="ph:books-light"
          class="mb-3 text-4xl text-gray-400"
        />

        <p class="text-sm text-gray-500">
          No terms found.
        </p>
      </div>
    </template>

    <!-- Pagination -->
      <div class="flex justify-between items-center mt-3 md:hidden">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>