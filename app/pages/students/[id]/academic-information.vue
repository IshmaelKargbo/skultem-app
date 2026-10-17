<template>
    <StudentView>
        <UCard :ui="{ body: 'p-4 sm:p-5' }">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 class="font-semibold md:text-lg">Academic Information</h3>
                        <p class="text-xs-base text-muted">How {{ record?.givenNames || 'the student' }} is doing in each subject this term.</p>
                    </div>
                    <USelectMenu v-model="state.term" :items="terms" value-key="value" placeholder="Select term"
                        class="w-full sm:w-52" />
                </div>
            </template>

            <!-- At a glance -->
            <div class="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div class="flex items-center gap-3 rounded-2xl border border-default bg-default p-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UIcon name="i-lucide-book-open" class="size-5" />
                    </span>
                    <div class="min-w-0">
                        <p class="text-xs text-muted">Subjects</p>
                        <USkeleton v-if="loading" class="mt-1 h-6 w-12" />
                        <p v-else class="text-xl font-bold leading-tight text-highlighted">{{ summary.subjects }}</p>
                        <p v-if="!loading && summary.pending" class="text-[11px] text-muted">{{ summary.pending }} awaiting marks</p>
                    </div>
                </div>

                <div class="flex items-center gap-3 rounded-2xl border border-default bg-default p-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                        <UIcon name="i-lucide-star" class="size-5" />
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs text-muted">Average</p>
                        <USkeleton v-if="loading" class="mt-1 h-6 w-16" />
                        <template v-else>
                            <p class="text-xl font-bold leading-tight text-highlighted">
                                {{ summary.scored ? `${summary.average}%` : '-' }}</p>
                            <div v-if="summary.scored" class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                                <div class="h-full rounded-full" :class="scoreBar(Number(summary.average))"
                                    :style="{ width: `${Math.min(100, Number(summary.average))}%` }" />
                            </div>
                        </template>
                    </div>
                </div>

                <div class="flex items-center gap-3 rounded-2xl border border-default bg-default p-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                        <UIcon name="i-lucide-circle-check" class="size-5" />
                    </span>
                    <div class="min-w-0">
                        <p class="text-xs text-muted">Passed</p>
                        <USkeleton v-if="loading" class="mt-1 h-6 w-12" />
                        <p v-else class="text-xl font-bold leading-tight text-highlighted">
                            {{ summary.passed }}<span class="text-sm font-medium text-muted"> / {{ summary.scored }}</span>
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3 rounded-2xl border border-default bg-default p-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-xl"
                        :class="summary.failed ? 'bg-error/10 text-error' : 'bg-elevated text-muted'">
                        <UIcon name="i-lucide-alert-triangle" class="size-5" />
                    </span>
                    <div class="min-w-0">
                        <p class="text-xs text-muted">Needs support</p>
                        <USkeleton v-if="loading" class="mt-1 h-6 w-12" />
                        <p v-else class="text-xl font-bold leading-tight" :class="summary.failed ? 'text-error' : 'text-highlighted'">
                            {{ summary.failed }}</p>
                        <p v-if="!loading" class="text-[11px] text-muted">below 50%</p>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="space-y-3">
                <div v-for="i in 3" :key="i" class="rounded-2xl border border-default p-4">
                    <div class="flex items-center justify-between gap-3">
                        <USkeleton class="h-5 w-48" />
                        <USkeleton class="h-5 w-24" />
                    </div>
                </div>
            </div>

            <div v-else-if="groups.length" class="space-y-4">
                <section v-for="group in groups" :key="group.key" class="overflow-hidden rounded-2xl border border-default">
                    <button type="button"
                        class="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-elevated/30 px-4 py-3 text-left transition hover:bg-elevated/60"
                        @click="toggle(group.key)">
                        <div class="flex min-w-0 items-center gap-2">
                            <UIcon :name="expandedKeys.has(group.key) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                                class="size-4 shrink-0 text-muted" />
                            <h4 class="truncate font-semibold text-highlighted">{{ group.title }}</h4>
                            <UBadge size="sm" variant="subtle"
                                :color="group.failed ? 'warning' : group.pending ? 'neutral' : 'success'"
                                :label="group.failed ? `${group.failed} below 50%` : group.pending ? `${group.pending} pending` : 'All passed'" />
                        </div>
                        <div class="flex items-center gap-4 text-sm text-muted">
                            <span>{{ group.items.length }} {{ group.items.length === 1 ? 'subject' : 'subjects' }}</span>
                            <span>Avg <span class="font-semibold text-highlighted">{{ group.average }}%</span></span>
                        </div>
                    </button>

                    <ul v-if="expandedKeys.has(group.key)" class="divide-y divide-default">
                        <li v-for="subject in group.items" :key="subject.id" class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-medium text-highlighted">{{ subject.subject }}</p>
                                    <p class="truncate text-xs text-muted">{{ subject.teacher || 'No teacher assigned' }}</p>
                                </div>

                                <template v-if="isSubmitted(subject)">
                                    <div class="hidden w-40 sm:block">
                                        <div class="h-1.5 overflow-hidden rounded-full bg-elevated">
                                            <div class="h-full rounded-full" :class="scoreBar(Number(subject.score))"
                                                :style="{ width: `${Math.min(100, Number(subject.score))}%` }" />
                                        </div>
                                    </div>
                                    <div class="w-16 shrink-0 text-right">
                                        <p class="text-sm font-semibold tabular-nums text-highlighted">{{ subject.score }}%</p>
                                        <p class="text-[11px] text-muted">counts {{ subject.weightScore }}%</p>
                                    </div>
                                    <UBadge size="md" variant="subtle" class="w-9 shrink-0 justify-center"
                                        :color="gradeColor(subject.grade)" :label="subject.grade || 'N/A'" />
                                </template>
                                <UBadge v-else size="sm" variant="subtle" color="neutral" label="Awaiting marks" />
                            </div>
                            <GradesCaBreakdown v-if="subject.continuous" class="mt-2" :grade="subject" />
                        </li>
                    </ul>
                </section>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default py-10">
                <UIcon name="i-lucide-book-x" class="mb-2 text-4xl text-muted" />
                <p class="font-medium">No academic records for this term</p>
                <p class="text-sm text-muted">Marks show up here once teachers record them. Try another term.</p>
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
// Bar colour by score: under 50 fails, 50-69 is fair, 70+ is good.
const scoreBar = (score: number) => score < 50 ? 'bg-error' : score < 70 ? 'bg-warning' : 'bg-success'
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
        scored: passed + failed,
        pending: list.length - passed - failed,
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
