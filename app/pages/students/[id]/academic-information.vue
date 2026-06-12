<template>
    <StudentView>
        <UCard class="rounded-3xl">
            <template #header>
                <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-1">
                        <h3 class="text-xl font-bold">
                            Academic Performance
                        </h3>

                        <p class="text-sm text-muted">
                            Subject results, grades and overall performance summary.
                        </p>
                    </div>

                    <div class="grid w-full gap-3 md:w-[420px] md:grid-cols-2">
                        <USelectMenu v-model="state.term" :items="terms" value-key="value" size="xl"
                            placeholder="Select Term" />

                        <USelectMenu v-model="state.assessment" :items="assessmentItems" value-key="value" size="xl"
                            placeholder="Select Assessment" />
                    </div>
                </div>
            </template>

            <!-- Summary -->
            <div class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div class="rounded-xl border border-default p-5">
                    <p class="text-xs uppercase text-muted">
                        Subjects
                    </p>

                    <USkeleton v-if="loading" class="mt-2 h-8 w-16" />

                    <h2 v-else class="mt-3 text-3xl font-bold">
                        {{ summary.subjects }}
                    </h2>
                </div>

                <div class="rounded-xl border border-success/20 bg-success/5 p-5">
                    <p class="text-xs uppercase text-muted">
                        Passed
                    </p>

                    <USkeleton v-if="loading" class="mt-2 h-8 w-16" />

                    <h2 v-else class="mt-3 text-3xl font-bold text-success">
                        {{ summary.passed }}
                    </h2>
                </div>

                <div class="rounded-xl border border-warning/20 bg-warning/5 p-5">
                    <p class="text-xs uppercase text-muted">
                        Average
                    </p>

                    <USkeleton v-if="loading" class="mt-2 h-8 w-16" />

                    <h2 v-else class="mt-3 text-3xl font-bold text-warning">
                        {{ summary.average }}%
                    </h2>
                </div>

                <div class="rounded-xl border border-error/20 bg-error/5 p-5">
                    <p class="text-xs uppercase text-muted">
                        Failed
                    </p>

                    <USkeleton v-if="loading" class="mt-2 h-8 w-16" />

                    <h2 v-else class="mt-3 text-3xl font-bold text-error">
                        {{ summary.failed }}
                    </h2>
                </div>
            </div>

            <!-- Results -->
            <div class="space-y-4">

                <!-- Loading -->
                <div v-if="loading" v-for="i in runtimeConf().limit" :key="i"
                    class="rounded-xl border border-default p-6 space-y-6">
                    <div class="flex items-center justify-between">
                        <USkeleton class="h-6 w-32" />
                        <USkeleton class="h-7 w-24" />
                    </div>

                    <USkeleton class="h-2 w-full" />

                    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <USkeleton class="h-12" />
                        <USkeleton class="h-12" />
                        <USkeleton class="h-12" />
                        <USkeleton class="h-12" />
                    </div>
                </div>

                <!-- Results -->
                <div v-else-if="grades.length > 0" v-for="subject in grades" :key="subject.id"
                    class="rounded-xl border border-default p-6 transition hover:border-primary/40">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-lg font-semibold">
                                {{ subject.subject }}
                            </h4>

                            <p class="mt-1 text-sm text-muted">
                                {{ subject.teacher }}
                            </p>
                        </div>

                        <UBadge size="lg" variant="soft" :color="subject.grade === 'A'
                                ? 'success'
                                : subject.grade === 'B'
                                    ? 'primary'
                                    : subject.grade === 'C'
                                        ? 'warning'
                                        : subject.grade === null
                                            ? 'neutral'
                                            : 'error'
                            ">
                            Grade {{ subject.grade || 'N/A' }}
                        </UBadge>
                    </div>

                    <UProgress class="mt-5" size="xs" :model-value="subject.score" />

                    <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        <div class="space-y-1 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-xs uppercase text-muted">
                                Score
                            </p>

                            <p class="text-lg font-semibold">
                                {{ subject.score }}%
                            </p>
                        </div>

                        <div class="space-y-1 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-xs uppercase text-muted">
                                Weight ({{ subject.weight }})
                            </p>

                            <p class="text-lg font-semibold">
                                {{ subject.weightScore }}%
                            </p>
                        </div>

                        <div class="space-y-1 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-xs uppercase text-muted">
                                Term
                            </p>

                            <p class="text-lg font-semibold">
                                {{ subject.term }}
                            </p>
                        </div>

                        <div class="space-y-1 bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p class="text-xs uppercase text-muted">
                                Teacher
                            </p>

                            <p class="text-lg font-semibold">
                                {{ subject.teacher }}
                            </p>
                        </div>

                    </div>
                </div>

                <!-- Empty -->
                <div v-else class="rounded-xl border border-dashed border-default p-16 text-center">
                    <UIcon name="i-lucide-book-x" class="mx-auto size-14 text-muted" />

                    <h3 class="mt-4 text-lg font-semibold">
                        No Academic Records Found
                    </h3>

                    <p class="mt-2 text-sm text-muted">
                        Try selecting another term or assessment.
                    </p>
                </div>

            </div>

            <template #footer>
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="md" :page-size="meta?.size" :items-per-page="meta?.size"
                        :total="meta?.total" show-edges />
                </div>
            </template>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

