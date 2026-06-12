<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useFeeStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<FeeCategory | null>(null)
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

function getRowItems(row: Row<FeeCategory>) {
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
  <div class="space-y-4">
    <!-- Desktop -->
    <UCard class="hidden md:block" :ui="{
      body: 'p-0'
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:wallet-cards" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                No fee categories found
              </h3>

              <p class="mt-1 text-sm text-gray-500">
                Fee categories and payment groups will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:receipt-text" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.name }}
              </p>

              <p class="text-xs text-gray-500">
                Fee Category
              </p>
            </div>
          </div>
        </template>

        <template #description-cell="{ row }">
          <p class="max-w-md text-sm leading-6 text-gray-500 line-clamp-2">
            {{
              row.original.description ||
              'No description available.'
            }}
          </p>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
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
    <div class="space-y-3 md:hidden">
      <!-- Loading -->
      <template v-if="loading">
        <div v-for="i in 5" :key="i"
          class="rounded-[32px] border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div class="flex justify-center">
            <USkeleton class="size-16 rounded-3xl" />
          </div>

          <div class="mt-5 flex flex-col items-center space-y-3">
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-3 w-20" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-5/6" />
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <USkeleton class="h-20 rounded-2xl" />
            <USkeleton class="h-20 rounded-2xl" />
          </div>

          <USkeleton class="mt-5 h-14 rounded-2xl" />
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="!data?.length" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 flex size-20 items-center justify-center rounded-3xl bg-primary-50 dark:bg-primary-500/10">
          <UIcon name="lucide:wallet-cards" class="text-4xl text-primary-500" />
        </div>

        <h3 class="font-semibold">
          No fee categories found
        </h3>

        <p class="mt-2 text-center text-sm text-gray-500">
          Organize school fees into categories.
        </p>
      </div>


      <!-- Cards -->
      <template v-else>
        <div class="space-y-4">
          <div v-for="item in data" :key="item.id"
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <!-- Top -->
            <div class="px-5 pt-6 text-center">
              <div
                class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
                <UIcon name="lucide:receipt-text" class="size-7" />
              </div>

              <h3 class="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                {{ item.name }}
              </h3>

              <p class="mt-1 text-xs text-gray-500">
                Fee Category
              </p>

              <p class="mt-4 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {{
                  item.description ||
                  'No description available for this category.'
                }}
              </p>
            </div>

            <!-- Divider -->
            <div class="my-5 border-t border-dashed border-gray-200 dark:border-neutral-800" />

            <!-- Details -->
            <div class="grid grid-cols-2 gap-3 px-5">
              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
                <p class="text-[11px] text-gray-500">
                  Department
                </p>

                <p class="mt-1 font-medium">
                  Finance
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
                <p class="text-[11px] text-gray-500">
                  Status
                </p>

                <UBadge color="success" variant="soft" size="sm" class="mt-1">
                  Active
                </UBadge>
              </div>
            </div>

            <!-- Footer -->
            <div
              class="mt-5 flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-neutral-800">
              <div>
                <p class="text-xs text-gray-500">
                  Category
                </p>

                <p class="text-sm font-medium">
                  School Fees
                </p>
              </div>
              <!-- 
              <UDropdownMenu :items="getRowItems({ original: item } as any)" :content="{ align: 'end' }">
                <UButton icon="i-lucide-more-horizontal" size="sm" variant="soft" color="neutral" class="rounded-xl" />
              </UDropdownMenu> -->
            </div>
          </div>
        </div>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length" class="flex flex-col items-center gap-3 pt-2">
        <Showing :meta="meta" />

        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>