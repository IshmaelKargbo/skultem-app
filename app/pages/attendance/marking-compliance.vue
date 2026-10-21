<template>
  <div class="space-y-3 px-4 md:px-6">
    <UCard :ui="{ body: 'px-4 py-3 sm:px-4 sm:py-3' }">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-1 items-center gap-2">
          <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label"
            placeholder="Active term" class="w-full" />
          <USelectMenu v-model="filters.threshold" :items="thresholds" value-key="value" label-key="label"
            class="w-full" />
        </div>
        <USwitch v-model="filters.belowOnly" :label="`Only below ${filters.threshold}%`" />
      </div>
    </UCard>

    <template v-if="loading">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric v-for="i in 4" :key="i" :record="{ label: '', value: '', isReady: false, icon: '', color: 'neutral' }" />
      </div>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <div class="hidden md:block">
          <TableLoading :size="5" />
        </div>
        <div class="md:hidden">
          <div v-for="i in 6" :key="i" class="space-y-2.5 border-b border-default px-4 py-3 last:border-0">
            <div class="flex items-center justify-between gap-3">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-12" />
            </div>
            <USkeleton class="h-3 w-44" />
            <USkeleton class="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </UCard>
    </template>

    <UCard v-else-if="!report">
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-calendar-x" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No term to check yet.</p>
        <p class="mt-1 text-xs text-muted">Set an active term for this academic year, or pick a term above.</p>
      </div>
    </UCard>

    <template v-else>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric :record="{ label: 'School Days So Far', value: report.schoolDays, isReady: true, icon: 'i-lucide-calendar-days', color: 'info', subtle: `${report.termName} · ${report.startDate} – ${report.asOf}` }" />
        <Metric :record="{ label: 'Fully Marked', value: `${fullyMarked} / ${report.classes.length}`, isReady: true, icon: 'i-lucide-circle-check', color: 'success', subtle: 'Classes with every day marked' }" />
        <Metric :record="{ label: `Below ${filters.threshold}%`, value: belowCount, isReady: true, icon: 'i-lucide-triangle-alert', color: belowCount ? 'error' : 'success', subtle: 'Classes to follow up' }" />
        <Metric :record="{ label: 'Overall Marked', value: `${overall}%`, isReady: true, icon: 'i-lucide-percent', color: 'primary', subtle: 'Of all class register days' }" />
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <UTable class="hidden md:block" :columns="columns" :data="rows">
          <template #empty>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="i-lucide-circle-check" class="text-4xl text-success" />
              <p class="text-muted">
                {{ filters.belowOnly ? `Every class is at ${filters.threshold}% or above.` : 'No classes found.' }}
              </p>
            </div>
          </template>

          <template #class-cell="{ row }">
            <p class="font-medium text-highlighted">{{ classLabel(row.original) }}</p>
          </template>

          <template #classMasters-cell="{ row }">
            <span v-if="row.original.classMasters.length">{{ row.original.classMasters.join(', ') }}</span>
            <UBadge v-else color="warning" variant="subtle" label="No class master" />
          </template>

          <template #marked-cell="{ row }">
            <div class="w-32">
              <div class="flex items-baseline justify-between gap-2">
                <p class="text-sm font-semibold tabular-nums"
                  :class="isBelow(row.original) ? 'text-error' : 'text-highlighted'">
                  {{ percentText(row.original) }}</p>
                <p v-if="row.original.percentage !== null" class="text-xs text-muted tabular-nums">
                  {{ row.original.markedDays }}/{{ row.original.schoolDays }}</p>
              </div>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div class="h-full rounded-full"
                  :class="isBelow(row.original) ? 'bg-error' : 'bg-success'"
                  :style="{ width: `${Math.min(100, row.original.percentage ?? 0)}%` }" />
              </div>
            </div>
          </template>

          <template #lastMarked-cell="{ row }">
            <span :class="row.original.lastMarked ? '' : 'text-error'">{{ row.original.lastMarked || 'Never' }}</span>
          </template>

          <template #missing-cell="{ row }">
            <span v-if="row.original.percentage === null" class="text-muted">-</span>
            <span v-else-if="!row.original.missingDays.length" class="text-success">None</span>
            <UPopover v-else :content="{ align: 'end' }">
              <UButton variant="soft" color="error" size="xs" trailing-icon="i-lucide-chevron-down"
                :label="`${row.original.missingDays.length} day${row.original.missingDays.length === 1 ? '' : 's'}`" />
              <template #content>
                <div class="max-h-72 w-56 overflow-y-auto p-3">
                  <p class="mb-2 text-xs font-medium text-muted">Not marked</p>
                  <ul class="space-y-1 text-sm tabular-nums">
                    <li v-for="day in row.original.missingDays" :key="day">{{ formatDay(day) }}</li>
                  </ul>
                </div>
              </template>
            </UPopover>
          </template>
        </UTable>

        <!-- Mobile list: one stacked row per class instead of five squeezed columns -->
        <div class="md:hidden">
          <div v-for="c in rows" :key="c.classSessionId" class="space-y-2.5 border-b border-default px-4 py-3 last:border-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ classLabel(c) }}</p>
                <p class="mt-0.5 truncate text-xs text-muted">
                  <span v-if="c.classMasters.length">{{ c.classMasters.join(', ') }}</span>
                  <span v-else class="text-warning">No class master</span>
                  · Last marked
                  <span :class="c.lastMarked ? '' : 'text-error'">{{ c.lastMarked || 'never' }}</span>
                </p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-bold tabular-nums" :class="isBelow(c) ? 'text-error' : 'text-highlighted'">
                  {{ percentText(c) }}</p>
                <p v-if="c.percentage !== null" class="text-xs text-muted tabular-nums">{{ c.markedDays }}/{{ c.schoolDays }} days</p>
              </div>
            </div>

            <div class="h-1.5 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full" :class="isBelow(c) ? 'bg-error' : 'bg-success'"
                :style="{ width: `${Math.min(100, c.percentage ?? 0)}%` }" />
            </div>

            <p v-if="c.percentage === null" class="text-xs text-muted">No students enrolled yet</p>
            <p v-else-if="!c.missingDays.length" class="text-xs text-success">Every school day marked</p>
            <UPopover v-else :content="{ align: 'start' }">
              <UButton variant="soft" color="error" size="xs" trailing-icon="i-lucide-chevron-down"
                :label="`${c.missingDays.length} day${c.missingDays.length === 1 ? '' : 's'} not marked`" />
              <template #content>
                <div class="max-h-72 w-56 overflow-y-auto p-3">
                  <p class="mb-2 text-xs font-medium text-muted">Not marked</p>
                  <ul class="space-y-1 text-sm tabular-nums">
                    <li v-for="day in c.missingDays" :key="day">{{ formatDay(day) }}</li>
                  </ul>
                </div>
              </template>
            </UPopover>
          </div>

          <div v-if="!rows.length" class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-circle-check" class="text-4xl text-success" />
            <p class="text-sm text-muted">
              {{ filters.belowOnly ? `Every class is at ${filters.threshold}% or above.` : 'No classes found.' }}
            </p>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()

