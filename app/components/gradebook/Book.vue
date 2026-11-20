<script setup lang="ts">
// The Grade Book: every student against every subject for one class section and term, from either source -
//  - Live marks: what subject teachers have submitted so far (fills in during the term), or
//  - Report cards: the frozen results from the generated report cards (what parents receive; what the broadsheet was).
// One page, one design, so there's a single place for a class's results.
const props = defineProps<{ sessionId: string, termId?: string, initialSource?: 'live' | 'cards' }>()

const { can } = useAuth()
// Report-card results need the Report Cards module; without it the page is live marks only.
const { isInstalled } = useModules()
const hasCards = computed(() => isInstalled(ModuleKey.REPORT_CARDS))

type Source = 'live' | 'cards'
const source = ref<Source>(props.initialSource ?? 'live')
watch(hasCards, (on) => { if (!on) source.value = 'live' }, { immediate: true })
const isCards = computed(() => source.value === 'cards')
const loading = ref(true)
const live = ref<Gradebook | null>(null)
const sheet = ref<Broadsheet | null>(null)
const sheetLoading = ref(false)
const sheetError = ref<string | null>(null)
// Which report cards: empty = the backend's default (full term, else the newest kind).
const scope = ref<string | undefined>()
const scopeOptions = computed(() => (sheet.value?.scopes ?? []).map(sc => ({
  label: `${sc.label} (${sc.cards} card${sc.cards === 1 ? '' : 's'})`, value: sc.key
})))
// What's on screen. With report cards chosen but none generated, the page says so (below) rather than switching.
const book = computed<Gradebook | null>(() =>
  isCards.value && sheet.value?.rows.length ? broadsheetToGradebook(sheet.value, live.value) : live.value)
const cardsReady = computed(() => isCards.value && !sheetLoading.value && !sheetError.value && !!sheet.value?.rows.length)

async function loadCards() {
  const l = live.value
  if (!l?.classId) return
  sheetLoading.value = true
  sheetError.value = null
  try {
    sheet.value = await ExamOfficeApi().broadsheet({
      classId: l.classId, termId: l.termId, sectionId: l.sectionId ?? undefined, streamId: l.streamId ?? undefined,
      scope: scope.value
    }) ?? null
    // Show the kind the backend picked, so the picker matches what's on screen.
    if (sheet.value?.scopeKey && scope.value !== sheet.value.scopeKey) scope.value = sheet.value.scopeKey
  } catch (err: any) {
    sheetError.value = err?.message || 'Couldn\'t load the report cards'
  } finally {
    sheetLoading.value = false
  }
}
watch(source, (s) => { if (s === 'cards' && !sheet.value && !sheetLoading.value) loadCards() })
watch(scope, (now, before) => { if (now && before && now !== before) loadCards() })
function printPage() {
  window.print()
}

type View = 'sheet' | 'students' | 'subjects'
const VIEWS = [
  { value: 'sheet' as View, label: 'Sheet', icon: 'i-lucide-table-2' },
  { value: 'students' as View, label: 'Students', icon: 'i-lucide-users' },
  { value: 'subjects' as View, label: 'Subjects', icon: 'i-lucide-book-open' }
]
const view = ref<View>('sheet')
const search = ref('')
const belowOnly = ref(false)
const sortBy = ref<'position' | 'name'>('position')

const openId = ref('')
const openStudent = computed(() => book.value?.students.find(s => s.studentId === openId.value) ?? null)
const detailOpen = computed({
  get: () => !!openId.value,
  set: (v: boolean) => { if (!v) openId.value = '' }
})

async function load() {
  loading.value = true
  sheet.value = null
  scope.value = undefined
  live.value = await GradebookApi().get(props.sessionId, props.termId)
  loading.value = false
  if (isCards.value) loadCards()
}
watch(() => [props.sessionId, props.termId], load)
onMounted(() => {
  // A phone gets the student cards; a wide screen the sheet.
  if (window.matchMedia('(max-width: 767px)').matches) view.value = 'students'
  load()
})

