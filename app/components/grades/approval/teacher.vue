<template>
  <UForm :state="state" class="h-full flex flex-col bg-gray-50">
    <!-- HEADER -->
    <div class="md:p-7 p-4 border-b border-gray-300 space-y-4">
      <Heading class="hidden md:flex" title="Approval Requests" :subtitle="headerMessage">
        <div class="flex gap-3">
          <UBadge color="warning" variant="outline" size="lg">{{ summary.pending }} Pending</UBadge>
          <UBadge color="success" variant="outline" size="lg">{{ summary.approved }} Approved</UBadge>
          <UBadge color="error" variant="outline" size="lg">{{ summary.returned }} Returned</UBadge>
        </div>
      </Heading>
      <div class="flex flex-wrap justify-between items-center space-y-3">
        <div class="flex gap-2 w-full">
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

        <div class="md:w-1/2 w-full flex space-x-3">
          <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search teacher or subject" />
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="flex flex-1 overflow-hidden">
      <!-- LEFT REQUEST LIST -->
      <div class="flex-1 bg-white overflow-y-auto">
        <GradesRecordLoading v-if="isLoading" v-for="(item, index) in 8" :key="index" />
        <GradesRecord v-else v-for="req in filteredRequests" :selected="selected" :key="req.id" @click="selected = req"
          :record="req" />
      </div>

      <!-- RIGHT DETAILS -->
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

const store = useAssessmentStore()
const isLoading = ref(false)

const search = ref('')
const filter = ref<RequestFilter>('ALL')
const requests = ref<AssessmentApprovalRequest[]>([])
const selected = ref<AssessmentApprovalRequest | null>()

const state = reactive<ApprovalRequestForm>({
  teacherId: ""
})

function close() {
  selected.value = null
}

const headerMessage = computed(() =>
  !state.teacherId
    ? "Select a teacher to review grade submissions"
    : "Review grade submissions from subject teachers"
)

const summary = computed(() => ({
  pending: requests.value.filter(r => r.status === 'Pending Review').length,
  approved: requests.value.filter(r => r.status === 'Approved').length,
  returned: requests.value.filter(r => r.status === 'Returned').length
}))

/* STATUS PRIORITY */
const statusPriority: Record<ApprovalRequestStatus, number> = {
  'Pending Review': 1,
  'Returned': 2,
  'Approved': 3
}

const filteredRequests = computed(() => {
  let list = [...requests.value]

  if (filter.value !== 'ALL') {
    list = list.filter(r => r.status === filter.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      `${r.teacher} ${r.subject}`.toLowerCase().includes(q)
    )
  }

  /* SORT SO PENDING ALWAYS ON TOP */
  list.sort((a, b) => statusPriority[a.status] - statusPriority[b.status])

  return list
})

async function fetchRecordAndUpdate() {
  await loadRequests(true)
}

async function loadRequests(keepSelection: boolean) {
  isLoading.value = true

  try {
    const res = await store.fetchAllMeAssessmentApprovalRequest()
    requests.value = res || []

    if (!keepSelection) return

    selected.value =
      requests.value.find(r => r.id === selected.value?.id) || null
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Grade Approval Requests')
  document.title = 'Grade Approval Requests | Grades | Skultem'

  await loadRequests(false)
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR]
})
</script>