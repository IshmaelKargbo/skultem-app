<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { subjects: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<TeacherSubject> = [
  {
    accessorKey: 'subjectName',
    header: 'Subject'
  },
  {
    accessorKey: 'className',
    header: 'Class'
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
    accessorKey: 'teacherName',
    header: 'Teacher'
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
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-end">
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No subjects found.</p>
        </div>
      </template>
      </UTable>

      <div class="p-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-0' }">
          <div class="animate-pulse">
            <!-- Header -->
            <div class="border-b border-default p-4">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 shrink-0 rounded-xl" />
                <div class="min-w-0 space-y-2">
                  <USkeleton class="h-4 w-32 rounded-md" />
                  <USkeleton class="h-3 w-24 rounded-md" />
                </div>
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
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="i-lucide-book-open" class="size-6 text-primary-600 dark:text-primary-400" />
              </div>

              <div class="min-w-0">
                <h3 class="truncate text-base font-bold text-highlighted">
                  {{ item.subjectName }}
                </h3>
                <p class="mt-1 truncate text-xs text-muted">
                  {{ item.className || 'No class' }} · {{ item.sectionName || 'No section' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Class -->
            <div
              class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <UIcon name="i-lucide-school" class="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Class
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.className || 'N/A' }}
              </p>
            </div>

            <!-- Section -->
            <div
              class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <UIcon name="i-lucide-layout-grid" class="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Section
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.sectionName || 'N/A' }}
              </p>
            </div>

            <!-- Stream -->
            <div
              class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-git-branch" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Stream
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.streamName || 'N/A' }}
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
                {{ item.teacherName || 'N/A' }}
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
            <p class="text-sm text-gray-500">No subjects found.</p>
          </div>
        </UCard>
      </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
