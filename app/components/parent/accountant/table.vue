<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useParentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  { accessorKey: 'name', header: 'Guardian', pin: 'left' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'students', header: 'Children' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'paid', header: 'Paid' },
  { accessorKey: 'balance', header: 'Outstanding' },
  { accessorKey: 'status', header: 'Status' }
]

// PAGE (URL synced)
const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        page: val,
        size: size.value
      }
    })
  }
})

// SIZE (URL synced)
const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        page: page.value,
        size: val
      }
    })
  }
})

// FETCH whenever query changes
watch(
  () => [page.value, size.value],
  async () => {
    await fetchRecord()

    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })
  },
  { immediate: true }
)

async function fetchRecord() {
  loading.value = true
  try {
    await store.fetchAll(page.value, size.value)
  } finally {
    loading.value = false
  }
}

// Ensure initial query exists
onMounted(() => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }
})
</script>

<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading" class="w-full">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No parents found.</p>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            v-if="row.original.feeDetail"
            :label="row.original.feeDetail.status"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]"
            variant="outline"
          />
        </template>

        <template #students-cell="{ row }">
          <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.students}`" />
        </template>

        <template #total-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-error">
            {{ format(row.original.feeDetail.total) }}
          </p>
        </template>

        <template #paid-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-success">
            {{ format(row.original.feeDetail.paid) }}
          </p>
        </template>

        <template #balance-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-info">
            {{ format(row.original.feeDetail.balance) }}
          </p>
        </template>
      </UTable>

      <template #footer>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Showing :meta="meta" />
          <UPagination
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            size="sm"
            show-edges
            class="justify-center lg:justify-end"
          />
        </div>
      </template>
    </UCard>

    <div class="space-y-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm"
          :ui="{ body: 'p-0' }">
          <div class="animate-pulse">
            <!-- Header -->
            <div class="border-b border-default p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <USkeleton class="size-12 shrink-0 rounded-xl" />

                  <div class="min-w-0 space-y-2">
                    <USkeleton class="h-4 w-36 rounded-md" />
                    <USkeleton class="h-3 w-28 rounded-md" />
                  </div>
                </div>

                <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-7 shrink-0 rounded-lg" />
                  <USkeleton class="h-3 w-16 rounded-md" />
                </div>

                <USkeleton class="h-4 w-24 rounded-md" />
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-3 border-t border-default p-4">
              <USkeleton class="h-4 w-32 rounded-md" />
              <USkeleton class="h-4 w-20 rounded-md" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="parent in data" :key="parent.id"
          class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
          :ui="{ body: 'p-0' }">
          <!-- Header -->
          <div class="border-b border-default  p-3 md:p-0 md:pb-3 ">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="2xl" icon="i-lucide-user" :alt="parent.name" />

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ parent.name }}
                  </h3>

                  <p class="mt-1 truncate text-xs text-muted">
                    {{ parent.email || 'No Email' }}
                  </p>
                </div>
              </div>

              <UBadge v-if="parent.feeDetail" :label="parent.feeDetail.status"
                :color="parseFeeStatusColor[parent.feeDetail.status]"
                :icon="parseFeeStatusIcon[parent.feeDetail.status]" variant="soft" />
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Children -->
            <div
              class="min-w-0 rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                  <UIcon :name="STUDENT_ICON" class="size-4 text-primary-600 dark:text-primary-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
                  Children
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ parent.students }}
              </p>
            </div>

            <!-- Total -->
            <div
              class="min-w-0 rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                  <UIcon name="i-lucide-receipt" class="size-4 text-red-600 dark:text-red-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-red-700 dark:text-red-300">
                  Total
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ parent.feeDetail ? format(parent.feeDetail.total) : '-' }}
              </p>
            </div>

            <!-- Paid -->
            <div
              class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <UIcon name="i-lucide-circle-check-big" class="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Paid
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ parent.feeDetail ? format(parent.feeDetail.paid) : '-' }}
              </p>
            </div>

            <!-- Balance -->
            <div
              class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <UIcon name="i-lucide-wallet" class="size-4 text-blue-600 dark:text-blue-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Balance
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ parent.feeDetail ? format(parent.feeDetail.balance) : '-' }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 border-t border-default  p-3 md:p-0 md:pt-3 ">
            <div class="flex min-w-0 items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
              <span class="truncate">{{ parent.phone || 'No Phone' }}</span>
            </div>

            <p class="shrink-0 truncate text-sm font-medium text-highlighted">
              {{ parent.students }} Student{{ parent.students === 1 ? '' : 's' }}
            </p>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

            <p class="text-sm text-gray-500 dark:text-gray-400">No parents found.</p>
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
