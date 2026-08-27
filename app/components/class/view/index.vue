<template>
    <div class="space-y-4 px-4 md:px-6">
        <!-- Banner -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-10 flex flex-col gap-5 md:-mt-12 md:flex-row md:items-center md:justify-between">
                    <!-- Identity -->
                    <div class="flex min-w-0 items-center gap-4">
                        <div class="shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-16 w-16 rounded-xl md:h-20 md:w-20" />

                            <div v-else class="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 md:h-20 md:w-20">
                                <UIcon name="i-lucide-school" class="size-7 text-primary md:size-9" />
                            </div>
                        </div>

                        <div class="min-w-0 pb-0.5 md:pb-1">
                            <USkeleton v-if="loading" class="h-6 w-40 md:h-7 md:w-56" />

                            <h2 v-else class="truncate text-xl font-bold tracking-tight text-highlighted md:text-2xl">
                                {{ record?.name || 'Class' }}
                            </h2>

                            <div v-if="loading" class="mt-2 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                            </div>

                            <div v-else class="flex flex-wrap items-center gap-2 text-sm text-muted">
                                <span>{{ parseLevel[record?.level || ''] || 'No Level' }}</span>

                                <span v-if="record?.terminal" class="size-1 rounded-full bg-dimmed" />

                                <UBadge v-if="record?.terminal" color="warning" variant="subtle" size="xs" class="rounded-full">
                                    Terminal Class
                                </UBadge>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 items-center gap-2">
                        <UButton v-if="canManagePromotion" @click="promote" variant="soft" size="sm"
                            color="primary" :icon="PROMOTE_STUDENTS_ICON" label="Promotions" />
                        <UButton to="/classes" variant="outline" size="sm" color="neutral" icon="i-lucide-arrow-left"
                            label="Classes" />
                    </div>
                </div>

                <!-- Quick facts -->
                <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div v-for="item in quickFacts" :key="item.label"
                        class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 px-3.5 py-3">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

        <!-- Sections / Streams / Class Teachers -->
        <div class="grid gap-4 md:grid-cols-3">
            <UCard :ui="{ body: 'space-y-3' }">
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-layout-grid" class="size-4 text-primary" />
                        <h3 class="text-sm font-semibold">Sections</h3>
                    </div>
                </template>

                <div v-if="loading" class="flex flex-wrap gap-2">
                    <USkeleton v-for="i in 3" :key="i" class="h-6 w-16 rounded-full" />
                </div>

                <div v-else-if="overview?.sections?.length" class="flex flex-wrap gap-2">
                    <UBadge v-for="section in overview.sections" :key="section.id" variant="subtle" color="primary"
                        class="rounded-full">
                        {{ section.sectionName || section.section?.name }}
                    </UBadge>
                </div>

                <p v-else class="text-sm text-muted">No sections assigned.</p>
            </UCard>

            <UCard :ui="{ body: 'space-y-3' }">
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-git-branch" class="size-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 class="text-sm font-semibold">Streams</h3>
                    </div>
                </template>

                <div v-if="loading" class="flex flex-wrap gap-2">
                    <USkeleton v-for="i in 3" :key="i" class="h-6 w-16 rounded-full" />
                </div>

                <div v-else-if="overview?.streams?.length" class="flex flex-wrap gap-2">
                    <UBadge v-for="stream in overview.streams" :key="stream.id" variant="subtle" color="success"
                        class="rounded-full">
                        {{ stream.stream?.name }}
                    </UBadge>
                </div>

                <p v-else class="text-sm text-muted">No streams assigned.</p>
            </UCard>

            <UCard :ui="{ body: 'space-y-3' }">
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-user-round-check" class="size-4 text-violet-600 dark:text-violet-400" />
                        <h3 class="text-sm font-semibold">Class Teachers</h3>
                    </div>
                </template>

                <div v-if="loading" class="space-y-3">
                    <USkeleton v-for="i in 2" :key="i" class="h-8 w-full rounded-lg" />
                </div>
                <div v-else-if="classTeachers.length" class="space-y-3">
                    <div v-for="teacher in classTeachers" :key="teacher.id" class="flex items-center justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-3">
                            <UAvatar size="sm" :alt="teacher.name" />

                            <div class="min-w-0">
                                <p class="truncate text-sm font-medium text-highlighted">{{ teacher.name }}</p>
                                <p class="truncate text-xs text-muted">{{ teacher.assignment || 'No section / stream' }}</p>
                            </div>
                        </div>

                        <div v-if="(teacher.isMe || canManagePromotion) && teacher.sessionId"
                            class="flex shrink-0 items-center gap-2">
                            <USkeleton v-if="promotionStatusLoading" class="h-5 w-20 rounded-full" />
                            <UBadge v-else :label="promotionStatusLabel(teacher)" :color="promotionStatusColor(teacher)"
                                variant="subtle" size="xs" class="rounded-full" />

                            <UButton v-if="promotionActionLabel(teacher)" :to="promotionActionTo(teacher)" size="xs"
                                variant="soft" color="primary" :icon="PROMOTE_STUDENTS_ICON"
                                :label="promotionActionLabel(teacher)!" />
                        </div>
                    </div>
                </div>

                <p v-else class="text-sm text-muted">No class teacher assigned.</p>
            </UCard>
        </div>

        <!-- Promotion Settings -->
        <UCard v-if="canManagePromotion">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon :name="PROMOTE_STUDENTS_ICON" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold">Promotion Settings</h3>
                </div>
            </template>

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="flex items-center justify-between gap-3 rounded-xl border border-default p-3">
                    <div class="min-w-0 pr-3">
                        <p class="text-sm font-medium text-highlighted">Graduating class</p>
                        <p class="text-xs text-muted">e.g. Class 6, JSS 3, SSS 3 - promoted students graduate instead of moving up</p>
                    </div>
                    <USwitch :model-value="!!record?.terminal" :loading="savingTerminal" :disabled="savingTerminal"
                        @update:model-value="toggleTerminal" />
                </div>

                <UFormField label="Promotes to"
                    :hint="record?.terminal ? 'Disabled while this is a graduating class' : 'The class students move up to when promoted'">
                    <USelectMenu v-model="nextClassId" value-key="value" :items="otherClasses"
                        :disabled="!!record?.terminal || savingNextClass" :loading="savingNextClass"
                        placeholder="Select next class" class="w-full" />
                </UFormField>
            </div>
        </UCard>

        <!-- Students -->
        <UCard :ui="{ body: 'sm:p-0' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-users" class="size-4 text-primary" />
                        <h3 class="text-sm font-semibold">Students</h3>
                    </div>

                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <!-- Desktop Table -->
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="students"
                :loading="studentsLoading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon :name="STUDENT_ICON" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">No students enrolled in this class.</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
                        :photo="row.original.photo" :subtitle="row.original.admissionNumber || 'No Admission No'" />
                </template>
                <template #dateOfBirth-cell="{ row }">
                    <p>{{ formatDate(row.original.dateOfBirth) || 'N/A' }}</p>
                </template>
                <template #gender-cell="{ row }">
                    <UBadge :label="parseGender[row.original.gender] || 'N/A'" :color="parseGenderColor[row.original.gender]"
                        variant="outline" />
                </template>
                <template #guardian-cell="{ row }">
                    <p>{{ `${row.original.guardian?.givenNames || ''} ${row.original.guardian?.familyName || ''}`.trim() || '-' }}</p>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="parseStatus[row.original.status] || row.original.status" :color="parseStatusColor[row.original.status]"
                        variant="soft" />
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton :to="`/students/${row.original.id}`" size="sm" variant="ghost" color="success"
                        class="cursor-pointer" :icon="VIEW_ICON" />
                </template>
            </UTable>

            <!-- Mobile / Card -->
            <div class="p-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'">
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

                <template v-else-if="students.length">
                    <UCard v-for="student in students" :key="student.id"
                        class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
                        :ui="{ body: 'p-0' }">
                        <!-- Header -->
                        <div class="border-b border-default p-4">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <UAvatar class="size-10" :src="student.photo || '/avatar-placeholder.svg'"
                                        :alt="`${student.givenNames} ${student.familyName}`" />

                                    <div class="min-w-0">
                                        <h3 class="truncate text-base font-bold text-highlighted">
                                            {{ student.givenNames }} {{ student.familyName }}
                                        </h3>

                                        <p class="truncate text-xs-base text-muted">
                                            {{ student.admissionNumber || 'No Admission No' }}
                                        </p>
                                    </div>
                                </div>

                                <UBadge :label="parseStatus[student.status] || student.status" :color="parseStatusColor[student.status]"
                                    variant="soft" />
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
                            <div class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                        <UIcon name="i-lucide-calendar-days" class="size-4 text-amber-600 dark:text-amber-400" />
                                    </div>

                                    <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                        Date of Birth
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-highlighted">
                                    {{ formatDate(student.dateOfBirth) || 'N/A' }}
                                </p>
                            </div>

                            <!-- Guardian -->
                            <div class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                        <UIcon name="i-lucide-user-round" class="size-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>

                                    <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                        Guardian
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-highlighted">
                                    {{ student.guardian?.givenNames }} {{ student.guardian?.familyName }}
                                </p>
                            </div>

                            <!-- Admission No -->
                            <div class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                        <UIcon name="i-lucide-id-card" class="size-4 text-violet-600 dark:text-violet-400" />
                                    </div>

                                    <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
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

                            <UButton :to="`/students/${student.id}`" label="View" trailing-icon="i-lucide-chevron-right"
                                color="neutral" variant="ghost" size="lg" class="shrink-0 rounded-xl" />
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
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { can } = useAuth()
const { success: toastSuccess, error: toastError } = useNotify()

