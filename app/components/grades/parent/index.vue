<template>
  <div class="p-7 h-full overflow-y-auto space-y-5">
    <UCard>
      <div class="flex items-center justify-between">
        <div class="space-y-2">
          <p class="text-xs text-mute">Overall Performance</p>
          <USkeleton v-if="avarageLoading" class="w-20 h-8" />
          <p v-else class="text-2xl font-semibold">{{ avarage }}</p>
          <USkeleton v-if="avarageLoading" class="w-32 h-2" />
          <p v-else-if="term" class="text-[11px] text-mute">{{ term.name }} Average</p>
        </div>
        <div class="flex space-x-3 w-1/2">
          <USelectMenu @change="change" :loading="loading" :items="children" value-key="value" v-model="state.student"
            placeholder="Select Student" />
          <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
            placeholder="Select Term" />
        </div>
      </div>
    </UCard>
    <GradesParentSubjectTable v-if="selected" :student="state.student" :term="state.term" :clazz="selected.classId" />
    <GradesParentPerformanceBreakdown v-if="selected" :term="state.term" :id="state.student" />
    <div class="grid grid-cols-4 gap-5">
      <GradesParentGrade :id="state.student" :term="state.term" grade="A" />
      <GradesParentGrade :id="state.student" :term="state.term" grade="B" />
      <UCard>
        <div class="space-y-2 text-center">
          <USkeleton v-if="avarageLoading" class="w-20 h-8" />
          <p v-else class="text-2xl font-semibold">{{ avarage }}</p>
          <p>Overall Average</p>
        </div>
      </UCard>
      <GradesParentRank v-if="selected" :student="selected" :term="state.term" />
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useParentStore()
const widgetStore = useWidgetStore()
const studentStore = useStudentStore()
const { students, loading } = storeToRefs(store)
const avarageLoading = ref(true)
const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)

const state = reactive<{
  student: string
  term: string
}>({
  student: '',
  term: ''
})

const selected = ref<Student | undefined>()
const term = computed(() => activeCycle.value?.terms.find(e => e.id == state.term))
const avarage = ref("")

const terms = computed(() => activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })) || [])

const children = computed(() =>
  students.value.map(e => ({
    label: `${e.givenNames} ${e.familyName} - ${e.className}`,
    value: e.id
  }))
)

function change() {
  const select = students.value.find(e => e.id === state.student)
  selected.value = select
}

async function fetchRecord() {
  await store.fetchAllStudents(0, 0)
}

async function fetchCycle() {
  if (selected.value == null) return null
  await studentStore.fetchActiveCycle(selected.value.sessionId)
  if (activeCycle.value == null) return null
  const active = activeCycle.value.terms.find(e => e.status == "ACTIVE")
  if (active == null) return
  const termIndex = terms.value.findIndex(e => e.value == active.id)
  state.term = terms.value[termIndex]?.value || ''
}

async function loadAvarageData() {
  if (!state.student && !state.term) return
  avarageLoading.value = true
  try {
    const payload = {
      entity: "assessments",
      title: "Class Performance",
      filters: [
        {
          field: "studentAssessment.enrollment.student.id",
          value: state.student,
          operator: "EQUALS",
          type: "select"
        },
        {
          field: 'cycle.term.id',
          value: state.term,
          operator: "EQUALS",
          type: "select"
        }
      ],
      metrics: [
        {
          name: "Average Score",
          aggregation: "avg",
          field: "score",
          tags: { groupBy: "term" }
        }
      ],
      chartType: "bar"
    }

    const res = await widgetStore.runAnalytic(payload)
    const widget = res?.data ?? res

    if (!widget?.labels || !widget?.datasets) return

    const value = widget.datasets[0].data[0]
    if (value) avarage.value = `${Number.parseInt(value || '0').toFixed(0)}%`
    else avarage.value = value

  } catch (err) {
    console.error("Failed to load class performance", err)
  } finally {
    avarageLoading.value = false
  }
}

watch(() => children.value, () => {
  state.student = children.value[0]?.value || ''
  change()
}, { immediate: true })

watch(() => state.term, async () => {
  await loadAvarageData()
}, { immediate: true })

watch(
  () => selected.value,
  async () => {
    await fetchCycle()
  },
  { immediate: true }
)

onMounted(async () => {
  useAppStore().setTitle('Grades')
  document.title = 'Grades | Grades | Skultem'
  fetchRecord()
})

definePageMeta({
  role: [Role.PARENT]
})
</script>