type ClassMarking = AttendanceMarkingCompliance['classes'][number]

// termId '' = the year's active term (resolved on the server).
const filters = reactive({
  academicYearId: '',
  termId: '',
  threshold: 75,
  belowOnly: false
})

const thresholds = [50, 75, 90, 100].map(v => ({ label: `Threshold ${v}%`, value: v }))
const terms = computed(() => [
  { label: 'Active term', value: '' },
  ...termStore.records
    .filter(t => !filters.academicYearId || t.academicYear?.id === filters.academicYearId)
    .map(t => ({ label: t.name, value: t.id }))
])

const report = ref<AttendanceMarkingCompliance | null>(null)
const loading = ref(true)

const columns = [
  { id: 'class', header: 'Class' },
  { id: 'classMasters', header: 'Class Master' },
  { id: 'marked', header: 'Days Marked' },
  { id: 'lastMarked', header: 'Last Marked' },
  { id: 'missing', header: 'Missing', meta: { class: { th: 'text-right', td: 'text-right' } } }
]

const classLabel = (c: ClassMarking) => genderClassRowLabel(c)
const formatDay = (day: string) =>
  new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

// Worst first: the classes to chase are at the top.
const rows = computed(() => [...(report.value?.classes ?? [])]
  .filter(c => !filters.belowOnly || isBelow(c))
  // Classes with no students (nothing owed) go last.
  .sort((a, b) => (a.percentage ?? Infinity) - (b.percentage ?? Infinity)))

// A class with no students owes nothing: never "below", and left out of the tallies.
const isBelow = (c: ClassMarking) => c.percentage !== null && c.percentage < filters.threshold
const percentText = (c: ClassMarking) => c.percentage === null ? 'No students' : `${c.percentage}%`

const fullyMarked = computed(() =>
  report.value?.classes.filter(c => c.schoolDays > 0 && c.missingDays.length === 0).length ?? 0)
const belowCount = computed(() => report.value?.classes.filter(isBelow).length ?? 0)
// Every register day owed across all classes - each class from its own start.
const overall = computed(() => {
  const classes = report.value?.classes ?? []
  const owed = classes.reduce((sum, c) => sum + c.schoolDays, 0)
  if (!owed) return 0
  return Math.round(classes.reduce((sum, c) => sum + c.markedDays, 0) / owed * 1000) / 10
})

async function load() {
  if (!filters.academicYearId) return
  loading.value = true
  try {
    report.value = await AttendanceApi().getMarkingCompliance({
      academicYearId: filters.academicYearId,
      termId: filters.termId || undefined
    }) ?? null
  } finally {
    loading.value = false
  }
}

watch(() => [filters.academicYearId, filters.termId], load)

// A term from another year doesn't belong to the newly viewed one - fall back to its active term.
watch(() => filters.academicYearId, () => {
  if (filters.termId && !terms.value.some(t => t.value === filters.termId)) filters.termId = ''
})

// No year dropdown on this page: it follows the header's year switcher (viewing year).
watch(() => academicYearStore.viewingYearId || academicYearStore.activeYear?.id || '', (id) => { filters.academicYearId = id })

onMounted(async () => {
  useAppStore().setTitle('Marking Compliance')
  document.title = 'Marking Compliance | Attendance | Skultem'

  await Promise.all([academicYearStore.fetchAll(1, 100), termStore.fetchAll(1, 100)])
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''
  if (!filters.academicYearId) loading.value = false
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