const passMark = computed(() => book.value?.passMark ?? 50)
const students = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = (book.value?.students ?? []).filter(s =>
    (!q || s.name.toLowerCase().includes(q) || (s.admissionNumber ?? '').toLowerCase().includes(q))
    && (!belowOnly.value || s.passed === false))
  return sortBy.value === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list
})
const belowCount = computed(() => (book.value?.students ?? []).filter(s => s.passed === false).length)
const classAverage = computed(() => {
  const a = (book.value?.students ?? []).map(s => s.average).filter((v): v is number => v != null)
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null
})
const assessmentsIn = computed(() => (book.value?.subjects ?? []).reduce((n, s) => n + s.submitted, 0))
const assessmentsTotal = computed(() => (book.value?.subjects ?? []).reduce((n, s) => n + s.assessments.length, 0))
const inShare = computed(() => assessmentsTotal.value ? assessmentsIn.value / assessmentsTotal.value : 0)
const RING = 2 * Math.PI * 42
const top = computed(() => book.value?.students.find(s => s.position === 1) ?? null)

const avgText = (v: number | null | undefined) => v == null ? '-' : `${gradebookNumber(v)}%`
const MEDAL = ['text-amber-500', 'text-slate-400', 'text-orange-700'] as const

// Per-student summaries, so 18-20 subjects stay readable.
const totalOf = (st: GradebookStudent, s: GradebookSubject) => st.subjects[s.teacherSubjectId]?.total ?? null
const withTotals = (st: GradebookStudent) => (book.value?.subjects ?? [])
  .map(subject => ({ subject, total: totalOf(st, subject) }))
  .filter((x): x is { subject: GradebookSubject, total: number } => x.total != null)
const subjectsWithTotal = (st: GradebookStudent) => withTotals(st).length
const passedCount = (st: GradebookStudent) => withTotals(st).filter(x => x.total >= passMark.value).length
const belowOf = (st: GradebookStudent) => withTotals(st).filter(x => x.total < passMark.value).length
const bestOf = (st: GradebookStudent) => withTotals(st).sort((a, b) => b.total - a.total)[0]
// Below the pass mark, worst first - the card names a few, then "+N more".
const failingOf = (st: GradebookStudent) => withTotals(st).filter(x => x.total < passMark.value)
  .sort((a, b) => a.total - b.total)
// Weakest first, then the ones with nothing in yet.
const sortedSubjects = (st: GradebookStudent) => [...(book.value?.subjects ?? [])].sort((a, b) =>
  (totalOf(st, a) ?? 1000) - (totalOf(st, b) ?? 1000))
</script>

