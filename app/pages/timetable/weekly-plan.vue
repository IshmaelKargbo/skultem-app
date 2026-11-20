<!-- Weekly plan: a class's school term split into its weeks, laid out like the timetable (weekdays across,
     sessions down), a subject in each session (e.g. Morning and After break). Leadership auto-fills, edits and
     publishes; teachers look; parents see their child's published plan for this week and next.
     A plan can repeat: plan e.g. 4 weeks (one month) by weekday and it is repeated over the whole term. -->
<template>
  <div class="space-y-3 px-4 md:px-6">
    <!-- Parents -->
    <template v-if="isParent">
      <Heading title="Weekly plan" subtitle="What your child's class is learning this week and next.">
        <USelectMenu v-model="childId" placeholder="Select Student" value-key="value" :items="children"
          :loading="parentStore.loading" class="w-full md:w-72" />
      </Heading>
      <div><TimetableSectionNav /></div>
      <div v-if="childLoading" class="space-y-3"><USkeleton v-for="i in 2" :key="i" class="h-56 w-full rounded-lg" /></div>
      <UCard v-else-if="childOnTimetable">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <UIcon name="i-lucide-calendar-days" class="mb-3 size-12 text-muted" />
          <h3 class="text-base font-semibold">This class follows the normal timetable</h3>
          <p class="mt-1 text-sm text-muted">It has a lesson-by-lesson timetable instead of a weekly plan.</p>
          <UButton class="mt-4" to="/timetable" label="Open the timetable" icon="i-lucide-calendar-days" />
        </div>
      </UCard>
      <template v-else-if="childPlan">
        <UCard v-for="week in childPlan.weeks" :key="week.start" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <p class="font-display font-semibold">{{ week.start === thisMonday ? 'This week' : 'Next week' }}
              <span class="font-normal text-muted">· {{ week.label }}</span></p>
          </template>
          <WeeklyPlanGrid :week="week" :slots="childPlan.slots" />
        </UCard>
      </template>
      <UCard v-else>
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <UIcon name="i-lucide-calendar-range" class="mb-3 size-12 text-muted" />
          <h3 class="text-base font-semibold">No weekly plan yet</h3>
          <p class="mt-1 text-sm text-muted">The school hasn't published this class's plan for these weeks.</p>
        </div>
      </UCard>
    </template>

    <!-- Staff -->
    <template v-else>
      <Heading title="Weekly plan" subtitle="The whole term, week by week, with a subject in each session of the day.">
        <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <USelectMenu v-model="classSessionId" placeholder="Select Class" value-key="value" :items="classStore.list"
            :loading="classStore.loading || typesLoading" class="w-full md:w-64" />
          <USelectMenu v-model="termId" placeholder="Select Term" value-key="value" :items="termItems"
            :loading="termStore.loading" class="w-full md:w-48" />
        </div>
      </Heading>
      <div><TimetableSectionNav /></div>

      <UCard v-if="!classSessionId">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <UIcon name="i-lucide-school" class="mb-3 size-12 text-muted" />
          <h3 class="text-base font-semibold">Choose a class</h3>
          <p class="mt-1 text-sm text-muted">Pick a class and a term to see or build its weekly plan.</p>
        </div>
      </UCard>

      <!-- A class follows the normal timetable or a weekly plan, never both. -->
      <UCard v-else-if="onTimetable">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <UIcon name="i-lucide-calendar-days" class="mb-3 size-12 text-muted" />
          <h3 class="text-base font-semibold">{{ pickedName }} follows the normal timetable</h3>
          <p class="mt-1 max-w-md text-sm text-muted">A class has a timetable or a weekly plan, not both.
            <template v-if="canEdit">To plan {{ pickedName }} week by week instead (e.g. nursery), switch it - its timetable is
              kept, just hidden, until you switch back.</template></p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <UButton to="/timetable" label="Open its timetable" icon="i-lucide-calendar-days" color="neutral" variant="soft" />
            <UButton v-if="canEdit" label="Plan it week by week" icon="i-lucide-calendar-range" :loading="switching"
              @click="switchToPlan" />
          </div>
        </div>
      </UCard>

      <div v-else-if="loading" class="space-y-3"><USkeleton v-for="i in 3" :key="i" class="h-48 w-full rounded-lg" /></div>

      <template v-else-if="plan">
        <!-- Summary and actions -->
        <UCard>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-display text-lg font-semibold text-highlighted">{{ plan.className }}</p>
                <UBadge :label="plan.status === 'PUBLISHED' ? 'Published' : 'Draft'" variant="subtle"
                  :color="plan.status === 'PUBLISHED' ? 'success' : 'neutral'" />
                <UBadge v-if="dirty" label="Unsaved changes" variant="subtle" color="warning" />
              </div>
              <p class="text-sm text-muted">
                {{ plan.termName }} · {{ formatDate(plan.termStart) }} - {{ formatDate(plan.termEnd) }} · {{ plan.weeks.length }} weeks
                · {{ plan.slots.length }} {{ plan.slots.length === 1 ? 'subject' : 'subjects' }} a day
                <template v-if="plan.slotsSource === 'CLASS'">(this class's own sessions)</template>
                <template v-if="!canEdit && plan.cycleWeeks"> · repeats every {{ plan.cycleWeeks }} {{ plan.cycleWeeks === 1 ? 'week' : 'weeks' }}</template>
              </p>
            </div>
            <USelectMenu v-if="canEdit" v-model="repeat" :items="repeatItems" value-key="value" :search-input="false"
              icon="i-lucide-repeat" class="w-full md:w-64" />
            <div v-if="canEdit" class="flex flex-wrap gap-2">
              <UButton icon="i-lucide-clock" label="Sessions" color="neutral" variant="outline" @click="() => { sessionsOpen = true }" />
              <UButton icon="i-lucide-wand-sparkles" label="Auto-fill" color="neutral" variant="outline" :loading="busy === 'fill'"
                @click="autoFill" />
              <UButton icon="i-lucide-save" label="Save" :disabled="!dirty" :loading="busy === 'save'" @click="save" />
              <UButton v-if="plan.status === 'PUBLISHED'" icon="i-lucide-eye-off" label="Unpublish" color="neutral" variant="soft"
                :loading="busy === 'status'" @click="setStatus(false)" />
              <UButton v-else icon="i-lucide-send" label="Publish" color="success" variant="soft" :disabled="dirty || !hasEntries"
                :loading="busy === 'status'" @click="setStatus(true)" />
            </div>
          </div>
          <p v-if="!plan.subjects.length" class="mt-3 text-sm text-warning">
            This class has no subjects yet - assign subjects to it before planning.
          </p>
        </UCard>

        <!-- A repeating plan: just its weeks, by weekday - saving spreads them over the term -->
        <template v-if="canEdit && repeat">
          <UAlert color="info" variant="subtle" icon="i-lucide-repeat"
            :title="`Plan ${repeat} ${repeat === 1 ? 'week' : 'weeks'} - it repeats for the whole term`"
            :description="`Week 1 is the first week of term, then week ${repeat + 1} starts again from Week 1, and so on for all ${plan.weeks.length} weeks. Holidays are skipped. Parents see the dated weeks once it is published.`" />
          <UCard v-for="week in cycleGrid" :key="week.start" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header><p class="font-display font-semibold">{{ week.label }}</p></template>
            <WeeklyPlanGrid :week="week" :slots="plan.slots" editable undated :picks="picks" :subjects="plan.subjects" />
          </UCard>
        </template>

        <!-- The weeks, each laid out like the timetable -->
        <template v-else>
          <UCard v-for="week in plan.weeks" :key="week.start" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header><p class="font-display font-semibold">{{ week.label }}</p></template>
            <WeeklyPlanGrid :week="week" :slots="plan.slots" :editable="canEdit" :picks="picks" :subjects="plan.subjects" />
          </UCard>
        </template>

        <WeeklyPlanSessions v-if="canEdit" v-model:open="sessionsOpen" :class-session-id="classSessionId"
          :class-name="plan.className" @saved="load" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { WeeklyPlanApi, type ChildWeeklyPlan, type WeeklyPlan } from '~/api/weeklyPlan.api'

const { can } = useAuth()
const { success, error: toastError } = useNotify()
const classStore = useClassSessionStore()
const termStore = useTermStore()
const parentStore = useParentStore()

const isParent = computed(() => can([Role.PARENT]) && !can([Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER]))
const canEdit = computed(() => can([Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.OWNER, Role.PROPRIETOR]))

// ---- staff
const classSessionId = ref('')
// A class follows a weekly plan or the normal timetable, never both. The class picked is shared with the Timetable
// page; picking one on the normal timetable goes straight to its timetable.
const { types, load: loadTypes, loading: typesLoading, typeOfSession, classIdOfSession, selected, set: setType } = useClassTimetableTypes()
// The class picked before (here or on the Timetable page) when it's on a weekly plan, else the first that is.
watch([() => classStore.list, types], ([items]) => {
  if (!types.value || classSessionId.value || !items.length) return
  const kept = selected.value && typeOfSession(selected.value) === 'WEEKLY_PLAN' ? selected.value : ''
  classSessionId.value = kept || (items.find((c: { value: string }) => typeOfSession(c.value) === 'WEEKLY_PLAN')?.value ?? '')
}, { immediate: true })
watch([classSessionId, types], ([id]) => {
  if (!id) return
  selected.value = id
  // A class on the normal timetable has no weekly plan: straight to its timetable (the Timetable page opens on it).
  if (types.value && typeOfSession(id) === 'PERIODS') navigateTo('/timetable', { replace: true })
})
// The class picked is on the normal timetable: say so (and let the school switch it) rather than load a plan.
const onTimetable = computed(() => !!classSessionId.value && !!types.value && typeOfSession(classSessionId.value) === 'PERIODS')
const pickedName = computed(() => classStore.list.find((c: { value: string, label: string }) => c.value === classSessionId.value)?.label ?? 'This class')
const switching = ref(false)
async function switchToPlan() {
  const classId = classIdOfSession(classSessionId.value) ?? classStore.get(classSessionId.value)?.clazzId
  if (!classId) return
  switching.value = true
  try {
    await setType(classId, 'WEEKLY_PLAN')
    await load()
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'Could not switch the class')
  } finally {
    switching.value = false
  }
}
const termId = ref('')
const termItems = computed(() => termStore.records.map(t => ({ label: `${t.name}${t.academicYear?.name ? ` (${t.academicYear.name})` : ''}`, value: t.id })))
// The running term to start with (else the first listed).
watch(() => termStore.records, (terms) => {
  if (termId.value || !terms.length) return
  termId.value = (terms.find(t => t.status === 'ACTIVE') ?? terms[0])!.id
}, { immediate: true })
const plan = ref<WeeklyPlan>()
const loading = ref(false)
const busy = ref<'' | 'fill' | 'save' | 'status'>('')
const sessionsOpen = ref(false)
const picks = reactive<Record<string, string | undefined>>({})
const saved = ref('')

