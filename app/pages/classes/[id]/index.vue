<template>
    <div class="space-y-3 px-4 md:px-6">
        <!-- Header: who this class is, and what you can do with it -->
        <UCard>
            <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
                <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UIcon :name="CLASS_ICON" class="size-6" />
                </span>
                <div class="min-w-0">
                    <USkeleton v-if="loading" class="h-6 w-44" />
                    <div v-else class="flex flex-wrap items-center gap-2">
                        <h2 class="truncate text-xl font-bold tracking-tight text-highlighted md:text-2xl">
                            {{ session?.clazz || className || 'Class' }}
                        </h2>
                        <UBadge v-if="session?.sectionName" color="primary" variant="subtle" size="md">
                            Section {{ session.sectionName }}
                        </UBadge>
                        <UBadge v-if="session?.streamName && session.streamName !== 'N/A'" color="info" variant="subtle"
                            size="md">{{ session.streamName }}</UBadge>
                        <UBadge v-if="record?.terminal" color="warning" variant="subtle" size="sm">Graduating class</UBadge>
                    </div>
                    <p v-if="!loading" class="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                        <span>{{ session?.classLevel || 'No level' }}</span>
                        <template v-if="classTeachers.length">
                            <span>·</span>
                            <span>Class master: {{ classTeachers.map(t => t.name).join(', ') }}</span>
                        </template>
                        <template v-if="canViewRoster && !studentsLoading">
                            <span>·</span>
                            <span>{{ students.length }} {{ students.length === 1 ? 'student' : 'students' }}</span>
                        </template>
                    </p>
                </div>
            </div>

            <div class="flex shrink-0 flex-wrap items-center gap-2">
                <template v-if="isTeacherViewer && (isMasterOfThisClass || isSubjectTeacherOfThisClass)">
                    <UButton :to="`/curriculums?sessionId=${session?.id}`" variant="soft" size="sm" color="neutral"
                        label="Curriculum" icon="i-lucide-book-open" />
                    <UButton :to="`/timetable?session=${session?.id}`" variant="soft" size="sm" color="neutral"
                        label="Timetable" icon="i-lucide-calendar-days" />
                </template>
                <ClassEdit v-if="canManagePromotion" ref="classEditRef" :class-id="classId" hide-trigger @updated="fetchClass" />
                <UDropdownMenu v-if="canManagePromotion && !loading && className" :items="actionItems"
                    :content="{ align: 'end' }">
                    <UButton variant="soft" size="sm" color="neutral" label="Actions" trailing-icon="i-lucide-ellipsis" />
                </UDropdownMenu>
                <ClassPromotionSetting v-model:open="promotionSettingOpen" :id="session?.clazzId || ''" hide-trigger />
            </div>
        </div>
        </UCard>

        <USlideover v-model:open="assignMasterOpen" :dismissible="false" title="Assign Class Master"
            :description="`Choose the teacher who will be class master of ${sessionName}.`">
            <template #body>
                <UFormField label="Teacher" required>
                    <USelectMenu v-model="masterTeacherId" value-key="value" :items="masterTeacherOptions"
                        placeholder="Select teacher" class="w-full" :disabled="assigningMaster">
                        <template #leading>
                            <UIcon name="i-lucide-user-round" class="text-muted" />
                        </template>
                    </USelectMenu>
                </UFormField>
            </template>
            <template #footer>
                <div class="flex gap-3">
                    <UButton icon="lucide:save" label="Assign" :loading="assigningMaster" :disabled="!masterTeacherId"
                        @click="onAssignClassMaster" />
                    <UButton label="Cancel" variant="outline" color="neutral" :disabled="assigningMaster"
                        @click="assignMasterOpen = false" />
                </div>
            </template>
        </USlideover>

        <ConfirmDeleteModal v-model:open="deleteSessionOpen" :title="`Delete ${sessionName}`" :item-name="sessionName"
            :confirm-label="`Delete ${sessionName}`"
            description="Removes only this section - with its class teacher, subject assignments and setup. The class's other sections are not touched. Only possible while no students are placed in it - move them first."
            :on-confirm="confirmDeleteSession" />

        <ConfirmDeleteModal v-model:open="deleteOpen" title="Delete Class" :item-name="className"
            confirm-label="Delete class"
            description="Removes this class with all of its sections and streams, subjects and setup. Only possible while no students have been placed in it - move them to another class first."
            :on-confirm="confirmDeleteClass" />

        <!-- At a glance -->
        <div v-if="canViewRoster" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric :record="{
                label: 'Students', value: students.length, subtle: genderSummary,
                icon: 'i-lucide-users', color: 'primary', isReady: !studentsLoading
            }" />
            <Metric :record="{
                label: 'Attendance', value: avgAttendance === null ? '-' : `${avgAttendance}%`,
                subtle: avgAttendance === null ? 'No school days yet this term' : `${termAttendance?.termName ?? 'This term'}, over every school day so far`,
                subtileColor: avgAttendance !== null && avgAttendance < 75 ? 'warning' : undefined,
                icon: 'i-lucide-calendar-check', color: avgAttendance !== null && avgAttendance < 75 ? 'warning' : 'info', isReady: !studentsLoading
            }" />
            <Metric :record="{
                label: 'Average score', value: avgScore === null ? '-' : `${avgScore}%`,
                subtle: avgScore === null ? 'No approved tests yet' : 'Across approved tests',
                subtileColor: avgScore !== null && avgScore < 50 ? 'warning' : undefined,
                icon: 'i-lucide-star', color: avgScore !== null && avgScore < 50 ? 'warning' : 'success', isReady: !studentsLoading
            }" />
            <Metric :record="{
                label: classTeachers.length > 1 ? 'Class masters' : 'Class master',
                value: classTeachers.length ? classTeachers[0]!.name : 'Not assigned',
                subtle: classTeachers.length > 1 ? `+${classTeachers.length - 1} more` : '',
                icon: 'i-lucide-user-round-check', color: 'secondary', isReady: !loading
            }" />
        </div>

        <!-- What to look at first -->
        <ClassInsights v-if="canViewRoster && !studentsLoading" :students="students" :attention="attentionByStudentId"
            :attendance-by-id="attendanceById" :performance-by-name="performanceByName"
            :subject-scores="subjectScores" :class-id="classId" />

        <!-- Students -->
        <UCard v-if="loading || canViewRoster" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-wrap items-center gap-2 px-4 py-3">
                    <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-highlighted">Students</h3>
                        <UBadge variant="soft" color="neutral">{{ filteredStudents.length }}</UBadge>
                    </div>
                    <p v-if="attentionRule" class="order-last w-full text-xs text-muted sm:order-none sm:w-auto">
                        <UIcon name="i-lucide-alert-triangle" class="mr-1 inline size-3.5 align-[-2px] text-warning" />
                        {{ attentionRule }}
                    </p>
                    <div class="ml-auto flex w-full items-center gap-2 sm:w-auto">
                        <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search students" class="flex-1 sm:w-64" />
                        <UTooltip v-if="attentionCount" :text="`Show only students who need attention${attentionRule ? ` - ${attentionRule.toLowerCase()}` : ''}`">
                            <UButton icon="i-lucide-alert-triangle" size="md" :color="onlyAttention ? 'warning' : 'neutral'"
                                :variant="onlyAttention ? 'solid' : 'outline'" :label="String(attentionCount)"
                                @click="onlyAttention = !onlyAttention" />
                        </UTooltip>
                        <UTooltip text="Highest average first">
                            <UButton :icon="PERFORMANCE_ICON" size="md" :color="sortByPerformance ? 'primary' : 'neutral'"
                                :variant="sortByPerformance ? 'solid' : 'outline'" aria-label="Sort by performance"
                                @click="sortByPerformance = !sortByPerformance" />
                        </UTooltip>
                    </div>
                </div>
            </template>

            <UTable class="hidden md:block" :columns="columns" :data="filteredStudents" :loading="studentsLoading"
                :meta="{ class: { tr: (row: any) => attentionStyle(row.original) ? `border-l-4 ${attentionStyle(row.original)!.border}` : '' } }">
                <template #rank-cell="{ row }">
                    <span class="text-xs font-semibold tabular-nums"
                        :class="sortByPerformance && !search && !onlyAttention && row.index < 3 && performanceOf(row.original) !== undefined ? 'text-primary' : 'text-muted'">
                        {{ row.index + 1 }}
                    </span>
                </template>
                <template #name-cell="{ row }">
                    <StudentIdentityCell :given-names="row.original.givenNames"
                        :family-name="row.original.familyName" :photo="row.original.photo"
                        :subtitle="row.original.admissionNumber || 'No admission number'" />
                </template>
                <template #age-cell="{ row }">
                    <span v-if="ageOf(row.original.dateOfBirth) !== null" class="text-sm tabular-nums">
                        {{ ageOf(row.original.dateOfBirth) }} <span class="text-xs text-muted">yrs</span>
                    </span>
                    <span v-else class="text-muted">-</span>
                </template>
                <template #gender-cell="{ row }">
                    <UBadge :label="parseGender[row.original.gender] || 'N/A'"
                        :color="parseGenderColor[row.original.gender]" variant="subtle" size="sm" />
                </template>
                <template #attendance-cell="{ row }">
                    <div v-if="attendanceOf(row.original) !== undefined" class="w-28">
                        <p class="text-sm font-medium tabular-nums"
                            :class="attendanceOf(row.original)! < 75 ? 'text-warning' : 'text-highlighted'">
                            {{ attendanceOf(row.original) }}%</p>
                        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                            <div class="h-full rounded-full"
                                :class="attendanceOf(row.original)! < 75 ? 'bg-warning' : 'bg-success'"
                                :style="{ width: `${Math.min(100, attendanceOf(row.original)!)}%` }" />
                        </div>
                    </div>
                    <span v-else class="text-muted">-</span>
                </template>
                <template #average-cell="{ row }">
                    <div v-if="performanceOf(row.original) !== undefined" class="w-28">
                        <p class="text-sm font-medium tabular-nums text-highlighted">
                            {{ Math.round(performanceOf(row.original)!) }}</p>
                        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                            <div class="h-full rounded-full"
                                :class="performanceOf(row.original)! < 50 ? 'bg-error' : performanceOf(row.original)! < 70 ? 'bg-warning' : 'bg-primary'"
                                :style="{ width: `${Math.min(100, performanceOf(row.original)!)}%` }" />
                        </div>
                    </div>
                    <span v-else class="text-muted">-</span>
                </template>
                <template #guardian-cell="{ row }">
                    <div v-if="guardianOf(row.original).name" class="min-w-0">
                        <p class="truncate text-sm font-medium text-highlighted">{{ guardianOf(row.original).name }}</p>
                        <p v-if="guardianOf(row.original).phone" class="truncate text-xs text-muted">
                            {{ guardianOf(row.original).phone }}</p>
                    </div>
                    <span v-else class="text-muted">-</span>
                </template>
                <template #status-cell="{ row }">
                    <UTooltip v-if="needsAttention(row.original)" :text="attentionReason(row.original)">
                        <UBadge size="sm" variant="subtle"
                            :color="attentionOf(row.original)?.severity === 'CRITICAL' ? 'error' : attentionOf(row.original)?.severity === 'WATCH' ? 'neutral' : 'warning'"
                            :icon="attentionOf(row.original)?.severity === 'WATCH' ? 'i-lucide-eye' : 'i-lucide-alert-triangle'"
                            :label="attentionOf(row.original)?.severity === 'CRITICAL' ? 'Critical' : attentionOf(row.original)?.severity === 'WATCH' ? 'Watch' : 'Needs attention'" />
                    </UTooltip>
                    <UBadge v-else size="sm" variant="subtle" color="success" label="On track" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton :to="`/students/${row.original.id}?back=/classes/${route.params.id}`" size="sm"
                        variant="ghost" color="neutral" icon="i-lucide-chevron-right" aria-label="Open student" />
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #empty>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">
                            {{ search || onlyAttention ? 'No student matches.' : 'No students enrolled in this class.' }}
                        </p>
                    </div>
                </template>
            </UTable>

            <!-- Phone -->
            <div class="md:hidden">
                <template v-if="studentsLoading">
                    <div v-for="i in 6" :key="i" class="flex items-center gap-3 border-b border-default p-3">
                        <USkeleton class="size-10 shrink-0 rounded-full" />
                        <div class="flex-1 space-y-2"><USkeleton class="h-4 w-36" /><USkeleton class="h-3 w-24" /></div>
                    </div>
                </template>
                <template v-else-if="filteredStudents.length">
                    <button v-for="student in filteredStudents" :key="student.id" type="button"
                        class="flex w-full items-center gap-3 border-b border-default p-3 text-left last:border-0"
                        :class="attentionStyle(student) ? `border-l-2 ${attentionStyle(student)!.border}` : ''"
                        @click="navigateTo(`/students/${student.id}?back=/classes/${route.params.id}`)">
                        <UAvatar class="size-10" :src="student.photo" :alt="`${student.givenNames} ${student.familyName}`" />
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-semibold text-highlighted">{{ student.givenNames }} {{ student.familyName }}</p>
                            <p class="truncate text-xs text-muted">
                                {{ student.admissionNumber || 'No admission number' }}
                                <template v-if="attendanceOf(student) !== undefined"> · {{ attendanceOf(student) }}% attendance</template>
                                <template v-if="performanceOf(student) !== undefined"> · avg {{ Math.round(performanceOf(student)!) }}</template>
                            </p>
                            <p v-if="needsAttention(student)" class="truncate text-[11px]" :class="attentionStyle(student)?.text">
                                {{ attentionReason(student) }}
                            </p>
                        </div>
                        <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-muted" />
                    </button>
                </template>
                <div v-else class="flex flex-col items-center gap-2 py-10">
                    <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">{{ search || onlyAttention ? 'No student matches.' : 'No students enrolled in this class.' }}</p>
                </div>
            </div>
        </UCard>

        <UCard v-else-if="isTeacherViewer">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <span class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <UIcon name="i-lucide-lock" class="text-2xl text-primary" />
                </span>
                <p class="text-sm font-semibold text-highlighted">Student list is only visible to staff of this class</p>
                <p class="max-w-xs text-xs text-muted">You're not the class master or a subject teacher here. Head to My Classes to see the ones you teach.</p>
                <UButton to="/classes" label="My Classes" :icon="CLASS_ICON" color="primary" variant="soft" />
            </div>
        </UCard>

        <UCard v-else-if="isParentViewer">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <span class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <UIcon name="i-lucide-lock" class="text-2xl text-primary" />
                </span>
                <p class="text-sm font-semibold text-highlighted">Student list is only visible to school staff</p>
                <p class="max-w-xs text-xs text-muted">You can see your own child's details from your dashboard.</p>
                <UButton to="/" label="Back to Dashboard" icon="i-lucide-arrow-left" color="primary" variant="soft" />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useAcademicYearStore()
