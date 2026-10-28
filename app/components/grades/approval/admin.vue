<script setup lang="ts">
type ApprovalRequestStatusFilter = '' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'

const route = useRoute()
const router = useRouter()

const sessionStore = useTeacherStore()
const store = useAssessmentStore()
const classSessionStore = useClassSessionStore()

const { records: teacherRecords } = storeToRefs(sessionStore)
const { requests, meta } = storeToRefs(store)

const isLoading = ref(false)
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
async function fetchSummary() {
  summary.value = teacherId.value
    ? await store.fetchAssessmentApprovalSummary(teacherId.value)
    : await store.fetchSchoolAssessmentApprovalSummary()
}

async function fetchRecords() {
  isLoading.value = true

  try {
    if (teacherId.value) {
      await store.fetchAllAssessmentApprovalRequest(
        teacherId.value, page.value, size.value, status.value || undefined, search.value || undefined,
        classId.value || undefined
      )
    } else {
      await store.fetchAllSchoolAssessmentApprovalRequest(
        page.value, size.value, status.value || undefined, search.value || undefined, classId.value || undefined
      )
    }
  } finally {
    isLoading.value = false
  }
}

watch(() => page.value, () => fetchRecords())
watch(teacherId, fetchSummary, { immediate: true })

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([teacherId, classId, status, search], () => {
  updateQuery({
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

  loadingSession.value = true
  loadingClasses.value = true
  await Promise.all([
    sessionStore.fetchAll(0, 0).finally(() => { loadingSession.value = false }),
    classSessionStore.fetchAll(0, 0).finally(() => { loadingClasses.value = false }),
  ])

  await fetchRecords()
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR]
})
</script>

<template>
  <div class="px-4 md:px-6 space-y-3">
    <GradesSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-highlighted">Grade Approval</h2>

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
              v-model:teacher-id="teacherId" :class-options="classOptions" :teacher-options="teachers"
              :loading-classes="loadingClasses" :loading-teachers="loadingSession"
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

      <template v-if="meta.total" #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