// How the plan is made: every week on its own (0), or a few weeks repeated over the term.
const repeat = ref(0)
// Up to 8 weeks (the server's limit, WeeklyPlanService.MAX_CYCLE_WEEKS).
const repeatItems = [
  { label: 'Repeats every month (4 weeks)', value: 4 },
  { label: 'Repeats every 5 weeks', value: 5 },
  { label: 'Repeats every 6 weeks', value: 6 },
  { label: 'Repeats every 7 weeks', value: 7 },
  { label: 'Repeats every 8 weeks', value: 8 },
  { label: 'Repeats every 3 weeks', value: 3 },
  { label: 'Repeats every 2 weeks', value: 2 },
  { label: 'Same every week', value: 1 },
  { label: 'Plan every week of the term', value: 0 }
]
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
// Pattern cells are keyed "c<week>-<weekday>|<slot>" (weekday 1-5); dated cells "<date>|<slot>".
const cycleKey = (week: number, weekday: number) => `c${week}-${weekday}`
const parseCycle = (key: string) => {
  const m = /^c(\d+)-(\d)\|(\d+)$/.exec(key)
  return m ? { week: Number(m[1]), weekday: Number(m[2]), slot: Number(m[3]) } : null
}
const cycleGrid = computed(() => Array.from({ length: repeat.value }, (_, i) => ({
  label: `Week ${i + 1}`, start: `c${i + 1}`, end: `c${i + 1}`,
  days: WEEKDAYS.map((weekday, d) => ({ date: cycleKey(i + 1, d + 1), weekday, holiday: null, entries: [] }))
})))

