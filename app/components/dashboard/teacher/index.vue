<template>
    <div class="px-4 space-y-3 md:px-6">
        <DashboardWelcome />

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
                <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10">
                    <UIcon name="i-lucide-inbox" class="text-3xl text-primary-500" />
                </div>
                <p class="text-sm font-semibold text-highlighted">Nothing assigned yet</p>
                <p class="max-w-xs text-xs text-muted">You're not currently a class master or teaching any subject. Once
                    your
                    school assigns you one, it'll show up here.</p>
            </div>
        </UCard>

        <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
            <!-- LEFT: do stuff, then review how it's going -->
            <div class="space-y-4 lg:col-span-2">
                <!-- CLOCK IN / OUT -->
                <DashboardTeacherClockInOut v-if="isInstalled(ModuleKey.STAFF_HR)" />

                <!-- PERFORMANCE -->
                <template v-if="hasSubjects">
                    <SectionHeading title="Performance" subtitle="Pick a subject to see how that class is doing." accent="secondary" />

                    <UCard>
                        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
                            <div class="col-span-2 md:col-span-1">
                                <p class="mb-1 text-xs font-medium text-muted">Subject</p>
                                <USelectMenu value-key="value" v-model="state.clazz" :loading="loading" :items="subjects"
                                    placeholder="Select Subject" class="w-full" />
                            </div>
                            <div>
                                <p class="mb-1 text-xs font-medium text-muted">Term</p>
                                <USelectMenu value-key="value" v-model="state.term" :loading="loading" :items="terms"
                                    placeholder="Select Term" class="w-full" />
                            </div>
                            <div>
                                <p class="mb-1 text-xs font-medium text-muted">Assessment</p>
                                <USelectMenu value-key="value" v-model="state.assessment" :loading="loading"
                                    :items="assessmentItems" placeholder="Select Assessment" class="w-full" />
                            </div>
                        </div>
                    </UCard>

                    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <DashboardTeacherTotal :term="term" :session-id="selected?.classId" />
                        <DashboardTeacherClassAvarage :assessment="state.assessment" :class-id="selected?.classId"
                            :teacher="selected?.id" :term="term" :session-id="selected?.classId" />
                        <DashboardTeacherAttendance class="col-span-2 md:col-span-1"  :classId="selected?.classId" />
                    </div>

                    <DashboardTeacherGradeDistribution :assessment="state.assessment" :term="state.term"
                        :class-id="selected?.classId" :teacher="selected?.id" />
                    <DashboardTeacherAttendanceTrend :class-id="selected?.classId" />
                </template>

                <template v-else>
                    <SectionHeading title="Performance" subtitle="Subject performance for the classes you teach." accent="secondary" />

                    <UCard>
                        <div class="flex flex-col items-center gap-3 py-10 text-center">
                            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                                <UIcon name="i-lucide-bar-chart-3" class="text-2xl text-secondary-500" />
                            </div>
                            <p class="text-sm font-semibold text-highlighted">No subject performance to show</p>
                            <p class="max-w-sm text-xs text-muted">
                                You're set up as a class master but you're not currently teaching a subject, so
                                there's no assessment data to track here. Once your school assigns you a subject,
                                class averages and grade trends will show up in this space.
                            </p>
                        </div>
                    </UCard>
                </template>
            </div>

            <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
                <!-- MY CLASSES -->
                <UCard :ui="{ header: 'px-4 py-3', body: 'p-0 sm:p-0' }">
                    <template #header>
                        <div class="flex items-center justify-between gap-2">
                            <h3 class="font-semibold text-highlighted">My classes</h3>
                            <NuxtLink to="/classes" class="text-xs font-medium text-primary hover:underline">View all</NuxtLink>
                        </div>
                    </template>

                    <ul class="divide-y divide-default">
                        <li v-for="c in classMasterAssignments" :key="`m-${c.classMasterId}`">
                            <NuxtLink :to="classRosterUrl(c.classId, c.streamId, c.sessionId)"
                                class="flex items-center gap-3 px-4 py-3 transition hover:bg-elevated/40">
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-semibold text-highlighted">{{ c.sessionName || c.className }}</p>
                                    <p class="text-xs text-muted">
                                        {{ c.studentCount }} {{ c.studentCount === 1 ? 'student' : 'students' }}
                                    </p>
                                </div>
                                <UBadge v-if="attentionByClassId[c.classId]" color="warning" variant="subtle" size="sm"
                                    icon="i-lucide-alert-triangle" :label="`${attentionByClassId[c.classId]}`" />
                                <UBadge color="primary" variant="subtle" size="sm" label="Class master" />
                                <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-muted" />
                            </NuxtLink>
                        </li>
                        <li v-for="c in subjectOnlyClasses" :key="`s-${c.sessionId}`">
                            <NuxtLink :to="classRosterUrl(c.classId, c.streamId, c.sessionId)"
                                class="flex items-center gap-3 px-4 py-3 transition hover:bg-elevated/40">
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-semibold text-highlighted">
                                        {{ c.className }}<template v-if="c.sectionName"> {{ c.sectionName }}</template></p>
                                    <p class="truncate text-xs text-muted">{{ c.subjects.join(', ') }}</p>
                                </div>
                                <UBadge color="neutral" variant="subtle" size="sm" label="Subject" />
                                <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-muted" />
                            </NuxtLink>
                        </li>
                    </ul>
                </UCard>

                <!-- QUICK ACTIONS -->
                <UCard>
                    <SectionHeading title="Quick Actions" subtitle="Jump straight to the thing you came here to do." class="mb-3" />

                    <div class="grid gap-3" :class="hasSubjects ? 'grid-cols-2' : 'grid-cols-2'">
                        <NuxtLink to="/classes"
                            class="group flex flex-col items-center gap-2 rounded-2xl border border-default bg-elevated/30 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md">
                            <div
                                class="flex size-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                                <UIcon class="size-5" :name="CLASS_ICON" />
                            </div>
                            <p class="text-xs font-medium text-highlighted">My Classes</p>
                        </NuxtLink>

                        <NuxtLink v-if="hasSubjects" to="/grades"
                            class="group flex flex-col items-center gap-2 rounded-2xl border border-default bg-elevated/30 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                            <div
                                class="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                <UIcon class="size-5" :name="GRADES_ICON" />
                            </div>
                            <p class="text-xs font-medium text-highlighted">Mark Grade</p>
                        </NuxtLink>

                        <NuxtLink to="/attendance"
                            class="group flex flex-col items-center gap-2 rounded-2xl border border-default bg-elevated/30 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-success/40 hover:shadow-md">
                            <div
                                class="flex size-11 items-center justify-center rounded-2xl bg-success/10 text-success transition-colors group-hover:bg-success group-hover:text-white">
                                <UIcon class="size-5" :name="ATTENDANCE_ICON" />
                            </div>
                            <p class="text-xs font-medium text-highlighted">Mark Attendance</p>
                        </NuxtLink>

                        <NuxtLink to="/behaviours"
                            class="group flex flex-col items-center gap-2 rounded-2xl border border-default bg-elevated/30 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-info/40 hover:shadow-md">
                            <div
                                class="flex size-11 items-center justify-center rounded-2xl bg-info/10 text-info transition-colors group-hover:bg-info group-hover:text-white">
                                <UIcon class="size-5" :name="BEHAVIOUR_ICON" />
                            </div>
                            <p class="text-xs font-medium text-highlighted">Mark Behaviour</p>
                        </NuxtLink>

                        <NuxtLink to="/fees"
                            class="group flex flex-col items-center gap-2 rounded-2xl border border-default bg-elevated/30 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-error/40 hover:shadow-md">
                            <div
                                class="flex size-11 items-center justify-center rounded-2xl bg-error/10 text-error transition-colors group-hover:bg-error group-hover:text-white">
                                <UIcon class="size-5" :name="FEE_STRUCTURE_ICON" />
                            </div>
                            <p class="text-xs font-medium text-highlighted">Check Fees</p>
                        </NuxtLink>
                    </div>
                </UCard>

            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const store = useTeacherSubjectStore()
