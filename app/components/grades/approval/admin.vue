<script setup lang="ts">
type ApprovalRequestStatusFilter = '' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'

const route = useRoute()
const router = useRouter()

const sessionStore = useTeacherStore()
const store = useAssessmentStore()
const classSessionStore = useClassSessionStore()

const { records: teacherRecords } = storeToRefs(sessionStore)
const { requests, meta } = storeToRefs(store)

// Starts true so the list shows skeletons, not "no requests", before the first load lands.
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const loadingSummary = ref(true)
const loadingSession = ref(true)
const loadingClasses = ref(true)
const summary = ref<AssessmentApprovalSummary | null>(null)

const teachers = computed(() =>
  teacherRecords.value.map(e => ({
    label: teacherLabel(e),
    value: e.id
  }))
)

// Class + section + stream, matching the name each record shows (e.g. "JSS 1 A Science").
const classOptions = computed(() =>
  classSessionStore.records.map(c => ({
    label: [c.clazz, c.sectionName, c.streamId && c.streamName !== 'N/A' ? c.streamName : '']
      .filter(Boolean).join(' '),
    value: c.id
  }))
)

// Whose queue: the exam officer starts on what's routed to them; management sees everything and can narrow to one
// approver (class master / admin / exam officer) - see useGradeApproval.
const { load: loadRouting, myApprover, approversInUse, isExamOfficer } = useGradeApproval()
const approver = ref<GradeApprover | ''>((route.query.approver as GradeApprover | undefined) ?? myApprover.value ?? '')

const approverTabs = computed(() => {
  if (isExamOfficer.value) {
    return [
      { label: 'Mine to approve', value: 'EXAM_OFFICER' as const },
      { label: 'Whole school', value: '' as const },
    ]
  }
  if (approversInUse.value.length < 2) return []
  return [
    { label: 'All', value: '' as const },
    ...approversInUse.value.map(a => ({ label: `${GRADE_APPROVER_LABEL[a]}`, value: a })),
  ]
})

const teacherId = ref(String(route.query.teacherId ?? ''))
const classId = ref(String(route.query.classId ?? ''))
const status = ref<ApprovalRequestStatusFilter>((route.query.status as ApprovalRequestStatusFilter) ?? '')
const searchInput = ref(String(route.query.search ?? ''))
const search = ref(searchInput.value)

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
})

const size = ref(10)

const skeletonRows = computed(() => Math.min(size.value, 6))

// Any search or filter on - an empty list then means "nothing matches", not "nothing submitted".
const isFiltered = computed(() => !!(teacherId.value || classId.value || status.value || search.value))

function clearFilters() {
  searchInput.value = ''
  search.value = ''
  teacherId.value = ''
  classId.value = ''
  status.value = ''
}

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(() => [teacherId.value, classId.value, status.value].filter(Boolean).length)

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = val
  }, 350)
})

// "" (All Teachers, the default) means school-wide - see the teachers computed above.
let latestSummary = 0
async function fetchSummary() {
  const request = ++latestSummary
  loadingSummary.value = true
  const res = teacherId.value
    ? await store.fetchAssessmentApprovalSummary(teacherId.value)
    : await store.fetchSchoolAssessmentApprovalSummary(approver.value || undefined)
  if (request !== latestSummary) return
  summary.value = res
  loadingSummary.value = false
}

// Only the newest request may update the list, so a slow older one can't overwrite it.
let latestRecords = 0
async function fetchRecords() {
  const request = ++latestRecords
  isLoading.value = true
  loadError.value = null

  try {
    if (teacherId.value) {
      await store.fetchAllAssessmentApprovalRequest(
        teacherId.value, page.value, size.value, status.value || undefined, search.value || undefined,
        classId.value || undefined
      )
    } else {
      await store.fetchAllSchoolAssessmentApprovalRequest(
        page.value, size.value, status.value || undefined, search.value || undefined, classId.value || undefined,
        approver.value || undefined
      )
    }
    if (request !== latestRecords) return
    loadError.value = store.error
  } finally {
    if (request === latestRecords) isLoading.value = false
  }
}

