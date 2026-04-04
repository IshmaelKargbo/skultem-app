<template>
    <div class="md:p-7 p-4 md:space-y-5 space-y-3">
        <div class="flex space-x-3">
            <USelectMenu value-key="value" v-model="state.clazz" @change="change" :loading="loading" :items="subjects"
                placeholder="Select Subject" />
            <USelectMenu value-key="value" v-model="state.term" :loading="loading" :items="terms"
                placeholder="Select Term" />
        </div>
        <div class="grid md:grid-cols-3 grid-cols-2 md:gap-5 gap-3">
            <DashboardTeacherTotal :term="term" :session-id="selected?.classId" />
            <DashboardTeacherClassAvarage :term="term" :session-id="selected?.classId" />
            <DashboardTeacherAttendance class="col-span-2 md:col-span-1" :classId="selected?.classId" />
        </div>
        <div class="grid md:grid-cols-2 md:gap-5 gap-3">
            <DashboardTeacherGradeDistribution :term="state.term" :class-id="selected?.classId" />
            <DashboardTeacherAttendanceTrend :class-id="selected?.classId" />
        </div>
        <UCard>
            <div class="grid md:grid-cols-4 grid-cols-2 gap-3">
                <UButton to="/grades" color="primary" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="GRADES_ICON" />
                        <p>Mark Grade</p>
                    </div>
                </UButton>
                <UButton to="/attendance" color="success" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
                        <p>Mark Attendance</p>
                    </div>
                </UButton>
                <UButton to="/behaviours" color="info" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="BEHAVIOUR_ICON" />
                        <p>Mark Behaviour</p>
                    </div>
                </UButton>
                <UButton to="/fees" color="error" class="w-full flex justify-center py-4 rounded-xl" variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="FEE_STRUCTURE_ICON" />
                        <p>Check Fees</p>
                    </div>
                </UButton>
            </div>
        </UCard>
    </div>
</template>
<script setup lang="ts">
const store = useTeacherSubjectStore()
const studentStore = useStudentStore()
const { activeCycle } = storeToRefs(studentStore)
const { loading } = storeToRefs(store)

const records = ref<TeacherSubject[]>([])
const state = reactive<{ clazz: string, term: string }>({
    clazz: '',
    term: ''
})

const selected = ref<TeacherSubject | undefined>()

const terms = computed(() => activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })))

const term = ref<Term | undefined>()

const subjects = computed(() =>
    records.value.map(e => ({
        label: `${e.subjectName} - ${e.className}(${e.sectionName})`,
        value: e.id
    }))
)

async function fetchCycle() {
    if (selected.value == null) return null
    await studentStore.fetchActiveCycle("all")
    if (activeCycle.value == null) return null
    const active = activeCycle.value.terms.find(e => e.status == "ACTIVE")
    if (active == null) return
    if (terms.value == null) return
    const termIndex = terms.value.findIndex(e => e.value == active.id)
    state.term = terms.value[termIndex]?.value || ''
    term.value = active
}

function change() {
    const select = records.value.find(e => e.id === state.clazz)
    selected.value = select
}

watch(() => subjects.value, (val: any) => {
    if (val.length && !state.clazz) {
        state.clazz = val[0].value
        change()
    }
}, { immediate: true })

async function fetchRecord() {
    const res = await store.fetchAllByTeacher(0, 0)
    records.value = res
}

watch(
    () => selected.value,
    async () => {
        await fetchCycle()
    },
    { immediate: true }
)

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

onMounted(async () => {
    useAppStore().setTitle('Dashboard')
    document.title = 'Dashboard | Skultem'
    await fetchRecord()
})
</script>