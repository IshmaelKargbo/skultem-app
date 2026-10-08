<template>
  <div class="space-y-4 px-4 md:px-6">
    <ReportCardSectionNav />
    <ReportCardParentView v-if="can(Role.PARENT)" />

    <ReportCardClassMasterOnly v-else>
    <!-- Header -->
    <Heading title="Report Cards" subtitle="Generate, preview and export student report cards.">
      <UButton icon="i-lucide-plus" label="Generate Report Cards" class="justify-center" to="/report-cards/generate" />
      <UButton v-if="!isTeacherOnly" icon="i-lucide-settings-2" variant="outline" label="Design" class="justify-center"
        to="/report-cards/templates" />
    </Heading>

    <!-- Stats -->
    <div v-if="!isTeacherOnly" class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      <Metric :record="{
        color: 'info',
        icon: 'i-lucide-file-text',
        label: 'Total Reports',
        value: stats?.total ?? 0,
        isReady: !loading
      }" />
      <Metric :record="{
        color: 'success',
        icon: 'i-lucide-check-circle',
        label: 'Passed',
        value: stats?.passed ?? 0,
        isReady: !loading
      }" />
      <Metric :record="{
        color: 'warning',
        icon: 'i-lucide-alert-circle',
        label: 'Needs Attention',
        value: stats?.failed ?? 0,
        isReady: !loading
      }" />

      <Metric :record="{
        color: 'primary',
        icon: 'i-lucide-download',
        label: 'Downloads',
        value: stats?.downloads ?? 0,
        isReady: !loading
      }" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex flex-1 items-center gap-2">
            <UInput v-model="searchInput" icon="i-lucide-search" placeholder="Search student..." class="flex-1" />
            <ReportCardFilterDrawer v-model:term-id="selectedTerm" v-model:class-id="selectedClass"
              v-model:level="level" v-model:section-id="sectionId" v-model:stream-id="streamId"
              :term-options="terms" :class-options="classes" :section-options="sectionOptions"
              :stream-options="streamOptions" :active-count="activeFilterCount" />
          </div>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="records" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-file-text" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No report cards match these filters.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #studentName-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar class="bg-white" :src="row.original.photo" :alt="row.original.studentName" size="md" loading="lazy" />
            <div class="space-y-1">
              <p class="font-medium text-highlighted">{{ row.original.studentName }}</p>
              <p class="text-xs text-muted">{{ row.original.admissionNumber || 'No Admission No' }}</p>
            </div>
          </div>
        </template>

        <template #className-cell="{ row }">
          <p class="text-sm">{{ row.original.className }}</p>
        </template>

        <template #termName-cell="{ row }">
          <div class="space-y-1">
            <p class="text-sm">{{ row.original.termName }}</p>
            <p v-if="row.original.scopeLabel" class="text-xs font-medium text-primary">{{ row.original.scopeLabel }}</p>
            <p v-else class="text-xs text-muted">{{ row.original.academicYearName }}</p>
          </div>
        </template>

        <template #average-cell="{ row }">
          <p class="font-semibold text-primary">{{ row.original.average.toFixed(1) }}%</p>
        </template>

        <template #overallGrade-cell="{ row }">
          <UBadge variant="subtle" color="neutral" :label="row.original.overallGrade || 'N/A'" />
        </template>

        <template #position-cell="{ row }">
          <p class="text-sm">{{ row.original.position ? ordinal(row.original.position) : 'N/A' }}</p>
        </template>

        <template #passed-cell="{ row }">
          <UBadge :label="row.original.passed ? 'Passed' : 'Attention'"
            :color="row.original.passed ? 'success' : 'warning'" variant="subtle" />
        </template>

        <template #actions-cell="{ row }">
          <UButton :to="`/report-cards/${row.original.id}`" size="sm" variant="ghost" color="success"
            :icon="VIEW_ICON" aria-label="Preview report card" />
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="loading && !records.length">
          <UCard v-for="i in 4" :key="i" class="overflow-hidden">
            <div class="animate-pulse space-y-2 p-4">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
          </UCard>
        </template>

        <UCard v-else-if="!records.length" class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14 text-center">
            <UIcon name="i-lucide-file-text" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />
            <h3 class="text-sm font-semibold text-highlighted">No report cards match these filters</h3>
            <p class="mt-1 text-xs text-muted">Try adjusting your search, clearing the filters, or generating new
              report cards.</p>
          </div>
        </UCard>

        <template v-else>
          <UCard v-for="item in records" :key="item.id" class="overflow-hidden rounded-xl" :ui="{ body: 'p-0' }">
            <NuxtLink :to="`/report-cards/${item.id}`" class="block">
              <div class="flex items-center gap-3 p-3">
                <UAvatar class="bg-white" :src="item.photo" :alt="item.studentName" size="md" loading="lazy" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-highlighted">{{ item.studentName }}</p>
                  <p class="truncate text-xs text-muted">{{ item.className }} · {{ item.termName }}</p>
                  <p v-if="item.scopeLabel" class="truncate text-xs font-medium text-primary">{{ item.scopeLabel }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-primary">{{ item.average.toFixed(1) }}%</p>
                  <p class="text-xs text-muted">Grade {{ item.overallGrade || 'N/A' }}</p>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-2 border-t border-default p-3 text-xs text-muted">
                <UBadge :label="item.passed ? 'Passed' : 'Attention'" :color="item.passed ? 'success' : 'warning'"
                  variant="subtle" />
                <span>Position: {{ item.position ? ordinal(item.position) : 'N/A' }}</span>
                <span v-if="item.downloadCount">
                  {{ item.downloadCount }} download{{ item.downloadCount === 1 ? '' : 's' }}
                </span>
              </div>
            </NuxtLink>
          </UCard>
        </template>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
    </ReportCardClassMasterOnly>

  </div>
</template>
<script setup lang="ts">
const { can } = useAuth()
const { classOptions: masterClasses, ensureLoaded: ensureClassMasterLoaded } = useClassMaster()
const route = useRoute()
const router = useRouter()
const reportCardStore = useReportCardStore()
const classStore = useClassStore()
const termStore = useTermStore()

const { records, meta, loading, stats } = storeToRefs(reportCardStore)

// Plain local refs seeded from the URL and mirrored back to it - same pattern as the class list.
const searchInput = ref(String(route.query.search ?? ''))
const view = ref<'table' | 'card'>('table')

const columns = [
  { accessorKey: 'studentName', header: 'Student' },
  { accessorKey: 'className', header: 'Class' },
  { accessorKey: 'termName', header: 'Term' },
  { accessorKey: 'average', header: 'Average' },
  { accessorKey: 'overallGrade', header: 'Grade' },
  { accessorKey: 'position', header: 'Position' },
  { accessorKey: 'passed', header: 'Status' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

const search = ref(searchInput.value)
const selectedTerm = ref(String(route.query.termId ?? ''))
const selectedClass = ref(String(route.query.classId ?? ''))
const level = ref(String(route.query.level ?? ''))
const sectionId = ref(String(route.query.sectionId ?? ''))
const streamId = ref(String(route.query.streamId ?? ''))

const sectionStore = useSectionStore()
const streamStore = useStreamStore()
const sectionOptions = computed(() => sectionStore.records.map(e => ({ label: e.name, value: e.id })))
const streamOptions = computed(() => streamStore.records.map(e => ({ label: e.name, value: e.id })))

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(() =>
  [selectedTerm.value, selectedClass.value, level.value, sectionId.value, streamId.value].filter(Boolean).length)

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = val }, 350)
})

