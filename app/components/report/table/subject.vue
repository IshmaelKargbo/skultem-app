<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { subjects: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

// Desktop columns are trimmed to what fits without horizontal scroll - section/stream live in the
// detail modal opened via "actions" / tapping a row.
const columns: TableColumn<TeacherSubject>[] = [
  {
    accessorKey: 'subjectName',
    header: 'Subject'
  },
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'teacherName',
    header: 'Teacher'
  },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function fetchReport() {
  if (report.value == null) return
  store.runReport(report.value, page.value, size.value)
}

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

const selected = ref<any | null>(null)
const detailOpen = ref(false)

function openDetail(item: any) {
  selected.value = item
  detailOpen.value = true
}

const detailFields = computed<ReportDetailField[]>(() => {
  const item = selected.value
  if (!item) return []
  return [
    { label: 'Class', value: item.className || 'N/A' },
    { label: 'Section', value: item.sectionName || 'N/A' },
    { label: 'Stream', value: item.streamName || 'N/A' },
    { label: 'Teacher', value: item.teacherName || 'N/A' }
  ]
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
      </template>

      <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #empty>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No subjects found.</p>
        </div>
      </template>
      <template #actions-cell="{ row }">
        <UButton icon="i-lucide-eye" size="xs" variant="ghost" color="neutral" aria-label="View details"
          @click="openDetail(row.original)" />
      </template>
      </UTable>

      <!-- Mobile compact list (default view, mirrors /transactions and /transactions/student-ledger mobile design) -->
      <div class="md:hidden">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-10 shrink-0 rounded-xl" />
              <div class="min-w-0 space-y-2">
                <USkeleton class="h-4 w-32 rounded-md" />
                <USkeleton class="h-3 w-24 rounded-md" />
              </div>
            </div>
            <USkeleton class="h-4 w-4 shrink-0 rounded-md" />
          </div>
        </template>

        <template v-else-if="data?.length">
          <div v-for="item in data" :key="item.id" class="flex cursor-pointer items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0 hover:bg-elevated/40 active:bg-muted/50"
            @click="openDetail(item)">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="i-lucide-book-open" class="size-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">{{ item.subjectName }}</h3>
                <p class="truncate text-xs text-muted">{{ item.className || 'No class' }} · {{ item.teacherName || 'No teacher' }}</p>
              </div>
            </div>

            <UIcon name="i-lucide-chevron-right" class="shrink-0 text-muted" />
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col items-center py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <UIcon name="ph:books-light" class="size-10 text-muted" />
            </div>
            <h3 class="mt-4 text-sm font-semibold">No subjects found</h3>
            <p class="mt-1 text-sm text-muted">Subject records will appear here.</p>
          </div>
        </template>
      </div>

      <!-- Card view (explicit toggle, unchanged detail layout, available on any breakpoint) -->

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <ReportDetailModal v-model:open="detailOpen" :title="selected?.subjectName || ''" icon="i-lucide-book-open"
      :fields="detailFields" />
  </div>
</template>
