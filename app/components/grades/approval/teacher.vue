<script setup lang="ts">
const { routing, load: loadRouting, routesTo, approversInUse } = useGradeApproval()
const otherApprovers = computed(() => approversInUse.value.filter(a => a !== 'CLASS_MASTER')
  .map(a => GRADE_APPROVER_LABEL[a].toLowerCase()).join(' or '))
onMounted(() => { loadRouting() })

type ApprovalRequestStatusFilter = '' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'

const route = useRoute()
const router = useRouter()
const store = useAssessmentStore()
const { assignments, loading: loadingClasses } = useClassMaster()

// The classes (sessions) this class master runs - full name incl. section/stream.
const classOptions = computed(() => {
  const seen = new Map<string, { label: string, value: string }>()
  for (const a of assignments.value ?? []) {
    if (!seen.has(a.sessionId)) seen.set(a.sessionId, { label: a.sessionName || a.className, value: a.sessionId })
  }
  return [...seen.values()]
})

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const loadingSummary = ref(true)
const requests = ref<AssessmentApprovalRequest[]>([])
const meta = ref<Meta>()
const summary = ref<AssessmentApprovalSummary | null>(null)

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
})

const status = ref<ApprovalRequestStatusFilter>((route.query.status as ApprovalRequestStatusFilter) ?? '')
const classId = ref(String(route.query.classId ?? ''))
const searchInput = ref(String(route.query.search ?? ''))
const search = ref(searchInput.value)

const size = ref(5)

const skeletonRows = computed(() => Math.min(size.value, 6))

// Any search or filter on - an empty list then means "nothing matches", not "nothing submitted".
const isFiltered = computed(() => !!(classId.value || status.value || search.value))

function clearFilters() {
  searchInput.value = ''
  search.value = ''
  classId.value = ''
  status.value = ''
}

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(() => [classId.value, status.value].filter(Boolean).length)

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

// Only the newest request may update the list, so a slow older one can't overwrite it.
let latestRecords = 0
async function fetchRecords() {
  const request = ++latestRecords
  isLoading.value = true
  loadError.value = null

  try {
    const res = await store.fetchAllMeAssessmentApprovalRequest(
      page.value, size.value, status.value || undefined, search.value || undefined, classId.value || undefined
    )
    if (request !== latestRecords) return

    // The store returns nothing when the request failed - show that instead of a stale list.
    if (!res) {
      requests.value = []
      loadError.value = store.error || 'Failed to fetch approval requests'
      return
    }
    requests.value = res.data || []
    meta.value = res.meta
  } finally {
    if (request === latestRecords) isLoading.value = false
  }
}

async function fetchSummary() {
  loadingSummary.value = true
  summary.value = await store.fetchMeAssessmentApprovalSummary()
  loadingSummary.value = false
}

watch(() => page.value, () => fetchRecords())

watch([classId, status, search], () => {
  updateQuery({
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
  await Promise.all([fetchRecords(), fetchSummary()])
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER]
})
</script>

<template>
  <div class="px-4 md:px-6 space-y-3">
    <GradesSectionNav />
    <!-- Where the school sends grades to someone else, the class master follows them here but doesn't sign off. -->
    <UAlert v-if="routing && approversInUse.some(a => a !== 'CLASS_MASTER')" color="neutral" variant="soft"
      icon="i-lucide-info"
      :title="routesTo('CLASS_MASTER') ? 'Some classes are approved by someone else' : `Grades are approved by the ${otherApprovers}`"
      :description="routesTo('CLASS_MASTER')
        ? `In parts of the school, the ${otherApprovers} approves grades instead of the class master. Those requests show who they're with - you can follow them, but not approve them.`
        : 'You can follow your class\'s grades here, but approving them is not the class master\'s job in this school.'" />
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-highlighted">My Approval Queue</h2>

            <!-- Skeletons until the counts arrive, so they never flash "0". -->
            <div v-if="loadingSummary && !summary" class="flex items-center gap-2">
              <USkeleton v-for="i in 3" :key="i" class="h-5 w-20 rounded-md" />
            </div>
            <div v-else class="flex items-center gap-2">
              <UBadge color="warning" variant="subtle" size="sm">{{ summary?.pending ?? 0 }} Pending</UBadge>
              <UBadge color="success" variant="subtle" size="sm">{{ summary?.approved ?? 0 }} Approved</UBadge>
              <UBadge color="error" variant="subtle" size="sm">{{ summary?.returned ?? 0 }} Returned</UBadge>
            </div>
          </div>

          <div class="border-t px-4 py-3 border-default flex items-center gap-2">
            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search subject or teacher..."
              class="flex-1" />
            <GradesApprovalFilterDrawer v-model:status="status" v-model:class-id="classId"
              :class-options="classOptions" :loading-classes="loadingClasses"
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
          :filtered="isFiltered" empty-title="Your approval queue is empty"
          empty-description="When subject teachers in your class submit grades for review, they'll show up here."
          @retry="fetchRecords" @clear="clearFilters" />

        <!-- LIST -->
        <div v-else>
          <GradesRecord class="border-b last:border-b-0 border-default" v-for="req in requests" :key="req.id" :record="req"
            @click="router.push(`/grades/approval/${req.id}`)" />
        </div>
      </div>

      <template v-if="!isLoading && !loadError && meta?.total" #footer>
        <div class="flex items-center justify-between gap-3">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta?.size" :items-per-page="meta?.size"
            :total="meta?.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
