<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

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
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },
          size: 'sm',
          items: getRowItems(row),
          'aria-label': 'Actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            size: 'sm',
            variant: 'ghost',
            'aria-label': 'Actions dropdown'
          })
      )
    }
  }
]

function getRowItems(row: Row<AcademicYear>) {
  return [
    {
      label: 'Edit Record',
      icon: 'i-lucide-edit',
      onClick: () => {
        editState.value = true;
        editRcord.value = row.original;
      }
    },
    {
      label: 'Delete Record',
      icon: 'i-lucide-trash',
    }
  ]
}

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
        page: page.value,
        size: size.value
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
    class="hidden overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 md:block"
    :ui="{
      body: 'p-0',
      footer: 'border-t border-gray-200 dark:border-gray-800'
    }"
  >
    <UTable
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
            No academic years found
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #active-cell="{ row }">
        <UBadge
          :label="row.original.active ? 'Active' : 'Inactive'"
          :color="row.original.active ? 'success' : 'neutral'"
          variant="soft"
        />
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
    </UTable>

    <template #footer>
      <div class="flex items-center justify-between px-4 py-4">
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

    <!-- Data -->
    <template v-else-if="data?.length">
      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900"
        :ui="{
          body: 'p-0'
        }"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 p-4">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
            >
              <UIcon
                name="i-lucide-calendar-range"
                class="size-5"
              />
            </div>

            <div class="min-w-0">
              <h3
                class="truncate text-sm font-semibold text-gray-900 dark:text-white"
              >
                {{ item.name }}
              </h3>

              <p class="truncate text-xs text-gray-500">
                {{ formatDate(item.startDate) }}
                -
                {{ formatDate(item.endDate) }}
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

        <!-- Content -->
        <div class="grid grid-cols-2 gap-3 px-4 pb-4">
          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Start Date
            </p>

            <p class="text-sm font-medium">
              {{ formatDate(item.startDate) }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              End Date
            </p>

            <p class="text-sm font-medium">
              {{ formatDate(item.endDate) }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Active
            </p>

            <UBadge
              :label="item.active ? 'Yes' : 'No'"
              :color="item.active ? 'success' : 'neutral'"
              variant="soft"
              size="sm"
            />
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Status
            </p>

            <UBadge
              :color="parseStatusColor[item.status]"
              variant="soft"
              size="sm"
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
            <p class="truncate text-sm font-medium">
              Academic Year
            </p>

            <p class="truncate text-xs text-gray-500">
              {{ item.name }}
            </p>
          </div>

          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 text-gray-400"
          />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon
          name="i-lucide-calendar-range"
          class="mb-3 size-10 text-gray-400"
        />

        <p class="text-sm text-gray-500">
          No academic years found
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
