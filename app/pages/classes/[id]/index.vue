<template>
    <div class="space-y-4 px-4 md:px-6">
        <!-- Banner -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div
                class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-10 flex flex-col gap-2 md:-mt-12 md:flex-row md:justify-between">
                    <!-- Identity -->
                    <div class="flex flex-col md:flex-row items-center min-w-0 gap-4">
                        <div
                            class="shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-16 w-16 rounded-xl md:h-20 md:w-20" />

                            <div v-else
                                class="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 md:h-20 md:w-20">
                                <UIcon :name="CLASS_ICON" class="size-7 text-primary md:size-9" />
                            </div>
                        </div>

                        <div
                            class="min-w-0 pb-0.5 md:pb-1 flex flex-col justify-center md:justify-baseline md:items-start items-center">
                            <USkeleton v-if="loading" class="h-6 w-40 md:h-7 md:w-56" />

                            <h2 v-else class="truncate text-xl font-bold tracking-tight text-highlighted md:text-2xl">
                                {{ session?.clazz || 'Class' }}
                            </h2>

                            <div v-if="loading" class="mt-1 flex items-center gap-2">
                                <USkeleton class="h-5 w-24 rounded-full" />
                            </div>

                            <div v-else-if="record?.terminal" class="mt-1 flex items-center justify-center gap-2">
                                <UBadge color="warning" variant="subtle" size="xs" class="rounded-full">
                                    Terminal Class
                                </UBadge>
                            </div>

                            <div v-if="!loading"
                                class="mt-1 flex items-center justify-center flex-wrap gap-1.5 text-xs text-dimmed">
                                <p>{{ session?.classLevel || 'No Level' }}</p>
                                <div class="flex space-x-2">
                                    <p>-</p>
                                    <p>{{ session?.sectionName || 'No Section' }}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <p>-</p>
                                    <p>{{ session?.streamName || 'No Stream' }}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <p>-</p>
                                    <p>{{ session?.totalStudent ?? 0 }} Students</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 flex-wrap items-center justify-center gap-2">
                        <ClassEdit v-if="canManagePromotion" :class-id="classId" @updated="fetchClass" />
                        <UButton v-if="canManagePromotion" @click="promote" variant="soft" size="sm" color="primary"
                            :icon="PROMOTE_STUDENTS_ICON" label="Promotions" />

                        <template v-if="isTeacherViewer && (isMasterOfThisClass || isSubjectTeacherOfThisClass)">
                            <UButton :to="`/curriculums?sessionId=${session?.id}`" variant="soft" size="sm"
                                color="neutral" label="Curriculum" icon="i-lucide-book-open" />
                            <UButton :to="`/timetable?session=${session?.id}`" variant="soft" size="sm" color="neutral"
                                label="Timetable" icon="i-lucide-calendar-days" />
                        </template>
                    </div>
                </div>
            </div>
        </UCard>

        <UCard v-if="canManagePromotion && classTeachers.length" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-user-round-check" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold">Class Masters</h3>
                </div>
            </template>

            <div class="divide-y divide-gray-200 dark:divide-gray-800">
                <div v-for="master in classTeachers" :key="master.id" class="flex flex-wrap items-center gap-3 p-3">
                    <UAvatar :src="master.photo" :alt="master.name" size="md"
                        class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0" />

                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium">{{ master.name }}</p>
                        <p v-if="master.assignment" class="truncate md:text-[11px] text-gray-500 dark:text-gray-400">
                            {{ master.assignment }}
                        </p>
                    </div>

                    <UButton size="xs" color="error" variant="soft" icon="i-lucide-user-round-x" label="Unassign"
                        :loading="unassigningMasterId === master.id" @click="onRemoveClassMaster(master.id)" />
                </div>
            </div>
        </UCard>

        <ClassPromotionSetting :id="session?.clazzId || ''" />

        <UCard v-if="loading || canViewRoster" :ui="{ body: 'sm:p-0 p-0' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-users" class="size-4 text-primary" />
                        <h3 class="text-sm font-semibold">Students</h3>
                        <UBadge variant="soft" color="neutral">{{ students.length }}</UBadge>
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
            <div class="md:p-4 md:space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="studentsLoading">
                    <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-center gap-3">
                            <USkeleton class="size-10 shrink-0 rounded-full" />

                            <div class="min-w-0 flex-1 space-y-2">
                                <USkeleton class="h-4 w-36 rounded-md" />
                                <USkeleton class="h-3 w-24 rounded-md" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Data -->
                <template v-else-if="displayStudents.length">
                    <div v-for="student in displayStudents" :key="student.id"
                        class="cursor-pointer border-b md:border md:rounded-2xl border-default p-3"
                        :class="needsAttention(student) ? 'md:border-l-4 border-l-2 border-l-warning' : ''"
                        @click="navigateTo(`/students/${student.id}?back=/classes/${route.params.id}`)">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <UAvatar class="size-10" :src="student.photo"
                                    :alt="`${student.givenNames} ${student.familyName}`" loading="lazy" />
                                <div class="min-w-0">
                                    <h3
                                        class="flex items-center gap-1.5 truncate md:text-base font-bold text-highlighted">
                                        {{ student.givenNames }} {{ student.familyName }}
                                        <UTooltip class="hidden md:visible" v-if="needsAttention(student)"
                                            :text="attentionReason(student)" :open="openAttentionId === student.id"
                                            @update:open="(v) => openAttentionId = v ? student.id : null">
                                            <UIcon name="i-lucide-alert-triangle" class="size-4 shrink-0 text-warning"
                                                @click.stop="openAttentionId = openAttentionId === student.id ? null : student.id" />
                                        </UTooltip>
                                    </h3>

                                    <p class="truncate text-xs-base text-muted">
                                        {{ student.admissionNumber || 'No Admission No' }}
                                    </p>
                                    <p class="text-[9px] text-warning truncate">{{ attentionReason(student) }}</p>
                                </div>
                            </div>

                            <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 self-center text-muted" />
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center gap-2 py-10">
                        <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">No students enrolled in this class.</p>
                    </div>
                </template>
            </div>

        </UCard>

        <UCard v-else-if="isTeacherViewer">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <div
                    class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="i-lucide-lock" class="text-3xl text-primary-500" />
                </div>
                <p class="text-sm font-semibold text-highlighted">Student list is only visible to staff of this class
                </p>
                <p class="max-w-xs text-xs text-muted">You're not the class master or a subject teacher here. Head to My
                    Classes
                    to see the ones you teach.</p>
                <UButton to="/classes" label="My Classes" :icon="CLASS_ICON" color="primary" variant="soft" />
            </div>
        </UCard>

        <UCard v-else-if="isParentViewer">
            <div class="flex flex-col items-center gap-3 py-10 text-center">
                <div
                    class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
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
const { success, error: toastError } = useNotify()

