<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { attendances: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'clazz',
    header: 'Class'
  },
  {
    accessorKey: 'state',
    header: 'State'
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }: any) => formatDateString(row.original.date)
  },
  {
    accessorKey: 'reason',
    header: 'Reason'
  }
]

const parseStateColor: Record<string, string> = {
  "Absent": "error",
  "Present": "success",
  "Late": "warning",
  "Excused": "neutral"
}

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

function fetchReport() {
  if (report.value == null) return
  store.runReport(report.value, page.value, size.value)
}

watch(() => page.value, async () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      ...route.query,
      page: page.value,
      size: size.value
    }
  })

  await fetchReport()
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No Attendance found.</p>
        </div>
      </template>
      <template #state-cell="{ row }">
        <UBadge :label="row.original.state" variant="outline" :color="parseStateColor[row.original.state]" />
      </template>
      </UTable>
      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size" :total="meta?.total" show-edges />
        </div>
      </template>
    </UCard>

    <div class="space-y-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-0' }">
          <div class="animate-pulse">
            <!-- Header -->
            <div class="border-b border-default p-4">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 shrink-0 rounded-full" />
                <div class="min-w-0 space-y-2">
                  <USkeleton class="h-4 w-32 rounded-md" />
                  <USkeleton class="h-3 w-24 rounded-md" />
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <div class="rounded-2xl border border-default bg-muted/40 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-7 shrink-0 rounded-lg" />
                  <USkeleton class="h-3 w-16 rounded-md" />
                </div>
                <USkeleton class="h-4 w-16 rounded-md" />
              </div>
              <div class="rounded-2xl border border-default bg-muted/40 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-7 shrink-0 rounded-lg" />
                  <USkeleton class="h-3 w-16 rounded-md" />
                </div>
                <USkeleton class="h-4 w-24 rounded-md" />
              </div>
              <div class="col-span-2 rounded-2xl border border-default bg-muted/40 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-7 shrink-0 rounded-lg" />
                  <USkeleton class="h-3 w-16 rounded-md" />
                </div>
                <USkeleton class="h-4 w-40 rounded-md" />
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
          :ui="{ body: 'p-0' }">
          <!-- Header -->
          <div class="border-b border-default p-4">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar size="2xl" icon="i-lucide-user-round" :alt="item.student" />

              <div class="min-w-0">
                <h3 class="truncate text-base font-bold text-highlighted">
                  {{ item.student }}
                </h3>
                <p class="mt-1 truncate text-xs text-muted">
                  {{ item.clazz }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- State -->
            <div
              class="min-w-0 rounded-2xl border border-default bg-muted/40 p-3">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-elevated">
                  <UIcon name="i-lucide-badge-check" class="size-4 text-muted" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-muted">
                  State
                </p>
              </div>
              <UBadge :label="item.state" variant="soft" :color="parseStateColor[item.state]" size="sm" />
            </div>

            <!-- Date -->
            <div
              class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <UIcon name="i-lucide-calendar-days" class="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Date
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ formatDateString(item.date) }}
              </p>
            </div>

            <!-- Reason -->
            <div
              class="col-span-2 min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-message-square-text" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Reason
                </p>
              </div>
              <p class="text-sm font-medium text-highlighted">
                {{ item.reason || 'No reason' }}
              </p>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />
            <p class="text-sm text-gray-500">No Attendance found.</p>
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size" :total="meta?.total" show-edges />
      </div>
    </div>
  </div>
</template>
