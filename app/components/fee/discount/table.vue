<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const view = ref<'table' | 'card'>('table')
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
  <TableViewToggle v-model="view" />

  <!-- Desktop -->
  <UCard v-if="view === 'table'" class="hidden md:block" :ui="{
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
  <div class="space-y-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
    <!-- Loading -->
    <template v-if="loading">
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
    </template>

    <!-- Empty -->
    <div v-else-if="!data?.length"
      class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900 col-span-full">
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
    <template v-else>
      <UCard v-for="item in data" :key="item.id" class="overflow-hidden rounded-3xl" :ui="{ body: 'p-0' }">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 px-4 pt-4 pb-4 dark:border-neutral-800">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:badge-percent" class="text-primary text-lg" />
            </div>

            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold">
                {{ item.name }}
              </h3>

              <p class="truncate text-xs text-gray-500">
                {{ item.student }}
              </p>
            </div>
          </div>

          <UDropdownMenu :items="getRowItems({ original: item } as any)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" class="shrink-0" />
          </UDropdownMenu>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-2 px-4 pb-4 pt-4">
          <!-- Type -->
          <div
            class="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50"
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800"
              >
                <UIcon
                  name="i-lucide-tag"
                  class="size-4 text-gray-600 dark:text-gray-400"
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300"
              >
                Type
              </p>
            </div>

            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ parseKind[item.type] }}
            </p>
          </div>

          <!-- Value -->
          <div
            class="rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10"
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20"
              >
                <UIcon
                  name="i-lucide-badge-percent"
                  class="size-4 text-primary"
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide text-primary"
              >
                Value
              </p>
            </div>

            <p class="truncate text-sm font-bold text-primary">
              {{
                item.type === 'PERCENTAGE'
                  ? `${item.value}%`
                  : format(item.value)
              }}
            </p>
          </div>

          <!-- Saved -->
          <div
            class="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10"
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20"
              >
                <UIcon
                  name="i-lucide-piggy-bank"
                  class="size-4 text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
              >
                Saved
              </p>
            </div>

            <p class="truncate text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {{ item.totalSaved }}
            </p>
          </div>
        </div>

        <!-- Information -->
        <div
          class="mx-4 my-4 rounded-2xl border border-gray-100 bg-gray-100 p-3 dark:border-neutral-800 dark:bg-neutral-800">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">
              Class
            </span>

            <span class="font-medium text-sm">
              {{ item.clazz }}
            </span>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs text-gray-500">
              Status
            </span>

            <UBadge color="success" variant="soft" size="xs">
              Applied
            </UBadge>
          </div>

          <div v-if="item.expires" class="mt-3 flex items-center justify-between">
            <span class="text-xs text-gray-500">
              Expiry
            </span>

            <span class="text-sm font-medium">
              {{ formatDate(item.expires) }}
            </span>
          </div>
        </div>

        <!-- Reason -->
        <div v-if="item.reason" class="border-t border-gray-100 px-4 pt-4 pb-4 dark:border-neutral-800">
          <p class="text-[11px] uppercase text-gray-500 mb-1">
            Reason
          </p>

          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {{ item.reason }}
          </p>
        </div>
      </UCard>
    <!-- Pagination -->
    <div v-if="!loading && data?.length" class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
      <Showing :meta="meta" />
      <UPagination
        size="sm"
        v-model:page="page"
        :page-size="meta.size"
        :items-per-page="meta.size"
        :total="meta.total"
        show-edges
      />
    </div>
    </template>
  </div>
</template>