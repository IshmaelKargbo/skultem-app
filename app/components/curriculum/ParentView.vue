<template>
  <div class="space-y-4">
    <Heading title="Curriculum" :subtitle="subtitle">
      <div class="flex md:space-x-3 space-x-2">
        <USelectMenu @change="change" :loading="loading" :items="children" value-key="value" v-model="state.student"
          placeholder="Select Student" />
        <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
          placeholder="Select Term" />
      </div>
    </Heading>

    <!-- At a glance -->
    <div class="grid grid-cols-3 gap-3 md:gap-5">
      <Metric :record="{
        label: 'Subjects', color: 'primary', value: schemes.length, isReady: !schemesLoading,
        icon: 'i-lucide-book-open', subtle: schemes.length ? 'This term' : undefined
      }" />
      <Metric :record="{
        label: 'Overall Coverage', color: 'success', value: `${overallCoverage}%`, isReady: !schemesLoading,
        icon: COVERAGE_ICON, subtle: 'Average across subjects'
      }" />
      <Metric :record="{
        label: 'Weeks Completed', color: 'info', value: `${totalCompletedWeeks}/${totalWeeks}`,
        isReady: !schemesLoading, icon: CHECK_ICON, subtle: 'Across all subjects'
      }" />
    </div>

    <!-- Subjects -->
    <div v-if="schemes.length" class="space-y-3">
      <h3 class="px-1 text-sm font-semibold text-highlighted">Subjects This Term</h3>

      <UCard :ui="{ body: 'p-0 sm:p-0' }" v-for="item in schemes" :key="item.scheme.id" class="cursor-pointer"
        @click="toggle(item.scheme.id)">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar size="lg" :alt="item.scheme.subject" />

            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ item.scheme.subject }}</p>
              <UBadge :label="progressLabel[item.scheme.progressState]" :color="getLessonStateColor(item.scheme.progressState)"
                variant="subtle" size="sm" class="mt-1" />
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <div class="hidden w-32 flex-col items-end gap-1 sm:flex">
              <p class="text-sm font-semibold">{{ item.progress.coverage }}% covered</p>
              <UProgress :model-value="item.progress.coverage" color="success" size="sm" />
            </div>

            <UIcon :name="expanded[item.scheme.id] ? 'iconoir:nav-arrow-down' : 'weui:arrow-outlined'"
              class="text-lg text-mute" variant="link" />
          </div>
        </div>

        <template v-if="expanded[item.scheme.id]" #footer>
          <div v-if="item.weeks.length" class="space-y-1.5">
            <div v-for="week in item.weeks" :key="week.id" class="flex items-start justify-between gap-3 py-1.5"
              :class="{ 'border-b border-gray-100 dark:border-gray-800': week !== item.weeks[item.weeks.length - 1] }">
              <div class="min-w-0">
                <p class="text-sm font-medium">Week {{ week.week }}: {{ week.topic }}</p>
                <p v-if="week.subTopic" class="truncate text-xs text-muted">{{ week.subTopic }}</p>
              </div>
              <UBadge :label="progressLabel[week.state]" :color="getLessonStateColor(week.state)" variant="subtle"
                size="sm" class="shrink-0" />
            </div>
          </div>
          <p v-else class="py-2 text-center text-xs text-muted">No weeks have been planned for this subject yet.</p>
        </template>
      </UCard>
    </div>

    <UCard v-else-if="!schemesLoading" class="py-14">
      <div class="flex flex-col items-center justify-center text-center space-y-4">
        <UIcon name="i-lucide-book-open" class="text-4xl text-muted" />

        <div class="space-y-1">
          <p class="text-lg font-semibold">
            No Curriculum Published Yet
          </p>
          <p class="max-w-sm text-sm text-muted">
            {{ studentFirstName ? `${studentFirstName}'s` : "Your child's" }} teachers haven't published a scheme of
            work for {{ term?.name || 'the selected term' }} yet.
            <template v-if="terms.length > 1">Try a different term above, or check back once it's up.</template>
            <template v-else>Check back once it's up.</template>
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const parentStore = useParentStore()
const studentStore = useStudentStore()

const { students, loading } = storeToRefs(parentStore)
const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)

const selected = ref<Student | undefined>()

const state = reactive({
  student: '',
  term: ''
})

const expanded = ref<Record<string, boolean>>({})

function toggle(id: string) {
  expanded.value[id] = !expanded.value[id]
}

const terms = computed(() =>
  activeCycle.value?.terms.map(e => ({
    label: e.name,
    value: e.id
  })) || []
)

const children = computed(() =>
  students.value.map(e => ({
    label: `${e.givenNames} ${e.familyName} - ${e.className}`,
    value: e.id
  }))
)

const studentFirstName = computed(() => selected.value?.givenNames || '')

const term = computed(() =>
  activeCycle.value?.terms.find(e => e.id === state.term)
)

const subtitle = computed(() =>
  studentFirstName.value
    ? `What ${studentFirstName.value} is learning${term.value ? ` in ${term.value.name}` : ' this term'}`
    : "What your child is learning, term by term"
)

const progressLabel: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
}

function change() {
  const select = students.value.find(e => e.id === state.student)
  selected.value = select
}

async function fetchRecord() {
  await parentStore.fetchAllStudents(0, 0)
}

async function fetchCycle() {
  if (!selected.value) return

  await studentStore.fetchActiveCycle(selected.value.sessionId)

  if (!activeCycle.value) return

  const cycleTerms = activeCycle.value.terms
  if (!cycleTerms.length) return

  // Same fallback as pages/performance.vue - a cycle from a class that's rolled past the
  // school's currently-active term (or hasn't rolled over into it yet) has no term marked
  // ACTIVE, which would otherwise leave state.term blank forever and starve everything below.
  const active = cycleTerms.find(e => e.status === "ACTIVE")
    ?? cycleTerms.reduce((latest, t) => t.termNumber > latest.termNumber ? t : latest)

  const termIndex = terms.value.findIndex(e => e.value === active.id)

  state.term = terms.value[termIndex]?.value || ''
}

const schemes = ref<ChildSchemeOfWork[]>([])
const schemesLoading = ref(false)

async function loadCurriculum() {
  if (!state.term || !state.student) return

  schemesLoading.value = true
  try {
    schemes.value = await CurriculumsApi().getChildCurriculum(state.student, state.term) || []
  } catch (err) {
    console.error('Failed to load child curriculum', err)
  } finally {
    schemesLoading.value = false
  }
}

const totalWeeks = computed(() => schemes.value.reduce((sum, s) => sum + s.progress.totalWeeks, 0))
const totalCompletedWeeks = computed(() => schemes.value.reduce((sum, s) => sum + s.progress.completed, 0))

const overallCoverage = computed(() => {
  if (!schemes.value.length) return 0
  const total = schemes.value.reduce((sum, s) => sum + s.progress.coverage, 0)
  return Math.round(total / schemes.value.length)
})

watch(
  () => children.value,
  () => {
    state.student = children.value[0]?.value || ''
    change()
  },
  { immediate: true }
)

watch(
  () => selected.value,
  async () => {
    await fetchCycle()
  },
  { immediate: true }
)

watch(
  () => [state.term, state.student],
  async () => {
    await loadCurriculum()
  },
  { immediate: true }
)

onMounted(async () => {
  await fetchRecord()
})
</script>