// What would be saved in the current mode.
const activePicks = computed(() => Object.entries(picks).filter(([k, v]) => {
  if (!v) return false
  const c = parseCycle(k)
  return repeat.value ? !!c && c.week <= repeat.value : !c
}))
const current = computed(() => JSON.stringify([repeat.value, [...activePicks.value].sort()]))
const dirty = computed(() => !!plan.value && current.value !== saved.value)
const hasEntries = computed(() => activePicks.value.length > 0)

function take(p: WeeklyPlan) {
  plan.value = p
  for (const k of Object.keys(picks)) delete picks[k]
  for (const w of p.weeks) for (const d of w.days) for (const e of d.entries) picks[`${d.date}|${e.slot}`] = e.subjectId
  for (const e of p.cycle ?? []) picks[`${cycleKey(e.week, e.weekday)}|${e.slot}`] = e.subjectId
  // A plan not started yet begins as a one-month cycle.
  repeat.value = p.cycleWeeks || (p.id ? 0 : 4)
  saved.value = current.value
}

// Switching to a repeating plan with nothing in it yet starts from the term's first weeks as planned so far.
watch(repeat, (n) => {
  if (!n || !plan.value || activePicks.value.length) return
  plan.value.weeks.slice(0, n).forEach((week, w) => {
    for (const d of week.days) {
      const weekday = WEEKDAYS.indexOf(d.weekday) + 1
      if (!weekday) continue
      plan.value!.slots.forEach((_, slot) => {
        const subject = picks[`${d.date}|${slot}`]
        if (subject) picks[`${cycleKey(w + 1, weekday)}|${slot}`] = subject
      })
    }
  })
})

