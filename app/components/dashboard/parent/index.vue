<template>
    <div class="md:p-7 p-4 md:space-y-5 space-y-3">
        <UCard>
            <div class="grid grid-cols-2 gap-2">
                <USelectMenu value-key="value" v-model="state.student" @change="change" :loading="loading"
                    :items="children" placeholder="Select Student" />
                <USelectMenu value-key="value" v-model="state.term" :loading="loading" :items="terms"
                    placeholder="Select Term" />
            </div>
        </UCard>
        <div class="grid md:grid-cols-3 grid-cols-2 md:gap-5 gap-3">
            <DashboardParentAvarage class="col-span-2 md:col-span-1" :term="term"
                :session-id="selected?.sessionId || ''" :id="state.student" />
            <DashboardParentAttendance :id="state.student" />
            <DashboardParentFees :id="state.student" />
        </div>
        <div class="grid md:grid-cols-2 md:gap-5 gap-3">
            <DashboardParentGradeTrend :id="state.student" />
            <DashboardParentSubjectPerformance :term="state.term" :id="state.student" />
            <UCard>
                <div v-if="selected">
                    <p class="text-mute">Student Information</p>
                    <div class="mt-2">
                        <div class="justify-between flex border-b py-3.5 border-gray-200">
                            <p class="text-muted">Class:</p>
                            <p>{{ selected.className }}</p>
                        </div>
                        <div class="justify-between flex border-b py-3.5 border-gray-200">
                            <p class="text-muted">Class Teacher:</p>
                            <p>{{ selected.classTeacher }}</p>
                        </div>
                        <div class="justify-between flex border-b py-3.5 border-gray-200">
                            <p class="text-muted">Total Students:</p>
                            <p>{{ selected.classSize }}</p>
                        </div>
                        <DashboardParentRank :term="state.term" :student="selected" />
                    </div>
                </div>
            </UCard>
            <DashboardParentUpdate />
        </div>
        <UCard>
            <div class="grid md:grid-cols-4 grid-cols-2 gap-3">
                <UButton to="/performance" color="success" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="PERFORMANCE_ICON" />
                        <p>Performance</p>
                    </div>
                </UButton>
                <UButton to="/grades" color="info" class="w-full flex justify-center py-4 rounded-xl" variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="GRADES_ICON" />
                        <p>View Grade</p>
                    </div>
                </UButton>
                <UButton to="/fees" color="error" class="w-full flex justify-center py-4 rounded-xl" variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="PAYMENT_ICON" />
                        <p>Check Fee</p>
                    </div>
                </UButton>
                <UButton to="/attendance" color="primary" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
                        <p>Check Attendance</p>
                    </div>
                </UButton>
            </div>
        </UCard>
    </div>
</template>
<script setup lang="ts">
const store = useParentStore()
const studentStore = useStudentStore()
const { activeCycle } = storeToRefs(studentStore)
const { students, loading } = storeToRefs(store)

const state = reactive<{ student: string, term: string }>({
    student: '',
    term: ''
})

const selected = ref<Student | undefined>()

const terms = computed(() => activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })))

const term = ref<Term | undefined>()

const children = computed(() =>
    students.value.map(e => ({
        label: `${e.givenNames} ${e.familyName} - ${e.className}`,
        value: e.id
    }))
)

async function fetchCycle() {
    if (selected.value == null) return null
    await studentStore.fetchActiveCycle(selected.value.sessionId)
    if (activeCycle.value == null) return null
    const active = activeCycle.value.terms.find(e => e.status == "ACTIVE")
    if (active == null) return
    if (terms.value == null) return
    const termIndex = terms.value.findIndex(e => e.value == active.id)
    state.term = terms.value[termIndex]?.value || ''
    term.value = active
}

function change() {
    const select = students.value.find(e => e.id === state.student)
    selected.value = select
}

watch(
    () => state.term,
    async () => {
        if (activeCycle.value == null) return
        const active = activeCycle.value.terms.find(e => e.id == state.term)
        if (active == null) return
        term.value = active
    },
    { immediate: true }
)

watch(() => children.value, (val) => {
    if (val.length && !state.student) {
        state.student = val[0].value
        change()
    }
}, { immediate: true })

async function fetchRecord() {
    await store.fetchAllStudents(0, 0)
}

watch(
    () => selected.value,
    async () => {
        await fetchCycle()
    },
    { immediate: true }
)

onMounted(async () => {
    useAppStore().setTitle('Dashboard')
    document.title = 'Dashboard | Skultem'
    await fetchRecord()
})
</script>