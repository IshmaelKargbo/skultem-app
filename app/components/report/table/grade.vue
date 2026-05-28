<script setup lang="ts">
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
    <UCard class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No Attendance found.</p>
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

    <div class="space-y-3 md:hidden">
      <UCard v-for="item in data" :key="item.id" :ui="{ body: 'p-4' }">
        <div class="space-y-1">
          <p class="font-semibold text-sm">{{ item.student }}</p>
          <p class="text-xs text-muted">{{ item.subject }} · {{ item.clazz }} · {{ item.term }}</p>
          <p class="text-xs">{{ item.name }} ({{ item.teacher }})</p>
          <div class="flex items-center justify-between">
            <UBadge :label="parseStatus[item.status]" variant="outline" :color="parseStatusColor[item.status]" size="sm" />
            <p class="text-xs font-medium">{{ item.score }} / {{ item.weightScore }}%</p>
          </div>
        </div>
      </UCard>
      <div v-if="!loading && !data?.length" class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        <p class="text-gray-500">No Attendance found.</p>
      </div>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size" :total="meta?.total" show-edges />
      </div>
    </div>
  </div>
</template>
