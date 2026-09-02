<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const feeStore = useFeeStore()
const { feeDetails, loading } = storeToRefs(feeStore)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  { accessorKey: 'name', header: 'Student' },
  { accessorKey: 'admissionNo', header: 'Admission No' },
  { accessorKey: 'status', header: '' },
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val }),
})

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

function scrollToTop() {
  const el = scrollContainer?.value ?? window
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    })
  })
}

async function fetchReport() {
  feeStore.getClassFeeDetails(feeDetails.value.sessionId || '', feeDetails.value.termId || '', page.value, size.value)
}

onBeforeMount(() => {
  if (!route.query.page) {
    router.replace({
      query: { ...route.query, page: 1, size: size.value },
    })
  }
})

watch(
  page,
  async (newPage, oldPage) => {
    await fetchReport()
    if (oldPage !== undefined && newPage !== oldPage) {
      scrollToTop()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-end">
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="feeDetails.records"
        :loading="loading">

        <!-- Empty State -->
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:wallet-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No fee records found.</p>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <!-- Status -->
        <template #status-cell="{ row }">
          <div class="flex justify-end">
            <UBadge :label="row.original.status" variant="outline" :color="parseFeeStatusColor[row.original.status]"
              :icon="parseFeeStatusIcon[row.original.status]" />
          </div>
        </template>

      </UTable>

      <div class="p-4 space-y-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i" :ui="{ body: 'p-0' }" class="overflow-hidden">
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center space-x-2">
                <USkeleton class="size-10 shrink-0 rounded-full" />
                <div class="space-y-2">
                  <USkeleton class="h-3 w-24 rounded-md" />
                  <USkeleton class="h-2 w-16 rounded-md" />
                </div>
              </div>
              <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="feeDetails.records?.length">
          <UCard v-for="item in feeDetails.records" :key="item.id" :ui="{ body: 'p-0 sm:p-0' }">
            <div class="flex items-center justify-between gap-3 p-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="2xl" :alt="item.name" class="shrink-0 ring-1 ring-gray-200 dark:ring-gray-700" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-highlighted">{{ item.name }}</p>
                  <p class="truncate text-[11px] text-muted">{{ item.admission || 'No Admission No' }}</p>
                </div>
              </div>
              <UBadge :label="item.status" variant="outline" :color="parseFeeStatusColor[item.status]"
                :icon="parseFeeStatusIcon[item.status]" class="shrink-0" />
            </div>
          </UCard>
        </template>

        <!-- Empty -->
        <template v-else>
          <UCard class="col-span-full">
            <div class="flex flex-col items-center justify-center py-10">
              <UIcon name="ph:wallet-light" class="mb-2 text-4xl text-gray-400 dark:text-gray-500" />
              <p class="text-xs text-gray-500 dark:text-gray-400">No fee records found.</p>
            </div>
          </UCard>
        </template>
      </div>

      <template v-if="feeDetails.meta" #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="feeDetails.meta" />
          <UPagination size="sm" v-model:page="page" :page-size="feeDetails.meta?.size"
            :items-per-page="feeDetails.meta?.size" :total="feeDetails.meta?.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>