<template>
    <div class="md:p-7 p-4 md:space-y-5 space-y-3 h-full overflow-y-auto">
        <Heading title="Attendance" subtitle="Track class attendance and export reports">
            <div class="grid grid-cols-2 w-full md:w-2/3 gap-3">
                <USelectMenu @change="change" :loading="loading" :items="children" value-key="value"
                    v-model="state.student" placeholder="Select Student" />
                <USelectMenu :loading="cycleLoading" value-key="value" v-model="state.term" :items="terms"
                    placeholder="Select Term" />
            </div>
        </Heading>
        <AttendanceParentReport :student="selected" :term="term" />
        <TabMobile class="md:hidden block" :tabs="tabs">
            <template #overview-data>
                <AttendanceParentTableMobile />
            </template>
            <template #breakdown-data>
                <AttendanceParentBreakdown :student="selected" :term="term" />
            </template>
        </TabMobile>
        <AttendanceParentTable />
        <AttendanceParentBreakdown class="hidden md:block" :student="selected" :term="term" />
    </div>
</template>

<script setup lang="ts">
const store = useParentStore()
const studentStore = useStudentStore()
const reportStore = useReportStore()
const { students, loading } = storeToRefs(store)

const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)

const tabs = [
    {
        label: 'Overview',
        key: 'overview'
    },
    {
        label: 'Breakdown',
        key: 'breakdown'
    }
]

const state = reactive<{
    student: string
    term: string
}>({
    student: '',
    term: ''
})

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

const selected = ref<Student | undefined>()
const term = computed(() => activeCycle.value?.terms.find(e => e.id == state.term))
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

async function fetchAttendance() {
    if (term.value == null) return
    reportStore.runReport({
        entity: 'attendances',
        filters: [
            {
                field: "enrollment.student.id",
                value: state.student,
                operator: "EQUALS",
                type: "select"
            },
            {
                field: 'date',
                value: term.value?.startDate || '',
                valueTo: term.value?.endDate,
                operator: "BETWEEN",
                type: "date"
            }
        ]
    }, 1, 7);
}

watch(() => children.value, () => {
    state.student = children.value[0]?.value || ''
    change()
}, { immediate: true })

watch(
    () => selected.value,
    async () => {
        await fetchCycle()
    },
    { immediate: true }
)

watch(
    () => [term.value, selected.value],
    async () => {
        await fetchAttendance()
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('Attendance')
    document.title = 'Attendance | Skultem'
    fetchRecord()
})

onUnmounted(() => {
    useAttendanceStore().cleanUp()
})

definePageMeta({
    role: [Role.PARENT]
})
</script>