async function load() {
  if (!classSessionId.value || !termId.value) return
  if (!types.value || typeOfSession(classSessionId.value) !== 'WEEKLY_PLAN') return // no plan to load (see onTimetable)
  loading.value = true
  try {
    take(await WeeklyPlanApi().get(classSessionId.value, termId.value))
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'The weekly plan could not be loaded')
    plan.value = undefined
  } finally {
    loading.value = false
  }
}

async function run(kind: 'fill' | 'save' | 'status', work: () => Promise<WeeklyPlan>, done: string) {
  busy.value = kind
  try {
    take(await work())
    success(done)
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'Something went wrong')
  } finally {
    busy.value = ''
  }
}

function autoFill() {
  if (hasEntries.value && !confirm('Auto-fill replaces every subject planned for this term. Continue?')) return
  run('fill', () => WeeklyPlanApi().autoFill(classSessionId.value, termId.value, repeat.value), 'Term filled - check it, then save or publish')
}

function save() {
  if (repeat.value) {
    const entries = activePicks.value.map(([k, subjectId]) => ({ ...parseCycle(k)!, subjectId: subjectId as string }))
    run('save', () => WeeklyPlanApi().saveCycle(classSessionId.value, termId.value, repeat.value, entries),
      'Weekly plan saved - repeated over the whole term')
    return
  }
  const entries = activePicks.value.map(([k, subjectId]) => {
    const [date, slot] = k.split('|') as [string, string]
    return { date, slot: Number(slot), subjectId: subjectId as string }
  })
  run('save', () => WeeklyPlanApi().save(classSessionId.value, termId.value, entries), 'Weekly plan saved')
}

function setStatus(published: boolean) {
  run('status', () => WeeklyPlanApi().setStatus(classSessionId.value, termId.value, published),
    published ? 'Published - parents can see it now' : 'Unpublished')
}

watch([classSessionId, termId, types], load)

// ---- parents
const childId = ref('')
const childPlan = ref<ChildWeeklyPlan | null>(null)
const childLoading = ref(false)
const childOnTimetable = computed(() => {
  const child = parentStore.students.find(st => st.id === childId.value)
  return !!child?.sessionId && !!types.value && typeOfSession(child.sessionId) === 'PERIODS'
})
const children = computed(() => parentStore.students.map(s => ({ label: `${s.givenNames} ${s.familyName} (${s.className})`, value: s.id })))
const thisMonday = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// The child picked before (here or on the Timetable page), else the first whose class is on a weekly plan.
watch([children, types], ([items]) => {
  if (!items.length || !types.value || items.some(i => i.value === childId.value)) return
  const kept = parentStore.students.find(st => st.sessionId === selected.value && typeOfSession(st.sessionId) === 'WEEKLY_PLAN')
  const firstOnPlan = parentStore.students.find(st => typeOfSession(st.sessionId) === 'WEEKLY_PLAN')
  childId.value = kept?.id ?? firstOnPlan?.id ?? items[0]!.value
}, { immediate: true })
watch(childId, async (id) => {
  if (!id) return
  const child = parentStore.students.find(s => s.id === id)
  if (child?.sessionId) {
    selected.value = child.sessionId
    if (types.value && typeOfSession(child.sessionId) === 'PERIODS') {
      // No weekly plan: straight to the child's timetable (the Timetable page opens on them).
      childPlan.value = null
      navigateTo('/timetable', { replace: true })
      return
    }
  }
  childLoading.value = true
  try {
    childPlan.value = await WeeklyPlanApi().child(id)
  } catch {
    childPlan.value = null
  } finally {
    childLoading.value = false
  }
})

onMounted(() => {
  useAppStore().setTitle('Weekly Plan')
  document.title = 'Weekly Plan | Timetable | Skultem'
  if (isParent.value) Promise.all([parentStore.fetchAllStudents(0, 0), loadTypes(true)])
  else Promise.all([classStore.fetchAll(0, 0), termStore.fetchAll(0, 0), loadTypes(true)])
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