const { viewingYear } = storeToRefs(store)

const { can } = useAuth()
const { success, error: toastError } = useNotify()

const classId = computed(() => String(route.params.id))

const classStore = useClassStore()
const studentStore = useStudentStore()
const userStore = useUserStore()

const stream = computed(() => (route.query.stream as string) || '')
const sessionId = computed(() => (route.query.session as string) || '')
const { record, session, overview, loading } = storeToRefs(classStore)
const { classRecords: students, loading: studentsLoading } = storeToRefs(studentStore)

const view = ref<'table' | 'card'>('table')

const widgetStore = useWidgetStore()
const performanceByName = ref<Record<string, number>>({})
// Term to date over every school day so far (not just recorded days) - see GetStudentTermAttendanceUseCase.
const termAttendance = ref<StudentTermAttendance | null>(null)
// Each student over the school days since they enrolled; someone nobody has marked is 0%. Students
// with no school days yet (enrolled today) are left out rather than shown as 0%.
const attendanceById = computed<Record<string, number>>(() => Object.fromEntries(
    (termAttendance.value?.students ?? [])
        .filter(r => r.percentage !== null)
        .map(r => [r.studentId, r.percentage as number])))
const subjectScores = ref<{ name: string, score: number }[]>([])
const attentionByStudentId = ref<Record<string, StudentAttention>>({})
const attentionThresholds = ref<{ passMark: number, attendance: number } | null>(null)
// What gets a student flagged in this class, from the same cut-offs the backend applies.
const attentionRule = computed(() => {
    const t = attentionThresholds.value
    if (!t) return ''
    return `Flagged below a ${t.passMark}% term average or ${Math.round(t.attendance)}% recent attendance`
})
const sortByPerformance = ref(true)
const openAttentionId = ref<string | null>(null)