watch(() => page.value, () => fetchRecords())
watch([teacherId, approver], fetchSummary, { immediate: true })

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([teacherId, classId, status, search, approver], () => {
  updateQuery({
    approver: approver.value || undefined,
    teacherId: teacherId.value || undefined,
    classId: classId.value || undefined,
    status: status.value || undefined,
    search: search.value || undefined,
    page: 1,
  })

  if (page.value === 1) fetchRecords()
})

onMounted(async () => {
  useAppStore().setTitle('Grade Approval Requests')
  document.title = 'Grade Approval Requests | Grades | Skultem'

  // The list doesn't need the filter dropdowns - load it right away instead of after them.
  fetchRecords()
  loadRouting()

  loadingSession.value = true
  loadingClasses.value = true
  await Promise.all([
    sessionStore.fetchAll(0, 0).finally(() => { loadingSession.value = false }),
    classSessionStore.fetchAll(0, 0).finally(() => { loadingClasses.value = false }),
  ])
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR]
})
</script>

<template>
  <div class="px-4 md:px-6 space-y-3">
    <div data-guide="grades-tabs"><GradesSectionNav /></div>
    <GradesApprovalRouting />
    <UCard data-guide="approval-list" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-sm font-semibold text-highlighted">Grade Approval</h2>
              <GuideButton guide="exam-office-approval" /><HelpButton topic="exam-office-approval" />
              <div v-if="approverTabs.length" data-guide="approval-approver" class="flex flex-wrap gap-1">
                <UButton v-for="tab in approverTabs" :key="tab.value" size="xs"
                  :variant="approver === tab.value ? 'soft' : 'ghost'"
                  :color="approver === tab.value ? 'primary' : 'neutral'" :label="tab.label"
                  @click="() => { approver = tab.value }" />
              </div>
            </div>

            <!-- Skeletons until the counts arrive, so they never flash "0". -->
            <div v-if="loadingSummary && !summary" class="flex items-center gap-2">
              <USkeleton v-for="i in 3" :key="i" class="h-5 w-20 rounded-md" />
            </div>
            <div v-else data-guide="approval-counts" class="flex items-center gap-2">
              <UBadge color="warning" variant="subtle" size="sm">{{ summary?.pending ?? 0 }} Pending</UBadge>
              <UBadge color="success" variant="subtle" size="sm">{{ summary?.approved ?? 0 }} Approved</UBadge>
              <UBadge color="error" variant="subtle" size="sm">{{ summary?.returned ?? 0 }} Returned</UBadge>
            </div>
          </div>

          <div data-guide="approval-search" class="border-t px-4 py-3 border-default flex items-center gap-2">
            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search subject or teacher..."
              class="flex-1" />
            <GradesApprovalFilterDrawer v-model:status="status" v-model:class-id="classId"
              v-model:teacher-id="teacherId" :class-options="classOptions" :teacher-options="teachers"
              :loading-classes="loadingClasses" :loading-teachers="loadingSession"
              :active-count="activeFilterCount" />
          </div>
        </div>
      </template>

      <div>
        <!-- LOADING -->
        <div v-if="isLoading" class="divide-y divide-default">
          <GradesRecordLoading v-for="i in skeletonRows" :key="i" />
        </div>

        <!-- ERROR / EMPTY -->
        <GradesApprovalListState v-else-if="loadError || !requests.length" :error="loadError"
          :filtered="isFiltered" :empty-title="approver === 'EXAM_OFFICER' ? 'Nothing waiting for the exam officer' : 'No grades waiting for approval'"
          :empty-description="approver ? `Only classes whose grades go to the ${GRADE_APPROVER_LABEL[approver].toLowerCase()} are shown. Switch tabs to see the rest.` : 'When teachers submit grades for review, they\'ll show up here.'"
          @retry="fetchRecords" @clear="clearFilters" />

        <!-- LIST -->
        <div v-else>
          <GradesRecord class="border-b last:border-b-0 border-default" v-for="req in requests" :key="req.id" :record="req"
            @click="router.push(`/grades/approval/${req.id}`)" />
        </div>
      </div>

      <template v-if="!isLoading && !loadError && meta.total" #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
