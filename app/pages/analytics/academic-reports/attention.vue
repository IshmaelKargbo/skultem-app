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

    <div v-else class="space-y-4">
      <UCard :ui="{
        body: 'p-0 sm:p-0'
      }">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Students Requiring Attention</h2>
            <UBadge v-if="attention" color="warning" variant="subtle">{{ attention.flaggedCount }} flagged</UBadge>
          </div>
        </template>

        <div v-if="loadingAttention" class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 rounded-2xl border border-default p-4">
            <USkeleton class="size-10 shrink-0 rounded-full" />
            <div class="min-w-0 flex-1 space-y-2">
              <USkeleton class="h-4 w-40 rounded-md" />
              <USkeleton class="h-3 w-full rounded-md" />
            </div>
          </div>
        </div>

        <div v-else-if="!attention || !attention.students.length" class="py-10 text-center text-sm text-muted">
          Nothing needs attention right now.
        </div>

        <div v-else class="space-y-3">
          <div v-for="s in attention.students" :key="s.enrollmentId"
            class="flex items-center gap-3 border-b border-default p-4">
            <UAvatar size="lg" :src="s.photo || undefined" icon="i-lucide-user-round"
              :alt="`${s.givenNames} ${s.familyName}`" />

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-medium text-highlighted">{{ s.givenNames }} {{ s.familyName }}</p>
                <div class="flex flex-col items-end gap-y-0.5 text-xs text-muted">
                  <span v-if="s.academicAverage != null">Academic average: {{ s.academicAverage }}%</span>
                  <span v-if="s.attendanceRate != null">Attendance: {{ s.attendanceRate }}%</span>
                </div>
              </div>

              <div class="flex mt-0.5 flex-wrap gap-2">
                <UBadge v-if="s.lowAcademicSignal" color="error" size="sm" variant="subtle">Low academic performance</UBadge>
                <UBadge v-if="s.lowAttendanceSignal" color="error" size="sm" variant="subtle">Low attendance</UBadge>
                <UBadge v-if="s.missingAssessmentsSignal" color="warning" size="sm" variant="subtle">
                  {{ s.assessmentsMissing }} assessment{{ s.assessmentsMissing === 1 ? '' : 's' }} missing
                </UBadge>
                <UBadge v-if="s.decliningTrendSignal" color="warning" variant="subtle" size="sm">Declining trend</UBadge>
              </div>
            </div>
          </div>
        </div>

        <template v-if="attention?.students.length" #footer>
          <div class="flex items-center justify-between">
            <Showing :meta="attentionMeta" />
            <UPagination v-model:page="attentionPage" size="sm" :page-size="attentionPageSize"
              :items-per-page="attentionPageSize" :total="attention?.flaggedCount ?? 0" show-edges />
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

const { attention, loadingAttention } = storeToRefs(reportStore)
const attentionPage = ref(1)
const attentionPageSize = 20

const attentionMeta = computed(() => useMeta({
  page: attention.value?.page ?? 1,
  size: attention.value?.size ?? attentionPageSize,
  count: attention.value?.flaggedCount ?? 0
}))

async function loadAttention() {
  if (!filters.termId) return
  await reportStore.fetchStudentsRequiringAttention({ ...apiFilters.value, page: attentionPage.value, size: attentionPageSize })
}

watch(apiFilters, () => {
  attentionPage.value = 1
  loadAttention()
})
watch(attentionPage, loadAttention)

onMounted(async () => {
  useAppStore().setTitle('Students Requiring Attention')
  document.title = 'Students Requiring Attention | Skultem'
  await ensureLoaded()
  await loadAttention()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
