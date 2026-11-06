<template>
    <div class="space-y-3 px-4 md:px-6">
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

        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center gap-2 px-4 py-3">
                    <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search by class or subject" class="flex-1" />
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <!-- Desktop table -->
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="filteredClasses"
                :loading="loading" :ui="{ th: 'text-xs uppercase tracking-wide text-muted font-medium', td: 'py-3.5', tr: 'cursor-pointer' }"
                @select="(_e: Event, row: any) => openClass(row.original)">
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #empty>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">{{ emptyText }}</p>
                    </div>
                </template>
                <template #className-cell="{ row }">
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="text-[15px] font-semibold tracking-tight text-highlighted">{{ row.original.className }}</p>
                            <UTooltip v-if="row.original.attentionCount > 0" :delay-duration="0" arrow
                                :text="`${row.original.attentionCount} student${row.original.attentionCount === 1 ? ' has' : 's have'} low attendance or ${row.original.attentionCount === 1 ? 'is' : 'are'} below the pass mark`">
                                <span class="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                                    <span class="size-1.5 rounded-full bg-warning" />Needs attention
                                </span>
                            </UTooltip>
                            <span v-if="promotionPill(row.original)"
                                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                                :class="promotionPill(row.original)!.class">
                                <span class="size-1.5 rounded-full bg-current" />{{ promotionPill(row.original)!.label }}
                            </span>
                        </div>
                        <p v-if="row.original.subjects.length" class="mt-0.5 max-w-sm truncate text-xs text-muted"
                            :title="row.original.subjects.join(', ')">
                            {{ subjectSummary(row.original.subjects) }}
                        </p>
                    </div>
                </template>
                <template #sectionName-cell="{ row }">
                    <div class="flex flex-wrap items-center gap-1.5">
                        <span v-if="row.original.sectionName"
                            class="rounded-md bg-elevated px-2 py-0.5 text-xs font-medium text-highlighted ring-1 ring-default">
                            {{ row.original.sectionName }}</span>
                        <span v-if="row.original.streamName"
                            class="rounded-md bg-info/10 px-2 py-0.5 text-xs font-medium text-info">{{ row.original.streamName }}</span>
                        <span v-if="!row.original.sectionName && !row.original.streamName" class="text-muted">-</span>
                    </div>
                </template>
                <template #role-cell="{ row }">
                    <span v-if="row.original.isClassMaster"
                        class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <UIcon name="i-lucide-graduation-cap" class="size-3.5" />Class master
                    </span>
                    <span v-else
                        class="inline-flex items-center gap-1.5 rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-toned ring-1 ring-default">
                        <UIcon name="i-lucide-book-open" class="size-3.5" />Subject teacher
                    </span>
                </template>
                <template #studentCount-cell="{ row }">
                    <span v-if="row.original.studentCount"
                        class="inline-flex min-w-9 items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold tabular-nums text-primary">
                        {{ row.original.studentCount }}</span>
                    <span v-else class="text-muted">-</span>
                </template>
                <template #actions-cell>
                    <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-chevron-right" aria-label="Open class" />
                </template>
            </UTable>

            <!-- Mobile / card view -->
            <div class="md:p-4 md:space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 4" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="min-w-0 flex-1 space-y-2">
                            <USkeleton class="h-4 w-36 rounded-md" />
                            <USkeleton class="h-3 w-28 rounded-md" />
                        </div>
                    </div>
                </template>

                <!-- Data -->
                <template v-else-if="filteredClasses.length">
                    <NuxtLink v-for="c in filteredClasses" :key="c.sessionId" :to="classUrl(c)"
                        class="block border-b md:border md:rounded-2xl last:border-0 border-default p-3">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0">
                                <div class="flex items-center gap-1.5">
                                    <h3 class="truncate font-bold text-highlighted">{{ c.className }}</h3>
                                    <p v-if="c.sectionName" class="shrink-0 text-muted">- {{ c.sectionName }}</p>
                                    <UIcon v-if="c.attentionCount > 0" name="i-lucide-alert-triangle"
                                        class="size-4 shrink-0 text-warning" />
                                </div>
                                <p class="truncate text-xs text-muted">
                                    {{ c.isClassMaster ? 'Class master' : 'Subject teacher' }}<template
                                        v-if="c.subjects.length"> · {{ subjectSummary(c.subjects, false) }}</template>
                                </p>
                            </div>

                            <div class="flex shrink-0 items-center gap-2">
                                <span v-if="promotionPill(c)"
                                    class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="promotionPill(c)!.class">
                                    {{ promotionPill(c)!.label }}</span>
                                <UBadge v-if="c.studentCount" variant="subtle" color="secondary" size="sm"
                                    :trailing-icon="STUDENT_ICON" :label="`${c.studentCount}`" />
                                <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
                            </div>
                        </div>
                    </NuxtLink>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center gap-2 py-14 text-center">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-sm text-gray-500">{{ emptyText }}</p>
                        <p v-if="!search" class="max-w-xs text-xs text-muted">
                            Once your school makes you a class master or assigns you a subject, it'll show up here.
                        </p>
                    </div>
                </template>
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
    streamName: string
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
            className: a.className || a.sessionName,
            sectionName: '',
            streamName: '',
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
            existing.sectionName ||= r.sectionName
            existing.streamName ||= cleanStream(r.streamName)
            if (!existing.subjects.includes(r.subjectName)) existing.subjects.push(r.subjectName)
            continue
        }

        map.set(r.sessionId, {
            sessionId: r.sessionId,
            classId: r.classId,
            streamId: r.streamId,
            className: r.className,
            sectionName: r.sectionName,
            streamName: cleanStream(r.streamName),
            isClassMaster: false,
            isSubjectTeacher: true,
            subjects: [r.subjectName],
            attentionCount: attentionByClassId.value[r.classId] ?? 0
        })
    }

    // Class-master rows only learn the section from a subject record; without one, the
    // session name (which includes the section) is the most complete label we have.
    for (const a of classMasterAssignments.value) {
        const c = map.get(a.sessionId)
        if (c && !c.sectionName && a.sessionName) c.className = a.sessionName
    }

    return Array.from(map.values())
})

