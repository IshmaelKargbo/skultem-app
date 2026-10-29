<script setup lang="ts">
const { formatScore } = useScoreFormat()
const tableView = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();
const store = useStudentStore();
const clazzStore = useClassStore();
const { records: data, meta, loading } = storeToRefs(store)

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
)

const sortOptions = [
  { label: 'Name (A-Z)', value: 'givenNames:asc' },
  { label: 'Name (Z-A)', value: 'givenNames:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
]
const DEFAULT_SORT = 'createdAt:desc'

const value = ref('')
const classId = ref(String(route.query.classId ?? ''))
const gender = ref(String(route.query.gender ?? ''))
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(
  () => [classId.value, gender.value, sort.value !== DEFAULT_SORT].filter(Boolean).length
)

const parseStaus: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

const parseStatusColor: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  DELETED: "danger",
};

const columns = [
  { id: "name", header: "Student" },
  { id: "guardian", header: "Guardian" },
  { id: "attendance", header: "Attendance" },
  { id: "average", header: "Average" },
  { id: "fees", header: "Fees" },
  { id: "actions", header: "", meta: { class: { td: "text-right" } } },
];

const { format } = useMoney()
const { can } = useAuth()
// Only the owner and principal see what a student has paid or owes; everyone else sees the state only.
const canSeeAmounts = computed(() => can([Role.OWNER, Role.PRINCIPAL]))
const widgetStore = useWidgetStore()
const termAttendance = ref<StudentTermAttendance | null>(null)
const attendanceById = computed(() => new Map(termAttendance.value?.students.map(r => [r.studentId, r]) ?? []))
const performanceByName = ref<Record<string, number>>({})

const fullName = (s: Student) => `${s.givenNames} ${s.familyName}`.trim()
// Term to date, over every school day since the student enrolled (the term start, or later). An
// enrolled student nobody has marked shows 0% - exactly what this column should make visible.
const attendanceRowOf = (s: Student) => attendanceById.value.get(s.id)
const attendanceOf = (s: Student) => attendanceRowOf(s)?.percentage ?? undefined
const performanceOf = (s: Student) => performanceByName.value[fullName(s)]

function feePaidPercent(s: Student) {
  const f = s.feeDetail
  if (!f || !Number(f.total)) return 0
  return Math.min(100, Math.round((Number(f.paid) / Number(f.total)) * 100))
}

// School-wide figures, the same way the class page works them out (matched on student name).
async function approvedAverages(): Promise<Record<string, number>> {
  const widgets = await Promise.all(['APPROVED', 'COMPLETED'].map(status => widgetStore.runAnalytic({
    entity: 'assessments',
    title: 'Approved scores',
    filters: [{ field: 'cycle.status', value: status, operator: 'EQUALS', type: 'select' }],
    metrics: [
      { name: 'Average Score', aggregation: 'avg', field: 'score', tags: { groupBy: 'student' } },
      { name: 'Count', aggregation: 'count', field: 'score', tags: { groupBy: 'student' } }
    ],
    chartType: 'bar'
  }).catch(() => null)))

  const sums: Record<string, { total: number, count: number }> = {}
  for (const res of widgets) {
    const w = res?.data ?? res
    const rows: { label: string, avg: number, count: number }[] = Array.isArray(w)
      ? w.map((r: any) => ({ label: String(r.student), avg: Number(r['Average Score']), count: Number(r['Count'] ?? 1) }))
      : (w?.labels || []).map((label: string, i: number) => ({
        label, avg: Number(w.datasets?.[0]?.data?.[i] ?? 0), count: Number(w.datasets?.[1]?.data?.[i] ?? 1)
      }))
    for (const r of rows) {
      if (!Number.isFinite(r.avg) || !(r.count > 0)) continue
      const entry = sums[r.label] ?? (sums[r.label] = { total: 0, count: 0 })
      entry.total += r.avg * r.count
      entry.count += r.count
    }
  }
  const out: Record<string, number> = {}
  for (const [label, v] of Object.entries(sums)) out[label] = Math.round(v.total / v.count * 10) / 10
  return out
}

async function fetchInsights() {
  try {
    const [performance, attendance] = await Promise.all([
      approvedAverages(),
      // No active term (e.g. between terms) just leaves the column empty.
      AttendanceApi().getStudentTermAttendance().catch(() => null)
    ])
    performanceByName.value = performance
    termAttendance.value = attendance ?? null
  } catch (err) {
    console.error('Failed to load student insights', err)
  }
}

