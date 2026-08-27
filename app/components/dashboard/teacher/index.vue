<template>
    <div class="px-4 space-y-4 md:px-6">
        <!-- MY CLASS (class master) -->
        <template v-if="hasClassMaster">
            <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-check" class="size-4 text-primary" />
                <h3 class="text-sm font-semibold text-highlighted">My Class</h3>
            </div>

            <div class="grid gap-3 md:grid-cols-2">
                <UCard v-for="a in classMasterAssignments" :key="a.sessionId" :ui="{ body: 'space-y-3' }">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="truncate font-semibold text-highlighted">{{ a.sessionName }}</p>
                            <p class="text-xs text-muted">{{ a.studentCount }} student{{ a.studentCount === 1 ? '' : 's' }}</p>
                        </div>

                        <UBadge :color="classMasterBadge(a.promotionStatus).color" variant="subtle" size="sm" class="shrink-0">
                            {{ classMasterBadge(a.promotionStatus).label }}
                        </UBadge>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <UButton :to="`/classes/${a.classId}`" size="xs" variant="soft" color="neutral" label="View Class" icon="i-lucide-school" />

                        <UButton
                            v-if="a.promotionStatus === 'READY' || a.promotionStatus === 'RETURNED'"
                            :to="`/promotion/${a.sessionId}`" size="xs" variant="soft" color="primary"
                            :icon="PROMOTE_STUDENTS_ICON"
                            :label="a.promotionStatus === 'RETURNED' ? 'Review & Resubmit' : 'Promote Class'"
                        />
                    </div>
                </UCard>
            </div>
        </template>

        <div v-if="hasClassMaster && hasSubjects" class="flex items-center gap-2 pt-1">
            <UIcon name="i-lucide-book-open" class="size-4 text-primary" />
            <h3 class="text-sm font-semibold text-highlighted">Teaching</h3>
        </div>

        <!-- SUBJECT TEACHING DASHBOARD -->
        <template v-if="hasSubjects">
            <UCard>
                <div class="flex space-x-3">
                    <USelectMenu value-key="value" v-model="state.clazz" @change="change" :loading="loading"
                        :items="subjects" placeholder="Select Subject" />
                    <USelectMenu value-key="value" v-model="state.term" :loading="loading" :items="terms"
                        placeholder="Select Term" />
                    <USelectMenu value-key="value" v-model="state.assessment" :loading="loading" :items="assessmentItems"
                        placeholder="Select Assessment" />
                </div>
            </UCard>
            <div class="grid md:grid-cols-3 grid-cols-2 md:gap-5 gap-3">
                <DashboardTeacherTotal :term="term" :session-id="selected?.classId" />
                <DashboardTeacherClassAvarage :assessment="state.assessment" :class-id="selected?.classId"
                    :teacher="selected?.id" :term="term" :session-id="selected?.classId" />
                <DashboardTeacherAttendance class="col-span-2 md:col-span-1" :classId="selected?.classId" />
            </div>
            <div class="grid md:grid-cols-2 md:gap-5 gap-3">
                <DashboardTeacherGradeDistribution :assessment="state.assessment" :term="state.term"
                    :class-id="selected?.classId" :teacher="selected?.id" />
                <DashboardTeacherAttendanceTrend :class-id="selected?.classId" />
            </div>
        </template>

        <!-- QUICK ACTIONS -->
        <UCard v-if="hasSubjects || hasClassMaster">
            <div class="grid gap-3" :class="hasSubjects ? 'md:grid-cols-4 grid-cols-2' : 'md:grid-cols-3 grid-cols-3'">
                <UButton v-if="hasSubjects" to="/grades" color="primary" class="w-full flex justify-center py-4 rounded-xl"
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

        <!-- LOADING -->
        <UCard v-if="initialLoading">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <USkeleton class="size-10 rounded-2xl" />
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-56" />
            </div>
        </UCard>

        <!-- EMPTY STATE -->
        <UCard v-else-if="!hasSubjects && !hasClassMaster">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="i-lucide-inbox" class="text-3xl text-primary-500" />
                </div>
                <p class="text-sm font-semibold text-highlighted">Nothing assigned yet</p>
                <p class="max-w-xs text-xs text-muted">You're not currently a class master or teaching any subject. Once your school assigns you one, it'll show up here.</p>
            </div>
        </UCard>
    </div>
</template>
<script setup lang="ts">
const store = useTeacherSubjectStore()
const studentStore = useStudentStore()
const assessmentStore = useAssessmentStore()
const { assessments } = storeToRefs(assessmentStore)
const { activeCycle } = storeToRefs(studentStore)
const { loading } = storeToRefs(store)

const records = ref<TeacherSubject[]>([])
const state = reactive<{ clazz: string, term: string, assessment: string }>({
    clazz: '',
    term: '',
    assessment: ''
})

const selected = ref<TeacherSubject | undefined>()

const terms = computed(() => activeCycle.value?.terms.map(e => ({ label: e.name, value: e.id })))

const assessmentItems = computed(() => assessments.value?.map(e => ({ label: e.name, value: e.id })))

const term = ref<Term | undefined>()

const subjects = computed(() =>
    records.value.map(e => ({
        label: `${e.subjectName} - ${e.className}(${e.sectionName})`,
        value: e.id
    }))
)

const hasSubjects = computed(() => records.value.length > 0)

// --- Class master ---
const classMasterAssignments = ref<TeacherClassMaster[]>([])
const loadingAssignments = ref(true)
const loadingSubjects = ref(true)
const hasClassMaster = computed(() => classMasterAssignments.value.length > 0)
const initialLoading = computed(() => loadingAssignments.value || loadingSubjects.value)

const classMasterBadgeStyles: Record<string, { label: string, color: 'neutral' | 'warning' | 'success' | 'error' }> = {
    READY: { label: 'Ready to promote', color: 'warning' },
    PENDING_REVIEW: { label: 'Awaiting approval', color: 'warning' },
    RETURNED: { label: 'Returned - needs changes', color: 'error' },
    APPROVED: { label: 'Promoted', color: 'success' }
}

function classMasterBadge(status: TeacherClassMasterPromotionStatus) {
    return status ? classMasterBadgeStyles[status] || { label: 'On track', color: 'neutral' } : { label: 'On track', color: 'neutral' }
}

async function fetchClassMasterAssignments() {
    loadingAssignments.value = true
    try {
        classMasterAssignments.value = await TeacherApi().getMyClassMasterAssignments() || []
    } finally {
        loadingAssignments.value = false
    }
}

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
    loadingSubjects.value = true
    try {
        const res = await store.fetchAllByTeacher(0, 0)
        records.value = res || []
    } finally {
        loadingSubjects.value = false
    }
}

async function fetchAssessment() {
    if (!selected.value) return null
    await assessmentStore.fetchClassAssessments(selected.value.classId)

    if (assessmentItems.value && assessmentItems.value.length > 0)
        state.assessment = assessmentItems.value[0].value
}

watch(
    () => selected.value,
    async () => {
        await fetchCycle()
        await fetchAssessment()
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
    await Promise.all([fetchRecord(), fetchClassMasterAssignments()])
})
</script>
