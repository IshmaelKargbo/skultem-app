<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useClassSessionStore()
const sectionStore = useSectionStore()
const streamStore = useStreamStore()
const { records: data, meta, loading } = storeToRefs(store)
const { format } = useMoney()

const sectionOptions = computed(() =>
  sectionStore.records.map((e) => ({ label: e.name, value: e.id }))
)

const streamOptions = computed(() =>
  streamStore.records.map((e) => ({ label: e.name, value: e.id }))
)

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

const size = ref(runtimeConf().limit)

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const sectionId = ref(String(route.query.sectionId ?? ""))
const streamId = ref(String(route.query.streamId ?? ""))
const searchInput = ref(String(route.query.search ?? ""))
const search = ref(searchInput.value)

const hasActiveFilters = computed(() => !!sectionId.value || !!streamId.value || !!search.value)

function resetFilters() {
  sectionId.value = ""
  streamId.value = ""
  searchInput.value = ""
  search.value = ""
}

// Shadows the global `updateQuery` util (app/utils/common.ts) - that one only ever compares
// page/size and silently drops any other query key when neither changed, which would swallow
// these filter updates whenever a filter is set while already on page 1.
function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = val
  }, 350)
})

watch(() => page.value, () => {
  fetchRecords()
}, { immediate: true })

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([sectionId, streamId, search], () => {
  updateQuery({
    sectionId: sectionId.value || undefined,
    streamId: streamId.value || undefined,
    search: search.value || undefined,
    page: 1,
  })

  if (page.value === 1) fetchRecords()
})

async function fetchRecords() {
  loading.value = true
  await store.fetchAll(page.value, size.value, undefined, sectionId.value || undefined, streamId.value || undefined,
    search.value || undefined)
  loading.value = false
}

onMounted(async () => {
  updateQuery({
    page: page.value
  })

  sectionStore.fetchAll(0, 0)
  streamStore.fetchAll(0, 0)
  fetchRecords()
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="space-y-3">
          <div class="flex justify-end">
            <TableViewToggle v-model="view" />
          </div>

          <div class="border-t pt-3 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <USelectMenu v-model="sectionId" value-key="value" label-key="label" :items="sectionOptions"
                placeholder="All Sections" clear />
              <USelectMenu v-model="streamId" value-key="value" label-key="label" :items="streamOptions"
                placeholder="All Streams" clear />
              <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name" class="col-span-2" />
            </div>
            <div>
              <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                :disabled="!hasActiveFilters" @click="resetFilters" />
            </div>
          </div>
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
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

      <!-- Mobile / Card view -->
      <div class="p-4 space-y-4"
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
          <UCard v-for="item in data" :key="item.clazzId" :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="flex size-10  items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <UIcon name="i-lucide-school" class="size-5 text-primary" />
                  </div>

                  <div class="min-w-0">
                    <h3 class="truncate text-base font-bold text-highlighted">
                      {{ item.clazz }}
                    </h3>

                    <p class="mt-1 truncate text-xs text-muted">
                      {{ item.sectionName }}<template v-if="item.streamName && item.streamName !== 'N/A'"> - {{
                        item.streamName }}</template>
                    </p>
                  </div>
                </div>

                <UBadge v-if="item.feeDetail" :label="item.feeDetail.status || 'N/A'"
                  :color="parseFeeStatusColor[item.feeDetail.status]" :icon="parseFeeStatusIcon[item.feeDetail.status]"
                  variant="soft" />
              </div>
            </template>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Students -->
              <div
                class="min-w-0 rounded-xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
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
                class="min-w-0 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
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
                class="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
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
                class="min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
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
            <template #footer>
              <div class="flex items-center justify-between">
                <div class="flex min-w-0 items-center gap-2 text-sm text-muted">
                  <UIcon name="i-lucide-user-round" class="size-4 shrink-0" />
                  <span class="truncate">{{ item.teacherName || 'No Class Teacher' }}</span>
                </div>

                <p class="shrink-0 truncate text-sm font-medium text-highlighted">
                  {{ parseLevel[item.classLevel] }}
                </p>
              </div>
            </template>
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

      </div>

      <template #footer>
        <div v-if="!loading" class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
