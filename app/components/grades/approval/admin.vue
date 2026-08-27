<template>
  <div class="px-4 md:px-6 space-y-4">
    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <USelectMenu v-model="state.teacherId" value-key="value" :items="teachers" :loading="loadingSession"
              placeholder="Select teacher" class="w-full sm:w-56" @change="fetchRecords" />
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search subject or teacher..."
              class="w-full sm:w-64" />
            <USelectMenu v-model="filter" value-key="value" :items="filterOptions" class="w-full sm:w-40"
              @change="onFilterChange" />
          </div>

          <div class="flex items-center gap-2">
            <UBadge color="warning" variant="subtle" size="sm">{{ summary?.pending ?? 0 }} Pending</UBadge>
            <UBadge color="success" variant="subtle" size="sm">{{ summary?.approved ?? 0 }} Approved</UBadge>
            <UBadge color="error" variant="subtle" size="sm">{{ summary?.returned ?? 0 }} Returned</UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- NO TEACHER SELECTED -->
        <div v-if="!state.teacherId"
          class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="lucide:user-search" class="text-3xl text-primary-500" />
          </div>
          <h3 class="font-semibold text-highlighted">Select a teacher</h3>
          <p class="text-sm text-muted">Choose a teacher to review submitted grades and approval requests.</p>
        </div>

        <!-- LOADING -->
        <div v-else-if="isLoading" class="space-y-3">
          <GradesRecordLoading v-for="(_, index) in 6" :key="index" />
        </div>

        <!-- EMPTY -->
        <div v-else-if="!filteredRequests.length"
          class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-elevated">
            <UIcon name="lucide:inbox" class="text-3xl text-muted" />
          </div>
          <h3 class="font-semibold text-highlighted">No requests found</h3>
          <p class="text-sm text-muted">No approval requests match this filter.</p>
        </div>

        <!-- LIST -->
        <div v-else class="space-y-3">
          <GradesRecord v-for="req in filteredRequests" :key="req.id" :selected="selected" :record="req"
            @click="selected = req" />
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

    <USlideover :open="!!selected" side="right" :ui="{ content: 'bg-default' }" @update:open="close">
      <template #content>
        <div class="flex h-screen flex-col">
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-default bg-default/95 p-4 backdrop-blur">
            <div>
              <h2 class="text-sm font-semibold text-highlighted">Approval Details</h2>
              <p class="text-xs text-muted">Review submission</p>
            </div>
            <UButton icon="lucide:x" color="neutral" variant="ghost" class="rounded-full" @click="close" />
          </div>

          <div class="flex-1 overflow-y-auto p-3">
            <GradesViewRequest :record="selected" @refresh="fetchRecordAndUpdate" @close="close" />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
type ApprovalRequestStatusFilter = '' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'

type ApprovalRequestForm = {
  teacherId: string
}

const filterOptions: { label: string, value: ApprovalRequestStatusFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Returned', value: 'RETURNED' }
]

const sessionStore = useTeacherStore()
const store = useAssessmentStore()

const { records: teacherRecords } = storeToRefs(sessionStore)

const isLoading = ref(false)
const loadingSession = ref(true)

const teachers = computed(() =>
  teacherRecords.value.map(e => ({
    label: `${e.user.givenNames} ${e.user.familyName}`,
    value: e.id
  }))
)

const router = useRouter()
const route = useRoute()

const search = ref('')
const filter = ref<ApprovalRequestStatusFilter>('')
const { requests, meta } = storeToRefs(store)
const summary = ref<AssessmentApprovalSummary | null>(null)

const selected = ref<AssessmentApprovalRequest | null>(null)

function close() {
  selected.value = null
}

// Backend already filters by status - search narrows further within the current page.
const filteredRequests = computed(() => {
  if (!search.value) return requests.value

  const q = search.value.toLowerCase()

  return requests.value.filter(i =>
    `${i.teacher} ${i.subject}`.toLowerCase().includes(q)
  )
})

async function fetchRecords() {
  await loadRequests(false)
}

async function fetchRecordAndUpdate() {
  await Promise.all([loadRequests(true), fetchSummary()])
}

async function fetchSummary() {
  summary.value = await store.fetchAssessmentApprovalSummary(state.teacherId)
}

async function loadRequests(keepSelection: boolean) {
  if (!state.teacherId) return

  isLoading.value = true

  try {
    await store.fetchAllAssessmentApprovalRequest(state.teacherId, page.value, size.value, filter.value || undefined)
    if (!keepSelection) return
    selected.value = requests.value.find(e => e.id === selected.value?.id) || null
  } finally {
    isLoading.value = false
  }
}

const state = reactive<ApprovalRequestForm>({
  teacherId: ''
})

watch(() => state.teacherId, fetchSummary)

function onFilterChange() {
  updateQuery({ page: 1 })
  fetchRecords()
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: val => updateQuery({ page: val })
})

const size = ref(5)

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

watch(
  () => page.value,
  () => {
    router.replace({
      query: {
        page: page.value
      }
    })

    fetchRecords()
  },
  { immediate: true }
)

onMounted(async () => {
  useAppStore().setTitle('Grade Approval Requests')

  document.title = 'Grade Approval Requests | Grades | Skultem'

  loadingSession.value = true

  await sessionStore.fetchAll(0, 0)

  loadingSession.value = false
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR]
})
</script>
