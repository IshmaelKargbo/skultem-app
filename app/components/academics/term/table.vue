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
<div class="space-y-4">
  <!-- Loading -->
  <template v-if="loading">
    <div class="grid gap-4 md:grid-cols-1">
      <UCard
        v-for="i in 6"
        :key="i"
        class="overflow-hidden rounded-3xl"
      >
        <div class="space-y-4 p-5">
          <div class="flex items-center gap-3">
            <USkeleton class="size-14 rounded-2xl" />

            <div class="space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-24" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <USkeleton class="h-20 rounded-2xl" />
            <USkeleton class="h-20 rounded-2xl" />
          </div>
        </div>
      </UCard>
    </div>
  </template>

  <!-- Data -->
  <template v-else-if="data?.length">
    <div class="grid gap-5 md:grid-cols-1 ">

      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden rounded-3xl border border-default hover:ring-primary-300  transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
        :ui="{ body: 'p-0' }"
      >
        <!-- Header -->
        <div class="bg-primary-50/50 dark:bg-primary-500 rounded-2xl p-5">
          <div class="flex items-start justify-between">

            <div class="flex items-center gap-4">
              <div
                class="flex size-14 items-center justify-center rounded-2xl bg-primary/10"
              >
                <UIcon
                  name="i-lucide-calendar-days"
                  class="size-7 text-primary"
                />
              </div>

              <div>
                <h3 class="text-lg font-bold">
                  {{ item.name }}
                </h3>

                <p class="text-sm text-muted">
                  {{ item.academicYear?.name }}
                </p>
              </div>
            </div>

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

        <!-- Body -->
        <div class="grid grid-cols-2 gap-4 p-5">

          <div class="rounded-2xl bg-gray-100 dark:bg-green-500/10 p-4">
            <div class="mb-3 flex items-center gap-2">
              <UIcon
                name="i-lucide-calendar-check"
                class="text-green-600"
              />

              <span class="text-xs text-muted">
                Start Date
              </span>
            </div>

            <p class="font-semibold">
              {{ formatDate(item.startDate) }}
            </p>
          </div>

          <div class="rounded-2xl bg-orange-50 dark:bg-orange-500/10 p-4">
            <div class="mb-3 flex items-center gap-2">
              <UIcon
                name="i-lucide-calendar-x"
                class="text-orange-500"
              />

              <span class="text-xs text-muted">
                End Date
              </span>
            </div>

            <p class="font-semibold">
              {{ formatDate(item.endDate) }}
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-default px-5 py-4"
        >
          <div>
            <p class="text-sm font-medium">
              Academic Year
            </p>

            <p class="text-xs text-muted">
              {{ item.academicYear?.name }}
            </p>
          </div>

          <div class="flex gap-2">

            <UButton
              icon="i-lucide-eye"
              size="sm"
              variant="soft"
            >
              View
            </UButton>

            <UButton
              icon="i-lucide-pencil"
              size="sm"
              color="neutral"
              variant="soft"
            >
              Edit
            </UButton>

          </div>
        </div>

      </UCard>

    </div>
  </template>

  <!-- Empty -->
  <template v-else>
    <UCard>
      <div class="flex flex-col items-center justify-center py-16">
        <UIcon
          name="i-lucide-calendar-range"
          class="mb-4 size-12 text-muted"
        />

        <h3 class="font-semibold">
          No Terms Found
        </h3>

        <p class="text-sm text-muted">
          There are no terms available.
        </p>
      </div>
    </UCard>
  </template>

  <!-- Pagination -->
  <div
    v-if="!loading && data?.length"
    class="flex flex-col gap-3 pt-3 md:flex-row md:items-center md:justify-between"
  >
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
</div>
</template>