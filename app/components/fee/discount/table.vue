<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const { format } = useMoney()
const store = useFeeDiscountStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<FeeDiscount | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const parseKind: Record<string, string> = {
  "PERCENTAGE": "Percentage",
  "AMOUNT": "Fix Amount"
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: any) => parseKind[row.original.type]
  },
  {
    accessorKey: 'value',
    header: 'Value'
  },
  {
    accessorKey: 'applied',
    header: 'Applied'
  },
  {
    accessorKey: 'expires',
    header: 'Expiry Date'
  },
  {
    accessorKey: 'totalSaved',
    header: 'Total Saved',
    cell: ({ row }: any) => format(row.original.totalSaved)
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }: any) => {
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

function getRowItems(row: Row<FeeDiscount>) {
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
  <UCard class="hidden md:block" :ui="{
    body: 'sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No fee discounts found.</p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #name-cell="{ row }">
        <div class="space-y-0.5">
          <p class="font-semibold text-gray-700">
            {{ row.original.name }}
          </p>

          <p class="text-xs text-mute">
            {{ row.original.reason || 'Fetch' }}
          </p>
        </div>
      </template>

      <template #student-cell="{ row }">
        <div class="space-y-0.5">
          <p class="font-semibold text-gray-700">
            {{ row.original.student }}
          </p>

          <p class="text-xs text-mute">
            {{ row.original.clazz }}
          </p>
        </div>
      </template>

      <template #type-cell="{ row }">
        <UBadge color="neutral" :label="parseKind[row.original.type]" variant="subtle" />
      </template>

      <template #totalSaved-cell="{ row }">
        <p class="text-success font-semibold">
          {{ row.original.totalSaved }}
        </p>
      </template>
    </UTable>

    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />

        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>

  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i"
        class="rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="flex gap-3">
          <USkeleton class="h-14 w-14 rounded-2xl" />

          <div class="flex-1 space-y-3">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-full" />

            <div class="grid grid-cols-2 gap-2 pt-2">
              <USkeleton class="h-14 rounded-2xl" />
              <USkeleton class="h-14 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.length"
      class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10">
        <UIcon name="lucide:badge-percent" class="text-5xl text-primary-500" />
      </div>

      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        No fee discounts found
      </h3>

      <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
        Discounts, scholarships, and student waivers will appear here.
      </p>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-4">
      <div v-for="item in data" :key="item.id"
        class="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900">
        <div class="p-4">
          <div class="flex gap-3">
            <!-- Icon -->
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:badge-percent" class="text-xl text-primary-500" />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <!-- Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.name }}
                  </h3>

                  <p class="mt-1 text-xs text-gray-400">
                    {{ item.student }}
                  </p>
                </div>

                <UBadge color="success" variant="soft" size="sm">
                  Applied
                </UBadge>
              </div>

              <!-- Reason -->
              <div class="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60">
                <p class="line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {{
                    item.reason ||
                    'No reason available for this discount.'
                  }}
                </p>
              </div>

              <!-- Stats -->
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60">
                  <p class="text-[11px] text-gray-500">
                    Discount Type
                  </p>

                  <div class="mt-2">
                    <UBadge color="neutral" variant="soft">
                      {{ parseKind[item.type] }}
                    </UBadge>
                  </div>
                </div>

                <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60">
                  <p class="text-[11px] text-gray-500">
                    Discount Value
                  </p>

                  <p class="mt-1 text-lg font-semibold text-primary-600">
                    {{
                      item.type === 'PERCENTAGE'
                        ? `${item.value}%`
                        : format(item.value)
                    }}
                  </p>
                </div>
              </div>

              <!-- Bottom -->
              <div class="mt-4 flex items-center justify-between">
                <div>
                  <p class="text-[11px] text-gray-500">
                    Total Saved
                  </p>

                  <p class="mt-1 text-sm font-semibold text-emerald-600">
                    {{ item.totalSaved }}
                  </p>
                </div>

                <span
                  class="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-medium text-primary-600 dark:bg-primary-500/10">
                  {{ item.clazz }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>