// "ADM-001 · JSS 1 · 12 yrs" - the identifiers a school looks for, on one line.
function subtitleOf(s: Student) {
  const age = ageOf(s.dateOfBirth)
  return [s.admissionNumber || 'No admission no', s.className || 'Not placed', age !== null ? `${age} yrs` : '']
    .filter(Boolean).join(' · ')
}

// Whole years since the date of birth; null when missing or invalid.
function ageOf(dob?: string) {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// The linked parent account first; otherwise the father/mother recorded on the student.
function guardianOf(s: Student): { name: string, phone: string } {
  const g = s.guardian
  const linked = g ? (`${g.givenNames ?? ''} ${g.familyName ?? ''}`.trim() || g.name || '') : ''
  if (linked) return { name: linked, phone: g?.phone || '' }

  const f = s.family
  if (f?.fatherName) return { name: f.fatherName, phone: f.fatherContact || '' }
  if (f?.motherName) return { name: f.motherName, phone: f.motherContact || '' }
  return { name: '', phone: '' }
}

function view(row: Student) {
  router.push(`/students/${row.id}`);
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const search = ref(value.value)

const size = ref(runtimeConf().limit);

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecord() {
  await store.fetchAll(page.value, size.value, search.value, classId.value || undefined, sortBy.value, sortDirection.value, gender.value || undefined);
}

watch(
  () => page.value,
  () => fetchRecord(),
  { immediate: true }
);

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    search.value = val
  }, 500)
})

watch([search, classId, gender, sort], () => {
  updateQuery({
    classId: classId.value || undefined,
    gender: gender.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    page: 1,
  })

  if (page.value === 1) fetchRecord();
});

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value
    })
  }

  clazzStore.fetchAll(0, 0)
  fetchInsights();
  fetchRecord();
});
</script>

