<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold md:text-lg">
                            Academic Information
                        </h3>
                        <p class="text-xs-base text-muted">
                            Subject results, grades and performance grouped by assessment.
                        </p>
                    </div>
                </div>
            </template>

            <!-- Filters -->
            <div class="mb-4 grid gap-3 md:max-w-[16rem]">
                <USelectMenu v-model="state.term" :items="terms" value-key="value" size="lg"
                    placeholder="Select Term" />
            </div>

            <div class="mb-4 grid md:gap-4 gap-3 grid-cols-2 xl:grid-cols-4">
                <div
                    class="rounded-xl border-2 border-primary-300 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-950">
                    <p class="text-[11px] uppercase text-muted">
                        Subjects
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold">
                        {{ summary.subjects }}
                    </h2>
                </div>

                <div
                    class="rounded-xl border-2 border-success-300 bg-success-50 p-4 dark:border-success-800 dark:bg-success-950">
                    <p class="text-[11px] uppercase text-muted">
                        Passed
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold text-success-600">
                        {{ summary.passed }}
                    </h2>
                </div>

                <div
                    class="rounded-xl border-2 border-warning-300 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-950">
                    <p class="text-[11px] uppercase text-muted">
                        Average
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold text-warning-600">
                        {{ summary.average }}%
                    </h2>
                </div>

                <div
                    class="rounded-xl border-2 border-error-300 bg-error-50 p-4 dark:border-error-800 dark:bg-error-950">
                    <p class="text-[11px] uppercase text-muted">
                        Failed
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold text-error-600">
                        {{ summary.failed }}
                    </h2>
                </div>
            </div>

            <div v-if="loading" class="space-y-3">
                <div v-for="i in 3" :key="i"
                    class="rounded-xl border-2 border-gray-100 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-3">
                            <USkeleton class="h-5 w-5 rounded-full" />
                            <USkeleton class="h-5 w-48" />
                            <USkeleton class="h-6 w-20 rounded-full" />
                        </div>

                        <USkeleton class="h-5 w-24" />
                    </div>
                </div>
            </div>

            <div v-else-if="groups.length" class="space-y-3">
                <div v-for="group in groups" :key="group.key"
                    class="overflow-hidden rounded-xl border border-default border-l-4"
                    :class="group.failed ? 'border-l-warning-500' : group.pending ? 'border-l-neutral-400' : 'border-l-success-500'">
                    <div
                        class="flex w-full flex-col md:flex-row gap-3 px-4 py-3 text-left transition hover:bg-elevated/40"
                        @click="toggle(group.key)">
                        <div class="flex items-center justify-between gap-2.5 flex-1">
                            <div class="flex items-center space-x-2">
                                <UIcon
                                    :name="expandedKeys.has(group.key) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                                    class="size-4 shrink-0 text-muted" />

                                <UIcon
                                    :name="!group.failed && !group.pending ? 'i-lucide-check-circle-2' : 'i-lucide-book-open'"
                                    class="size-4 shrink-0"
                                    :class="!group.failed && !group.pending ? 'text-success-500' : 'text-primary-500'" />

                                <h4 class="truncate font-semibold">
                                    {{ group.title }}
                                </h4>
                            </div>

                            <UBadge :color="group.failed ? 'warning' : group.pending ? 'neutral' : 'success'" variant="solid"
                                size="sm" class="shrink-0 rounded-full">
                                {{ group.failed ? `${group.failed} Attention` : group.pending ? `${group.pending} Pending` : 'All Passed' }}
                            </UBadge>
                        </div>

                        <div class="flex shrink-0 items-center gap-4 text-sm">
                            <span class="text-muted">
                                Subjects: <span class="font-semibold text-highlighted">{{ group.items.length }}</span>
                            </span>

                            <span class="text-muted">
                                Avg: <span class="font-semibold text-highlighted">{{ group.average }}%</span>
                            </span>
                        </div>
                    </div>

                    <!-- Phone: a card per subject instead of the sideways-scrolling table. -->
                    <div v-if="expandedKeys.has(group.key)" class="space-y-2 border-t border-default p-3 md:hidden">
                        <div v-for="subject in group.items" :key="subject.id">
                            <div class="flex items-center justify-between gap-2 rounded-lg bg-elevated/40 px-3 py-2">
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-medium">{{ subject.subject }}</p>
                                    <p class="truncate text-[11px] text-muted">{{ subject.teacher }}</p>
                                </div>
                                <div class="flex shrink-0 items-center gap-2">
                                    <span v-if="isSubmitted(subject)" class="text-sm">
                                        {{ subject.score }}% <span class="text-muted">({{ subject.weightScore }}%)</span>
                                    </span>
                                    <UBadge v-if="!isSubmitted(subject)" size="sm" variant="soft" color="neutral">
                                        Pending
                                    </UBadge>
                                    <UBadge v-else size="sm" variant="soft" :color="gradeColor(subject.grade)">
                                        {{ subject.grade || 'N/A' }}
                                    </UBadge>
                                </div>
                            </div>
                            <GradesCaBreakdown class="mt-1" :grade="subject" />
                        </div>
                    </div>

                    <div v-if="expandedKeys.has(group.key)" class="hidden overflow-x-auto border-t border-default md:block">
                        <table class="w-full min-w-max text-sm">
                            <thead>
                                <tr class="text-[11px] uppercase tracking-wide text-muted">
                                    <th class="px-4 py-2 text-left font-semibold">Subject</th>
                                    <th class="px-4 py-2 text-left font-semibold">Teacher</th>
                                    <th class="px-4 py-2 text-right font-semibold">Score</th>
                                    <th class="px-4 py-2 text-right font-semibold">Weight</th>
                                    <th class="px-4 py-2 text-right font-semibold">Grade</th>
                                </tr>
                            </thead>

                            <tbody>
                                <template v-for="subject in group.items" :key="subject.id">
                                <tr class="border-t border-default">
                                    <td class="px-4 py-2.5 font-medium">
                                        {{ subject.subject }}
                                    </td>
                                    <td class="px-4 py-2.5 text-muted">
                                        {{ subject.teacher }}
                                    </td>
                                    <td class="px-4 py-2.5 text-right">
                                        {{ isSubmitted(subject) ? `${subject.score}%` : '—' }}
                                    </td>
                                    <td class="px-4 py-2.5 text-right">
                                        {{ isSubmitted(subject) ? `${subject.weightScore}%` : '—' }}
                                    </td>
                                    <td class="px-4 py-2.5 text-right">
                                        <UBadge v-if="!isSubmitted(subject)" size="sm" variant="soft" color="neutral">
                                            Pending
                                        </UBadge>
                                        <UBadge v-else size="sm" variant="soft" :color="subject.grade === 'A'
                                            ? 'success'
                                            : subject.grade === 'B'
                                                ? 'primary'
                                                : subject.grade === 'C'
                                                    ? 'warning'
                                                    : subject.grade === null
                                                        ? 'neutral'
                                                        : 'error'">
                                            {{ subject.grade || 'N/A' }}
                                        </UBadge>
                                    </td>
                                </tr>
                                <tr v-if="subject.continuous">
                                    <td colspan="5" class="px-4 pb-3"><GradesCaBreakdown :grade="subject" /></td>
                                </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 dark:border-gray-700">
                <UIcon name="i-lucide-book-x" class="mb-2 text-4xl text-muted" />

                <p class="font-medium">
                    No Academic Records Found
                </p>

                <p class="text-sm text-muted">
                    Try selecting another term.
                </p>
            </div>

        </UCard>

        <GradesCaSupport class="mt-4" :student-name="record?.givenNames" />
    </StudentView>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const store = useStudentStore()