const classId = computed(() => String(route.params.id))

const classStore = useClassStore()
const studentStore = useStudentStore()
const userStore = useUserStore()

const { record, overview, loading } = storeToRefs(classStore)
const { classRecords: students, classMeta: meta, loading: studentsLoading } = storeToRefs(studentStore)

const view = ref<'table' | 'card'>('table')

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
    { label: 'Total Students', value: meta.value?.total ?? 0, icon: STUDENT_ICON },
    { label: 'Sections', value: overview.value?.sectionCount ?? 0, icon: 'i-lucide-layout-grid' },
    { label: 'Streams', value: overview.value?.streamCount ?? 0, icon: 'i-lucide-git-branch' },
    { label: 'Class Teachers', value: overview.value?.classMasterCount ?? 0, icon: 'i-lucide-user-round-check' }
])

const classTeachers = computed(() => {
    return (overview.value?.classMasters || []).map((master) => {
        const name = `${master.teacher?.user?.givenNames || ''} ${master.teacher?.user?.familyName || ''}`.trim() || 'Unnamed Teacher'
        const assignment = [master.session?.sectionName, master.session?.streamName]
            .filter((value) => value && value !== 'N/A')
            .join(' • ')
        const isMe = !!userStore.user?.id && master.teacher?.user?.id === userStore.user.id

        return { id: master.id, name, assignment, sessionId: master.session?.id, isMe }
    })
})

