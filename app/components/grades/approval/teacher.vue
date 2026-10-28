<script setup lang="ts">
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

async function fetchRecords() {
  isLoading.value = true

  try {
    const res = await store.fetchAllMeAssessmentApprovalRequest(
      page.value, size.value, status.value || undefined, search.value || undefined, classId.value || undefined
    )

    requests.value = res.data || []
    meta.value = res.meta
  } finally {
    isLoading.value = false
  }
}

async function fetchSummary() {
  summary.value = await store.fetchMeAssessmentApprovalSummary()
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
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-highlighted">My Approval Queue</h2>

            <div class="flex items-center gap-2">
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

      <div class="space-y-4">
        <!-- LOADING -->
        <div v-if="isLoading" class="space-y-3">
          <GradesRecordLoading v-for="(_, index) in 6" :key="index" />
        </div>

        <!-- EMPTY -->
        <div v-else-if="!requests.length"
          class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-elevated">
            <UIcon name="lucide:inbox" class="text-3xl text-muted" />
          </div>
          <h3 class="font-semibold text-highlighted">No requests found</h3>
          <p class="text-sm text-muted">No approval requests match this filter.</p>
        </div>

        <!-- LIST -->
        <div v-else>
          <GradesRecord class="border-b last:border-b-0 border-default" v-for="req in requests" :key="req.id" :record="req"
            @click="router.push(`/grades/approval/${req.id}`)" />
        </div>
      </div>

      <template v-if="meta?.total" #footer>
        <div class="flex items-center justify-between gap-3">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta?.size" :items-per-page="meta?.size"
            :total="meta?.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
