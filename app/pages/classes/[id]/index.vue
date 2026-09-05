<template>
    <div class="space-y-4 px-4 md:px-6">
        <!-- Banner -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div
                class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-10 flex flex-col gap-5 md:-mt-12 md:flex-row md:items-center md:justify-between">
                    <!-- Identity -->
                    <div class="flex min-w-0 items-center gap-4">
                        <div
                            class="shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-16 w-16 rounded-xl md:h-20 md:w-20" />

                            <div v-else
                                class="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 md:h-20 md:w-20">
                                <UIcon :name="CLASS_ICON" class="size-7 text-primary md:size-9" />
                            </div>
                        </div>

                        <div class="min-w-0 pb-0.5 md:pb-1">
                            <USkeleton v-if="loading" class="h-6 w-40 md:h-7 md:w-56" />

                            <h2 v-else class="truncate text-xl font-bold tracking-tight text-highlighted md:text-2xl">
                                {{ session?.clazz || 'Class' }}
                            </h2>

                            <div v-if="loading" class="mt-2 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                            </div>

                            <div v-else class="flex flex-wrap items-center gap-2 text-sm text-muted">
                                <span>{{ session?.classLevel || 'No Level' }}</span>
                                <span>- {{ session?.sectionName || 'No Section' }}</span>
                                <span>- {{ session?.streamName || 'No Stream' }}</span>

                                <span v-if="record?.terminal" class="size-1 rounded-full bg-dimmed" />

                                <UBadge v-if="record?.terminal" color="warning" variant="subtle" size="xs"
                                    class="rounded-full">
                                    Terminal Class
                                </UBadge>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 items-center gap-2">
                        <UButton v-if="canManagePromotion" @click="promote" variant="soft" size="sm" color="primary"
                            :icon="PROMOTE_STUDENTS_ICON" label="Promotions" />
                    </div>
                </div>

                <!-- Quick facts -->
                <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div v-for="item in quickFacts" :key="item.label"
                        class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 px-3.5 py-3">
                        <div
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UIcon :name="item.icon" class="size-4" />
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs text-muted">
                                {{ item.label }}
                            </p>

                            <USkeleton v-if="loading" class="mt-1 h-4 w-10" />

                            <p v-else class="truncate text-sm font-semibold text-highlighted">
                                {{ item.value }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UCard>

        <ClassPromotionSetting :id="session?.clazzId || ''" />

        <!-- Students - a teacher only sees the roster for a class they're the class
             master of; a subject-only teacher is pointed to Curriculum instead. -->
        <UCard v-if="loading || canViewRoster" :ui="{ body: 'sm:p-0' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-users" class="size-4 text-primary" />
                        <h3 class="text-sm font-semibold">Students</h3>
                    </div>

                    <div class="flex items-center gap-2">
                        <UTooltip text="Rank this page highest average score first">
                            <UButton :icon="PERFORMANCE_ICON" size="sm" :variant="sortByPerformance ? 'solid' : 'soft'"
                                :color="sortByPerformance ? 'primary' : 'neutral'" label="Sort by Performance"
                                @click="sortByPerformance = !sortByPerformance" />
                        </UTooltip>

                        <TableViewToggle v-model="view" />
                    </div>
                </div>
            </template>

            <!-- Desktop Table -->
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="displayStudents"
                :loading="studentsLoading"
                :meta="{ class: { tr: (row: any) => needsAttention(row.original) ? 'border-l-4 border-l-warning' : '' } }">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">No students enrolled in this class.</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <StudentIdentityCell :given-names="row.original.givenNames"
                            :family-name="row.original.familyName" :photo="row.original.photo"
                            :subtitle="row.original.admissionNumber || 'No Admission No'" />

                        <UTooltip v-if="needsAttention(row.original)" :text="attentionReason(row.original)">
                            <UIcon name="i-lucide-alert-triangle" class="size-4 shrink-0 text-warning" />
                        </UTooltip>
                    </div>
                </template>
                <template #dateOfBirth-cell="{ row }">
                    <p>{{ formatDate(row.original.dateOfBirth) || 'N/A' }}</p>
                </template>
                <template #gender-cell="{ row }">
                    <UBadge :label="parseGender[row.original.gender] || 'N/A'"
                        :color="parseGenderColor[row.original.gender]" variant="outline" />
                </template>
                <template #guardian-cell="{ row }">
                    <p>{{ `${row.original.guardian?.givenNames || ''} ${row.original.guardian?.familyName || ''}`.trim()
                        || '-' }}</p>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="parseStatus[row.original.status] || row.original.status"
                        :color="parseStatusColor[row.original.status]" variant="soft" />
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton :to="`/students/${row.original.id}?back=/classes/${route.params.id}`" size="sm"
                        variant="ghost" color="success" class="cursor-pointer" :icon="VIEW_ICON" />
                </template>
            </UTable>

            <!-- Mobile / Card -->
            <div class="p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'">
                <template v-if="studentsLoading">
                    <UCard v-for="i in 4" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm"
                        :ui="{ body: 'p-0' }">
                        <div class="animate-pulse">
                            <div class="border-b border-default p-4">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex min-w-0 items-center gap-3">
                                        <USkeleton class="size-12 shrink-0 rounded-xl" />
                                        <div class="min-w-0 space-y-2">
                                            <USkeleton class="h-4 w-36 rounded-md" />
                                            <USkeleton class="h-3 w-28 rounded-md" />
                                        </div>
                                    </div>
                                    <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3 p-4">
                                <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                                    <div class="mb-3 flex items-center gap-2">
                                        <USkeleton class="size-7 shrink-0 rounded-lg" />
                                        <USkeleton class="h-3 w-16 rounded-md" />
                                    </div>
                                    <USkeleton class="h-4 w-24 rounded-md" />
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-3 border-t border-default p-4">
                                <div class="flex min-w-0 items-center gap-3">
                                    <USkeleton class="size-10 shrink-0 rounded-full" />
                                    <div class="min-w-0 space-y-2">
                                        <USkeleton class="h-4 w-28 rounded-md" />
                                        <USkeleton class="h-3 w-24 rounded-md" />
                                    </div>
                                </div>
                                <USkeleton class="h-9 w-20 shrink-0 rounded-xl" />
                            </div>
                        </div>
                    </UCard>
                </template>

                <template v-else-if="displayStudents.length">
                    <UCard v-for="student in displayStudents" :key="student.id" class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
                        :class="needsAttention(student) ? 'border-l-4 border-l-warning' : ''"
                        :ui="{ body: 'p-0' }">
                        <!-- Header -->
                        <div class="border-b border-default p-4">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <UAvatar class="size-10" :src="student.photo || '/avatar-placeholder.svg'"
                                        :alt="`${student.givenNames} ${student.familyName}`" loading="lazy" />

                                    <div class="min-w-0">
                                        <h3 class="flex items-center gap-1.5 truncate text-base font-bold text-highlighted">
                                            {{ student.givenNames }} {{ student.familyName }}
                                            <UTooltip v-if="needsAttention(student)" :text="attentionReason(student)">
                                                <UIcon name="i-lucide-alert-triangle" class="size-4 shrink-0 text-warning" />
                                            </UTooltip>
                                        </h3>

                                        <p class="truncate text-xs-base text-muted">
                                            {{ student.admissionNumber || 'No Admission No' }}
                                        </p>
                                    </div>
                                </div>

                                <UBadge :label="parseStatus[student.status] || student.status"
                                    :color="parseStatusColor[student.status]" variant="soft" />
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-3 p-4">
                            <!-- Gender -->
                            <div class="min-w-0 rounded-2xl border p-3" :class="student.gender === 'MALE'
                                ? 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
                                : student.gender === 'FEMALE'
                                    ? 'border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10'
                                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                ">
                                <div class="mb-2 flex items-center gap-2">
                                    <div class="flex size-7 shrink-0 items-center justify-center rounded-lg" :class="student.gender === 'MALE'
                                        ? 'bg-blue-100 dark:bg-blue-500/20'
                                        : student.gender === 'FEMALE'
                                            ? 'bg-pink-100 dark:bg-pink-500/20'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                        ">
                                        <UIcon name="i-lucide-users" class="size-4" :class="student.gender === 'MALE'
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : student.gender === 'FEMALE'
                                                ? 'text-pink-600 dark:text-pink-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                            " />
                                    </div>

                                    <p class="text-[10px] font-medium uppercase tracking-wide" :class="student.gender === 'MALE'
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : student.gender === 'FEMALE'
                                            ? 'text-pink-700 dark:text-pink-300'
                                            : 'text-gray-600 dark:text-gray-400'
                                        ">
                                        Gender
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-highlighted">
                                    {{ parseGender[student.gender] || 'N/A' }}
                                </p>
                            </div>

                            <!-- Date of Birth -->
                            <div
                                class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                        <UIcon name="i-lucide-calendar-days"
                                            class="size-4 text-amber-600 dark:text-amber-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                        Date of Birth
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-highlighted">
                                    {{ formatDate(student.dateOfBirth) || 'N/A' }}
                                </p>
                            </div>

                            <!-- Guardian -->
                            <div
                                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                        <UIcon name="i-lucide-user-round"
                                            class="size-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                        Guardian
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-highlighted">
                                    {{ student.guardian?.givenNames }} {{ student.guardian?.familyName }}
                                </p>
                            </div>

                            <!-- Admission No -->
                            <div
                                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                        <UIcon name="i-lucide-id-card"
                                            class="size-4 text-violet-600 dark:text-violet-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                                        Admission No
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-highlighted">
                                    {{ student.admissionNumber || 'N/A' }}
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex items-center justify-between gap-3 border-t border-default p-4">
                            <div class="flex min-w-0 items-center gap-3">
                                <UAvatar size="xl" icon="i-lucide-users" />

                                <div class="min-w-0">
                                    <p class="truncate text-sm font-medium text-highlighted">
                                        {{ student.family?.fatherName || 'No Father Name' }}
                                    </p>
                                    <p class="truncate text-xs-base text-muted">
                                        {{ student.family?.motherName || 'No Mother Name' }}
                                    </p>
                                </div>
                            </div>

                            <UButton :to="`/students/${student.id}?back=/classes/${route.params.id}`" label="View"
                                trailing-icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="lg"
                                class="shrink-0 rounded-xl" />
                        </div>
                    </UCard>
                </template>

                <template v-else>
                    <div class="col-span-full flex flex-col items-center gap-2 py-10">
                        <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">No students enrolled in this class.</p>
                    </div>
                </template>
            </div>

            <template #footer>
                <div v-if="students.length" class="flex items-center justify-between">
                    <Showing :meta="meta" />
                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>

        <UCard v-else-if="isTeacherViewer">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="i-lucide-lock" class="text-3xl text-primary-500" />
                </div>
                <p class="text-sm font-semibold text-highlighted">Student list is only visible to the class master</p>
                <p class="max-w-xs text-xs text-muted">You teach a subject in this class rather than oversee it. Head to Curriculum to manage your scheme of work.</p>
                <UButton to="/curriculums" label="View Curriculum" icon="i-lucide-book-open" color="primary" variant="soft" />
            </div>
        </UCard>

        <!-- A parent can look up any class in the school this way (the same broad
             access other class-level info already has), but the roster lists other
             families' children - given only the class-scoped view, not their own
             child's page, so it stays hidden here rather than leaking that. -->
        <UCard v-else-if="isParentViewer">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="i-lucide-lock" class="text-3xl text-primary-500" />
                </div>
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

const classId = computed(() => String(route.params.id))

const classStore = useClassStore()
const studentStore = useStudentStore()
const userStore = useUserStore()

const stream = route.query.stream as string
const { record, session, overview, loading } = storeToRefs(classStore)
const { classRecords: students, classMeta: meta, loading: studentsLoading } = storeToRefs(studentStore)

const view = ref<'table' | 'card'>('table')

// --- Roster insights: performance sort + needs-attention flag ---
// The average score used for "Sort by Performance" doesn't live on the student record itself, so
// it's pulled from the same analytics engine the dashboard widgets use (class-wide, not paginated
// with the roster) and matched back onto each row by full name - the report entities only expose a
// "student" name field, not the student id, so an exact `givenNames familyName` match is the best
// we can do here (same trade-off the "at risk students" widget already makes). The needs-attention
// flag itself is a different, id-keyed call (ComputeClassAttentionUseCase via /class/{id}/attention)
// combining attendance and academic average against the class's pass mark, so it doesn't inherit
// that name-matching fragility.
const widgetStore = useWidgetStore()
const performanceByName = ref<Record<string, number>>({})
const attentionByStudentId = ref<Record<string, StudentAttention>>({})
const sortByPerformance = ref(false)

function studentFullName(s: Student) {
    return `${s.givenNames} ${s.familyName}`.trim()
}

function performanceOf(s: Student) {
    return performanceByName.value[studentFullName(s)]
}

function attentionOf(s: Student) {
    return attentionByStudentId.value[s.id]
}

// The endpoint only returns students who were actually flagged, so being present in the map at
// all (for either reason) is exactly what "needs attention" means here.
function needsAttention(s: Student) {
    return !!attentionOf(s)
}

function attentionReason(s: Student) {
    const a = attentionOf(s)
    if (!a) return ''

    const parts: string[] = []
    if (a.attendanceFlag) parts.push(`Attendance ${a.attendanceRate}%`)
    if (a.academicFlag) parts.push(`Average ${a.academicAverage}%`)

    return `${parts.join(' · ')} - needs follow-up`
}

async function fetchAttention() {
    if (!canViewRoster.value || !classId.value) return
    try {
        const res = await ClassApi().getAttention(classId.value)
        const map: Record<string, StudentAttention> = {}
        res?.students?.forEach((s: StudentAttention) => { map[s.studentId] = s })
        attentionByStudentId.value = map
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

async function fetchRosterInsights() {
    if (!canViewRoster.value || !classId.value) return
    try {
        const [performance, attendance] = await Promise.all([
            widgetStore.runAnalytic({
                entity: 'assessments',
                title: 'Student Performance',
                filters: [
                    { field: 'studentAssessment.enrollment.clazz.id', value: classId.value, operator: 'EQUALS', type: 'select' }
                ],
                metrics: [
                    { name: 'Average Score', aggregation: 'avg', field: 'weightScore', tags: { groupBy: 'student' } }
                ],
                chartType: 'bar'
            }),
            widgetStore.runAnalytic({
                entity: 'attendances',
                title: 'Student Attendance',
                filters: [
                    { field: 'enrollment.clazz.id', value: classId.value, operator: 'EQUALS', type: 'select' }
                ],
                metrics: [
                    { name: 'Present', aggregation: 'count', field: 'state', tags: { groupBy: 'student', field: 'state', value: 'Present' } },
                    { name: 'Total', aggregation: 'count', field: 'state', tags: { groupBy: 'student' } }
                ],
                chartType: 'bar'
            })
        ])

        const performanceWidget = performance?.data ?? performance
        const performanceMap: Record<string, number> = {}
        performanceWidget?.labels?.forEach((label: string, i: number) => {
            performanceMap[label] = Number(performanceWidget.datasets?.[0]?.data?.[i] ?? 0)
        })
        performanceByName.value = performanceMap

        const attendanceWidget = attendance?.data ?? attendance
        const attendanceMap: Record<string, number> = {}
        attendanceWidget?.labels?.forEach((label: string, i: number) => {
            const present = Number(attendanceWidget.datasets?.[0]?.data?.[i] ?? 0)
            const total = Number(attendanceWidget.datasets?.[1]?.data?.[i] ?? 0)
            if (total > 0) attendanceMap[label] = Math.round((present / total) * 1000) / 10
        })
        attendanceByName.value = attendanceMap
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
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'dateOfBirth', header: 'Date of Birth' },
    { accessorKey: 'gender', header: 'Gender' },
    { accessorKey: 'guardian', header: 'Guardian' },
    { accessorKey: 'status', header: 'Status' },
    { id: 'actions', meta: { class: { td: 'text-right' } } }
]

const quickFacts = computed(() => [
    // Pulled from the session, not the roster's page meta - the roster is only
    // ever fetched for a class master, so a subject teacher or parent viewing
    // this page would otherwise always see "0" here.
    { label: 'Total Students', value: session.value?.totalStudent ?? 0, icon: STUDENT_ICON },
    { label: 'Class Teachers', value: session.value?.teacherName ?? 0, icon: 'i-lucide-user-round-check' }
])

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

const isTeacherViewer = computed(() => can(Role.TEACHER))
const isParentViewer = computed(() => can(Role.PARENT))
const isMasterOfThisClass = computed(() => classTeachers.value.some(t => t.isMe))
// A teacher only sees the roster for a class they're the class master of, and
// a parent never sees it here - the roster is every family's child in that
// class, not just their own, so it stays off-limits regardless of who they are.
const canViewRoster = computed(() => {
    if (isParentViewer.value) return false
    return !isTeacherViewer.value || isMasterOfThisClass.value
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


const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (value) => updateQuery({ page: value })
})

const size = ref(runtimeConf().limit)

async function fetchClass() {
    if (!viewingYear.value) return
    const tasks = [classStore.viewClassByClassAndStream(classId.value, stream, viewingYear.value?.id || '')]
    // Overview backs the class-master/promotion checks below - a parent has no
    // use for it and isn't authorized to fetch it, so skip the call entirely.
    if (!isParentViewer.value) tasks.push(classStore.fetchOverview(classId.value))
    await Promise.all(tasks)
}

async function fetchStudents() {
    if (!canViewRoster.value) return
    await studentStore.fetchByClassAndStream(classId.value, stream, page.value, size.value)
}

watch([classId, viewingYear], fetchClass, { immediate: true })
// canViewRoster starts false for a teacher until the class-master check above resolves
// (overview loads async) - included here so the fetch fires once it settles true.
watch([page, size, classId, canViewRoster], fetchStudents, { immediate: true })

onMounted(() => {
    useAppStore().setTitle('View Class')
    // Teachers and parents reach this page from a card on their own dashboard
    // rather than the admin /classes list, so send their back button straight
    // to the dashboard instead of a plain history-back (which could land
    // somewhere unexpected, e.g. after a reload).
    useAppStore().setBack(can([Role.TEACHER, Role.PARENT]) ? '/' : true)

    if (!route.query.page || !route.query.size) {
        updateQuery({ page: page.value })
    }
    fetchClass()
    if (canManagePromotion.value) classStore.fetchAll(1, 100)

    document.title = 'View Class | Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT]
})
</script>