function studentFullName(s: Student) {
    return `${s.givenNames} ${s.familyName}`.trim()
}

function performanceOf(s: Student) {
    return performanceByName.value[studentFullName(s)]
}

function attentionOf(s: Student) {
    return attentionByStudentId.value[s.id]
}

// Colour per level: critical = red, needs attention = amber, watch = a softer neutral hint.
const SEVERITY_STYLE = {
    CRITICAL: { text: 'text-error', border: 'border-l-error' },
    NEEDS_ATTENTION: { text: 'text-warning', border: 'border-l-warning' },
    WATCH: { text: 'text-muted', border: 'border-l-neutral' }
} as const

function attentionStyle(s: Student) {
    const a = attentionOf(s)
    return a ? SEVERITY_STYLE[a.severity] : undefined
}

function needsAttention(s: Student) {
    return !!attentionOf(s)
}

const TREND_LABEL = { IMPROVING: 'improving', STEADY: 'steady', DECLINING: 'declining' } as const

function attentionReason(s: Student) {
    const a = attentionOf(s)
    if (!a) return ''

    const parts: string[] = []
    if (a.attendanceFlag) {
        let text = a.attendanceRate != null ? `Attendance ${a.attendanceRate}% recently` : 'Attendance'
        if (a.termAttendanceRate != null) text += ` (${a.termAttendanceRate}% this term)`
        if (a.attendanceTrend) text += `, ${TREND_LABEL[a.attendanceTrend]}`
        if (a.absenceStreak >= 3) text += `, ${a.absenceStreak} absences in a row`
        parts.push(text)
    }
    if (a.academicFlag) {
        let text = `Average ${a.academicAverage}%`
        if (a.previousTermAverage != null) text += ` (${a.previousTermAverage}% last term)`
        if (a.academicTrend) text += `, ${TREND_LABEL[a.academicTrend]}`
        parts.push(text)
    }

    const tail = a.severity === 'WATCH' ? 'keep an eye on' : 'needs follow-up'
    return `${parts.join(' · ')} - ${tail}`
}

