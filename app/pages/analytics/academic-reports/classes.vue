<template>
  <div class="space-y-4 px-4 md:px-6">
    <AnalyticsAcademicFilterBar :filters="filters" :terms="terms" :class-options="classOptions"
      :subject-options="subjectOptions" :level-options="levelOptions" :class-loading="classStore.loading"
      :subject-loading="subjectStore.loading" />

    <AnalyticsAcademicTabNav :query="queryString" />

    <UCard v-if="!filters.termId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-graduation-cap" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Select a term to generate a report.</p>
      </div>
    </UCard>

    <UCard v-else-if="filters.classId">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-info" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">Class Performance compares every class - clear the Class filter to see it.</p>
      </div>
    </UCard>

    <div v-else class="space-y-4">
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="pagedClasses" :columns="classColumns" :loading="loadingReport" class="hidden md:block">
          <template #empty-state>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="i-lucide-school" class="text-4xl text-gray-400" />
              <p class="text-gray-500">No approved results for any class yet.</p>
            </div>
          </template>
          <template #loading>
            <TableLoading :size="classColumns.length" />
          </template>
          <template #className-cell="{ row }">
            <NuxtLink :to="`/analytics/academic-reports?classId=${row.original.classId}&${queryString}`" class="font-medium hover:underline">
              {{ row.original.className }}
            </NuxtLink>
          </template>
          <template #averageScore-cell="{ row }">{{ row.original.averageScore }}%</template>
          <template #passRate-cell="{ row }">{{ row.original.passRate }}%</template>
        </UTable>

        <!-- Mobile compact list -->
        <div class="md:hidden">
          <template v-if="loadingReport">
            <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
              <div class="min-w-0 space-y-2">
                <USkeleton class="h-4 w-32 rounded-md" />
                <USkeleton class="h-3 w-24 rounded-md" />
              </div>
              <USkeleton class="h-6 w-14 shrink-0 rounded-full" />
            </div>
          </template>

          <template v-else-if="pagedClasses.length">
            <NuxtLink v-for="c in pagedClasses" :key="c.classId"
              :to="`/analytics/academic-reports?classId=${c.classId}&${queryString}`"
              class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0 active:bg-muted/50">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">{{ c.className }}</h3>
                <p class="truncate text-xs text-muted">{{ c.studentsAssessed }}/{{ c.totalStudents }} assessed &middot; {{ c.studentsNotAssessed }} missing</p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <UBadge :label="`${c.averageScore}% avg`" variant="soft" color="primary" size="sm" />
                <UIcon name="i-lucide-chevron-right" class="text-muted" />
              </div>
            </NuxtLink>
          </template>

          <template v-else>
            <div class="flex flex-col items-center py-16">
              <UIcon name="i-lucide-school" class="mb-3 size-10 text-muted" />
              <p class="text-sm text-muted">No approved results for any class yet.</p>
            </div>
          </template>
        </div>

        <template v-if="classes.length" #footer>
          <div class="flex items-center justify-between">
            <Showing :meta="classesMeta" />
            <UPagination v-model:page="classPage" size="sm" :page-size="classPageSize"
              :items-per-page="classPageSize" :total="classes.length" show-edges />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const reportStore = useAcademicReportStore()
const { filters, terms, classOptions, subjectOptions, levelOptions, queryString, apiFilters, ensureLoaded,
  classStore, subjectStore } = useAcademicReportFilters()

const { report, loadingReport } = storeToRefs(reportStore)
const classPage = ref(1)
const classPageSize = 20

const classes = computed(() => report.value?.classes || [])
const pagedClasses = computed(() => {
  const start = (classPage.value - 1) * classPageSize
  return classes.value.slice(start, start + classPageSize)
})
const classesMeta = computed(() => useMeta({
  page: classPage.value,
  size: classPageSize,
  count: classes.value.length
}))

const classColumns = [
  { accessorKey: 'className', header: 'Class' },
  { accessorKey: 'totalStudents', header: 'Enrolled' },
  { accessorKey: 'studentsAssessed', header: 'Assessed' },
  { accessorKey: 'studentsNotAssessed', header: 'Not Assessed' },
  { accessorKey: 'averageScore', header: 'Average' },
  { accessorKey: 'passRate', header: 'Pass Rate' }
]

async function loadReport() {
  if (!filters.termId || filters.classId) return
  await reportStore.fetchReport({ ...apiFilters.value, page: 1, size: 1 })
}

watch(apiFilters, () => {
  classPage.value = 1
  loadReport()
})

onMounted(async () => {
  useAppStore().setTitle('Class Performance')
  document.title = 'Class Performance | Skultem'
  await ensureLoaded()
  await loadReport()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
