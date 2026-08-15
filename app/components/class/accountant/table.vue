<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useClassSessionStore()
const { records: data, meta, loading } = storeToRefs(store)
const { format } = useMoney()

const columns = [
  {
    accessorKey: 'clazz',
    header: 'Name'
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'classLevel',
    header: 'Level'
  },
  {
    accessorKey: 'sectionName',
    header: 'Section'
  },
  {
    accessorKey: 'streamName',
    header: 'Stream'
  },
  {
    accessorKey: 'totalStudent',
    header: 'Students'
  },
  {
    accessorKey: 'teacherName',
    header: 'Class Teacher'
  },
  {
    accessorKey: 'total',
    header: 'Total'
  },
  {
    accessorKey: 'paid',
    header: 'Paid'
  },
  {
    accessorKey: 'balance',
    header: 'Outstanding'
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
  get: () => Number(route.query.size ?? runtimeConf().limit),
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

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecords()
}, { immediate: true })

async function fetchRecords() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
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

  fetchRecords()
})
</script>

<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{
      body: 'sm:p-0'
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No classes found.</p>
          </div>
        </template>
        <template #classLevel-cell="{ row }">
          <p>{{ parseLevel[row.original.classLevel] }}</p>
        </template>
        <template #totalStudent-cell="{ row }">
          <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.totalStudent} -`" />
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #status-cell="{ row }">
          <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status || 'N/A'"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
        </template>
        <template #total-cell="{ row }">
          <p class="text-error">{{ format(row.original.feeDetail?.total) }}</p>
        </template>
        <template #paid-cell="{ row }">
          <p class="text-success">{{ format(row.original.feeDetail?.paid) }}</p>
        </template>
        <template #balance-cell="{ row }">
          <p class="text-info">{{ format(row.original.feeDetail?.balance) }}</p>
        </template>
      </UTable>
      <template #footer>
        <div v-if="!loading" class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <!-- Mobile / Card view -->
    <div class="space-y-4"
      :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm"
          :ui="{ body: 'p-0' }">
          <div class="animate-pulse">
            <!-- Header -->
            <div class="border-b border-default p-3 md:p-0 md:pb-3">
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
            <div class="flex items-center justify-between gap-3 border-t border-default p-3 md:p-0 md:pt-3">
              <USkeleton class="h-4 w-32 rounded-md" />
              <USkeleton class="h-4 w-20 rounded-md" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.clazzId"
          class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
          :ui="{ body: 'p-0' }">
          <!-- Header -->
          <div class="border-b border-default p-3 md:p-0 md:pb-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
          <div
                  class="flex size-10  items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"
                >
                  <UIcon name="i-lucide-school" class="size-5 text-primary" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.clazz }}
                  </h3>

                  <p class="mt-1 truncate text-xs text-muted">
                    {{ item.sectionName }}<template v-if="item.streamName && item.streamName !== 'N/A'"> - {{ item.streamName }}</template>
                  </p>
                </div>
              </div>

              <UBadge v-if="item.feeDetail" :label="item.feeDetail.status || 'N/A'"
                :color="parseFeeStatusColor[item.feeDetail.status]"
                :icon="parseFeeStatusIcon[item.feeDetail.status]" variant="soft" />
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Students -->
            <div
              class="min-w-0 rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                  <UIcon :name="STUDENT_ICON" class="size-4 text-primary-600 dark:text-primary-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
                  Students
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.totalStudent }}
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
                {{ format(item.feeDetail?.total) }}
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
                {{ format(item.feeDetail?.paid) }}
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
                {{ format(item.feeDetail?.balance) }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 border-t border-default p-3 md:p-0 md:pt-3">
            <div class="flex min-w-0 items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-user-round" class="size-4 shrink-0" />
              <span class="truncate">{{ item.teacherName || 'No Class Teacher' }}</span>
            </div>

            <p class="shrink-0 truncate text-sm font-medium text-highlighted">
              {{ parseLevel[item.classLevel] }}
            </p>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

            <p class="text-sm text-gray-500 dark:text-gray-400">No classes found.</p>
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