async function fetchAttention() {
    if (!canViewRoster.value || !classId.value) return
    try {
        const res = await ClassApi().getAttention(classId.value)
        const map: Record<string, StudentAttention> = {}
        res?.students?.forEach((s: StudentAttention) => { map[s.studentId] = s })
        attentionByStudentId.value = map
        attentionThresholds.value = res ? { passMark: res.passMark, attendance: res.attendanceThreshold } : null
    } catch (err) {
        console.error('Failed to load class attention', err)
    }
}

const displayStudents = computed(() => {
    if (!sortByPerformance.value) return students.value

    return [...students.value].sort((a, b) => {
        const pa = performanceOf(a)
        const pb = performanceOf(b)
        if (pa == null && pb == null) return 0
        if (pa == null) return 1
        if (pb == null) return -1
        return pb - pa
    })
})

// The class's real marks: the average of each student's (or subject's) 0-100 scores over tests that have been approved.
// Locked and draft tests are left out - their rows are 0 until someone marks them, which would drag every average down.
async function approvedAverages(groupBy: 'student' | 'subject'): Promise<Record<string, number>> {
    const statuses = ['APPROVED', 'COMPLETED']
    const widgets = await Promise.all(statuses.map(status => widgetStore.runAnalytic({
        entity: 'assessments',
        title: 'Approved scores',
        filters: [
            { field: 'studentAssessment.enrollment.clazz.id', value: classId.value, operator: 'EQUALS', type: 'select' },
            { field: 'cycle.status', value: status, operator: 'EQUALS', type: 'select' }
        ],
        metrics: [
            { name: 'Average Score', aggregation: 'avg', field: 'score', tags: { groupBy } },
            { name: 'Count', aggregation: 'count', field: 'score', tags: { groupBy } }
        ],
        chartType: 'bar'
    }).catch(() => null)))

    // Combine the two statuses as a weighted average (by how many scores each had).
    const sums: Record<string, { total: number, count: number }> = {}
    for (const res of widgets) {
        const w = res?.data ?? res
        const rows: { label: string, avg: number, count: number }[] = Array.isArray(w)
            ? w.map((r: any) => ({ label: String(r[groupBy]), avg: Number(r['Average Score']), count: Number(r['Count'] ?? 1) }))
            : (w?.labels || []).map((label: string, i: number) => ({
                label, avg: Number(w.datasets?.[0]?.data?.[i] ?? 0), count: Number(w.datasets?.[1]?.data?.[i] ?? 1)
            }))
        for (const r of rows) {
            if (!Number.isFinite(r.avg) || !(r.count > 0)) continue
            const entry = sums[r.label] ?? (sums[r.label] = { total: 0, count: 0 })
            entry.total += r.avg * r.count
            entry.count += r.count
        }
    }
    const out: Record<string, number> = {}
    for (const [label, v] of Object.entries(sums)) out[label] = Math.round(v.total / v.count * 10) / 10
    return out
}

