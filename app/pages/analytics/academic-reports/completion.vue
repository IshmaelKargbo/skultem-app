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

    <div v-else class="space-y-4 rounded-lg">
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="completion" :columns="completionColumns" :loading="loadingCompletion" class="hidden md:block">
          <template #empty-state>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="i-lucide-clipboard-check" class="text-4xl text-gray-400" />
              <p class="text-gray-500">No assessments scheduled for this selection yet.</p>
            </div>
          </template>
          <template #loading>
            <TableLoading :size="completionColumns.length" />
          </template>
          <template #status-cell="{ row }">
            <UBadge :color="statusColor[row.original.status]" variant="subtle">
              {{ statusLabel[row.original.status] }}
            </UBadge>
          </template>
        </UTable>

        <!-- Mobile compact list -->
        <div class="md:hidden">
          <template v-if="loadingCompletion">
            <div v-for="i in 4" :key="i" class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
              <div class="min-w-0 space-y-2">
                <USkeleton class="h-4 w-32 rounded-md" />
                <USkeleton class="h-3 w-24 rounded-md" />
              </div>
              <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
            </div>
          </template>

          <template v-else-if="completion.length">
            <div v-for="(row, i) in completion" :key="`${row.classId}-${row.subjectId}-${row.assessmentId}-${i}`"
              class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">{{ row.assessmentName }}</h3>
                <p class="truncate text-xs text-muted">{{ row.className }} &middot; {{ row.subjectName }}</p>
              </div>
              <UBadge :color="statusColor[row.status]" variant="subtle" size="sm" class="shrink-0">
                {{ statusLabel[row.status] }}
              </UBadge>
            </div>
          </template>

          <template v-else>
            <div class="flex flex-col items-center py-16">
              <UIcon name="i-lucide-clipboard-check" class="mb-3 size-10 text-muted" />
              <p class="text-sm text-muted">No assessments scheduled for this selection yet.</p>
            </div>
          </template>
        </div>

        <template v-if="completion.length" #footer>
          <div class="flex items-center justify-between">
            <Showing :meta="completionMeta" />
            <UPagination v-model:page="completionPage" size="sm" :page-size="completionPageSize"
              :items-per-page="completionPageSize" :total="reportStore.completionMeta?.count ?? 0" show-edges />
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

const { completion, loadingCompletion } = storeToRefs(reportStore)
const completionPage = ref(1)
const completionPageSize = 20

const completionMeta = computed(() => useMeta({
  page: reportStore.completionMeta?.page ?? 1,
  size: reportStore.completionMeta?.size ?? completionPageSize,
  count: reportStore.completionMeta?.count ?? 0
}))

const completionColumns = [
  { accessorKey: 'className', header: 'Class' },
  { accessorKey: 'subjectName', header: 'Subject' },
  { accessorKey: 'assessmentName', header: 'Assessment' },
  { id: 'status', header: 'Status' }
]

const statusColor: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  RETURNED: 'error',
  APPROVED: 'success',
  COMPLETED: 'success',
  LOCKED: 'neutral'
}

const statusLabel: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Pending Review',
  RETURNED: 'Returned',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  LOCKED: 'Not Started'
}

async function loadCompletion() {
  if (!filters.termId) return
  await reportStore.fetchCompletionReport({ ...apiFilters.value, page: completionPage.value, size: completionPageSize })
}

watch(apiFilters, () => {
  completionPage.value = 1
  loadCompletion()
})
watch(completionPage, loadCompletion)

onMounted(async () => {
  useAppStore().setTitle('Assessment Completion')
  document.title = 'Assessment Completion | Skultem'
  await ensureLoaded()
  await loadCompletion()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
