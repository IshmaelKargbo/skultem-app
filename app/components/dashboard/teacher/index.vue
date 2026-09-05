<template>
    <div class="px-4 space-y-4 md:px-6">
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10" />

            <div class="px-5 pb-5">
                <div class="-mt-12 flex min-w-0 items-end gap-4 md:-mt-14">
                    <div class="relative shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                        <UAvatar :src="user?.photo || undefined" :alt="user?.givenNames" size="3xl"
                            class="h-20 w-20 rounded-xl md:h-24 md:w-24" />
                    </div>

                    <div class="min-w-0 pb-0.5 md:pb-1">
                        <h2 class="truncate text-xl font-bold tracking-tight text-highlighted md:text-2xl">
                            {{ greeting }}, {{ user?.givenNames || 'there' }} <span aria-hidden="true">👋</span>
                        </h2>

                        <div class="mt-2 flex flex-wrap items-center gap-2">
                            <span class="text-sm text-muted">{{ today }}</span>

                            <span class="size-1 rounded-full bg-dimmed" />

                            <UBadge :color="clockBadgeColor" variant="subtle" size="xs" class="rounded-full">
                                <span class="mr-1.5 size-1.5 rounded-full" :class="`bg-${clockBadgeColor}`" />
                                {{ clockStatusText }}
                            </UBadge>

                            <template v-if="hasSubjects || hasClassMaster">
                                <span class="size-1 rounded-full bg-dimmed" />
                                <span class="text-sm text-muted">{{ totalClassCount }} class{{ totalClassCount === 1 ? '' : 'es' }}</span>
                            </template>

                            <UBadge v-if="totalAttentionCount > 0" color="warning" variant="subtle" size="xs"
                                class="rounded-full" icon="i-lucide-alert-triangle">
                                {{ totalAttentionCount }} need{{ totalAttentionCount === 1 ? 's' : '' }} attention
                            </UBadge>
                        </div>
                    </div>
                </div>
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
                <DashboardTeacherClockInOut />

                <!-- PERFORMANCE -->
                <template v-if="hasSubjects">
                    <SectionHeading title="Performance" subtitle="Pick a subject to see how that class is doing." accent="secondary" />

                    <UCard>
                        <div class="grid gap-3 sm:grid-cols-3">
                            <div>
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

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <DashboardTeacherTotal :term="term" :session-id="selected?.classId" />
                        <DashboardTeacherClassAvarage :assessment="state.assessment" :class-id="selected?.classId"
                            :teacher="selected?.id" :term="term" :session-id="selected?.classId" />
                        <DashboardTeacherAttendance :classId="selected?.classId" />
                    </div>

                    <DashboardTeacherGradeDistribution :assessment="state.assessment" :term="state.term"
                        :class-id="selected?.classId" :teacher="selected?.id" />
                    <DashboardTeacherAttendanceTrend :class-id="selected?.classId" />
                </template>
            </div>

            <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
                <!-- QUICK ACTIONS -->
                <UCard>
                    <SectionHeading title="Quick Actions" subtitle="Jump straight to the thing you came here to do." class="mb-3" />

                    <div class="grid gap-3" :class="hasSubjects ? 'grid-cols-2' : 'grid-cols-3'">
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

                <!-- MY CLASS (class master) -->
                <template v-if="hasClassMaster">
                    <SectionHeading title="My Class" subtitle="The class you're responsible for as class master." />

                    <div class="space-y-3">
                        <UCard v-for="a in visibleClassMasterAssignments" :key="a.sessionId" :ui="{
                            root: needsAttention(a.promotionStatus) || attentionCount(a.sessionId) > 0 ? 'ring-1 ring-warning/40' : '',
                            body: 'p-0 sm:p-0'
                        }">
                            <div class="flex items-start justify-between gap-3 p-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <div
                                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <UIcon name="i-lucide-graduation-cap" class="size-5" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="truncate font-semibold text-highlighted">{{ a.sessionName }}</p>
                                        <p class="flex items-center gap-1 text-xs text-muted">
                                            <UIcon name="i-lucide-users" class="size-3.5" />
                                            {{ a.studentCount }} student{{ a.studentCount === 1 ? '' : 's' }}
                                        </p>
                                        <p v-if="attentionCount(a.sessionId) > 0" class="flex items-center gap-1 text-xs text-warning">
                                            <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
                                            {{ attentionCount(a.sessionId) }} need{{ attentionCount(a.sessionId) === 1 ? 's' : '' }} attention
                                        </p>
                                    </div>
                                </div>

                                <UBadge :color="classMasterBadge(a.promotionStatus).color" variant="subtle" size="sm"
                                    class="shrink-0">
                                    {{ classMasterBadge(a.promotionStatus).label }}
                                </UBadge>
                            </div>

                            <USeparator />

                            <div class="flex flex-wrap items-center gap-2 p-3">
                                <UButton :to="classRosterUrl(a.classId, a.streamId)" size="sm" variant="soft" color="neutral"
                                    label="View Class" :icon="CLASS_ICON" />

                                <UButton :to="`/curriculums?sessionId=${a.sessionId}`" size="sm" variant="soft" color="neutral"
                                    label="View Curriculum" icon="i-lucide-book-open" />

                                <UButton to="/grades/approval" size="sm" variant="soft" color="neutral"
                                    label="Grade Approval" :icon="GRADES_APPROVAL_ICON" />

                                <UButton :to="`/timetable?session=${a.sessionId}`" size="sm" variant="soft" color="neutral"
                                    label="Timetable" icon="i-lucide-calendar-days" />

                                <UButton v-if="a.promotionStatus === 'READY' || a.promotionStatus === 'RETURNED'"
                                    :to="`/promotion/${a.sessionId}`" size="sm" variant="solid"
                                    :color="a.promotionStatus === 'RETURNED' ? 'error' : 'primary'"
                                    :icon="PROMOTE_STUDENTS_ICON"
                                    :label="a.promotionStatus === 'RETURNED' ? 'Review & Resubmit' : 'Promote Class'"
                                    class="ml-auto" />
                            </div>
                        </UCard>

                        <UButton v-if="classMasterAssignments.length > CLASS_MASTER_PREVIEW_COUNT" block size="sm"
                            variant="ghost" color="neutral"
                            :trailing-icon="showAllClassMasters ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                            :label="showAllClassMasters ? 'Show less' : `Show all (${classMasterAssignments.length})`"
                            @click="showAllClassMasters = !showAllClassMasters" />
                    </div>
                </template>

                <!-- MY CLASSES (all classes taught) -->
                <template v-if="hasSubjects">
                    <SectionHeading title="My Classes" subtitle="Every class you teach a subject in." :class="hasClassMaster ? 'pt-1' : ''" />

                    <div class="space-y-3">
                        <UCard v-for="c in visibleMyClasses" :key="c.sessionId" :ui="{ body: 'p-0 sm:p-0' }">
                            <div class="p-3 space-y-2">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="flex min-w-0 items-center gap-3">
                                        <div
                                            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <UIcon name="i-lucide-users-round" class="size-5" />
                                        </div>
                                        <div class="min-w-0">
                                            <p class="truncate font-semibold text-highlighted">{{ c.className }}{{ c.sectionName
                                                ? `(${c.sectionName})` : '' }}</p>
                                            <p class="text-xs text-muted">{{ c.subjects.length }} subject{{ c.subjects.length
                                                === 1 ? '' : 's' }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-wrap gap-1.5">
                                    <UBadge v-for="s in c.subjects" :key="s" variant="subtle" color="neutral" size="sm">{{ s }}
                                    </UBadge>
                                </div>
                            </div>
                            <USeparator />
                            <div class="flex flex-wrap gap-3 p-3">
                                <UButton v-if="isClassMaster(c.sessionId)" :to="classRosterUrl(c.classId, c.streamId)"
                                    size="sm" variant="soft" color="neutral" label="View Class" icon="i-lucide-school" />
                                <UButton v-else :to="`/curriculums?sessionId=${c.sessionId}`" size="sm" variant="soft"
                                    color="neutral" label="View Curriculum" icon="i-lucide-book-open" />
                                <UButton :to="`/timetable?session=${c.sessionId}`" size="sm" variant="soft" color="neutral"
                                    label="Timetable" icon="i-lucide-calendar-days" />
                            </div>
                        </UCard>

                        <UButton v-if="myClasses.length > MY_CLASSES_PREVIEW_COUNT" block size="sm" variant="ghost"
                            color="neutral"
                            :trailing-icon="showAllMyClasses ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                            :label="showAllMyClasses ? 'Show less' : `Show all (${myClasses.length})`"
                            @click="showAllMyClasses = !showAllMyClasses" />
                    </div>
                </template>
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
const { assessments } = storeToRefs(assessmentStore)
const { activeCycle } = storeToRefs(studentStore)
const { loading } = storeToRefs(store)
const { user } = storeToRefs(userStore)
const { myToday } = storeToRefs(teacherAttendanceStore)

const hour = new Date().getHours()

const greeting = computed(() => {
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
})

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

// Read-only view onto the same clock-in/out store ClockInOut owns and fetches -
// this just surfaces its status as a badge in the hero banner so a teacher doesn't
// have to scan down the page to see whether they've clocked in today. Warning while
// unclocked is a gentle nudge, same as every other "needs action" badge in the app.
const clockBadgeColor = computed<'success' | 'primary' | 'warning' | 'neutral'>(() => {
    if (!myToday.value) return 'neutral'
    if (myToday.value.clockedInAt && myToday.value.clockedOutAt) return 'success'
    if (myToday.value.clockedInAt) return 'primary'
    return 'warning'
})

const clockStatusText = computed(() => {
    if (!myToday.value) return 'Checking clock status…'
    if (myToday.value.clockedInAt && myToday.value.clockedOutAt) return 'Day complete'
    if (myToday.value.clockedInAt) {
        const time = new Date(myToday.value.clockedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return `Clocked in at ${time}`
    }
    return 'Not clocked in yet'
})

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
const classMasterAssignments = ref<TeacherClassMaster[]>([])
const loadingAssignments = ref(true)
const loadingSubjects = ref(true)
const hasClassMaster = computed(() => classMasterAssignments.value.length > 0)
const initialLoading = computed(() => loadingAssignments.value || loadingSubjects.value)

// A teacher can be class master of, and/or teach a subject in, more than a handful of
// classes - the right rail previews a few of each and expands in place on request rather
// than paginating, since both lists are already fully loaded on the client (no extra
// fetch to page through).
const CLASS_MASTER_PREVIEW_COUNT = 3
const MY_CLASSES_PREVIEW_COUNT = 3
const showAllClassMasters = ref(false)
const showAllMyClasses = ref(false)

const visibleClassMasterAssignments = computed(() =>
    showAllClassMasters.value ? classMasterAssignments.value : classMasterAssignments.value.slice(0, CLASS_MASTER_PREVIEW_COUNT)
)

const visibleMyClasses = computed(() =>
    showAllMyClasses.value ? myClasses.value : myClasses.value.slice(0, MY_CLASSES_PREVIEW_COUNT)
)

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

function attentionCount(sessionId: string) {
    const classId = classMasterAssignments.value.find(a => a.sessionId === sessionId)?.classId
    return classId ? (attentionByClassId.value[classId] ?? 0) : 0
}

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

// A subject teacher only sees the full roster for a class they're also the class
// master of - otherwise "View Class" would open the students list of a class they
// have no oversight of, so those cards link to Curriculum instead.
const classMasterSessionIds = computed(() => new Set(classMasterAssignments.value.map(a => a.sessionId)))

function isClassMaster(sessionId: string) {
    return classMasterSessionIds.value.has(sessionId)
}

const classMasterBadgeStyles: Record<string, { label: string, color: 'neutral' | 'warning' | 'success' | 'error' }> = {
    READY: { label: 'Ready to promote', color: 'warning' },
    PENDING_REVIEW: { label: 'Awaiting approval', color: 'warning' },
    RETURNED: { label: 'Returned - needs changes', color: 'error' },
    APPROVED: { label: 'Promoted', color: 'success' }
}

function classMasterBadge(status: TeacherClassMasterPromotionStatus) {
    return status ? classMasterBadgeStyles[status] || { label: 'On track', color: 'neutral' } : { label: 'On track', color: 'neutral' }
}

function needsAttention(status: TeacherClassMasterPromotionStatus) {
    return status === 'READY' || status === 'RETURNED'
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