async function fetchRosterInsights() {
    if (!canViewRoster.value || !classId.value) return
    try {
        const [performance, attendance, subjectsRes] = await Promise.all([
            approvedAverages('student'),
            // No active term (e.g. between terms) just leaves attendance empty.
            AttendanceApi().getClassTermAttendance(classId.value).catch(() => null),
            approvedAverages('subject').catch(() => ({} as Record<string, number>)) // a bonus line - never let it take the rest down
        ])

        subjectScores.value = Object.entries(subjectsRes).map(([name, score]) => ({ name, score }))
        performanceByName.value = performance

        termAttendance.value = attendance ?? null
    } catch (err) {
        console.error('Failed to load roster insights', err)
    }
}

const parseStatus: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    DELETED: 'danger'
}

const columns = [
    { id: 'rank', header: '#', meta: { class: { th: 'w-10', td: 'w-10' } } },
    { id: 'name', header: 'Student' },
    { id: 'age', header: 'Age' },
    { id: 'gender', header: 'Gender' },
    { id: 'guardian', header: 'Guardian' },
    { id: 'attendance', header: 'Attendance' },
    { id: 'average', header: 'Average' },
    { id: 'status', header: 'Status' },
    { id: 'actions', header: '', meta: { class: { td: 'text-right' } } }
]

