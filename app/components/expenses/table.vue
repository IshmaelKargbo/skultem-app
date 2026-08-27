<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const { format } = useMoney()

const store = useExpenseStore()
const emit = defineEmits(['refresh'])

const { records: data, meta, loading } = storeToRefs(store)

const parseCategoryColor: Record<string, string> = {
  TRANSPORT: 'warning',
  SALARY: 'error',
  UTILITIES: 'info',
  MAINTENANCE: 'primary',
  OTHER: 'neutral'
}

const columns = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }: any) => formatDateString(row.original.createdAt)
  },
  {
    accessorKey: 'title',
    header: 'Name'
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: any) => format(row.original.amount)
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

async function fetchRecord() {
  await store.fetchAll(page.value, size.value)
}

function refreshReport() {
  emit('refresh')
}

watch(
  () => [page.value, size.value],
  () => {
    fetchRecord()
  }
)

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecord()
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-between space-x-3">
          <div class="flex flex-1 space-x-3">
            <UInput placeholder="Search by name . . ." />
            <ExpensesAdd @refresh-report="refreshReport" />
          </div>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <!-- Desktop -->
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-12">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-receipt" class="text-2xl text-gray-400" />
            </div>

            <div class="text-center">
              <p class="font-medium text-gray-900 dark:text-white">
                No expenses found
              </p>

              <p class="text-sm text-gray-500">
                Expense records will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #category-cell="{ row }">
          <UBadge variant="soft" :color="parseCategoryColor[row.original.category] || 'neutral'">
            {{ row.original.category }}
          </UBadge>
        </template>

        <template #amount-cell="{ row }">
          <p class="font-semibold text-error">
            - {{ format(row.original.amount || 0) }}
          </p>
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="p-4 space-y-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 4" :key="i">
            <div class="space-y-4 p-4">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <USkeleton class="size-12 rounded-2xl" />

                  <div class="space-y-2">
                    <USkeleton class="h-3 w-32" />
                    <USkeleton class="h-2 w-20" />
                  </div>
                </div>

                <USkeleton class="h-6 w-16 rounded-full" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <USkeleton class="h-16 rounded-2xl" />
                <USkeleton class="h-16 rounded-2xl" />
              </div>
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <UCard v-for="item in data" :key="item.id" :ui="{
            body: 'sm:p-0 p-0'
          }">
            <template #header>
              <div class="flex items-start justify-between">
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="flex size-12 items-center justify-center rounded-2xl bg-error-50 text-error dark:bg-error-500/10">
                    <UIcon name="i-lucide-wallet" class="size-5" />
                  </div>

                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {{ item.title }}
                    </h3>

                    <p class="text-xs text-gray-500">
                      {{ formatDateString(item.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Body -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Category -->
              <div class="rounded-xl bg-primary-100 p-3 dark:bg-primary-500/20">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <UIcon name="i-lucide-tag" class="size-3.5 text-primary" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                    Category
                  </p>
                </div>

                <p class="text-sm font-semibold text-primary">
                  {{ item.category }}
                </p>

              </div>

              <!-- Amount -->
              <div class="rounded-xl bg-error-50 p-3 dark:bg-error-500/20">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-error/10">
                    <UIcon name="i-lucide-wallet" class="size-3.5 text-error" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                    Amount
                  </p>
                </div>

                <p class="text-sm font-semibold text-error">
                  {{ format(item.amount || 0) }}
                </p>
              </div>
            </div>
          </UCard>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="flex flex-col items-center justify-center py-14 col-span-full">
            <div class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-receipt" class="text-3xl text-gray-400" />
            </div>

            <p class="font-medium text-gray-900 dark:text-white">
              No expenses found
            </p>

            <p class="mt-1 text-sm text-gray-500">
              Expense records will appear here.
            </p>
          </div>
        </template>

      </div>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <Showing :meta="meta" />

          <div class="overflow-x-auto pb-1">
            <UPagination v-model:page="page" size="sm" :page-size="meta?.size" :items-per-page="meta?.size"
              :total="meta?.total" show-edges />
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
