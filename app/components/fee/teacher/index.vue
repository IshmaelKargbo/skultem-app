<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const classStore = useClassSessionStore()
const studentStore = useStudentStore()

const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)

const assessmentLoading = ref(false)
const selected = ref<ClassSession | undefined>()
const records = ref<ClassSession[]>([])

const state = reactive({
  classId: '',
  term: ''
})

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }
  if (merged.page === route.query.page) return
  router.replace({ query: merged })
}

const terms = computed(() =>
  activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })) ?? []
)

const classes = computed(() =>
  records.value.map(e => ({ label: parseClassSession(e), value: e.clazzId }))
)

function change() {
  selected.value = records.value.find(e => e.id === state.classId)
}

async function fetchCycle() {
  await studentStore.fetchActiveCycle('all')
  if (!activeCycle.value) return
  const active = activeCycle.value.terms.find(e => e.status === 'ACTIVE')
  if (!active) return
  state.term = terms.value.find(e => e.value === active.id)?.value ?? ''
}

async function fetchRecord() {
  await fetchCycle()
  records.value = await classStore.fetchAllMe()
}

async function loadData() {
  if (!state.term || !state.classId) return
  try {
    assessmentLoading.value = true
    await store.runReport(
      {
        entity: 'fees',
        filters: [
          { field: 'fee.term.id', value: state.term, operator: 'EQUALS', type: 'select' },
          { field: 'enrollment.clazz.id', value: state.classId, operator: 'EQUALS', type: 'select' },
        ]
      },
      page.value,
      size.value
    )
  } catch (err) {
    console.error('Failed to load fees report', err)
  } finally {
    assessmentLoading.value = false
  }
}

watch(classes, () => {
  state.classId = classes.value[0]?.value ?? ''
  change()
}, { immediate: true })

watch(() => [state.term, state.classId], loadData, { immediate: true })

onMounted(async () => {
  useAppStore().setTitle('Fees')
  document.title = 'Fees Collected | Skultem'
  await fetchRecord()
})

definePageMeta({
  role: [Role.TEACHER]
})
</script>

<template>
  <div class="md:p-7 p-4 md:space-y-5 space-y-3">
    <UCard>
      <Heading title="Fees Collected" subtitle="Create custom reports and explore your school data">
        <div class="flex w-full space-x-3 md:w-1/3">
          <USelectMenu :loading="classStore.loading" :items="classes" value-key="value" v-model="state.classId"
            placeholder="Select Class" @change="change" />
          <USelectMenu :loading="cycleLoading" :items="terms" value-key="value" v-model="state.term"
            placeholder="Select Term" />
        </div>
      </Heading>
    </UCard>
    <FeeTeacherReport />
    <FeeTeacherTable />
  </div>
</template>