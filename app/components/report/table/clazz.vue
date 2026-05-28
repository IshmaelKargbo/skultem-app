<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { classes: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<ClassSession> = [
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
</script>

<template>
  <div class="space-y-4">
    <UCard class="hidden md:block">
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
      </UTable>
      <div v-if="!loading && meta" class="flex justify-between border-t border-gray-200 pt-3 items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </UCard>

    <div class="space-y-3 md:hidden">
      <UCard v-for="item in data" :key="item.id" :ui="{ body: 'p-4' }">
        <div class="space-y-2">
          <p class="font-semibold text-sm">{{ item.clazz }}</p>
          <p class="text-xs text-muted">{{ item.grade }} · {{ parseLevel[item.classLevel] }}</p>
          <p class="text-xs text-muted">Section: {{ item.sectionName || 'N/A' }} · Stream: {{ item.streamName || 'N/A' }}</p>
          <div class="flex items-center justify-between">
            <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${item.totalStudent} Students`" />
            <p class="text-xs">{{ item.teacherName || 'No Teacher' }}</p>
          </div>
        </div>
      </UCard>
      <div v-if="!loading && !data?.length" class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        <p class="text-gray-500">No classes found.</p>
      </div>
      <div v-if="meta" class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
