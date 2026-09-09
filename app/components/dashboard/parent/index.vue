<template>
    <div class="px-4 space-y-4 md:px-6">
        <UCard>
            <div class="grid grid-cols-2 gap-2">
                <USelectMenu value-key="value" v-model="state.student" @change="change" :loading="loading"
                    :items="children" placeholder="Select Student" />
                <USelectMenu value-key="value" v-model="state.term" :loading="cycleLoading" :items="terms"
                    placeholder="Select Term" />
            </div>
        </UCard>

        <!-- One synthesized, plain-language line instead of making a parent read four separate
             numbers to work out how things stand - a fee balance always wins the slot since it's
             the one thing that's actually actionable; low attendance is the next most worth
             flagging; otherwise it's a genuine "all good" summary rather than silence. -->
        <UCard v-if="insight">
            <div class="flex items-start gap-3 rounded-xl p-1" :class="insight.bg">
                <UIcon :name="insight.icon" class="mt-0.5 size-5 shrink-0" :class="insight.text" />
                <div class="space-y-0.5">
                    <p class="text-sm font-semibold" :class="insight.text">{{ insight.title }}</p>
                    <p class="text-xs text-muted">{{ insight.message }}</p>
                </div>
            </div>
        </UCard>

        <div class="grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-3">
            <DashboardParentAvarage :term="term" :session-id="selected?.sessionId || ''" :id="state.student"
                @ready="onAverageReady" />
            <Metric :record="{
                label: 'Class Rank', color: 'primary', value: rank, isReady: rankReady, icon: LEADER_ICON,
                subtle: selected ? `Out of ${selected.classSize} in ${selected.className}` : undefined
            }" />
            <DashboardParentAttendance :id="state.student" @ready="onAttendanceReady" />
            <DashboardParentFees :id="state.student" @ready="onFeeReady" />
        </div>

        <div class="grid md:grid-cols-2 md:gap-5 gap-3">
            <DashboardParentGradeTrend :id="state.student" />
            <DashboardParentSubjectPerformance :term="state.term" :id="state.student" />
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <p>Student Information</p>
                        <UButton v-if="selected?.classId" :to="`/classes/${selected.classId}`" size="sm"
                            variant="soft" color="neutral" label="View Class" :icon="CLASS_ICON" />
                    </div>
                </template>
                <div v-if="selected">
                    <div class="justify-between flex border-b py-3.5 border-gray-200 dark:border-gray-800">
                        <p class="text-muted">Class:</p>
                        <p>{{ selected.className }}</p>
                    </div>
                    <div class="justify-between flex border-b py-3.5 border-gray-200 dark:border-gray-800">
                        <p class="text-muted">Class Teacher:</p>
                        <p>{{ selected.classTeacher }}</p>
                    </div>
                    <div class="justify-between flex py-3.5">
                        <p class="text-muted">Total Students:</p>
                        <p>{{ selected.classSize }}</p>
                    </div>
                </div>
            </UCard>
            <DashboardParentUpdate />
        </div>

        <UCard>
            <div class="grid md:grid-cols-5 grid-cols-2 gap-3">
                <UButton to="/performance" color="success" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" :name="PERFORMANCE_ICON" />
                        <p>Performance</p>
                    </div>
                </UButton>
                <UButton to="/curriculums" color="warning" class="w-full flex justify-center py-4 rounded-xl"
                    variant="subtle">
                    <div class="flex flex-col items-center space-y-2">
                        <UIcon class="text-xl" name="i-lucide-book-open" />
                        <p>Curriculum</p>
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
const { activeCycle, loading: cycleLoading } = storeToRefs(studentStore)
const { students, loading } = storeToRefs(store)
const { format } = useMoney()

const state = reactive<{ student: string, term: string }>({
    student: '',
    term: ''
})

const selected = ref<Student | undefined>()

const terms = computed(() => activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })) || [])

const term = computed(() =>
    activeCycle.value?.terms.find(e => e.id === state.term)
)

const studentFirstName = computed(() => selected.value?.givenNames || 'Your child')

const children = computed(() =>
    students.value.map(e => ({
        label: `${e.givenNames} ${e.familyName} - ${e.className}`,
        value: e.id
    }))
)

