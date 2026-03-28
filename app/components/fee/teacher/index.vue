<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const store = useReportStore()
const classStore = useClassSessionStore()
const studentStore = useStudentStore()

const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)

const assessmentLoading = ref(false)

const selected = ref<ClassSession | undefined>()

const state = reactive({
    classId: '',
    term: ''
})

const records = ref<ClassSession[]>([])

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

const parseTrend: Record<string, any> = {
    IMPROVED: {
        icon: 'i-heroicons-arrow-trending-up',
        color: 'success',
        label: 'Improved'
    },
    STABLE: {
        icon: 'i-heroicons-minus',
        color: 'neutral',
        label: 'Stable'
    },
    DROPPED: {
        icon: 'i-heroicons-arrow-trending-down',
        color: 'error',
        label: 'Dropped'
    }
}

const columns: TableColumn<any>[] = [
    {
        accessorKey: 'name',
        header: 'Assessment'
    },
    {
        accessorKey: 'score',
        header: 'Score'
    },
    {
        accessorKey: 'weight',
        header: 'Weighted'
    },
    {
        accessorKey: 'weightScore',
        header: 'Weight Score'
    },
    {
        accessorKey: 'grade',
        header: 'Grade'
    },
    {
        accessorKey: 'level',
        header: 'Level'
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        accessorKey: 'trend',
        header: ''
    }
]

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

        await store.runReport(payload, 0, 0)
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
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Fees Collected" subtitle="Create custom reports and explore your school data">
            <div class="flex space-x-3 w-1/3">
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