const studentStore = useStudentStore()
const assessmentStore = useAssessmentStore()
const userStore = useUserStore()
const teacherAttendanceStore = useTeacherAttendanceStore()
const { isInstalled } = useModules()
const { assessments } = storeToRefs(assessmentStore)
const { activeCycle } = storeToRefs(studentStore)
const { loading } = storeToRefs(store)
const { user } = storeToRefs(userStore)
const { myToday } = storeToRefs(teacherAttendanceStore)

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

const myClasses = computed(() => {
    const map = new Map<string, { sessionId: string, classId: string, streamId: string, className: string, sectionName: string, subjects: string[] }>()

    for (const r of records.value) {
        if (!map.has(r.sessionId)) {
            map.set(r.sessionId, {
                sessionId: r.sessionId,
                classId: r.classId,
                streamId: r.streamId,
                className: r.className,
                sectionName: r.sectionName,
                subjects: []
            })
        }
        map.get(r.sessionId)!.subjects.push(r.subjectName)
    }

    return Array.from(map.values())
})

// --- Class master ---
// Classes I only teach a subject in (the ones I'm class master of are listed separately above them).
const classMasterAssignments = ref<TeacherClassMaster[]>([])
const loadingAssignments = ref(true)
const loadingSubjects = ref(true)
const subjectOnlyClasses = computed(() => {
    const masterSessions = new Set(classMasterAssignments.value.map(a => a.sessionId))
    return myClasses.value.filter(c => !masterSessions.has(c.sessionId))
})
const hasClassMaster = computed(() => classMasterAssignments.value.length > 0)
const initialLoading = computed(() => loadingAssignments.value || loadingSubjects.value)

