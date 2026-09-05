<script setup lang="ts">
type ApprovalRequestStatusFilter = '' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'

// No "All Statuses" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). Nothing selected already shows the "All Statuses" placeholder, and
// the select's own clear button (:clear below) gets back to it.
const filterOptions: { label: string, value: ApprovalRequestStatusFilter }[] = [
  { label: 'Pending', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Returned', value: 'RETURNED' }
]

const route = useRoute()
const router = useRouter()
const store = useAssessmentStore()

const isLoading = ref(true)
const requests = ref<AssessmentApprovalRequest[]>([])
const meta = ref<Meta>()
const summary = ref<AssessmentApprovalSummary | null>(null)

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
})

// Plain local refs, not URL-bound computed getters/setters - a USelectMenu's v-model needs to
// read back the value it was just given synchronously. Routing the write through
// router.replace()'s async round trip first (as a computed setter would) left the dropdown
// showing its old selection until the navigation resolved, which read as "picking an option does
// nothing". These still seed from the URL on load and push back to it (see the watch below) so a
// direct link/refresh keeps the filter, but the URL is a mirror now, not the source of truth.
const status = ref<ApprovalRequestStatusFilter>((route.query.status as ApprovalRequestStatusFilter) ?? '')
const searchInput = ref(String(route.query.search ?? ''))
const search = ref(searchInput.value)

const size = ref(5)

const hasActiveFilters = computed(() => !!status.value || !!search.value)

function resetFilters() {
  status.value = ''
  searchInput.value = ''
  search.value = ''
}

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
      page.value, size.value, status.value || undefined, search.value || undefined
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

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([status, search], () => {
  updateQuery({ status: status.value || undefined, search: search.value || undefined, page: 1 })

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
  <div class="px-4 md:px-6 space-y-4">
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

          <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search subject or teacher..."
                class="col-span-2 sm:col-span-2" />
              <USelectMenu v-model="status" value-key="value" label-key="label" :items="filterOptions"
                placeholder="All Statuses" clear />
            </div>
            <div>
              <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                :disabled="!hasActiveFilters" @click="resetFilters" />
            </div>
          </div>
        </div>
      </template>

      <div class="space-y-4 p-4">
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
        <div v-else class="space-y-3">
          <GradesRecord v-for="req in requests" :key="req.id" :record="req"
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