const store = useStudentStore()
const reportStore = useReportStore()
const assessmentStore = useAssessmentStore()
const { assessments } = storeToRefs(assessmentStore)
const { record, activeCycle } = storeToRefs(store)
const { grades, meta } = storeToRefs(reportStore)
const loading = ref(true)
const route = useRoute()
const router = useRouter()
const state = reactive({
    term: '',
    assessment: ''
})
const student = computed(() => record.value)
const terms = computed(() =>
    activeCycle.value?.terms.map(term => ({
        label: term.name,
        value: term.id
    })) || []
)
const term = computed(() => activeCycle.value?.terms.find(e => e.id == state.term))

const assessmentItems = computed(() => assessments.value?.map(e => ({ label: e.name, value: e.id })))
const summary = computed(() => {
    const list = grades.value || []
    const total = list.length
    const numericScores = list
        .map((g: any) => Number(g.score ?? 0))
        .filter((n: number) => !Number.isNaN(n))

    const passed = list.filter((g: any) => Number(g.score ?? 0) >= 50).length
    const failed = Math.max(total - passed, 0)
    const average = numericScores.length
        ? (numericScores.reduce((sum: number, n: number) => sum + n, 0) / numericScores.length).toFixed(1)
        : '0.0'

    return {
        subjects: total,
        passed,
        failed,
        average
    }
})


async function fetchAssessment() {
    if (!record.value) return

    await assessmentStore.fetchClassAssessments(record.value?.classId || '')

    if (assessmentItems.value && assessmentItems.value.length > 0)
        state.assessment = assessmentItems.value[0].value
}

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
    const merged = { ...route.query, ...newQuery }

    if (
        merged.page === route.query.page &&
        merged.size === route.query.size
    ) {
        return
    }

    router.replace({ query: merged })
}

async function fetchCycle() {
    if (!student.value?.sessionId) return

    await store.fetchActiveCycle(student.value.sessionId)

    const activeTerm = activeCycle.value?.terms.find(
        term => term.status === 'ACTIVE'
    )

    if (activeTerm && state.term == '') {
        state.term = activeTerm.id
    }
}

async function fetchAcademicRecords() {
    if (!record.value?.id) return

    await reportStore.runReport(
        {
            entity: 'grades',
            filters: [
                {
                    field: "studentAssessment.enrollment.student.id",
                    value: record.value.id,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: "cycle.term.id",
                    value: state.term,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: "cycle.assessment.id",
                    value: state.assessment,
                    operator: "EQUALS",
                    type: "select"
                }
            ]
        },
        page.value,
        size.value
    )
}

watch(() => page.value, async () => {
    router.replace({
        query: {
            page: page.value
        }
    })

    await fetchCycle()
    await fetchAcademicRecords()
}, { immediate: true })

watch(
    () => record.value,
    async value => {
        if (!value) return
        await fetchCycle()
    },
    { immediate: true }
)

watch(
    () => state.assessment,
    async value => {
        if (!value) return

        await fetchCycle()
        await fetchAcademicRecords()
    },
    { immediate: true }
)

watch(
    () => state.term,
    async () => {
        loading.value = true
        await fetchAssessment()
        await fetchAcademicRecords()
        loading.value = false
    },
    { immediate: true }
)

onMounted(async () => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack(true)
    await fetchCycle()
    document.title = 'Academic Information | View Student | Students | Skultem'
})
</script>
