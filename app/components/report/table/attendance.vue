<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { attendances: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<TeacherSubject> = [
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
    cell: ({row}: any) => formatDateString(row.original.date)
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
  <UCard>
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No Attendance found.</p>
        </div>
      </template>
      <template #state-cell="{row}">
        <UBadge :label="row.original.state" variant="outline" :color="parseStateColor[row.original.state]" />
      </template>
    </UTable>
    <div v-if="meta" class="flex justify-between border-t border-gray-200 pt-3 items-center">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </UCard>
</template>