// Management is everyone who isn't just a teacher; a teacher sees only the classes they're class master of.
const isTeacherOnly = computed(() =>
  can(Role.TEACHER) && !can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]))

const classes = computed(() => isTeacherOnly.value
  ? masterClasses.value
  : classStore.records.map(e => ({ label: e.name, value: e.id })))
const terms = computed(() => termStore.records.map(e => ({ label: e.name, value: e.id })))

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

function ordinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

async function fetchRecords() {
  if (can(Role.PARENT)) return

  // A class master's list is always one of their own classes - the API won't list across the school
  // for them - so start on their first class; changing selectedClass then triggers the fetch.
  if (isTeacherOnly.value && !selectedClass.value) {
    await ensureClassMasterLoaded()
    if (!masterClasses.value.length) return
    selectedClass.value = masterClasses.value[0]!.value
    return
  }

  await reportCardStore.fetchAll(page.value, size.value, {
    classId: selectedClass.value || undefined,
    termId: selectedTerm.value || undefined,
    search: search.value || undefined,
    level: level.value || undefined,
    sectionId: sectionId.value || undefined,
    streamId: streamId.value || undefined
  })
}

watch([page, size], fetchRecords, { immediate: true })

// A filter change goes back to page 1 and is mirrored into the URL (shareable link / refresh).
watch([search, selectedTerm, selectedClass, level, sectionId, streamId], () => {
  router.replace({
    query: {
      ...route.query,
      termId: selectedTerm.value || undefined,
      classId: selectedClass.value || undefined,
      level: level.value || undefined,
      sectionId: sectionId.value || undefined,
      streamId: streamId.value || undefined,
      page: 1
    }
  })

  if (page.value === 1) fetchRecords()
})

onMounted(() => {
  useAppStore().setTitle('Report Cards')
  document.title = 'Report Cards | Skultem'

  if (can(Role.PARENT)) return

  termStore.fetchAll(1, 100)
  sectionStore.fetchAll(0, 0)
  streamStore.fetchAll(0, 0)

  if (!isTeacherOnly.value) {
    classStore.fetchAll(1, 100)
    reportCardStore.fetchStats()
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
