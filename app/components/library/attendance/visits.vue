<script setup lang="ts">
// Independent library visits (Workflow A): who is in now, who was never checked out, and the history.
const store = useLibraryAttendanceStore()
const { overview } = storeToRefs(store)
const { canRecordAttendance, canSuperviseAttendance } = useLibraryAccess()
const { success: toastSuccess, error: toastError } = useNotify()

type View = 'IN' | 'FOLLOW_UP' | 'TODAY' | 'HISTORY'
const initialView = String(useRoute().query.view || '').toUpperCase() as View
const view = ref<View>(['IN', 'FOLLOW_UP', 'TODAY', 'HISTORY'].includes(initialView) ? initialView : 'IN')

const today = schoolToday()
const from = ref(addDays(today, -30))
const to = ref(today)
const searchValue = ref('')
const search = ref('')
const page = ref(1)
const size = runtimeConf().limit

const data = ref<LibraryVisit[]>([])
const meta = ref<any>({})
const loading = ref(false)
const busyId = ref('')

const tabs = computed(() => [
  { key: 'IN', label: 'In the Library', icon: CHECK_IN_ICON, count: overview.value?.openVisits },
  { key: 'FOLLOW_UP', label: 'Not Checked Out', icon: FOLLOW_UP_ICON, count: overview.value?.unresolvedVisits, warn: true },
  { key: 'TODAY', label: 'Today', icon: 'i-lucide-calendar-days', count: overview.value?.visitsToday },
  { key: 'HISTORY', label: 'History', icon: 'i-lucide-history' }
])

function filters() {
  switch (view.value) {
    case 'IN': return { status: 'OPEN' as VisitFilter }
    case 'FOLLOW_UP': return { status: 'UNRESOLVED' as VisitFilter }
    case 'TODAY': return { status: 'ALL' as VisitFilter, from: today, to: today }
    default: return { status: 'ALL' as VisitFilter, from: from.value, to: to.value }
  }
}

let request = 0
async function load() {
  const mine = ++request
  loading.value = true
  try {
    const res = await LibraryAttendanceApi().listVisits(page.value, size, { ...filters(), search: search.value })
    if (mine !== request) return
    data.value = res.data
    meta.value = res.meta
  } catch (err: any) {
    if (mine === request) toastError(err?.message || 'Failed to load visits')
  } finally {
    if (mine === request) loading.value = false
  }
}

async function checkOut(visit: LibraryVisit) {
  busyId.value = visit.id
  try {
    await LibraryAttendanceApi().checkOut(visit.id)
    toastSuccess(`${visit.studentName} checked out`)
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to check out')
  } finally {
    busyId.value = ''
  }
}

const resolving = ref<LibraryVisit | null>(null)
const resolveOpen = ref(false)
const resolveSaving = ref(false)

function startResolve(visit: LibraryVisit) {
  resolving.value = visit
  resolveOpen.value = true
}

async function resolve(reason: string) {
  if (!resolving.value) return
  resolveSaving.value = true
  try {
    await LibraryAttendanceApi().resolveVisit(resolving.value.id, reason)
    toastSuccess('Visit followed up')
    resolveOpen.value = false
    store.changed()
  } catch (err: any) {
    toastError(err?.message || 'Failed to follow up the visit')
  } finally {
    resolveSaving.value = false
  }
}

const columns = computed(() => [
  { id: 'student', header: 'Student' },
  { id: 'in', header: 'Checked In' },
  { id: 'out', header: 'Checked Out' },
  { id: 'state', header: 'Status' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
])

let timer: ReturnType<typeof setTimeout>
watch(searchValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => { search.value = val.trim() }, 400)
})

watch([view, search, from, to], () => {
  if (page.value === 1) load()
  else page.value = 1
})
watch(page, load)
watch(() => store.changeVersion, load)
onMounted(load)
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="space-y-3">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tab v-model="view" :tabs="tabs" />
          <LibraryAttendanceCheckIn v-if="canRecordAttendance" />
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <UInput v-model="searchValue" :icon="SEARCH_ICON" placeholder="Search by student or class" class="w-full sm:w-64" />
          <template v-if="view === 'HISTORY'">
            <UInput v-model="from" type="date" :max="to" class="w-full sm:w-44" />
            <UInput v-model="to" type="date" :min="from" :max="today" class="w-full sm:w-44" />
          </template>
        </div>
        <p v-if="view === 'FOLLOW_UP'" class="text-sm text-muted">
          These students were never checked out and their school day has ended. Following up closes the visit
          as "check-out not recorded" - no time is made up.
        </p>
      </div>
    </template>

    <UTable :columns="columns" :data="data" :loading="loading">
      <template #student-cell="{ row }">
        <ULink :to="`/library/attendance/reports?student=${row.original.studentId}`"
          class="font-medium text-gray-900 hover:text-primary dark:text-white">
          {{ row.original.studentName }}
        </ULink>
        <p class="text-xs text-muted">{{ row.original.studentClass }}</p>
      </template>

      <template #in-cell="{ row }">
        <p class="text-sm">{{ formatDateTime(row.original.checkedInAt) }}</p>
        <p v-if="row.original.checkedInByName" class="text-xs text-muted">by {{ row.original.checkedInByName }}</p>
      </template>

      <template #out-cell="{ row }">
        <template v-if="row.original.checkedOutAt">
          <p class="text-sm">{{ formatTime(row.original.checkedOutAt) }}</p>
          <p class="text-xs text-muted">{{ formatMinutes(row.original.durationMinutes) }} in the library</p>
        </template>
        <template v-else-if="row.original.status === 'RESOLVED'">
          <p class="text-sm text-muted">Not recorded</p>
          <p class="max-w-56 truncate text-xs text-muted" :title="row.original.resolutionReason || ''">
            {{ row.original.resolvedByName }}: {{ row.original.resolutionReason }}
          </p>
        </template>
        <p v-else class="text-sm text-muted">-</p>
      </template>

      <template #state-cell="{ row }">
        <UBadge variant="soft" :color="visitState(row.original).color" :label="visitState(row.original).label" />
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-2">
          <UButton v-if="row.original.status === 'OPEN' && !row.original.unresolved && canRecordAttendance"
            :icon="CHECK_OUT_ICON" size="xs" variant="soft" color="info" label="Check Out"
            :loading="busyId === row.original.id" @click="checkOut(row.original)" />
          <UButton v-if="row.original.unresolved && canSuperviseAttendance" :icon="FOLLOW_UP_ICON" size="xs"
            variant="soft" color="warning" label="Follow Up" @click="startResolve(row.original)" />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="CHECK_IN_ICON" class="text-4xl text-primary-500" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ view === 'IN' ? 'Nobody is checked in' : view === 'FOLLOW_UP' ? 'Nothing to follow up' : 'No visits found' }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">Students who visit outside a class library period appear here.</p>
          </div>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>

    <template v-if="meta.total" #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>

  <LibraryAttendanceReasonModal v-model:open="resolveOpen" title="Follow Up Visit"
    :description="resolving ? `${resolving.studentName} was checked in ${formatDateTime(resolving.checkedInAt)} and never checked out.` : undefined"
    confirm-label="Close Visit" color="warning" :loading="resolveSaving"
    placeholder="e.g. Left with their class at the bell" @confirm="resolve" />
</template>
