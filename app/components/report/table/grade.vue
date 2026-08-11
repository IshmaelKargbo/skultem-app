<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { grades: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'subject',
    header: 'Subject'
  },
  {
    accessorKey: 'name',
    header: 'Assessment'
  },
  {
    accessorKey: 'term',
    header: 'Term'
  },
  {
    accessorKey: 'clazz',
    header: 'Class'
  },
  {
    accessorKey: 'teacher',
    header: 'Teacher'
  },
  {
    accessorKey: 'status',
    header: 'State'
  },
  {
    accessorKey: 'score',
    header: 'Score'
  },
  {
    accessorKey: 'weight',
    header: 'Weight',
    cell: ({ row }: any) => `${row.original.weight}%`
  },
  {
    accessorKey: 'weightScore',
    header: 'Weight Score',
    cell: ({ row }: any) => `${row.original.weightScore}%`
  }
]

const parseStatusColor: Record<string, string> = {
  "DRAFT": "info",
  "SUBMITED": "info",
  "APPROVED": "success",
  "RETURNED": "warning",
  "LOCKED": "neutral"
}

const parseStatus: Record<string, string> = {
  "DRAFT": "Draft",
  "SUBMITED": "Submited",
  "APPROVED": "Approved",
  "RETURNED": "Returned",
  "LOCKED": "Locked"
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
          <p class="text-gray-500">No grades found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="parseStatus[row.original.status]" variant="outline"
          :color="parseStatusColor[row.original.status]" />
      </template>
      </UTable>
      <template #footer>
        <div class="flex justify-between border-gray-200 items-center">
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
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <USkeleton class="size-12 shrink-0 rounded-full" />
                  <div class="min-w-0 space-y-2">
                    <USkeleton class="h-4 w-32 rounded-md" />
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
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="2xl" icon="i-lucide-user-round" :alt="item.student" />

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.student }}
                  </h3>
                  <p class="mt-1 truncate text-xs text-muted">
                    {{ item.subject }} · {{ item.clazz }}
                  </p>
                </div>
              </div>

              <UBadge :label="parseStatus[item.status]" variant="soft" :color="parseStatusColor[item.status]" />
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Assessment -->
            <div
              class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <UIcon name="i-lucide-clipboard-list" class="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Assessment
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.name }}
              </p>
            </div>

            <!-- Term -->
            <div
              class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <UIcon name="i-lucide-calendar-range" class="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Term
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.term || 'N/A' }}
              </p>
            </div>

            <!-- Teacher -->
            <div
              class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <UIcon name="i-lucide-user-round" class="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Teacher
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.teacher || 'N/A' }}
              </p>
            </div>

            <!-- Score -->
            <div
              class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-percent" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Score
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.score }} / {{ item.weightScore }}%
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
            <p class="text-sm text-gray-500">No grades found.</p>
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