// The linked parent account first; otherwise the father/mother recorded on the student.
function guardianOf(s: Student): { name: string, phone: string } {
    const g = s.guardian
    const linked = g ? (`${g.givenNames ?? ''} ${g.familyName ?? ''}`.trim() || g.name || '') : ''
    if (linked) return { name: linked, phone: g?.phone || '' }

    const f = s.family
    if (f?.fatherName) return { name: f.fatherName, phone: f.fatherContact || '' }
    if (f?.motherName) return { name: f.motherName, phone: f.motherContact || '' }
    return { name: '', phone: '' }
}

// Whole years since the date of birth; null when missing or invalid.
function ageOf(dob?: string) {
    if (!dob) return null
    const birth = new Date(dob)
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

// --- The list: search, "needs attention" and sort ---
const search = ref('')
const onlyAttention = ref(false)
const attendanceOf = (s: Student) => attendanceById.value[s.id]
const attentionCount = computed(() => students.value.filter(needsAttention).length)
const filteredStudents = computed(() => {
    const text = search.value.trim().toLowerCase()
    return displayStudents.value.filter((s) => {
        if (onlyAttention.value && !needsAttention(s)) return false
        return !text || studentFullName(s).toLowerCase().includes(text)
            || (s.admissionNumber || '').toLowerCase().includes(text)
    })
})

// --- At a glance ---
const average = (values: number[]) => values.length
    ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length * 10) / 10 : null
const avgAttendance = computed(() => average(Object.values(attendanceById.value)))
const avgScore = computed(() => {
    const v = average(Object.values(performanceByName.value))
    return v === null ? null : Math.round(v)
})
const genderSummary = computed(() => {
    const boys = students.value.filter(s => s.gender === 'MALE').length
    const girls = students.value.filter(s => s.gender === 'FEMALE').length
    return students.value.length ? `${boys} boys · ${girls} girls` : 'No students yet'
})

const classTeachers = computed(() => {
    return (overview.value?.classMasters || []).map((master) => {
        const name = `${master.teacher?.user?.givenNames || ''} ${master.teacher?.user?.familyName || ''}`.trim() || 'Unnamed Teacher'
        const assignment = [master.session?.sectionName, master.session?.streamName]
            .filter((value) => value && value !== 'N/A')
            .join(' • ')
        const isMe = !!userStore.user?.id && master.teacher?.user?.id === userStore.user.id
        const photo = master.teacher?.user?.photo || undefined

        return { id: master.id, name, assignment, sessionId: master.session?.id, isMe, photo }
    })
})

const canManagePromotion = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const deleteOpen = ref(false)
const deleteSessionOpen = ref(false)

