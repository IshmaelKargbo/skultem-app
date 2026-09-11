<template>
    <div class="space-y-4 px-4 md:px-6">
        <!-- At a glance -->
        <div class="grid md:grid-cols-3 grid-cols-2 gap-3 md:gap-5">
            <Metric :record="{
                label: 'Total Classes', color: 'primary', value: classes.length, isReady: !loading,
                icon: CLASS_ICON, subtle: classMasterCount ? `${classMasterCount} as class master` : undefined
            }" />
            <Metric :record="{
                label: 'Class Master Of', color: 'info', value: classMasterCount, isReady: !loading,
                icon: 'i-lucide-graduation-cap', subtle: 'Full roster oversight'
            }" />
            <Metric class="col-span-2 md:col-span-1" :record="{
                label: 'Needs Attention', color: totalAttentionCount > 0 ? 'warning' : 'success',
                value: totalAttentionCount, isReady: !loading, icon: 'i-lucide-alert-triangle',
                subtle: 'Attendance or academic flags'
            }" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <UCard v-for="i in 3" :key="i" :ui="{ body: 'p-0 sm:p-0' }">
                <div class="space-y-3 p-4">
                    <USkeleton class="h-5 w-2/3" />
                    <USkeleton class="h-3 w-1/2" />
                    <USkeleton class="h-16 w-full rounded-xl" />
                </div>
            </UCard>
        </div>

        <!-- Classes -->
        <div v-else-if="classes.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <UCard v-for="c in classes" :key="c.sessionId" :ui="{
                root: c.attentionCount > 0 ? 'ring-1 ring-warning/40' : '',
                body: 'p-0 sm:p-0'
            }">
                <div class="space-y-3 p-4">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-3">
                            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UIcon name="i-lucide-users-round" class="size-5" />
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-semibold text-highlighted">
                                    {{ c.className }}{{ c.sectionName ? ` (${c.sectionName})` : '' }}
                                </p>
                                <p v-if="c.studentCount != null" class="flex items-center gap-1 text-xs text-muted">
                                    <UIcon name="i-lucide-users" class="size-3.5" />
                                    {{ c.studentCount }} student{{ c.studentCount === 1 ? '' : 's' }}
                                </p>
                            </div>
                        </div>

                        <div class="flex shrink-0 flex-col items-end gap-1">
                            <UBadge v-if="c.isClassMaster" color="primary" variant="subtle" size="sm">Class Master</UBadge>
                            <UBadge v-if="c.isSubjectTeacher" color="neutral" variant="subtle" size="sm">Subject Teacher</UBadge>
                        </div>
                    </div>

                    <p v-if="c.attentionCount > 0" class="flex items-center gap-1.5 text-xs font-medium text-warning">
                        <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
                        {{ c.attentionCount }} student{{ c.attentionCount === 1 ? '' : 's' }} need{{ c.attentionCount === 1 ? 's' : '' }} attention
                    </p>

                    <div v-if="c.subjects.length" class="flex flex-wrap gap-1.5">
                        <UBadge v-for="s in c.subjects" :key="s" variant="subtle" color="neutral" size="sm">{{ s }}</UBadge>
                    </div>
                </div>

                <USeparator />

                <div class="flex flex-wrap items-center gap-2 p-3">
                    <UButton :to="classRosterUrl(c.classId, c.streamId)" size="sm" variant="soft" color="neutral"
                        label="View Class" :icon="CLASS_ICON" />

                    <UButton :to="`/curriculums?sessionId=${c.sessionId}`" size="sm" variant="soft" color="neutral"
                        label="Curriculum" icon="i-lucide-book-open" />

                    <UButton :to="`/timetable?session=${c.sessionId}`" size="sm" variant="soft" color="neutral"
                        label="Timetable" icon="i-lucide-calendar-days" />

                    <UButton v-if="c.isClassMaster" to="/grades/approval" size="sm" variant="soft" color="neutral"
                        label="Grade Approval" :icon="GRADES_APPROVAL_ICON" />

                    <UButton v-if="c.promotionStatus === 'READY' || c.promotionStatus === 'RETURNED'"
                        :to="`/promotion/${c.sessionId}`" size="sm" variant="solid"
                        :color="c.promotionStatus === 'RETURNED' ? 'error' : 'primary'" :icon="PROMOTE_STUDENTS_ICON"
                        :label="c.promotionStatus === 'RETURNED' ? 'Review & Resubmit' : 'Promote Class'" class="ml-auto" />
                </div>
            </UCard>
        </div>

        <!-- Empty -->
        <UCard v-else>
            <div class="flex flex-col items-center gap-3 py-14 text-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10">
                    <UIcon name="i-lucide-inbox" class="text-3xl text-primary-500" />
                </div>
                <p class="text-sm font-semibold text-highlighted">Nothing assigned yet</p>
                <p class="max-w-xs text-xs text-muted">
                    You're not currently a class master or teaching any subject. Once your school assigns you one,
                    it'll show up here.
                </p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const teacherSubjectStore = useTeacherSubjectStore()