const reportStore = useReportStore()
const { record, activeCycle } = storeToRefs(store)
const { grades } = storeToRefs(reportStore)

// No pagination: request every subject for the selected term in one page.
const ALL_SUBJECTS = 1000
const gradeColor = (grade: string | null) => grade === 'A' ? 'success'
    : grade === 'B' ? 'primary' : grade === 'C' ? 'warning' : grade === null ? 'neutral' : 'error'
const loading = ref(true)
const route = useRoute()
const state = reactive({
    term: ''
})

const terms = computed(() =>
    activeCycle.value?.terms.map(term => ({
        label: term.name,
        value: term.id
    })) || []
)

// Until the teacher submits an assessment for a subject its score is just an unfilled 0, so it is
// neither passed nor failed. Only submitted (or later) assessments count.
const RELEASED = ['SUBMITTED', 'APPROVED', 'COMPLETED']
const isSubmitted = (g: any) => RELEASED.includes(g.status) && g.score !== null && g.score !== undefined

function tally(list: any[]) {
    const submitted = list.filter(isSubmitted)
    const scores = submitted.map((g: any) => Number(g.score)).filter((n: number) => !Number.isNaN(n))
    const passed = submitted.filter((g: any) => Number(g.score) >= 50).length
    const failed = submitted.length - passed
    const average = scores.length
        ? (scores.reduce((sum: number, n: number) => sum + n, 0) / scores.length).toFixed(1)
        : '0.0'

    return { passed, failed, pending: list.length - submitted.length, average }
}

