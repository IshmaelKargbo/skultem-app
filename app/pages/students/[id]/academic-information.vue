<template>
    <StudentView>
        <!-- Academic Information -->
        <UCard>
            <template #header>
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 class="font-semibold text-lg">
                            Academic Information
                        </h3>

                        <p class="text-sm text-muted">
                            Student academic performance, subjects, and overall progress.
                        </p>
                    </div>

                    <div class="w-full md:w-2/5 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <USelectMenu v-model="state.term" :items="terms" value-key="value" size="lg"
                            placeholder="Select Term" />
                        <USelectMenu v-model="state.assessment" :items="assessmentItems" value-key="value" size="lg"
                            placeholder="Select Assessment" />
                    </div>
                </div>
            </template>

            <!-- Academic Summary -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div
                    class="border-2 border-info-300 bg-primary-50  dark:border-primary-800 dark:bg-primary-950 rounded-xl p-4">
                    <p class="text-[11px] uppercase text-muted">
                        Subjects
                    </p>

                    <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-primary-200 dark:bg-primary-800" />
                    <h2 v-else class="text-2xl font-bold mt-1">
                        {{ summary.subjects }}
                    </h2>
                </div>

                <div
                    class="border-2 border-success-300 bg-success-50  dark:border-success-800 dark:bg-success-950 rounded-xl p-4">
                    <p class="text-[11px] uppercase text-muted">
                        Passed
                    </p>

                    <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-success-200 dark:bg-success-800" />
                    <h2 v-else class="text-2xl font-bold text-success-600 mt-1">
                        {{ summary.passed }}
                    </h2>
                </div>

                <div
                    class="border-2 border-warning-300 bg-warning-50  dark:border-warning-800 dark:bg-warning-950 rounded-xl p-4">
                    <p class="text-[11px] uppercase text-muted">
                        Average Score
                    </p>

                    <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-warning-200 dark:bg-warning-800" />
                    <h2 v-else class="text-2xl font-bold text-warning-600 mt-1">
                        {{ summary.average }}%
                    </h2>
                </div>

                <div
                    class="border-2 border-error-300 bg-error-50  dark:border-error-800 dark:bg-error-950 rounded-xl p-4">
                    <p class="text-[11px] uppercase text-muted">
                        Failed
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-error-200 dark:bg-error-800" />
                    <h2 v-else class="text-2xl font-bold text-error-600 mt-1">
                        {{ summary.failed }}
                    </h2>
                </div>
            </div>

            <!-- Subject Results -->
            <div class="space-y-3">
                <div v-if="loading" v-for="subject in runtimeConf().limit"
                    class="border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-950 rounded-xl bg-white p-4 space-y-3">
                    <div class="flex items-start justify-between">
                        <USkeleton class="w-24 h-6" />
                        <USkeleton class="w-20 h-6" />
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="space-y-1">
                            <p class="text-xs uppercase text-muted">
                                Score
                            </p>
                            <USkeleton class="w-20 h-4" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-xs uppercase text-muted">
                                Weight <span>(0)</span>
                            </p>
                            <USkeleton class="w-20 h-4" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-xs uppercase text-muted">
                                Term
                            </p>
                            <USkeleton class="w-20 h-4" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-xs uppercase text-muted">
                                Teacher
                            </p>
                            <USkeleton class="w-20 h-4" />
                        </div>
                    </div>
                </div>
                <div v-else-if="grades.length > 0" v-for="subject in grades"
                    class="border-2 border-gray-100 rounded-xl  dark:border-gray-700 dark:bg-gray-950 bg-white p-4 space-y-3">
                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-medium text-base">
                                {{ subject.subject }}
                            </h4>
                        </div>

                        <UBadge :color="subject.grade === 'A'
                            ? 'success'
                            : subject.grade === 'B'
                                ? 'primary'
                                : subject.grade === 'C'
                                    ? 'warning'
                                    : subject.grade === null
                                        ? 'neutral'
                                        : 'error'" variant="outline">
                            Grade {{ subject.grade || 'N/A' }}
                        </UBadge>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p class="text-xs uppercase text-muted">
                                Score
                            </p>

                            <p class="font-semibold">
                                {{ subject.score }}%
                            </p>
                        </div>

                        <div>
                            <p class="text-xs uppercase text-muted">
                                Weight <span>({{ subject.weight }})</span>
                            </p>

                            <p class="font-semibold">
                                {{ subject.weightScore }}%
                            </p>
                        </div>
                        <div>
                            <p class="text-xs uppercase text-muted">
                                Term
                            </p>

                            <p class="font-semibold">
                                {{ subject.term }}
                            </p>
                        </div>


                        <div>
                            <p class="text-xs uppercase text-muted">
                                Teacher
                            </p>

                            <p class="font-semibold">
                                {{ subject.teacher }}
                            </p>
                        </div>
                    </div>
                </div>
                <div v-else
                    class="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                    <UIcon name="lucide:book-x" class="mx-auto mb-2 text-3xl text-muted" />
                    <p class="font-medium">No academic records found</p>
                    <p class="text-sm text-muted mt-1">Try another term or assessment to view results.</p>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size"
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