const canManagePromotion = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

type ClassTeacher = { id: string, name: string, assignment: string, sessionId: string | undefined, isMe: boolean }

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

function promotionRequestFor(teacher: ClassTeacher) {
    return teacher.sessionId ? (promotionRequests.value[teacher.sessionId] ?? null) : null
}

function promotionStatusLabel(teacher: ClassTeacher) {
    const request = promotionRequestFor(teacher)
    return request ? promotionRequestStatusStyle[request.status].label : 'Not started'
}

function promotionStatusColor(teacher: ClassTeacher) {
    const request = promotionRequestFor(teacher)
    return request ? promotionRequestStatusStyle[request.status].color : 'neutral'
}

// Which action is offered, and where it goes, depends on both the request's status and who's
// looking: the class master drafts/revises on the submit page, an admin/proprietor/owner reviews a
// pending submission on the approve page, and anyone can look back at an already-approved one there.
function promotionActionLabel(teacher: ClassTeacher) {
    const request = promotionRequestFor(teacher)

    if (!request) return teacher.isMe ? 'Promote' : null
    if (request.status === 'RETURNED') return teacher.isMe ? 'Revise' : null
    if (request.status === 'PENDING_REVIEW') return canManagePromotion.value ? 'Review' : (teacher.isMe ? 'View' : null)
    return (teacher.isMe || canManagePromotion.value) ? 'View' : null
}

function promotionActionTo(teacher: ClassTeacher) {
    const request = promotionRequestFor(teacher)

    if (!request || request.status === 'RETURNED') return `/promotion/${teacher.sessionId}`
    if (request.status === 'PENDING_REVIEW' && canManagePromotion.value) return `/academics/promotions/${request.id}`
    if (request.status === 'PENDING_REVIEW') return `/promotion/${teacher.sessionId}`
    return `/academics/promotions/${request.id}`
}

watch(promotionSessionIds, (sessionIds) => {
    if (sessionIds.length) fetchPromotionStatuses(sessionIds)
}, { immediate: true })

// --- Promotion settings: which class this one promotes into, or whether it's the graduating
// (terminal) point instead ---
const savingTerminal = ref(false)
const savingNextClass = ref(false)

const otherClasses = computed(() =>
    classStore.records
        .filter((c) => c.id !== classId.value)
        .map((c) => ({ label: c.name, value: c.id }))
)

const nextClassId = computed<string>({
    get: () => record.value?.nextClass?.id || '',
    set: async (value: string) => {
        if (!value || value === record.value?.nextClass?.id) return

        savingNextClass.value = true
        try {
            const res = await classStore.setNextClass(classId.value, value)
            if (res) toastSuccess(`This class now promotes to ${res.nextClass?.name}`)
        } catch (err: any) {
            toastError(err?.message || 'Failed to set next class')
        } finally {
            savingNextClass.value = false
        }
    }
})

async function toggleTerminal(value: boolean) {
    savingTerminal.value = true
    try {
        const res = await classStore.setTerminal(classId.value, value)
        if (res) {
            toastSuccess(value
                ? 'Marked as a graduating class - promoted students will graduate instead of moving up'
                : 'No longer a graduating class')
        }
    } catch (err: any) {
        toastError(err?.message || 'Failed to update class')
    } finally {
        savingTerminal.value = false
    }
}

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (value) => updateQuery({ page: value })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? runtimeConf().limit),
    set: (value) => updateQuery({ size: value })
})

function updateQuery(query: Record<string, any>) {
    router.replace({
        query: {
            ...route.query,
            ...query
        }
    })
}

async function fetchClass() {
    await classStore.viewClass(classId.value)
}

async function fetchStudents() {
    await studentStore.fetchByClass(classId.value, page.value, size.value)
}

watch(classId, fetchClass, { immediate: true })
watch([page, size, classId], fetchStudents, { immediate: true })

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        updateQuery({ page: page.value })
    }
    if (canManagePromotion.value) classStore.fetchAll(1, 100)
})
</script>
