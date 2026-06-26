<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const feeStore = useFeeStore()
const { feeDetails, loading } = storeToRefs(feeStore)
const { } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  { accessorKey: 'name', header: 'Student' },
  { accessorKey: 'admissionNo', header: 'Admission No' },
  { accessorKey: 'status', header: '' },
]

const parseStateColor: Record<string, string> = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'error',
}

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
  <UCard :ui="{ body: 'p-0 sm:p-0' }" class="block">
    <UTable class="hidden md:block" :columns="columns" :data="feeDetails.records" :loading="loading">

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
          <UBadge :label="row.original.status" variant="outline" :color="parseStateColor[row.original.status]" />
        </div>
      </template>

    </UTable>


    <!-- Pagination -->
    <template v-if="feeDetails.meta" #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="feeDetails.meta" />

        <!-- Desktop -->
        <UPagination v-model:page="page" size="sm" :page-size="feeDetails.meta?.size"
          :items-per-page="feeDetails.meta?.size" :total="feeDetails.meta?.total" show-edges />

      </div>
    </template>
  </UCard>
  <div class="space-y-4 md:hidden">
    <!-- Mobile Table -->
    <FeeTeacherTableMobile v-if="feeDetails" :records="feeDetails.records" :seed="6" :loading="loading" />

    <div class="flex justify-center">
      <!-- Mobile -->
      <UPagination v-model:page="page" :page-size="feeDetails.meta?.size" :items-per-page="feeDetails.meta?.size"
        :total="feeDetails.meta?.total" show-edges />
    </div>
  </div>
</template>