async function fetchCycle() {
    if (!selected.value) return

    await studentStore.fetchActiveCycle(selected.value.sessionId)

    if (!activeCycle.value) return

    const cycleTerms = activeCycle.value.terms
    if (!cycleTerms.length) return

    // Same fallback as pages/performance.vue - a cycle with no term marked ACTIVE (e.g. a class
    // that hasn't rolled into the school's current term yet) used to leave state.term blank
    // forever, starving every stat tile and chart below.
    const active = cycleTerms.find(e => e.status === "ACTIVE")
        ?? cycleTerms.reduce((latest, t) => t.termNumber > latest.termNumber ? t : latest)

    const termIndex = terms.value.findIndex(e => e.value === active.id)
    state.term = terms.value[termIndex]?.value || ''
}

function change() {
    const select = students.value.find(e => e.id === state.student)
    selected.value = select
}

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

// --- Class Rank - a flat stat tile like performance.vue, instead of a row buried inside the
// Student Information card below. ---
const rankReady = ref(false)
const rank = ref('—')

function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return `${n}${(s[(v - 20) % 10] || s[v] || s[0])}`
}

async function loadRank() {
    if (!state.term || !state.student) return

    rankReady.value = false
    try {
        const res = await studentStore.fetchRank(state.student, state.term)
        rank.value = res ? ordinal(Number(res)) : '—'
    } finally {
        rankReady.value = true
    }
}

// --- At-a-glance insight - built from the same numbers the Average/Attendance/Fees tiles
// already fetch, via their `ready` emit, so nothing is fetched twice. ---
const averageValue = ref(0)
const averageReady = ref(false)
const attendanceValue = ref(0)
const attendanceReady = ref(false)
const feeBalance = ref(0)
const feeReady = ref(false)

function onAverageReady(value: number) {
    averageValue.value = value
    averageReady.value = true
}

function onAttendanceReady(value: number) {
    attendanceValue.value = value
    attendanceReady.value = true
}

function onFeeReady(value: number) {
    feeBalance.value = value
    feeReady.value = true
}

const insight = computed(() => {
    if (!averageReady.value || !attendanceReady.value || !feeReady.value) return null

    if (feeBalance.value > 0) {
        return {
            icon: 'lucide:credit-card', bg: 'bg-warning-50 dark:bg-warning-500/10', text: 'text-warning',
            title: `${format(feeBalance.value)} fee balance outstanding`,
            message: `Settle ${studentFirstName.value}'s balance to keep everything on track.`
        }
    }

    if (attendanceValue.value < 90) {
        return {
            icon: 'lucide:calendar-x', bg: 'bg-warning-50 dark:bg-warning-500/10', text: 'text-warning',
            title: `Attendance is at ${attendanceValue.value.toFixed(0)}% this term`,
            message: `Worth checking in on why ${studentFirstName.value} has been missing school.`
        }
    }

    return {
        icon: 'lucide:sparkles', bg: 'bg-success-50 dark:bg-success-500/10', text: 'text-success',
        title: `${studentFirstName.value} is doing well this term`,
        message: `Averaging ${averageValue.value.toFixed(0)}% with no outstanding fees.`
    }
})

// Attendance and Fees are keyed only on the student (not the term), so resetting them on every
// [student, term] tuple change - including the transient student-set/term-still-empty moment
// during the initial load cascade - raced their own already-arrived `ready` emit: the reset fired
// again once term populated a moment later, wiping a flag its own component would never re-emit
// (its prop hadn't actually changed), leaving the insight banner permanently blank. Reset each
// flag only against the dimension it actually depends on, and only on a genuine value-to-value
// change (guarding on `old` skips the initial '' -> real-value hydration, which starts `false`
// already).
watch(() => state.student, (val, old) => {
    if (old && val !== old) {
        averageReady.value = false
        attendanceReady.value = false
        feeReady.value = false
    }
})

watch(() => state.term, (val, old) => {
    if (old && val !== old) {
        averageReady.value = false
    }
})

watch(
    () => [state.student, state.term],
    () => {
        loadRank()
    }
)

onMounted(async () => {
    useAppStore().setTitle('Dashboard')
    document.title = 'Dashboard | Skultem'
    await fetchRecord()
})
</script>