<template>
  <div class="space-y-4">
    <!-- Loading / failed -->
    <GradebookSkeleton v-if="loading" />
    <div v-else-if="!book" class="rounded-3xl border border-default p-10 text-center">
      <UIcon name="i-lucide-cloud-off" class="mx-auto size-8 text-muted" />
      <p class="mt-2 text-sm font-medium text-highlighted">Couldn't load the grade book</p>
      <UButton class="mt-3" label="Try again" icon="i-lucide-refresh-cw" variant="soft" @click="load" />
    </div>

    <template v-else>
      <!-- Hero: the class, the term, and how far along the marks are. -->
      <section class="rounded-3xl border border-default bg-default p-5 md:p-6">
        <div class="flex flex-col gap-5 md:flex-row md:items-center">
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 text-xs font-medium text-muted">
              <UIcon name="i-lucide-calendar" class="size-3.5" />{{ book.termName }}
            </p>
            <h2 class="mt-2 truncate text-2xl font-extrabold tracking-tight text-highlighted md:text-3xl">{{ book.className }}</h2>
            <p class="mt-1 text-sm text-muted">
              Pass mark {{ book.passMark }}% ·
              <template v-if="cardsReady">from the <b class="text-highlighted">{{ sheet?.scopeLabel ?? 'Full term' }}</b> report
                cards<template v-if="sheet?.lastGeneratedAt">, generated {{ formatDate(sheet.lastGeneratedAt) }}</template></template>
              <template v-else>only submitted marks are shown</template>
            </p>
            <!-- The two sources of one Grade Book. -->
            <div v-if="hasCards" class="mt-3 inline-flex rounded-xl bg-elevated/70 p-0.5 print:hidden" role="tablist" aria-label="Source">
              <button v-for="o in [{ v: 'live', l: 'Live marks', i: 'i-lucide-activity' }, { v: 'cards', l: 'Report cards', i: 'i-lucide-file-text' }]"
                :key="o.v" type="button" role="tab" :aria-selected="source === o.v"
                class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                :class="source === o.v ? 'bg-default text-highlighted shadow-sm' : 'text-muted hover:text-highlighted'"
                @click="() => { source = o.v as Source }">
                <UIcon :name="o.i" class="size-3.5" />{{ o.l }}
              </button>
            </div>
          </div>
          <div v-if="cardsReady && scopeOptions.length > 1" class="print:hidden">
            <p class="mb-1 text-xs text-muted">Which report cards</p>
            <USelectMenu v-model="scope" :items="scopeOptions" value-key="value" class="w-60" />
          </div>
          <div v-if="!isCards" class="flex items-center gap-3">
            <div class="relative size-24 shrink-0" role="img"
              :aria-label="`${assessmentsIn} of ${assessmentsTotal} assessments submitted`">
              <svg viewBox="0 0 100 100" class="size-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke-width="8" stroke="currentColor" class="text-elevated" />
                <circle cx="50" cy="50" r="42" fill="none" stroke-width="8" stroke-linecap="round" stroke="currentColor"
                  :class="inShare >= 1 ? 'text-success' : 'text-primary'"
                  :stroke-dasharray="RING" :stroke-dashoffset="RING * (1 - inShare)" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span class="text-xl font-extrabold text-highlighted">{{ assessmentsIn }}/{{ assessmentsTotal }}</span>
                <span class="mt-1 text-[10px] uppercase tracking-wide text-muted">in</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-y-4 border-t border-default pt-4 lg:grid-cols-4 lg:divide-x lg:divide-default">
          <div class="lg:px-4 lg:first:pl-0">
            <p class="text-xs text-muted">Class average</p>
            <p class="text-xl font-extrabold" :class="gradebookTone(classAverage, passMark).text">{{ avgText(classAverage) }}</p>
          </div>
          <div class="lg:px-4 lg:first:pl-0">
            <p class="text-xs text-muted">Students</p>
            <p class="text-xl font-extrabold text-highlighted">{{ book.students.length }}</p>
          </div>
          <div class="lg:px-4 lg:first:pl-0">
            <p class="text-xs text-muted">Top of the class</p>
            <p class="truncate text-base font-bold text-highlighted">{{ top?.name ?? '-' }}</p>
            <p v-if="top" class="text-xs text-muted">{{ avgText(top.average) }} average</p>
          </div>
          <button type="button" class="text-left lg:px-4"
            @click="() => { belowOnly = !belowOnly }">
            <p class="text-xs text-muted">Below the pass mark</p>
            <p class="text-xl font-extrabold" :class="belowCount ? 'text-error' : 'text-highlighted'">{{ belowCount }}</p>
            <p class="text-xs text-muted">{{ belowOnly ? 'Showing only these' : 'Tap to show only these' }}</p>
          </button>
        </div>
      </section>

      <!-- Toolbar: the view, search and filters. -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center">
        <div class="flex rounded-2xl bg-elevated/70 p-1" role="tablist" aria-label="View">
          <button v-for="v in VIEWS" :key="v.value" type="button" role="tab" :aria-selected="view === v.value"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition md:flex-none"
            :class="view === v.value ? 'bg-default text-highlighted shadow-sm' : 'text-muted hover:text-highlighted'"
            @click="() => { view = v.value }">
            <UIcon :name="v.icon" class="size-4" />{{ v.label }}
          </button>
        </div>
        <div v-if="view !== 'subjects'" class="flex flex-1 items-center gap-2 md:justify-end">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search students" class="flex-1 md:max-w-64" />
          <UButton icon="i-lucide-circle-alert" :label="belowOnly ? 'Below pass' : undefined" :aria-label="'Below the pass mark only'"
            :color="belowOnly ? 'error' : 'neutral'" :variant="belowOnly ? 'soft' : 'outline'" @click="() => { belowOnly = !belowOnly }" />
          <USelect v-model="sortBy" :items="[{ label: 'By position', value: 'position' }, { label: 'By name', value: 'name' }]"
            class="w-36" />
          <UButton icon="i-lucide-printer" color="neutral" variant="outline" aria-label="Print" class="hidden md:flex"
            @click="printPage" />
        </div>
      </div>

      <GradebookSkeleton v-if="isCards && sheetLoading" table-only />
      <div v-else-if="isCards && sheetError" class="rounded-3xl border border-default p-10 text-center">
        <UIcon name="i-lucide-alert-triangle" class="mx-auto size-8 text-error" />
        <p class="mt-2 text-sm font-medium text-highlighted">Couldn't load the report cards</p>
        <p class="mt-1 text-xs text-muted">{{ sheetError }}</p>
        <UButton class="mt-3" label="Try again" icon="i-lucide-refresh-cw" variant="soft" @click="loadCards" />
      </div>
      <div v-else-if="isCards && !sheet?.rows.length" class="rounded-3xl border border-dashed border-default p-10 text-center">
        <UIcon name="i-lucide-file-x" class="mx-auto size-8 text-muted" />
        <p class="mt-2 text-sm font-medium text-highlighted">No report cards for this class and term yet</p>
        <p class="mx-auto mt-1 max-w-md text-xs text-muted">Report-card results appear here once report cards are generated
          for this term. Until then, Live marks shows what teachers have submitted.</p>
        <div class="mt-3 flex flex-wrap justify-center gap-2">
          <UButton label="Show live marks" icon="i-lucide-activity" variant="soft" @click="() => { source = 'live' }" />
          <UButton v-if="can([Role.ADMIN, Role.SUPER_ADMIN])" to="/report-cards/generate" label="Generate report cards"
            icon="i-lucide-file-plus" color="neutral" variant="soft" />
        </div>
      </div>
      <div v-else-if="!book.subjects.length || !book.students.length" class="rounded-3xl border border-dashed border-default p-10 text-center">
        <UIcon name="i-lucide-book-dashed" class="mx-auto size-8 text-muted" />
        <p class="mt-2 text-sm text-muted">Nothing to show yet - no assessments are open for this class this term.</p>
      </div>

      <!-- Sheet: built for 18-20 subjects - short subject codes, the average beside the name, and the student
           columns and heading row staying put while the marks scroll either way. -->
      <section v-else-if="view === 'sheet'" class="overflow-hidden rounded-3xl border border-default bg-default">
        <div class="max-h-[70vh] overflow-auto">
          <table class="w-full min-w-max border-separate border-spacing-0 text-sm">
            <thead>
              <tr class="text-left">
                <th class="sticky left-0 top-0 z-30 w-10 min-w-10 max-w-10 border-b border-default bg-elevated px-3 py-2.5 text-xs font-semibold text-muted">#</th>
                <th class="sticky left-10 top-0 z-30 w-52 min-w-52 max-w-52 border-b border-default bg-elevated px-3 py-2.5 text-xs font-semibold text-muted">Student</th>
                <th class="sticky left-62 top-0 z-30 border-b border-r border-default bg-elevated px-3 py-2.5 text-center text-xs font-semibold text-muted">Avg</th>
                <th v-for="s in book.subjects" :key="s.teacherSubjectId"
                  class="sticky top-0 z-20 border-b border-default bg-elevated px-1 py-2 text-center">
                  <UTooltip :text="isCards ? s.name : `${s.name} · ${s.teacher ?? 'No teacher'} · ${s.submitted} of ${s.assessments.length} submitted`">
                    <span class="inline-flex flex-col items-center gap-1">
                      <span class="whitespace-nowrap text-[11px] font-bold tracking-wide text-highlighted">{{ subjectShort(s) }}</span>
                      <span v-if="!isCards" class="h-0.5 w-7 overflow-hidden rounded-full bg-default">
                        <span class="block h-full rounded-full" :class="s.submitted === s.assessments.length ? 'bg-success' : 'bg-primary'"
                          :style="{ width: `${s.assessments.length ? s.submitted / s.assessments.length * 100 : 0}%` }" />
                      </span>
                    </span>
                  </UTooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="st in students" :key="st.studentId" class="group cursor-pointer"
                @click="() => { openId = st.studentId }">
                <td class="sticky left-0 z-10 w-10 min-w-10 max-w-10 border-b border-default bg-default px-3 py-2 group-hover:bg-elevated">
                  <UIcon v-if="(st.position ?? 99) <= 3" name="i-lucide-medal" class="size-4" :class="MEDAL[(st.position ?? 1) - 1]" />
                  <span v-else class="text-xs font-semibold text-muted">{{ st.position ?? '-' }}</span>
                </td>
                <td class="sticky left-10 z-10 w-52 min-w-52 max-w-52 border-b border-default bg-default px-3 py-2 group-hover:bg-elevated">
                  <div class="flex items-center gap-2">
                    <UAvatar :src="st.photo || undefined" :alt="st.name" size="xs" />
                    <span class="min-w-0">
                      <span class="block truncate font-medium text-highlighted">{{ st.name }}</span>
                      <span v-if="st.admissionNumber" class="block truncate text-[10px] text-muted">{{ st.admissionNumber }}</span>
                    </span>
                  </div>
                </td>
                <td class="sticky left-62 z-10 border-b border-r border-default bg-default px-3 py-2 text-center group-hover:bg-elevated">
                  <span class="font-extrabold" :class="gradebookTone(st.average, passMark).text">{{ gradebookNumber(st.average) }}</span>
                </td>
                <td v-for="s in book.subjects" :key="s.teacherSubjectId"
                  class="border-b border-default px-1 py-2 text-center group-hover:bg-elevated/60">
                  <UTooltip v-if="st.subjects[s.teacherSubjectId]?.total != null"
                    :text="`${s.name}: ${gradebookNumber(st.subjects[s.teacherSubjectId]?.total)}${st.subjects[s.teacherSubjectId]?.grade ? ` (${st.subjects[s.teacherSubjectId]?.grade})` : ''}`">
                    <span class="inline-flex min-w-9 justify-center rounded-md px-1 py-0.5 text-xs font-bold"
                      :class="gradebookTone(st.subjects[s.teacherSubjectId]?.total, passMark).soft">
                      {{ gradebookNumber(st.subjects[s.teacherSubjectId]?.total) }}
                    </span>
                  </UTooltip>
                  <span v-else class="text-muted">·</span>
                </td>
              </tr>
              <tr v-if="!students.length">
                <td :colspan="book.subjects.length + 3" class="px-4 py-8 text-center text-sm text-muted">No student matches.</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="sticky bottom-0 left-0 z-20 border-t border-default bg-elevated px-3 py-2.5" />
                <td class="sticky bottom-0 left-10 z-20 border-t border-default bg-elevated px-3 py-2.5 text-xs font-semibold text-muted">Class average</td>
                <td class="sticky bottom-0 left-62 z-20 border-r border-t border-default bg-elevated px-3 py-2.5 text-center text-sm font-extrabold"
                  :class="gradebookTone(classAverage, passMark).text">{{ gradebookNumber(classAverage) }}</td>
                <td v-for="s in book.subjects" :key="s.teacherSubjectId"
                  class="sticky bottom-0 z-10 border-t border-default bg-elevated px-1 py-2.5 text-center text-xs font-bold"
                  :class="gradebookTone(s.classAverage, passMark).text">{{ gradebookNumber(s.classAverage) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="border-t border-default px-4 py-2 text-[11px] text-muted">
          Hover a subject code or a mark for the full name. Click a student for every subject and assessment.
        </p>
      </section>

      <!-- Students: every card the same size whether a student takes 6 subjects or 20 - the average, one thin bar
           per subject, and in words only how many passed, the best, and the few below the pass mark. -->
      <div v-else-if="view === 'students'" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <button v-for="st in students" :key="st.studentId" type="button"
          class="rounded-3xl border bg-default p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          :class="st.passed === false ? 'border-error/30' : 'border-default'" @click="() => { openId = st.studentId }">
          <div class="flex items-center gap-3">
            <div class="relative shrink-0">
              <UAvatar :src="st.photo || undefined" :alt="st.name" size="lg" />
              <span class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-default text-[10px] font-bold ring-1 ring-default"
                :class="(st.position ?? 99) <= 3 ? MEDAL[(st.position ?? 1) - 1] : 'text-muted'">{{ st.position ?? '-' }}</span>
            </div>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-highlighted">{{ st.name }}</span>
              <span v-if="st.admissionNumber" class="block truncate text-xs text-muted">{{ st.admissionNumber }}</span>
            </span>
            <span class="text-2xl font-extrabold" :class="gradebookTone(st.average, passMark).text">{{ avgText(st.average) }}</span>
          </div>
          <div class="mt-3 flex h-[18px] items-end gap-px" :aria-label="`${passedCount(st)} of ${subjectsWithTotal(st)} subjects passed`">
            <span v-for="s in book.subjects" :key="s.teacherSubjectId" class="flex-1 rounded-sm"
              :class="gradebookBar(st.subjects[s.teacherSubjectId]?.total, passMark)"
              :style="{ height: `${Math.max(20, Math.min(100, st.subjects[s.teacherSubjectId]?.total ?? 0))}%` }"
              :title="`${s.name}: ${gradebookNumber(st.subjects[s.teacherSubjectId]?.total)}`" />
          </div>
          <p class="mt-2 truncate text-xs text-muted">
            <b class="text-highlighted">{{ passedCount(st) }}</b>/{{ subjectsWithTotal(st) }} passed
            <template v-if="bestOf(st)"> · Best <b class="text-success">{{ subjectShort(bestOf(st)!.subject) }} {{ gradebookNumber(bestOf(st)!.total) }}</b></template>
          </p>
          <p class="truncate text-xs font-semibold"
            :class="failingOf(st).length ? 'text-error' : subjectsWithTotal(st) ? 'text-success' : 'text-muted'">
            <template v-if="failingOf(st).length">
              Below pass: {{ failingOf(st).slice(0, 3).map(f => `${subjectShort(f.subject)} ${gradebookNumber(f.total)}`).join(' · ') }}<template
                v-if="failingOf(st).length > 3"> · +{{ failingOf(st).length - 3 }} more</template>
            </template>
            <template v-else-if="subjectsWithTotal(st)">Every subject passed</template>
            <template v-else>No marks submitted yet</template>
          </p>
        </button>
        <p v-if="!students.length" class="col-span-full py-8 text-center text-sm text-muted">No student matches.</p>
      </div>

      <!-- Subjects -->
      <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="s in book.subjects" :key="s.teacherSubjectId" class="rounded-3xl border border-default bg-default p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-semibold text-highlighted">{{ s.name }}</p>
              <p class="truncate text-xs text-muted">{{ s.teacher ?? 'No teacher' }}</p>
            </div>
            <span class="text-2xl font-extrabold" :class="gradebookTone(s.classAverage, passMark).text">
              {{ s.classAverage == null ? '-' : `${gradebookNumber(s.classAverage)}%` }}</span>
          </div>
          <div v-if="!isCards" class="mt-3 flex items-center gap-2 text-xs text-muted">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full" :class="s.submitted === s.assessments.length ? 'bg-success' : 'bg-primary'"
                :style="{ width: `${s.assessments.length ? s.submitted / s.assessments.length * 100 : 0}%` }" />
            </div>
            {{ s.submitted }}/{{ s.assessments.length }} in
          </div>
          <div class="mt-3 space-y-1.5">
            <div v-for="a in s.assessments" :key="a.id" class="flex items-center justify-between gap-2 text-sm">
              <span class="truncate text-default">{{ a.name }}<span v-if="a.weight != null" class="text-xs text-muted"> · {{ a.weight }}%</span></span>
              <UBadge variant="subtle" size="sm" :color="GRADEBOOK_STATUS[a.status].color">{{ GRADEBOOK_STATUS[a.status].label }}</UBadge>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- One student in full -->
    <UModal v-model:open="detailOpen">
      <template #content>
        <div v-if="openStudent && book" class="max-h-[85vh] overflow-y-auto">
          <div class="border-b border-default p-5">
            <div class="flex items-center gap-4">
              <UAvatar :src="openStudent.photo || undefined" :alt="openStudent.name" size="xl" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-lg font-bold text-highlighted">{{ openStudent.name }}</p>
                <p class="text-xs text-muted">
                  {{ [openStudent.admissionNumber, openStudent.position ? `Position ${openStudent.position} of ${book.students.length}` : null].filter(Boolean).join(' · ') }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-extrabold" :class="gradebookTone(openStudent.average, passMark).text">{{ avgText(openStudent.average) }}</p>
                <p class="text-[11px] text-muted">average</p>
              </div>
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Close" @click="() => { openId = '' }" />
            </div>
          </div>
          <div class="p-5">
            <div class="mb-4 flex flex-wrap gap-2 text-xs">
              <span class="rounded-full bg-elevated px-2.5 py-1"><b class="text-highlighted">{{ passedCount(openStudent) }}</b> of {{ subjectsWithTotal(openStudent) }} subjects passed</span>
              <span v-if="belowOf(openStudent)" class="rounded-full bg-error/10 px-2.5 py-1 text-error"><b>{{ belowOf(openStudent) }}</b> below the pass mark</span>
              <span v-if="book.subjects.length > subjectsWithTotal(openStudent)" class="rounded-full bg-elevated px-2.5 py-1 text-muted">
                {{ book.subjects.length - subjectsWithTotal(openStudent) }} with nothing submitted yet</span>
            </div>
            <!-- Weakest first: what needs attention is at the top. -->
            <div class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div v-for="s in sortedSubjects(openStudent)" :key="s.teacherSubjectId">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate text-sm font-semibold text-highlighted" :title="s.name">{{ s.name }}</p>
                  <span class="flex shrink-0 items-center gap-1.5">
                    <span v-if="openStudent.subjects[s.teacherSubjectId]?.grade" class="rounded-md px-1.5 text-xs font-bold"
                      :class="gradebookTone(openStudent.subjects[s.teacherSubjectId]?.total, passMark).soft">
                      {{ openStudent.subjects[s.teacherSubjectId]?.grade }}</span>
                    <span class="font-extrabold" :class="gradebookTone(openStudent.subjects[s.teacherSubjectId]?.total, passMark).text">
                      {{ gradebookNumber(openStudent.subjects[s.teacherSubjectId]?.total) }}</span>
                  </span>
                </div>
                <div class="mt-1 h-1 overflow-hidden rounded-full bg-elevated">
                  <div class="h-full rounded-full" :class="gradebookBar(openStudent.subjects[s.teacherSubjectId]?.total, passMark)"
                    :style="{ width: `${Math.min(100, openStudent.subjects[s.teacherSubjectId]?.total ?? 0)}%` }" />
                </div>
                <p class="mt-1 truncate text-[11px] text-muted">
                  <template v-for="(a, i) in s.assessments" :key="a.id">
                    <template v-if="i"> · </template>{{ a.name }}
                    <template v-if="a.status === 'NOT_SUBMITTED'">-</template>
                    <b v-else class="text-highlighted">{{ openStudent.subjects[s.teacherSubjectId]?.scores[a.id] ?? '-' }}</b>
                    <template v-if="a.status === 'SUBMITTED'">*</template>
                  </template>
                </p>
              </div>
            </div>
            <p class="mt-4 text-[11px] text-muted">* awaiting approval · - not submitted yet</p>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
