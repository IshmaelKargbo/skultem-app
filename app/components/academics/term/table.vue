<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useTermStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

// Editing/deleting a term is only safe while it's still UPCOMING - once it's ACTIVE or CLOSED,
// assessments/attendance are already recorded against its dates.
function canManage(term: Term) {
  return term.status === 'UPCOMING'
}

const deleteModal = ref(false)
const selected = ref<Term>()

function remove(term: Term) {
  selected.value = term
  deleteModal.value = true
}

const parseStaus: Record<string, string> = {
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
}

const parseStatusColor: Record<string, 'warning' | 'success' | 'error'> = {
  UPCOMING: 'warning',
  ACTIVE: 'success',
  CLOSED: 'error'
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
    accessorKey: 'academicYear',
    header: 'Academic Year',
    cell: ({ row }: any) => row.original.academicYear?.name
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
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    }
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
<UCard :ui="{ body: 'p-0 sm:p-0' }">
  <template #header>
    <div class="flex justify-end">
      <TableViewToggle v-model="view" />
    </div>
  </template>

  <UTable
    v-if="view === 'table'"
    class="hidden md:block"
    :columns="columns"
    :data="data"
    :loading="loading"
  >
    <template #empty-state>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon
          name="i-lucide-calendar-range"
          class="mb-3 size-10 text-gray-400"
        />

        <p class="text-sm text-gray-500">
          No terms found
        </p>
      </div>
    </template>

    <template #loading>
      <TableLoading :size="columns.length" />
    </template>

    <template #status-cell="{ row }">
      <UBadge
        variant="soft"
        :color="parseStatusColor[row.original.status]"
      >
        <UIcon
          :name="parseStatusIcon[row.original.status]"
          class="mr-1"
        />

        {{ parseStaus[row.original.status] }}
      </UBadge>
    </template>

    <template #actions-cell="{ row }">
      <div v-if="canManage(row.original)" class="flex justify-end gap-1">
        <AcademicsTermAdd :term="row.original" />

        <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(row.original)" />
      </div>
    </template>
  </UTable>

  <!-- Mobile / Card -->
  <div
    class="p-4"
    :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-5 space-y-0! md:grid-cols-2 lg:grid-cols-3'"
  >
  <!-- Loading -->
  <template v-if="loading">
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
  </template>

  <!-- Data -->
  <template v-else-if="data?.length">
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

        <div v-if="canManage(item)" class="flex gap-1">
          <AcademicsTermAdd :term="item" />

          <UButton :icon="DELETE_ICON" size="sm" color="error" variant="ghost" @click="remove(item)" />
        </div>
      </div>

    </UCard>
  </template>

  <!-- Empty -->
  <template v-else>
    <UCard class="overflow-hidden col-span-full">
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
  </div>

  <AcademicsTermDeletePrompt v-if="selected" v-model:open="deleteModal" :term-id="selected.id"
    :term-name="selected.name" />

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
</template>
