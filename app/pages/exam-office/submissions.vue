<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Submissions" subtitle="Every open assessment this term, who owns it and where it stands.">
      <GuideButton guide="exam-office-submissions" /><HelpButton topic="exam-office-submissions" />
    </Heading>
    <div data-guide="grades-tabs"><GradesSectionNav /></div>
    <div data-guide="approval-routing"><GradesApprovalRouting /></div>

    <UCard data-guide="submission-list" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div data-guide="submission-status" class="flex flex-wrap gap-2">
            <UButton v-for="tab in statusTabs" :key="tab.value" size="sm"
              :variant="filters.status === tab.value ? 'soft' : 'ghost'"
              :color="filters.status === tab.value ? 'primary' : 'neutral'" @click="() => { filters.status = tab.value }">
              {{ tab.label }}
              <!-- No counts until the list has loaded - a "0" would look like a real number. -->
              <USkeleton v-if="loading && !data" class="h-4 w-5 rounded-md" />
              <UBadge v-else :label="String(tab.count)" size="sm" variant="subtle"
                :color="filters.status === tab.value ? 'primary' : 'neutral'" />
            </UButton>
          </div>
          <div data-guide="submission-filters" class="flex flex-col gap-2 sm:flex-row">
            <USelectMenu v-model="filters.termId" :items="termOptions" value-key="value" label-key="label"
              placeholder="Active term" class="w-full sm:w-44" :loading="termStore.loading" />
            <USelectMenu v-model="filters.className" :items="classOptions" placeholder="All classes"
              class="w-full sm:w-44" />
            <UInput v-model="filters.teacher" icon="i-lucide-search" placeholder="Teacher or subject"
              class="w-full sm:w-52" />
          </div>
        </div>
      </template>

      <div v-if="loading" class="divide-y divide-default">
        <div v-for="i in 6" :key="i" class="flex items-center justify-between gap-3 px-4 py-3">
          <div class="space-y-2">
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-3 w-32" />
          </div>
          <USkeleton class="h-6 w-24 rounded-full" />
        </div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center gap-3 px-4 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
          <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
        </div>
        <h3 class="font-semibold text-highlighted">Couldn't load submissions</h3>
        <p class="max-w-sm text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="load" />
      </div>

      <div v-else-if="filtered.length" class="divide-y divide-default">
        <div v-for="row in filtered" :key="row.cycleId"
          class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ row.subjectName }} <span class="text-muted">· {{ row.assessmentName }}</span>
            </p>
            <p class="truncate text-xs text-muted">
              {{ row.className }} · {{ row.teacherName || 'No teacher assigned' }}
              <template v-if="row.updatedAt"> · updated {{ formatDate(row.updatedAt) }}</template>
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <UTooltip :text="SUBMISSION_STATUS[row.status]?.hint">
              <UBadge :color="SUBMISSION_STATUS[row.status]?.color" variant="subtle">
                {{ SUBMISSION_STATUS[row.status]?.label ?? row.status }}
              </UBadge>
            </UTooltip>
            <!-- Who it's waiting on: whoever the school (or this class's section) has approving grades. -->
            <UBadge v-if="row.status === 'SUBMITTED'" variant="outline" color="neutral"
              :icon="GRADE_APPROVER_ICON[approverFor(row.level)]"
              :label="`With the ${GRADE_APPROVER_LABEL[approverFor(row.level)].toLowerCase()}`" />
            <UButton v-if="row.status === 'SUBMITTED' && canApproveLevel(row.level)"
              :to="{ path: '/grades/approval', query: { search: row.subjectName } }" label="Review" size="xs"
              variant="soft" trailing-icon="i-lucide-arrow-right" />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-3 px-4 py-14 text-center">
        <template v-if="isFiltered">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-elevated">
            <UIcon name="i-lucide-search-x" class="size-7 text-muted" />
          </div>
          <h3 class="font-semibold text-highlighted">Nothing matches your filters</h3>
          <UButton label="Clear filters" icon="i-lucide-x" color="neutral" variant="soft" @click="clearFilters" />
        </template>
        <template v-else>
          <div class="flex size-14 items-center justify-center rounded-2xl bg-success/10">
            <UIcon name="i-lucide-inbox" class="size-7 text-success" />
          </div>
          <h3 class="font-semibold text-highlighted">No open assessments</h3>
          <p class="max-w-sm text-sm text-muted">Assessments show here once the assessment cycle opens them for this term.</p>
        </template>
      </div>

      <template v-if="!loading && filtered.length" #footer>
        <p class="text-xs text-muted">{{ filtered.length }} of {{ rows.length }} assessments · {{ data?.termName }}</p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = ExamOfficeApi()
const termStore = useTermStore()
const { load: loadRouting, approverFor, canApproveLevel } = useGradeApproval()

type StatusFilter = 'all' | 'outstanding' | ExamSubmissionStatus

const filters = reactive({
  status: (route.query.status as StatusFilter) || 'outstanding',
  termId: undefined as string | undefined,
  className: undefined as string | undefined,
  teacher: (route.query.teacher as string) || '',
})

const data = ref<ExamSubmissions | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const rows = computed(() => data.value?.rows ?? [])

const termOptions = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const classOptions = computed(() => [...new Set(rows.value.map(r => r.className))])

const matchesStatus = (row: ExamSubmission, status: StatusFilter) =>
  status === 'all' || (status === 'outstanding' ? row.status === 'DRAFT' || row.status === 'RETURNED' : row.status === status)

const statusTabs = computed(() => ([
  { label: 'Outstanding', value: 'outstanding' },
  { label: 'Awaiting approval', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'All', value: 'all' },
] as { label: string, value: StatusFilter }[]).map(tab => ({
  ...tab,
  count: rows.value.filter(r => matchesStatus(r, tab.value)).length,
})))

const filtered = computed(() => {
  const q = filters.teacher.trim().toLowerCase()
  return rows.value.filter(r => matchesStatus(r, filters.status)
    && (!filters.className || r.className === filters.className)
    && (!q || (r.teacherName ?? '').toLowerCase().includes(q) || r.subjectName.toLowerCase().includes(q)))
})

const isFiltered = computed(() => !!filters.className || !!filters.teacher.trim() || filters.status !== 'all')

function clearFilters() {
  filters.status = 'all'
  filters.className = undefined
  filters.teacher = ''
}

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = (await api.submissions(filters.termId)) ?? null
    if (!filters.termId && data.value) filters.termId = data.value.termId
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loading.value = false
  }
}

watch(() => filters.termId, (id, old) => {
  // The first fill (from the active term) isn't a change of term.
  if (old !== undefined && id !== data.value?.termId) {
    filters.className = undefined
    load()
  }
})

onMounted(() => {
  useAppStore().setTitle('Submissions')
  document.title = 'Submissions | Skultem'
  termStore.fetchAll(1, 100)
  loadRouting()
  load()
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>