const view = ref<'table' | 'card'>('table')
const search = ref('')

const filteredClasses = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return classes.value
    return classes.value.filter(c =>
        [c.className, c.sectionName, ...c.subjects].some(v => v?.toLowerCase().includes(q))
    )
})

const columns = [
    { accessorKey: 'className', header: 'Class' },
    { accessorKey: 'sectionName', header: 'Section' },
    { id: 'role', header: 'My role' },
    { accessorKey: 'studentCount', header: 'Students' },
    { id: 'actions', header: '', meta: { class: { td: 'text-right' } } }
]

const emptyText = computed(() => search.value ? 'No classes match your search.' : 'Nothing assigned yet.')

function cleanStream(name?: string | null) {
    return name && name !== 'N/A' ? name : ''
}

function classUrl(c: UnifiedClass) {
    return classRosterUrl(c.classId, c.streamId, c.sessionId)
}

function openClass(c: UnifiedClass) {
    navigateTo(classUrl(c))
}

// "Teaches Maths, English +2" - keeps the row short; the full list is on the class page.
function subjectSummary(subjects: string[], prefix = true) {
    const shown = subjects.slice(0, 2).join(', ')
    const more = subjects.length > 2 ? ` +${subjects.length - 2}` : ''
    return `${prefix ? 'Teaches ' : ''}${shown}${more}`
}

// Only flag promotion when the class master has something to do.
function promotionPill(c: UnifiedClass) {
    if (c.promotionStatus === 'READY') return { label: 'Ready to promote', class: 'bg-primary/10 text-primary' }
    if (c.promotionStatus === 'RETURNED') return { label: 'Promotion returned', class: 'bg-error/10 text-error' }
    return null
}

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
