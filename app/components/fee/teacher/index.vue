<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const classStore = useClassSessionStore()
const studentStore = useStudentStore()

const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const assessmentLoading = ref(false)

const selected = ref<ClassSession | undefined>()

const state = reactive({
    classId: '',
    term: ''
})

const records = ref<ClassSession[]>([])

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

    if (merged.page === route.query.page) {
        return
    }

    router.replace({ query: merged })
}

const terms = computed(() =>
    activeCycle.value?.terms.map(e => ({
        label: e.name,
        value: e.id
    })) || []
)

const classes = computed(() =>
    records.value.map(e => ({
        label: parseClassSession(e),
        value: e.clazzId
    }))
)

watch(() => page.value, () => {
    router.replace({
        query: {
            page: page.value
        }
    })

    nextTick(() => {
        scrollContainer?.value?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    })

    fetchRecord()
}, { immediate: true })

function change() {
    const select = records.value.find(e => e.id === state.classId)
    selected.value = select
}

async function fetchRecord() {
    await fetchCycle()
    const res = await classStore.fetchAllMe()
    records.value = res
}

async function fetchCycle() {
    await studentStore.fetchActiveCycle("all")

    if (!activeCycle.value) return

    const active = activeCycle.value.terms.find(e => e.status === "ACTIVE")

    if (!active) return

    const termIndex = terms.value.findIndex(e => e.value === active.id)

    state.term = terms.value[termIndex]?.value || ''
}

watch(
    () => classes.value,
    () => {
        state.classId = classes.value[0]?.value || ''
        change()
    },
    { immediate: true }
)

watch(
    () => [state.term, state.classId],
    async () => {
        await loadAvarageData()
    },
    { immediate: true }
)

onMounted(async () => {
    useAppStore().setTitle('Fees')
    document.title = 'Fees Collected | Skultem'

    await fetchRecord()
})

async function loadAvarageData() {
    try {

        if (!state.term || !state.classId) return

        assessmentLoading.value = true

        const payload = {
            entity: "fees",
            title: "Fees by tearm",
            filters: [
                {
                    field: 'fee.term.id',
                    value: state.term,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: 'enrollment.clazz.id',
                    value: state.classId,
                    operator: "EQUALS",
                    type: "select"
                }
            ]
        }

        await store.runReport(payload, page.value, size.value)
    } catch (err) {
        console.error("Failed to load class performance", err)
    } finally {

        assessmentLoading.value = false
    }
}

definePageMeta({
    role: [Role.TEACHER]
})
</script>

<template>
    <div id="attendance-scroll" class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Fees Collected" subtitle="Create custom reports and explore your school data">
            <div class="flex w-full space-x-3 md:w-1/3">
                <USelectMenu @change="change" :loading="classStore.loading" :items="classes" value-key="value"
                    v-model="state.classId" placeholder="Select Student" />
                <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
                    placeholder="Select Term" />
            </div>
        </Heading>
        <FeeTeacherReport />
        <FeeTeacherTable />
    </div>
</template>
