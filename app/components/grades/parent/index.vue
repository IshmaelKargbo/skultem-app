<template>
  <div class="md:p-7 p-4 h-full overflow-y-auto md:space-y-5 space-y-3">
    <!-- Top Card -->
    <UCard class="hidden md:block">
      <div class="flex flex-col md:flex-row items-center justify-between space-y-5 md:space-y-0">
        <div class="space-y-2 flex flex-col items-center md:items-baseline">
          <p class="text-xs text-mute">Overall Performance</p>
          <USkeleton v-if="avarageLoading" class="w-20 h-8" />
          <p v-else class="text-2xl font-semibold">{{ avarage }}</p>
          <USkeleton v-if="avarageLoading" class="w-32 h-2" />
          <p v-else-if="currentTerm" class="text-[11px] text-mute">{{ currentTerm.name }} Average</p>
        </div>
        <div class="md:flex space-y-2 md:space-y-0 md:space-x-3 md:w-1/2 w-full">
          <USelectMenu
            :items="children"
            v-model="state.student"
            @change="onStudentChange"
            :loading="loading"
            value-key="value"
            placeholder="Select Student"
          />
          <USelectMenu
            :items="terms"
            v-model="state.term"
            :loading="cycleLoading"
            value-key="value"
            placeholder="Select Term"
          />
        </div>
      </div>
    </UCard>
    <!-- Mobile Selects -->
    <div class="grid grid-cols-2 md:hidden gap-3">
      <USelectMenu
        :items="children"
        v-model="state.student"
        @change="onStudentChange"
        :loading="loading"
        value-key="value"
        placeholder="Select Student"
      />
      <USelectMenu
        :items="terms"
        v-model="state.term"
        :loading="cycleLoading"
        value-key="value"
        placeholder="Select Term"
      />
    </div>

    <!-- Grades Grid -->
    <div class="grid md:hidden md:grid-cols-4 grid-cols-2 md:gap-5 gap-3">
      <GradesParentGrade color="success" :id="state.student" :term="state.term" grade="A" />
      <GradesParentGrade color="info" :id="state.student" :term="state.term" grade="B" />
      <UCard>
        <div class="space-y-2 text-center">
          <USkeleton v-if="avarageLoading" class="w-20 h-8" />
          <p v-else class="text-2xl font-display font-semibold">{{ avarage }}</p>
          <p>Overall Average</p>
        </div>
      </UCard>
      <GradesParentRank v-if="selectedStudent" :student="selectedStudent" :term="state.term" />
    </div>

    <!-- Tabs -->
    <TabMobile class="md:hidden" :tabs="tabs">
      <template #overview-data>
        <GradesParentSubjectMobile
          v-if="selectedStudent"
          :student="state.student"
          :term="state.term"
          :clazz="selectedStudent.classId"
        />
      </template>
      <template #breakdown-data>
        <GradesParentPerformanceBreakdown
          v-if="selectedStudent"
          :term="state.term"
          :id="state.student"
        />
      </template>
    </TabMobile>

    <!-- Desktop Tables -->
    <GradesParentSubjectTable
      class="hidden md:block"
      v-if="selectedStudent"
      :student="state.student"
      :term="state.term"
      :clazz="selectedStudent.classId"
    />
    <GradesParentPerformanceBreakdown
      class="hidden md:block"
      v-if="selectedStudent"
      :term="state.term"
      :id="state.student"
    />

    <div class="hidden md:grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-3">
      <GradesParentGrade :id="state.student" :term="state.term" grade="A" />
      <GradesParentGrade :id="state.student" :term="state.term" grade="B" />
      <UCard>
        <div class="space-y-2 text-center">
          <USkeleton v-if="avarageLoading" class="w-20 h-8" />
          <p v-else class="text-2xl font-semibold">{{ avarage }}</p>
          <p>Overall Average</p>
        </div>
      </UCard>
      <GradesParentRank v-if="selectedStudent" :student="selectedStudent" :term="state.term" />
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useParentStore()
const studentStore = useStudentStore()
const widgetStore = useWidgetStore()
const appStore = useAppStore()

const { students, loading } = storeToRefs(store)
const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)

const state = reactive({
  student: '',
  term: ''
})

const selectedStudent = ref<Student | undefined>()
const avarage = ref('')
const avarageLoading = ref(true)

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'breakdown', label: 'Breakdown' }
]

// Computed helpers
const children = computed(() =>
  students.value.map(e => ({
    label: `${e.givenNames} ${e.familyName} - ${e.className}`,
    value: e.id
  }))
)
const terms = computed(() =>
  activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })) || []
)
const currentTerm = computed(() =>
  activeCycle.value?.terms.find(e => e.id === state.term)
)

// Fetch functions
async function fetchStudents() {
  await store.fetchAllStudents(0, 0)
  state.student = children.value[0]?.value || ''
  onStudentChange()
}

async function fetchActiveCycle(studentId: string) {
  await studentStore.fetchActiveCycle(studentId)
  const active = activeCycle.value?.terms.find(e => e.status === 'ACTIVE')
  state.term = active?.id || terms.value[0]?.value || ''
}

// When student changes
async function onStudentChange() {
  selectedStudent.value = students.value.find(s => s.id === state.student)
  if (selectedStudent.value) {
    await fetchActiveCycle(selectedStudent.value.sessionId)
  }
}

// Load average
async function loadAverage() {
  if (!state.student || !state.term) return
  
  avarageLoading.value = true
  try {
    const payload = {
      entity: "assessments",
      title: "Class Performance",
      filters: [
        { field: "studentAssessment.enrollment.student.id", value: state.student, operator: "EQUALS", type: "select" },
        { field: "cycle.term.id", value: state.term, operator: "EQUALS", type: "select" }
      ],
      metrics: [{ name: "Average Score", aggregation: "avg", field: "score", tags: { groupBy: "term" } }],
      chartType: "bar"
    }
    const res = await widgetStore.runAnalytic(payload)
    const widget = res?.data ?? res
    const value = widget?.datasets?.[0]?.data?.[0]
    avarage.value = value ? `${Number.parseInt(value || '0').toFixed(0)}%` : '0%'
  } catch (err) {
    console.error("Failed to load class performance", err)
  } finally {
    avarageLoading.value = false
  }
}

watch([() => state.student, () => state.term], loadAverage, { immediate: true })

onMounted(async () => {
  appStore.setTitle('Grades')
  document.title = 'Grades | Grades | Skultem'
  await fetchStudents()
})

// Page meta
definePageMeta({ role: [Role.PARENT] })
</script>