const classId = computed(() => String(route.params.id))

const classStore = useClassStore()
const studentStore = useStudentStore()
const userStore = useUserStore()

const stream = route.query.stream as string
const { record, session, overview, loading } = storeToRefs(classStore)
const { classRecords: students, loading: studentsLoading } = storeToRefs(studentStore)

const view = ref<'table' | 'card'>('table')

const widgetStore = useWidgetStore()
const performanceByName = ref<Record<string, number>>({})
const attendanceByName = ref<Record<string, number>>({})
const attentionByStudentId = ref<Record<string, StudentAttention>>({})
const sortByPerformance = ref(false)
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

const unassigningMasterId = ref<string | null>(null)

async function onRemoveClassMaster(id: string) {
    unassigningMasterId.value = id
    try {
        await classStore.removeClassMaster(id)
        success('Class master unassigned successfully')
        await classStore.fetchOverview(classId.value, viewingYear.value?.id || '', stream)
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
    const tasks = [classStore.viewClassByClassAndStream(classId.value, stream, viewingYear.value?.id || '')]
    if (!isParentViewer.value) tasks.push(classStore.fetchOverview(classId.value, viewingYear.value.id || '', stream))
    await Promise.all(tasks)
}

async function fetchStudents() {
    if (!canViewRoster.value) return
    await studentStore.fetchByClassAndStream(classId.value, stream, 0, 0)
}

watch([classId, viewingYear], fetchClass, { immediate: true })
watch([classId, canViewRoster], fetchStudents, { immediate: true })

onMounted(() => {
    useAppStore().setTitle('View Class')
    useAppStore().setBack(can([Role.TEACHER, Role.PARENT]) ? '/' : true)

    fetchClass()
    fetchMyTeacherSubjects()
    if (canManagePromotion.value) classStore.fetchAll(1, 100)

    document.title = 'View Class | Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT]
})
</script>
