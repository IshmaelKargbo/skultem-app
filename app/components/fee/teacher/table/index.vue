<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { format } = useMoney()

const { fees: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  { accessorKey: 'student',     header: 'Student'     },
  { accessorKey: 'fee',         header: 'Fee'         },
  { accessorKey: 'term',        header: 'Term'        },
  { accessorKey: 'status',      header: ''            },
]

const parseStateColor: Record<string, string> = {
  Paid:    'success',
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
  if (!report.value) return
  await store.runReport(report.value, page.value, size.value)
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
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">

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
          <UBadge
            :label="row.original.status"
            variant="outline"
            :color="parseStateColor[row.original.status]"
          />
        </div>
      </template>

    </UTable>

    <!-- Mobile Table -->
    <FeeTeacherTableMobile :records="data" :seed="6" :loading="loading" />

    <!-- Pagination -->
    <template v-if="meta" #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />

        <!-- Desktop -->
        <UPagination
          v-model:page="page"
          class="hidden md:flex"
          size="sm"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />

        <!-- Mobile -->
        <UPagination
          v-model:page="page"
          class="md:hidden"
          size="xs"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />
      </div>
    </template>
  </UCard>
</template>