// "JSS 1 A" - this one section/stream, not the whole class.
const sessionName = computed(() => [
    session.value?.clazz,
    session.value?.sectionName,
    session.value?.streamName && session.value.streamName !== 'N/A' ? session.value.streamName : ''
].filter(Boolean).join(' '))

const promotionSettingOpen = ref(false)

const classEditRef = ref<{ openEdit: () => void } | null>(null)

const actionItems = computed(() => [[
    {
        label: 'Edit class', icon: EDIT_ICON,
        onSelect: () => classEditRef.value?.openEdit()
    },
    {
        label: classTeachers.value.length ? 'Add class master' : 'Assign class master',
        icon: 'i-lucide-user-round-plus',
        onSelect: () => { assignMasterOpen.value = true }
    },
    {
        label: 'Promotions', icon: PROMOTE_STUDENTS_ICON,
        disabled: classTeachers.value.length === 0,
        onSelect: () => promote()
    },
    {
        label: 'Promotion Settings', icon: 'i-lucide-settings',
        onSelect: () => { promotionSettingOpen.value = true }
    },
    {
        label: 'Create missing assessments', icon: 'i-lucide-refresh-cw',
        onSelect: () => syncAssessments()
    }
],
// One entry per class master, so any of them can still be unassigned.
...(classTeachers.value.length ? [classTeachers.value.map(master => ({
    label: `Remove ${master.name} as class master`, icon: 'i-lucide-user-round-x',
    disabled: unassigningMasterId.value === master.id,
    onSelect: () => onRemoveClassMaster(master.id)
}))] : []),
[
    {
        label: `Delete ${sessionName.value}`, icon: 'i-lucide-trash-2', color: 'error' as const,
        onSelect: () => { deleteSessionOpen.value = true }
    },
    {
        label: 'Delete whole class (all sections)', icon: 'i-lucide-trash-2', color: 'error' as const,
        onSelect: () => { deleteOpen.value = true }
    }
]])

// Fills in the assessments students in this class are missing (existing ones are never touched).
async function syncAssessments() {
    if (!session.value?.clazzId) return
    const res = await classStore.syncAssessments(session.value.clazzId)
    if (!res) return

    const missing = res.subjectsWithoutTeacher?.length
        ? ` No teacher is assigned yet for: ${res.subjectsWithoutTeacher.join(', ')}.`
        : ''
    const failed = res.failed ? ` ${res.failed} student(s) failed: ${res.firstError}.` : ''

    if (res.assessmentsCreated > 0) {
        success(`Created assessments for ${res.studentsUpdated} of ${res.students} student(s).${missing}${failed}`)
    } else {
        success(`Nothing new to create for ${res.students} student(s).${missing}${failed}`)
    }
    await fetchClass()
}

async function confirmDeleteSession() {
    if (!session.value) return
    try {
        await classStore.deleteSession(session.value.id)
        success(`${sessionName.value} deleted`)
        await navigateTo('/classes')
    } catch (err: any) {
        // Left open on purpose: the backend's reason (e.g. it still has students) is what to read.
        toastError(err?.message || 'Unable to delete this section')
        throw err
    }
}
const className = computed(() => record.value?.name || session.value?.clazz || '')
async function confirmDeleteClass() {
    try {
        await classStore.delete(record.value?.id || session.value?.clazzId || classId.value)
        success('Class deleted')
        await navigateTo('/classes')
    } catch (err: any) {
        // Left open on purpose: the backend's reason (e.g. it still has students) is what to read.
        toastError(err?.message || 'Unable to delete the class')
        throw err
    }
}

const assignMasterOpen = ref(false)
const assigningMaster = ref(false)
const masterTeacherId = ref('')
const teacherStore = useTeacherStore()

// Teachers who are not already a class master of this class.
const masterTeacherOptions = computed(() => {
    const taken = new Set((overview.value?.classMasters || []).map((m: any) => m.teacher?.id))
    return (teacherStore.records || [])
        .filter((t: any) => !taken.has(t.id))
        .map((t: any) => ({ label: teacherLabel(t), value: t.id }))
})

watch(assignMasterOpen, (open) => {
    if (open) teacherStore.fetchAll(0, 0)
    else masterTeacherId.value = ''
})

