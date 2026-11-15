<!-- Weekly plan: a class's school term split into its weeks, laid out like the timetable (weekdays across,
     sessions down), a subject in each session (e.g. Morning and After break). Leadership auto-fills, edits and
     publishes; teachers look; parents see their child's published plan for this week and next. -->
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
            :loading="classStore.loading" class="w-full md:w-64" />
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
              </p>
            </div>
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

        <!-- The weeks, each laid out like the timetable -->
        <UCard v-for="week in plan.weeks" :key="week.start" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header><p class="font-display font-semibold">{{ week.label }}</p></template>
          <WeeklyPlanGrid :week="week" :slots="plan.slots" :editable="canEdit" :picks="picks" :subjects="plan.subjects" />
        </UCard>

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

const current = computed(() => JSON.stringify(Object.entries(picks).filter(([, v]) => v).sort()))
const dirty = computed(() => !!plan.value && current.value !== saved.value)
const hasEntries = computed(() => Object.values(picks).some(Boolean))

function take(p: WeeklyPlan) {
  plan.value = p
  for (const k of Object.keys(picks)) delete picks[k]
  for (const w of p.weeks) for (const d of w.days) for (const e of d.entries) picks[`${d.date}|${e.slot}`] = e.subjectId
  saved.value = current.value
}

async function load() {
  if (!classSessionId.value || !termId.value) return
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
  run('fill', () => WeeklyPlanApi().autoFill(classSessionId.value, termId.value), 'Term filled - check it, then save or publish')
}

function save() {
  const entries = Object.entries(picks).filter(([, v]) => v).map(([k, subjectId]) => {
    const [date, slot] = k.split('|') as [string, string]
    return { date, slot: Number(slot), subjectId: subjectId as string }
  })
  run('save', () => WeeklyPlanApi().save(classSessionId.value, termId.value, entries), 'Weekly plan saved')
}

function setStatus(published: boolean) {
  run('status', () => WeeklyPlanApi().setStatus(classSessionId.value, termId.value, published),
    published ? 'Published - parents can see it now' : 'Unpublished')
}

watch([classSessionId, termId], load)

// ---- parents
const childId = ref('')
const childPlan = ref<ChildWeeklyPlan | null>(null)
const childLoading = ref(false)
const children = computed(() => parentStore.students.map(s => ({ label: `${s.givenNames} ${s.familyName} (${s.className})`, value: s.id })))
const thisMonday = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

watch(children, (items) => { if (items.length && !items.some(i => i.value === childId.value)) childId.value = items[0]!.value })
watch(childId, async (id) => {
  if (!id) return
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
  if (isParent.value) parentStore.fetchAllStudents(0, 0)
  else Promise.all([classStore.fetchAll(0, 0), termStore.fetchAll(0, 0)])
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
