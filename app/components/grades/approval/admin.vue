<template>
  <UForm :state="state" class="md:px-5 py-2 md:py-4 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
    <Heading class="hidden md:flex" title="Approval Requests" :subtitle="headerMessage">
      <div class="flex gap-3">
        <UBadge color="warning" variant="outline" size="lg">{{ summary.pending }} Pending</UBadge>
        <UBadge color="success" variant="outline" size="lg">{{ summary.approved }} Approved</UBadge>
        <UBadge color="error" variant="outline" size="lg">{{ summary.returned }} Returned</UBadge>
      </div>
    </Heading>
    <div class="grid md:grid-cols-2 gap-5">
      <div>
        <UCard class="sticky top-0">
          <template #header>
            <div class="flex flex-wrap md:flex-nowrap justify-between items-center">
              <div class="flex gap-1 w-full">
                <UButton size="sm" :variant="filter === 'ALL' ? 'outline' : 'ghost'" @click="filter = 'ALL'">
                  All {{ requests.length }}
                </UButton>
                <UButton size="sm" :variant="filter === 'Pending Review' ? 'outline' : 'ghost'"
                  @click="filter = 'Pending Review'">
                  Pending {{ summary.pending }}
                </UButton>

                <UButton size="sm" :variant="filter === 'Approved' ? 'outline' : 'ghost'" @click="filter = 'Approved'">
                  Approved {{ summary.approved }}
                </UButton>

                <UButton size="sm" :variant="filter === 'Returned' ? 'outline' : 'ghost'" @click="filter = 'Returned'">
                  Returned {{ summary.returned }}
                </UButton>
              </div>
              <div class="md:w-72 w-full flex space-x-3">
                <USelectMenu @change="fetchRecords" value-key="value" size="lg" v-model="state.teacherId"
                  :items="teachers" :loading="loadingSession" placeholder="Search teacher" />
              </div>
            </div>
          </template>
          <div v-if="isLoading" class="p-4">
            <p class="text-sm text-gray-500">Loading requests...</p>
          </div>
          <div v-if="!state.teacherId" class="p-4 flex items-center justify-center">
            <p class="text-sm text-gray-500">Select a teacher to view details</p>
          </div>
          <div v-if="!isLoading && state.teacherId && filteredRequests.length === 0" class="p-4 flex items-center justify-center">
            <p class="text-sm text-gray-500">No requests found</p>
          </div>
          <div v-else class="space-y-3">
            <GradesRecordLoading v-if="isLoading" v-for="(item, index) in 8" :key="index" />
            <GradesRecord v-else v-for="req in filteredRequests" :selected="selected" :key="req.id"
              @click="selected = req" :record="req" />
          </div>
          <template #footer>
            <div class="flex justify-between items-center">
              <Showing :meta="meta" />
              <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                :total="meta.total" show-edges />
            </div>
          </template>
        </UCard>
      </div>
      <GradesViewRequest @refresh="fetchRecordAndUpdate" @close="close" :record="selected" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
type ApprovalRequestStatus = 'Pending Review' | 'Approved' | 'Returned'
type RequestFilter = 'ALL' | ApprovalRequestStatus

type ApprovalRequestForm = {
  teacherId: string
}

const headerMessage = computed(() => {
  if (!state.teacherId) return "Select a teacher to review grade submissions"

  return "Review grade submissions from subject teachers"
})

const sessionStore = useTeacherStore()
const store = useAssessmentStore()
const { records, meta } = storeToRefs(sessionStore)
const isLoading = ref(false)
const loadingSession = ref(true)
const teachers = computed(() => records.value.map(e => ({ label: `${e.user.givenNames} ${e.user.familyName}`, value: e.id })))

const router = useRouter()
const route = useRoute()
const search = ref('')
const filter = ref<RequestFilter>('ALL')
const requests = ref<AssessmentApprovalRequest[]>([])

const selected = ref<AssessmentApprovalRequest | null>()

function close() {
  selected.value = null
}

const summary = computed(() => ({
  pending: requests.value.filter(i => i.status === 'Pending Review').length,
  approved: requests.value.filter(i => i.status === 'Approved').length,
  returned: requests.value.filter(i => i.status === 'Returned').length
}))

const filteredRequests = computed(() => {
  let list = requests.value

  if (filter.value !== 'ALL') {
    list = list.filter(i => i.status === filter.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(i =>
      `${i.teacher} ${i.subject}`.toLowerCase().includes(q)
    )
  }

  return list
})

async function fetchRecords() {
  await loadRequests(false)
}

async function fetchRecordAndUpdate() {
  await loadRequests(true)
}

async function loadRequests(keepSelection: boolean) {
  if (state.teacherId == null) return;
  isLoading.value = true
  try {
    const res = await store.fetchAllAssessmentApprovalRequest(state.teacherId)
    requests.value = res || []

    if (!keepSelection) return

    selected.value = requests.value.find(e => e.id === selected.value?.id) || null
  } finally {
    isLoading.value = false
  }
}

const state = reactive<ApprovalRequestForm>({
  teacherId: ""
})

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value
    }
  })

  fetchRecords()
}, { immediate: true })

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