async function onAssignClassMaster() {
    if (!masterTeacherId.value || !session.value) return
    assigningMaster.value = true
    try {
        await classStore.assignClassMaster(classId.value, {
            teacherId: masterTeacherId.value,
            sectionId: session.value.sectionId || '',
            streamId: session.value.streamId || ''
        })
        success('The class master has been assigned successfully.')
        assignMasterOpen.value = false
        await classStore.fetchOverview(classId.value, viewingYear.value?.id || '', stream.value, sessionId.value)
    } catch (err: any) {
        toastError(err?.message || 'Unable to assign the class master')
    } finally {
        assigningMaster.value = false
    }
}

const unassigningMasterId = ref<string | null>(null)

async function onRemoveClassMaster(id: string) {
    unassigningMasterId.value = id
    try {
        await classStore.removeClassMaster(id)
        success('Class master unassigned successfully')
        await classStore.fetchOverview(classId.value, viewingYear.value?.id || '', stream.value, sessionId.value)
    } catch (err: any) {
        toastError(err?.message || 'Unable to unassign the class master')
    } finally {
        unassigningMasterId.value = null
    }
}

const isTeacherViewer = computed(() => can(Role.TEACHER))
const isParentViewer = computed(() => can(Role.PARENT))
const isMasterOfThisClass = computed(() => classTeachers.value.some(t => t.isMe))

const teacherSubjectStore = useTeacherSubjectStore()
const myTeacherSubjects = ref<TeacherSubject[]>([])
const isSubjectTeacherOfThisClass = computed(() =>
    myTeacherSubjects.value.some(s => s.classId === classId.value)
)

async function fetchMyTeacherSubjects() {
    if (!isTeacherViewer.value) return
    myTeacherSubjects.value = await teacherSubjectStore.fetchAllByTeacher(0, 0) || []
}

const canViewRoster = computed(() => {
    if (isParentViewer.value) return false
    return !isTeacherViewer.value || isMasterOfThisClass.value || isSubjectTeacherOfThisClass.value
})

watch(canViewRoster, (val) => { if (val) { fetchRosterInsights(); fetchAttention() } }, { immediate: true })

const promotionRequests = ref<Record<string, PromotionRequest | null>>({})
const promotionStatusLoading = ref(false)

function promote() {
    if (classTeachers.value.length == 0) return
    var session = classTeachers.value[0]
    navigateTo(`/promotion/${session?.sessionId}`)
}

const promotionSessionIds = computed(() =>
    (overview.value?.classMasters || [])
        .map((master) => master.session?.id)
        .filter((id): id is string => !!id)
)

async function fetchPromotionStatuses(sessionIds: string[]) {
    promotionStatusLoading.value = true
    try {
        const results = await Promise.all(
            sessionIds.map((sessionId) => PromotionApi().getCurrentPromotionRequestForSession(sessionId))
        )
        const next: Record<string, PromotionRequest | null> = {}
        sessionIds.forEach((sessionId, i) => { next[sessionId] = results[i] || null })
        promotionRequests.value = next
    } finally {
        promotionStatusLoading.value = false
    }
}

watch(promotionSessionIds, (sessionIds) => {
    if (sessionIds.length) fetchPromotionStatuses(sessionIds)
}, { immediate: true })


async function fetchClass() {
    if (!viewingYear.value) return
    const tasks = [classStore.viewClassByClassAndStream(classId.value, stream.value, viewingYear.value?.id || '', sessionId.value)]
    if (!isParentViewer.value) tasks.push(classStore.fetchOverview(classId.value, viewingYear.value.id || '', stream.value, sessionId.value))
    await Promise.all(tasks)
}

async function fetchStudents() {
    if (!canViewRoster.value) return
    // Wait for the exact section to load, or this would briefly list every section of the class.
    if (sessionId.value && session.value?.id !== sessionId.value) return
    await studentStore.fetchByClassAndStream(classId.value, stream.value, 0, 0, session.value?.sectionId)
}

watch([classId, viewingYear, stream, sessionId], fetchClass, { immediate: true })
watch([classId, canViewRoster, stream, () => session.value?.id], fetchStudents, { immediate: true })

onMounted(() => {
    useAppStore().setTitle('View Class')
    useAppStore().setBack(can([Role.TEACHER, Role.PARENT]) ? '/' : true)

    fetchClass()
    fetchMyTeacherSubjects()
    if (canManagePromotion.value) classStore.fetchAll(1, 100)

    document.title = 'View Class | Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT]
})
</script>