type UnifiedClass = {
    sessionId: string
    classId: string
    streamId: string | null
    className: string
    sectionName: string
    isClassMaster: boolean
    isSubjectTeacher: boolean
    studentCount?: number
    subjects: string[]
    promotionStatus?: TeacherClassMasterPromotionStatus
    attentionCount: number
}

const classMasterAssignments = ref<TeacherClassMaster[]>([])
const subjectRecords = ref<TeacherSubject[]>([])
const attentionByClassId = ref<Record<string, number>>({})
const loadingAssignments = ref(true)
const loadingSubjects = ref(true)
const loading = computed(() => loadingAssignments.value || loadingSubjects.value)

const classes = computed<UnifiedClass[]>(() => {
    const map = new Map<string, UnifiedClass>()

    for (const a of classMasterAssignments.value) {
        map.set(a.sessionId, {
            sessionId: a.sessionId,
            classId: a.classId,
            streamId: a.streamId,
            className: a.sessionName,
            sectionName: '',
            isClassMaster: true,
            isSubjectTeacher: false,
            studentCount: a.studentCount,
            subjects: [],
            promotionStatus: a.promotionStatus,
            attentionCount: attentionByClassId.value[a.classId] ?? 0
        })
    }

    for (const r of subjectRecords.value) {
        const existing = map.get(r.sessionId)
        if (existing) {
            existing.isSubjectTeacher = true
            if (!existing.subjects.includes(r.subjectName)) existing.subjects.push(r.subjectName)
            continue
        }

        map.set(r.sessionId, {
            sessionId: r.sessionId,
            classId: r.classId,
            streamId: r.streamId,
            className: r.className,
            sectionName: r.sectionName,
            isClassMaster: false,
            isSubjectTeacher: true,
            subjects: [r.subjectName],
            attentionCount: attentionByClassId.value[r.classId] ?? 0
        })
    }

    return Array.from(map.values())
})

const classMasterCount = computed(() => classMasterAssignments.value.length)

const totalAttentionCount = computed(() =>
    classes.value.reduce((sum, c) => sum + c.attentionCount, 0)
)

async function fetchAttentionCounts(classIds: string[]) {
    const uniqueClassIds = [...new Set(classIds.filter(Boolean))]
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
    } finally {
        loadingAssignments.value = false
    }
}

async function fetchSubjectRecords() {
    loadingSubjects.value = true
    try {
        subjectRecords.value = await teacherSubjectStore.fetchAllByTeacher(0, 0) || []
    } finally {
        loadingSubjects.value = false
    }
}

onMounted(async () => {
    await Promise.all([fetchClassMasterAssignments(), fetchSubjectRecords()])
    await fetchAttentionCounts([
        ...classMasterAssignments.value.map(a => a.classId),
        ...subjectRecords.value.map(r => r.classId)
    ])
})
</script>
