<template>
  <div class="space-y-4 px-4 sm:px-6">
    <AcademicsSectionNav />

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <!-- Same header as Classes: add, search, filters, view -->
      <template #header>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex flex-1 items-center gap-2">
            <UButton color="primary" label="Add Template" :icon="ADD_ICON" class="hidden md:flex"
              to="/academics/template-setup" />
            <UButton color="primary" :icon="ADD_ICON" class="md:hidden" to="/academics/template-setup"
              aria-label="Add assessment template" />
            <div class="flex flex-1 items-center gap-2">
              <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search by name or description"
                class="flex-1" />
              <AcademicsAssessmentTemplateFilterDrawer v-model:status="status" v-model:scoring="scoring"
                :active-count="activeFilterCount" />
            </div>
          </div>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <div v-if="sharedNotes.length && !loading"
        class="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-default bg-elevated/30 px-4 py-2 text-xs text-muted">
        <UIcon name="lucide:info" class="size-3.5" />
        <span v-for="(n, i) in sharedNotes" :key="n">{{ n }}<span v-if="i < sharedNotes.length - 1"> ·</span></span>
      </div>

      <!-- Table -->
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="filtered" :loading="loading">
        <template #name-cell="{ row }">
          <button type="button" class="block max-w-64 text-left" @click="openView(row.original)">
            <p class="truncate font-medium text-highlighted">{{ row.original.name }}</p>
            <p class="truncate text-xs text-muted">{{ row.original.description || 'No description' }}</p>
          </button>
        </template>

        <template #assessments-cell="{ row }">
          <div class="w-52 space-y-1.5">
            <AcademicsAssessmentTemplateWeightBar :items="itemsOf(row.original)" compact />
            <p class="truncate text-xs text-muted" :title="summaryOf(row.original)">{{ summaryOf(row.original) }}</p>
          </div>
        </template>

        <template #scoring-cell="{ row }">
          <div class="space-y-1">
            <UBadge variant="subtle" :color="isCa(row.original) ? 'primary' : 'neutral'"
              :label="scoringLabel(row.original)" />
            <p v-if="(row.original.startsInTerm ?? 1) > 1" class="flex items-center gap-1 text-[11px] text-primary">
              <UIcon name="lucide:calendar-range" class="size-3" /> From term {{ row.original.startsInTerm }}
            </p>
            <div v-if="isCa(row.original)" class="flex flex-wrap items-center gap-1 text-[11px] text-muted">
              <span v-if="row.original.scoring?.parts">{{ row.original.scoring.parts }} parts</span>
              <span v-if="row.original.scoring?.attendance" class="flex items-center gap-0.5 text-info">
                <UIcon name="lucide:calendar-check" class="size-3" /> attendance
              </span>
              <span v-if="row.original.scoring?.inherited">· school-wide</span>
            </div>
          </div>
        </template>

        <template #passMark-cell="{ row }">
          <span class="font-medium">{{ row.original.passMark }}%</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge variant="subtle" :color="statusColor(calculateTotal(row.original.assessments))"
            :label="statusLabel(calculateTotal(row.original.assessments))" />
        </template>

        <template #updatedAt-cell="{ row }">
          <span class="text-sm text-muted">{{ formatDate(row.original.updatedAt) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-1">
            <UButton size="sm" variant="ghost" color="success" :icon="VIEW_ICON" aria-label="View template"
              @click="openView(row.original)" />
            <UDropdownMenu :items="getRowItems(row.original)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="sm" variant="ghost"
                aria-label="More actions" />
            </UDropdownMenu>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">
              {{ hasActiveFilters ? 'No template matches your search or filters.' : 'No assessment templates yet.' }}
            </p>
            <UButton v-if="!hasActiveFilters" label="Add the first template" icon="i-lucide-plus" size="sm"
              to="/academics/template-setup" />
          </div>
        </template>
      </UTable>

      <!-- Phone list (table view) and card grid (card view) -->
      <div class="md:p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="space-y-3 border-b border-default p-3 md:rounded-2xl md:border">
            <USkeleton class="h-4 w-36" />
            <USkeleton class="h-3 w-48" />
            <USkeleton class="h-2.5 w-full rounded-full" />
          </div>
        </template>

        <template v-else-if="filtered.length">
          <div v-for="item in filtered" :key="item.id"
            class="cursor-pointer space-y-3 border-b border-default p-3 last:border-0 md:last:border md:rounded-2xl md:border md:p-4 md:hover:shadow-md"
            @click="openView(item)">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted">{{ item.name }}</p>
                <p class="line-clamp-1 text-xs text-muted">{{ item.description || 'No description' }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-1" @click.stop>
                <UBadge size="sm" variant="subtle" :color="statusColor(calculateTotal(item.assessments))"
                  :label="statusLabel(calculateTotal(item.assessments))" />
                <UDropdownMenu :items="getRowItems(item)" :content="{ align: 'end' }">
                  <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="xs" variant="ghost"
                    aria-label="More actions" />
                </UDropdownMenu>
              </div>
            </div>

            <AcademicsAssessmentTemplateWeightBar :items="itemsOf(item)" compact />
            <p class="truncate text-xs text-muted">{{ summaryOf(item) }}</p>

            <div class="flex flex-wrap items-center gap-1.5">
              <UBadge size="sm" variant="subtle" :color="isCa(item) ? 'primary' : 'neutral'"
                :label="scoringLabel(item)" />
              <UBadge size="sm" variant="outline" color="neutral" :label="`Pass ${item.passMark}%`" />
              <UBadge v-if="item.scoring?.attendance" size="sm" variant="subtle" color="info"
                icon="lucide:calendar-check" label="Attendance" />
              <UBadge v-if="(item.startsInTerm ?? 1) > 1" size="sm" variant="subtle" color="primary"
                icon="lucide:calendar-range" :label="`From term ${item.startsInTerm}`" />
            </div>
          </div>
        </template>

        <div v-else class="col-span-full flex flex-col items-center justify-center py-14">
          <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No template matches your search or filters.' : 'No assessment templates yet.' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <AcademicsAssessmentTemplateView v-model:open="viewOpen" :template="selected" @edit="editTemplate"
      @delete="askDelete(selected)" />

    <!-- Delete -->
    <UModal v-model:open="deleteOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Delete {{ toDelete?.name }}?</h3>
          </template>
          <div class="space-y-3">
            <UAlert color="warning" variant="soft" icon="lucide:triangle-alert"
              title="This removes the template, its tests and its scoring setup"
              description="A template that classes use, or that has been used to record assessments, can't be deleted - you'll be told why. This can't be undone." />
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton class="flex w-full items-center justify-center" label="Cancel" variant="soft"
                :disabled="deleting" @click="deleteOpen = false" />
              <UButton class="flex w-full items-center justify-center" label="Delete template" color="error"
                icon="lucide:trash-2" :loading="deleting" @click="confirmDelete" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useAssessmentStore()
const { success } = useNotify()

const { records: data, meta, loading } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

function calculateTotal(assessments: Assessment[]) {
  return assessments?.reduce((sum, item) => sum + item.weight, 0) || 0
}
function statusColor(total: number) {
  if (total === 100) return 'success'
  if (total > 100) return 'error'
  return 'warning'
}
function statusLabel(total: number) {
  if (total === 100) return 'Balanced'
  if (total > 100) return 'Overweighted'
  return 'Incomplete'
}

const itemsOf = (t: AssessmentTemplate) => [...(t.assessments ?? [])]
  .sort((a, b) => a.position - b.position).map(a => ({ name: a.name, weight: a.weight }))
const summaryOf = (t: AssessmentTemplate) => {
  const items = itemsOf(t)
  return items.length ? items.map(i => `${i.name} ${i.weight}%`).join(' · ') : 'No tests added yet'
}
const isCa = (t: AssessmentTemplate) => t.scoring?.structure === 'CA_AND_TEST'
const scoringLabel = (t: AssessmentTemplate) => !isCa(t) ? 'Simple scores'
  : t.scoring!.caTests ? `CA on ${t.scoring!.caTests} test${t.scoring!.caTests === 1 ? '' : 's'}`
  : t.scoring!.caPercentage === 0 ? 'CA monitoring'
    : `CA ${t.scoring!.caPercentage}% · Test ${t.scoring!.formalPercentage}%`

// --- Columns follow the data: one that says the same thing on every row is dropped and noted once instead ---
const rows = computed<AssessmentTemplate[]>(() => data.value ?? [])
const many = computed(() => rows.value.length > 1)
const allSame = (pick: (t: AssessmentTemplate) => unknown) => new Set(rows.value.map(pick)).size === 1

const anyCa = computed(() => rows.value.some(isCa))
const anyLateStart = computed(() => rows.value.some(t => (t.startsInTerm ?? 1) > 1))
// Scoring only earns a column once some template does more than plain scores (or starts later in the year).
const showScoring = computed(() => !rows.value.length || anyCa.value || anyLateStart.value)
const samePassMark = computed(() => many.value && allSame(t => t.passMark))
const allBalanced = computed(() => many.value && rows.value.every(t => calculateTotal(t.assessments) === 100))
const sameUpdated = computed(() => many.value && allSame(t => String(t.updatedAt ?? '').slice(0, 10)))

const columns = computed(() => [
  { id: 'name', header: 'Template' },
  { id: 'assessments', header: 'Tests & weights' },
  ...(showScoring.value ? [{ id: 'scoring', header: 'Scoring' }] : []),
  ...(samePassMark.value ? [] : [{ id: 'passMark', header: 'Pass mark' }]),
  ...(allBalanced.value ? [] : [{ id: 'status', header: 'Status' }]),
  ...(sameUpdated.value ? [] : [{ id: 'updatedAt', header: 'Updated' }]),
  { id: 'actions', header: '', meta: { class: { td: 'text-right' } } }
])

// What the dropped columns would have said, once.
const sharedNotes = computed(() => {
  const notes: string[] = []
  if (samePassMark.value) notes.push(`Pass mark ${rows.value[0]!.passMark}% for all`)
  if (allBalanced.value) notes.push('All tests total 100%')
  if (!showScoring.value && rows.value.length) notes.push('Simple scores for all')
  return notes
})

// --- Search + filters (applied to the page of templates on screen) ---
const search = ref('')
const status = ref('')
const scoring = ref('')

const activeFilterCount = computed(() => [status.value, scoring.value].filter(Boolean).length)
const hasActiveFilters = computed(() => !!search.value.trim() || activeFilterCount.value > 0)

const filtered = computed(() => {
  const text = search.value.trim().toLowerCase()
  return (data.value ?? []).filter((t: AssessmentTemplate) => {
    if (status.value && statusLabel(calculateTotal(t.assessments)) !== status.value) return false
    if (scoring.value === 'SIMPLE' && isCa(t)) return false
    if (scoring.value === 'CA' && !isCa(t)) return false
    if (scoring.value === 'ATTENDANCE' && !t.scoring?.attendance) return false
    return !text || t.name?.toLowerCase().includes(text) || t.description?.toLowerCase().includes(text)
  })
})

// --- View / edit / delete ---
const selected = ref<AssessmentTemplate | null>(null)
const viewOpen = ref(false)
function openView(t: AssessmentTemplate) {
  selected.value = t
  viewOpen.value = true
}

// Tests and scoring are edited on the template's own page (step 2 = tests, step 3 = scoring).
function editTemplate(step: number, t: AssessmentTemplate | null = selected.value) {
  if (t) navigateTo(`/academics/template-setup?id=${t.id}&step=${step}`)
}

const toDelete = ref<AssessmentTemplate | null>(null)
const deleteOpen = ref(false)
const deleting = ref(false)
function askDelete(t: AssessmentTemplate | null) {
  if (!t) return
  toDelete.value = t
  viewOpen.value = false
  deleteOpen.value = true
}
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    if (await AssessmentApi().deleteTemplate(toDelete.value.id)) {
      success(`${toDelete.value.name} deleted`)
      deleteOpen.value = false
      await fetchRecord()
    }
  } finally {
    deleting.value = false
  }
}

function getRowItems(t: AssessmentTemplate) {
  return [
    [{ label: 'View', icon: 'i-lucide-eye', onSelect: () => openView(t) }],
    [
      { label: t.assessments?.length ? 'Edit tests' : 'Add tests', icon: 'i-lucide-clipboard-list', onSelect: () => editTemplate(1, t) },
      { label: 'Scoring (CA)', icon: 'i-lucide-sliders-horizontal', onSelect: () => editTemplate(2, t) }
    ],
    [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => askDelete(t) }]
  ]
}

// --- Paging ---
const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})
const size = ref(runtimeConf().limit)

async function fetchRecord() {
  await store.fetchAll(page.value, size.value)
}

onMounted(async () => {
  updateQuery({ page: page.value })
  useAppStore().setTitle('Assessment Templates')
  document.title = 'Assessment Templates | Academics | Skultem'
  fetchRecord()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})

watch(() => [page.value, size.value], () => { fetchRecord() })
</script>
