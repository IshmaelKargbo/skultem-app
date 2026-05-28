<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useSectionStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<Section | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'description',
    header: 'Description'
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

function getRowItems(row: Row<Section>) {
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
  <UCard :ui="{
    body: 'p-0'
  }">
    <!-- Desktop Table -->
    <div class="hidden md:block">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">
              No sections found.
            </p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>
    </div>
  </UCard>

  <!-- Mobile -->
  <div class="md:hidden bg-gray-50 dark:bg-neutral-950 min-h-[300px]">
    <!-- Loading -->
    <div v-if="loading">
      <div class="space-y-3 p-4">
        <div v-for="i in 4" :key="i"
          class="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 p-4">
          <USkeleton class="h-5 w-32 mb-3" />
          <USkeleton class="h-4 w-full mb-2" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.length">
      <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div
          class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-gray-800">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        </div>

        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          No sections found
        </h3>

        <p class="mt-1 text-sm text-gray-500 max-w-xs">
          Create sections to organize your academic structure better.
        </p>
      </div>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-3 p-3">
      <div v-for="item in data" :key="item.id"
        class="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 p-4 shadow-sm active:scale-[0.99] transition-all">
        <div class="flex items-start justify-between gap-3">
          <!-- Left -->
          <div class="flex gap-3 min-w-0 flex-1">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/20">
              <UIcon name="lucide:layout-template" class="text-lg text-primary-600" />
            </div>

            <div class="min-w-0 flex-1">
              <!-- Title -->
              <div class="flex items-center gap-2">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ item.name }}
                </h3>

                <div class="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <!-- Description -->
              <p class="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                {{
                  item.description ||
                  'No description available for this section.'
                }}
              </p>

              <!-- Bottom Meta -->
              <div class="mt-4 flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full bg-gray-100 dark:bg-neutral-800 px-3 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  Academic Section
                </span>

                <span
                  class="rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1 text-[11px] font-medium text-primary-600">
                  Active
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <UDropdownMenu :items="getRowItems({ original: item } as any)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="sm" variant="ghost" class="rounded-full" />
          </UDropdownMenu>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Showing :meta="meta" />

    <div class="overflow-x-auto">
      <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>