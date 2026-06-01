<template>
  <UForm
    class="min-h-screen space-y-4 bg-linear-to-b from-gray-50 to-white p-3 md:space-y-5 md:bg-transparent md:p-5 dark:from-gray-950 dark:to-gray-950">
    <!-- Desktop Heading -->
    <Heading class="hidden md:flex" title="Approval Requests" subtitle="Review grade submissions">
      <div class="flex flex-wrap gap-2">
        <UBadge color="warning" variant="soft" size="lg" class="rounded-full px-3 py-1">
          {{ summary.pending }} Pending
        </UBadge>

        <UBadge color="success" variant="soft" size="lg" class="rounded-full px-3 py-1">
          {{ summary.approved }} Approved
        </UBadge>

        <UBadge color="error" variant="soft" size="lg" class="rounded-full px-3 py-1">
          {{ summary.returned }} Returned
        </UBadge>
      </div>
    </Heading>

    <!-- MOBILE HEADER -->
    <div class="md:hidden space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Approvals
          </h1>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            Review teacher submissions
          </p>
        </div>

        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
          <UIcon name="lucide:clipboard-check" class="size-5" />
        </div>
      </div>

      <!-- STATS -->
      <div class="grid grid-cols-3 gap-2">
        <UCard class="rounded-3xl border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
          <div class="text-center">
            <p class="text-[11px] text-gray-500">
              Pending
            </p>

            <p class="mt-1 text-lg font-bold text-warning">
              {{ summary.pending }}
            </p>
          </div>
        </UCard>

        <UCard class="rounded-3xl border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
          <div class="text-center">
            <p class="text-[11px] text-gray-500">
              Approved
            </p>

            <p class="mt-1 text-lg font-bold text-success">
              {{ summary.approved }}
            </p>
          </div>
        </UCard>

        <UCard class="rounded-3xl border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
          <div class="text-center">
            <p class="text-[11px] text-gray-500">
              Returned
            </p>

            <p class="mt-1 text-lg font-bold text-error">
              {{ summary.returned }}
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <!-- LEFT -->
      <div>
        <UCard class="overflow-hidden sticky top-0" :ui="{
          body: 'p-3 md:p-4',
          header: 'p-3 md:p-4',
          footer: 'p-3 md:p-4'
        }">
          <!-- HEADER -->
          <template #header>
            <div class="space-y-4">
              <!-- FILTERS -->
              <div
                class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide rounded-2xl bg-gray-50 p-1.5 dark:bg-gray-800/70">
                <UButton size="sm" class="shrink-0 rounded-xl" :variant="filter === 'ALL' ? 'solid' : 'ghost'"
                  @click="filter = 'ALL'">
                  All {{ requests.length }}
                </UButton>

                <UButton size="sm" class="shrink-0 rounded-xl"
                  :variant="filter === 'Pending Review' ? 'solid' : 'ghost'" @click="filter = 'Pending Review'">
                  Pending {{ summary.pending }}
                </UButton>

                <UButton size="sm" class="shrink-0 rounded-xl" :variant="filter === 'Approved' ? 'solid' : 'ghost'"
                  @click="filter = 'Approved'">
                  Approved {{ summary.approved }}
                </UButton>

                <UButton size="sm" class="shrink-0 rounded-xl" :variant="filter === 'Returned' ? 'solid' : 'ghost'"
                  @click="filter = 'Returned'">
                  Returned {{ summary.returned }}
                </UButton>
              </div>

              <!-- SEARCH -->
              <UInput v-model="search" icon="lucide:search" size="lg" placeholder="Search subject or teacher..." />
            </div>
          </template>

          <!-- LOADING -->
          <div v-if="isLoading" class="space-y-3">
            <GradesRecordLoading v-for="(_, index) in 6" :key="index" />
          </div>

          <!-- EMPTY REQUEST -->
          <div v-else-if="filteredRequests.length === 0"
            class="flex flex-col items-center justify-center py-14  sticky top-0  text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-gray-800">
              <UIcon name="lucide:inbox" class="size-7 text-gray-500" />
            </div>

            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              No Requests Found
            </h3>

            <p class="mt-1 text-xs text-gray-500">
              No approval requests match this filter.
            </p>
          </div>

          <!-- DESKTOP -->
          <div class="hidden space-y-3 md:block">
            <div class="sticky top-5">
              <GradesRecord v-for="req in filteredRequests" :key="req.id" :selected="selected" :record="req"
                @click="selected = req" />
            </div>
          </div>

          <!-- MOBILE -->
          <div v-if="filteredRequests.length > 0" class="space-y-3 md:hidden">
            <UCard v-for="req in filteredRequests" :key="req.id"
              class="cursor-pointer rounded-3xl border-0 shadow-sm ring-1 ring-gray-200 transition-all active:scale-[0.98] dark:ring-gray-800"
              :class="selected?.id === req.id ? 'ring-2 ring-primary-400 dark:ring-primary-500' : ''"
              :ui="{ body: 'p-4' }" @click="selected = req">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 flex-1 gap-3">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-500/10">
                    <UIcon name="lucide:clipboard-check" class="size-5 text-primary" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {{ req.subject }}
                      </h3>

                      <UBadge size="xs" :color="req.status === 'Approved'
                        ? 'success'
                        : req.status === 'Returned'
                          ? 'error'
                          : 'warning'
                        " variant="soft">
                        {{ req.status }}
                      </UBadge>
                    </div>

                    <p class="mt-1 truncate text-xs text-gray-500">
                      {{ req.teacher }}
                    </p>

                    <div class="mt-3 flex items-center justify-between">
                      <p class="text-[11px] text-gray-400">
                        Tap to review
                      </p>

                      <UIcon name="lucide:chevron-right" class="size-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- FOOTER -->
          <template #footer>
            <div class="flex items-center justify-between">
              <Showing :meta="meta" />

              <UPagination v-model:page="page" size="sm" :page-size="meta?.size" :items-per-page="meta?.size"
                :total="meta?.total" show-edges />
            </div>
          </template>
        </UCard>
      </div>

      <!-- DESKTOP VIEW -->
      <div class="hidden md:block">
        <GradesViewRequest :record="selected" @refresh="fetchRecordAndUpdate" @close="close" />
      </div>
    </div>

    <!-- MOBILE SLIDEOVER -->
    <USlideover v-model:open="mobileOpen" side="right" :ui="{
      content: 'bg-white dark:bg-gray-950'
    }">
      <template #content>
        <div class="flex h-screen flex-col">
          <!-- HEADER -->
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
            <div>
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                Approval Details
              </h2>

              <p class="text-xs text-gray-500">
                Review submission
              </p>
            </div>

            <UButton icon="lucide:x" color="neutral" variant="ghost" class="rounded-full" @click="close" />
          </div>

          <!-- BODY -->
          <div class="flex-1 overflow-y-auto p-3">
            <GradesViewRequest :record="selected" @refresh="fetchRecordAndUpdate" @close="close" />
          </div>
        </div>
      </template>
    </USlideover>
  </UForm>
</template>

<script setup lang="ts">
type ApprovalRequestStatus = 'Pending Review' | 'Approved' | 'Returned'
type RequestFilter = 'ALL' | ApprovalRequestStatus

const mobileOpen = ref(false)
const meta = ref<Meta>()

const store = useAssessmentStore()

const isLoading = ref(true)

const router = useRouter()
const route = useRoute()

const search = ref('')
const filter = ref<RequestFilter>('ALL')
const requests = ref<AssessmentApprovalRequest[]>([])

const selected = ref<AssessmentApprovalRequest | null>(null)

watch(selected, (val) => {
  if (import.meta.client && window.innerWidth < 768) {
    mobileOpen.value = !!val
  }
})

function close() {
  selected.value = null
  mobileOpen.value = false
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
  await loadRequests()
}

async function fetchRecordAndUpdate() {
  await loadRequests()
}

async function loadRequests() {
  isLoading.value = true

  try {
    const res = await store.fetchAllMeAssessmentApprovalRequest(page.value, size.value)

    requests.value = res.data || []
    meta.value = res.meta

  } finally {
    isLoading.value = false
  }
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: val => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? 6),
  set: val => updateQuery({ size: val })
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
  fetchRecords()
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER]
})
</script>