<template>
  <div class="px-4 md:px-6">
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 gap-2 justify-between items-center">
            <div class="flex space-x-2 flex-1 items-center">
              <UButton to="/students/add" class="md:items-center md:flex md:justify-center hidden" color="primary"
                label="Enrolled Student" :icon="ADD_ICON" />
              <UButton to="/students/add" class="md:hidden" color="primary" :icon="ADD_ICON" />
              <UButton class="hidden md:flex" color="neutral" variant="soft" label="Import"
                icon="i-lucide-file-spreadsheet" to="/students/import" />
              <UButton class="md:hidden" color="neutral" variant="soft" icon="i-lucide-file-spreadsheet"
                aria-label="Import students" to="/students/import" />
              <div class="flex-1 border-default flex items-center gap-2">
                <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or admission no"
                  class="flex-1" />
                <StudentFilterDrawer v-model:class-id="classId" v-model:gender="gender" v-model:sort="sort"
                  :class-options="classOptions" :sort-options="sortOptions" :active-count="activeFilterCount"
                  :default-sort="DEFAULT_SORT" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <TableViewToggle v-model="tableView" />
            </div>
          </div>
        </div>
      </template>
      <UTable v-if="tableView === 'table'" class="hidden md:block" :ui="{ th: 'px-3', td: 'px-3 py-2.5' }" :columns="columns" :data="data" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">No students found.</p>
          </div>
        </template>
        <template #name-cell="{ row }">
          <div class="flex min-w-0 items-center gap-2">
            <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
              :photo="row.original.photo" :status="row.original.status" :subtitle="subtitleOf(row.original)" />
            <UBadge v-if="row.original.status === 'INACTIVE' || row.original.status === 'DELETED'" size="sm"
              variant="subtle" :color="row.original.status === 'INACTIVE' ? 'warning' : 'error'"
              :label="parseStaus[row.original.status]" class="shrink-0" />
          </div>
        </template>
        <template #guardian-cell="{ row }">
          <div v-if="guardianOf(row.original).name" class="min-w-0 max-w-44">
            <p class="truncate text-sm font-medium text-highlighted">{{ guardianOf(row.original).name }}</p>
            <p v-if="guardianOf(row.original).phone" class="truncate text-xs text-muted">
              {{ guardianOf(row.original).phone }}</p>
          </div>
          <span v-else class="text-sm text-warning">No guardian</span>
        </template>
        <template #attendance-cell="{ row }">
          <UTooltip v-if="attendanceOf(row.original) !== undefined" :delay-duration="0" arrow
            :text="`${attendanceRowOf(row.original)!.presentOrLate} of ${attendanceRowOf(row.original)!.schoolDays} school days · ${termAttendance!.termName}${attendanceRowOf(row.original)!.countedFrom !== termAttendance!.startDate ? `, since enrolling ${attendanceRowOf(row.original)!.countedFrom}` : ' so far'}`">
          <div class="w-20">
            <p class="text-sm font-medium tabular-nums"
              :class="attendanceOf(row.original)! < 75 ? 'text-warning' : 'text-highlighted'">
              {{ attendanceOf(row.original) }}%</p>
            <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full" :class="attendanceOf(row.original)! < 75 ? 'bg-warning' : 'bg-success'"
                :style="{ width: `${Math.min(100, attendanceOf(row.original)!)}%` }" />
            </div>
          </div>
          </UTooltip>
          <span v-else class="text-muted">-</span>
        </template>
        <template #average-cell="{ row }">
          <div v-if="performanceOf(row.original) !== undefined" class="w-20">
            <p class="text-sm font-medium tabular-nums text-highlighted">{{ formatScore(performanceOf(row.original)) }}</p>
            <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full"
                :class="performanceOf(row.original)! < 50 ? 'bg-error' : performanceOf(row.original)! < 70 ? 'bg-warning' : 'bg-primary'"
                :style="{ width: `${Math.min(100, performanceOf(row.original)!)}%` }" />
            </div>
          </div>
          <span v-else class="text-muted">-</span>
        </template>
        <template #fees-cell="{ row }">
          <template v-if="row.original.feeDetail">
            <div v-if="canSeeAmounts" class="w-28">
              <p class="truncate text-sm font-medium tabular-nums"
                :class="Number(row.original.feeDetail.balance) > 0 ? (row.original.feeDetail.status === 'Overdue' ? 'text-error' : 'text-highlighted') : 'text-success'">
                {{ Number(row.original.feeDetail.balance) > 0 ? format(row.original.feeDetail.balance) : 'Cleared' }}
              </p>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div class="h-full rounded-full" :class="row.original.feeDetail.status === 'Overdue' ? 'bg-error' : 'bg-success'"
                  :style="{ width: `${feePaidPercent(row.original)}%` }" />
              </div>
            </div>
            <UBadge v-else size="sm" variant="subtle" :label="row.original.feeDetail.status"
              :color="parseFeeStatusColor[row.original.feeDetail.status] || 'neutral'" />
          </template>
          <span v-else class="text-muted">-</span>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #actions-cell="{ row }">
          <UButton @click="view(row.original)" size="sm" variant="ghost" color="neutral" class="cursor-pointer"
            icon="i-lucide-chevron-right" aria-label="Open student" />
        </template>
      </UTable>
      <div class="md:p-4  md:space-y-4"
        :class="tableView === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        
        <template v-if="loading">
          <div v-for="i in 6" :key="i">
            <div class="animate-pulse">
              <!-- Footer -->
              <div class="flex items-center justify-between gap-3 border-t border-default p-4">
                <div class="flex min-w-0 items-center gap-3">
                  <USkeleton class="size-10 shrink-0 rounded-full" />

                  <div class="min-w-0 space-y-2">
                    <USkeleton class="h-4 w-28 rounded-md" />
                    <USkeleton class="h-3 w-24 rounded-md" />
                  </div>
                </div>

                <USkeleton class="h-9 w-20 shrink-0 rounded-xl" />
              </div>
            </div>
          </div>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <div @click="view(item)" v-for="item in data" :key="item.id" class="cursor-pointer">
            <!-- Header -->
            <div class="border-b md:border md:rounded-2xl border-default p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar class="size-10 bg-white" :src="item.photo" :alt="`${item.givenNames} ${item.familyName}`"
                    loading="lazy" />

                  <div class="min-w-0">
                    <h3 class="truncate text-base font-bold text-highlighted">
                      {{ item.givenNames }} {{ item.familyName }}
                    </h3>

                    <div class="flex items-center gap-1 text-xs-base text-muted">
                      <span>
                        {{ item.admissionNumber || 'No Admission No' }}
                      </span>

                      <span>•</span>

                      <span>
                        {{ item.className || 'No Class' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-2 self-center">
                  <UBadge :label="parseStaus[item.status]"
                    :color="item.status === 'ACTIVE' ? 'success' : item.status === 'INACTIVE' ? 'warning' : 'error'"
                    variant="subtle" size="sm" />
                  <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <UCard class="col-span-full">
            <div class="flex flex-col items-center justify-center py-14">
              <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

              <p class="text-sm text-gray-500 dark:text-gray-400">No students found.</p>
            </div>
          </UCard>
        </template>
      </div>
      <template #footer>
        <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