// Distinct classes across "class master" and "teaches a subject in" - shown as a single
// glanceable count in the hero banner.
const totalClassCount = computed(() => {
    const ids = new Set([
        ...myClasses.value.map(c => c.sessionId),
        ...classMasterAssignments.value.map(a => a.sessionId)
    ])
    return ids.size
})

// How many students in each class-master session are below the attendance
// threshold - same threshold and per-student computation as the class roster
// page, just rolled up to a count so a card can flag it without listing names.
// Keyed by classId, not sessionId - ComputeClassAttentionUseCase (the same backend logic the
// class detail page and admin dashboard widget use: attendance rate over the last 30 days OR
// average score below the pass mark) aggregates across every stream of a class, not one stream
// at a time. A class split into streams (e.g. SSS2 Science/Art) will show the whole class's
// flagged count on each stream's card rather than a stream-exact one - an accepted trade-off for
// reusing one consistent "needs attention" definition everywhere instead of a second, narrower,
// attendance-only computation just for this dashboard.
const attentionByClassId = ref<Record<string, number>>({})

const totalAttentionCount = computed(() =>
    Object.values(attentionByClassId.value).reduce((sum, n) => sum + n, 0)
)

async function fetchAttentionCounts(sessions: { sessionId: string, classId: string, streamId?: string | null }[]) {
    const uniqueClassIds = [...new Set(sessions.filter(s => s.classId).map(s => s.classId))]
    if (!uniqueClassIds.length) return

    const entries = await Promise.all(uniqueClassIds.map(async (classId) => {
        try {
            const res = await ClassApi().getAttention(classId)
            return [classId, res?.flaggedCount ?? 0] as const
        } catch (err) {
            console.error('Failed to load attention status for class', classId, err)
            return [classId, 0] as const
        }
    }))

    attentionByClassId.value = { ...attentionByClassId.value, ...Object.fromEntries(entries) }
}

async function fetchClassMasterAssignments() {
    loadingAssignments.value = true
    try {
        classMasterAssignments.value = await TeacherApi().getMyClassMasterAssignments() || []
        fetchAttentionCounts(classMasterAssignments.value)
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
    }
}, { immediate: true })

watch(() => state.clazz, change, { immediate: true })

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
    if (!myToday.value) teacherAttendanceStore.fetchMyToday()
})
</script>
