<template>
    <div class="p-5 space-y-5">
        <UCard>
            <USelectMenu value-key="value" v-model="state.student" @change="change" :loading="loading" :items="children"
                placeholder="Select Student" />
        </UCard>
        <div class="grid grid-cols-3 gap-5">
            <DashboardParentAvarage :session-id="selected?.sessionId || ''" :id="state.student" />
            <DashboardParentAttendance :id="state.student" />
            <Metric v-for="item in reports" :key="item.id" :record="item" />
        </div>
        <div class="grid grid-cols-2 gap-5">
            <DashboardParentGradeTrend :id="state.student" />
            <DashboardParentSubjectPerformance :id="state.student" />
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
                        <div class="justify-between flex py-2 border-gray-200">
                            <p class="text-muted">Class Rank:</p>
                            <p>5th</p>
                        </div>
                    </div>
                </div>
            </UCard>
            <DashboardParentUpdate />
        </div>
        <UCard>
            <div class="grid grid-cols-4 gap-3">
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="GRADES_ICON" />
                        <p>View Grade</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="ATTENDANCE_ICON" />
                        <p>Check Attendance</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="PAYMENT_ICON" />
                        <p>Fee</p>
                    </div>
                </UButton>
                <UButton to="/teachers" color="neutral" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="HISTORY_ICON" />
                        <p>Download Report</p>
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

const state = reactive<{ student: string }>({
    student: ''
})

const selected = ref<Student | undefined>()

const terms = computed(() => activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })))

const children = computed(() =>
    students.value.map(e => ({
        label: `${e.givenNames} ${e.familyName} - ${e.className}`,
        value: e.id
    }))
)

const reports = [
    { id: '3', label: 'Fee Balance', icon: PAYMENT_ICON, value: 'NLE 0', subtle: 'All Paid', isReady: true, color: 'error' },
]

function change() {
    const select = students.value.find(e => e.id === state.student) // ← fix: === not =
    selected.value = select
}

watch(() => children.value, (val) => {
    if (val.length && !state.student) {
        state.student = val[0].value  // ← set first, then change
        change()
    }
}, { immediate: true })

async function fetchRecord() {
    await store.fetchAllStudents(0, 0)
}

onMounted(async () => {
    useAppStore().setTitle('Dashboard')
    document.title = 'Dashboard | Skultem'
    await fetchRecord()
})
</script>