const summary = computed(() => {
    const list = grades.value || []
    const { passed, failed, average } = tally(list)

    return {
        subjects: list.length,
        passed,
        failed,
        average
    }
})

const groups = computed(() => {
    const map = new Map<string, any[]>()

    for (const grade of grades.value || []) {
        const key = grade.name || 'Other'
        const items = map.get(key) ?? []
        items.push(grade)
        map.set(key, items)
    }

    return Array.from(map.entries())
        .map(([key, items]) => {
            const { passed, failed, pending, average } = tally(items)
            const position = Number((items[0] as any)?.level ?? Number.MAX_SAFE_INTEGER)

            return {
                key,
                title: key,
                items,
                passed,
                failed,
                pending,
                average,
                position
            }
        })
        .sort((a, b) => a.position - b.position)
})

const expandedKeys = ref(new Set<string>())

watch(groups, newGroups => {
    for (const group of newGroups) {
        if (!expandedKeys.value.has(group.key)) expandedKeys.value.add(group.key)
    }
}, { immediate: true })

function toggle(key: string) {
    if (expandedKeys.value.has(key)) expandedKeys.value.delete(key)
    else expandedKeys.value.add(key)
}

async function fetchCycle() {
    if (!record.value?.sessionId) return

    await store.fetchActiveCycle(record.value.sessionId)

    if (state.term) return

    const activeTerm = activeCycle.value?.terms.find(term => term.status === 'ACTIVE')
    state.term = activeTerm?.id || terms.value[0]?.value || ''
}

async function fetchRecord() {
    loading.value = true

    if (!record.value?.id || !state.term) {
        loading.value = false
        return
    }

    await reportStore.runReport(
        {
            entity: 'grades',
            filters: [
                {
                    field: 'studentAssessment.enrollment.student.id',
                    value: record.value.id,
                    operator: 'EQUALS',
                    type: 'select'
                },
                {
                    field: 'cycle.term.id',
                    value: state.term,
                    operator: 'EQUALS',
                    type: 'select'
                }
            ]
        },
        1,
        ALL_SUBJECTS
    )

    loading.value = false
}

watch(
    () => record.value,
    async value => {
        if (!value) return

        await fetchCycle()
    },
    { immediate: true }
)

watch(
    () => [record.value?.id, state.term],
    async () => {
        await fetchRecord()
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack((route.query.back as string) || '/students')

    document.title = 'Academic Information | View Student | Students | Skultem'
})
</script>
