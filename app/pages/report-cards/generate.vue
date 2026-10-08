<template>
    <div class="space-y-4 px-4 md:px-6">
        <ReportCardSectionNav />

        <ReportCardClassMasterOnly>

        <!-- Header -->
        <Heading title="Generate Report Cards" subtitle="Generate report cards for every student in a class and term.">
            <UButton icon="i-lucide-file-text" color="primary" class="justify-center" :loading="generating"
                :disabled="!canGenerate" @click="generateReportCards">
                Generate Report Cards
            </UButton>
        </Heading>

        <div class="grid gap-6 xl:grid-cols-3">

            <!-- Form -->
            <UCard class="xl:col-span-2">

                <template #header>
                    <div>
                        <h2 class="font-semibold">
                            Report Settings
                        </h2>

                        <p class="text-sm text-muted">
                            Choose the class and term to generate report cards for. Pick a section (and stream) to
                            generate for just that one, e.g. JSS 1 A.
                        </p>
                    </div>
                </template>

                <div class="grid gap-5 md:grid-cols-2">

                    <UFormField label="Class" required>
                        <USelectMenu v-model="form.classId" :items="classes" :loading="classStore.loading"
                            value-key="value" label-key="label" placeholder="Select class" />
                    </UFormField>

                    <UFormField v-if="streams.length" label="Stream">
                        <USelectMenu v-model="form.streamId" :items="streams" value-key="value" label-key="label"
                            placeholder="All streams" />
                    </UFormField>

                    <UFormField v-if="form.classId && sections.length" label="Section">
                        <USelectMenu v-model="form.sectionId" :items="sections" value-key="value" label-key="label"
                            placeholder="All sections" />
                    </UFormField>

                    <UFormField v-if="form.scope !== 'YEAR'" label="Term" required>
                        <USelectMenu v-model="form.termId" :items="terms" :loading="termStore.loading" value-key="value"
                            label-key="label" placeholder="Select term" />
                    </UFormField>

                </div>

                <!-- Coverage -->
                <div class="mt-6 space-y-3">
                    <p class="text-sm font-medium">What should the report cover?</p>

                    <URadioGroup v-model="form.scope" :items="scopes" />

                    <div v-if="form.scope === 'ASSESSMENTS'" class="rounded-xl border border-default p-4">
                        <p v-if="!form.classId" class="text-sm text-muted">Select a class to choose its assessments.</p>
                        <p v-else-if="loadingAssessments" class="text-sm text-muted">Loading assessments...</p>
                        <p v-else-if="!assessmentOptions.length" class="text-sm text-muted">
                            This class has no assessments set up.
                        </p>
                        <div v-else class="space-y-3">
                            <p class="text-xs text-muted">
                                Pick one or more. Scores are marked out of just the ones you choose, e.g. First Test
                                only, or First Test + Second Test.
                            </p>
                            <div class="grid gap-2 sm:grid-cols-2">
                                <UCheckbox v-for="a in assessmentOptions" :key="a.id"
                                    :model-value="form.assessmentIds.includes(a.id)"
                                    :label="`${a.name} (${a.weight}%)`"
                                    @update:model-value="toggleAssessment(a.id, $event as boolean)" />
                            </div>
                        </div>
                    </div>
                </div>

            </UCard>

            <!-- Options -->
            <UCard>

                <template #header>
                    <h2 class="font-semibold">
                        Include
                    </h2>
                </template>

                <div class="space-y-5">

                    <UCheckbox v-model="form.includeAttendance" label="Attendance"
                        description="Attendance percentage for the term" />

                    <UCheckbox v-model="form.includeRanking" label="Class Ranking"
                        description="Each student's position in class" />

                </div>

            </UCard>

        </div>

        <!-- Result -->
        <UCard v-if="result">

            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-semibold">
                            Generation Summary
                        </h2>

                        <p class="text-sm text-muted">
                            {{ result.generated }} report card{{ result.generated === 1 ? '' : 's' }} generated for this
                            class and term.
                        </p>
                    </div>

                    <UBadge color="primary">
                        {{ result.generated }} Students
                    </UBadge>
                </div>
            </template>

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">Generated</p>
                    <p class="mt-1 text-2xl font-bold">{{ result.generated }}</p>
                </div>

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">Passed</p>
                    <p class="mt-1 text-2xl font-bold text-green-600">{{ result.passed }}</p>
                </div>

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">Needs Attention</p>
                    <p class="mt-1 text-2xl font-bold text-red-600">{{ result.failed }}</p>
                </div>

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">Class Average</p>
                    <p class="mt-1 text-2xl font-bold">{{ result.classAverage.toFixed(1) }}%</p>
                </div>

            </div>

            <div class="mt-8 flex flex-wrap gap-3">
                <UButton icon="i-lucide-eye" color="primary" size="lg" to="/report-cards">
                    View Report Cards
                </UButton>
            </div>

        </UCard>

        <UCard v-else-if="!generating">
            <div class="flex flex-col items-center justify-center py-14 text-center">
                <div
                    class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="i-lucide-file-text" class="size-6 text-primary-500" />
                </div>
                <h3 class="text-sm font-semibold text-highlighted">No report cards generated yet</h3>
                <p class="mt-1 max-w-sm text-xs text-muted">
                    Choose a class and term above, then generate report cards for every student with grades recorded
                    that term.
                </p>
            </div>
        </UCard>

        </ReportCardClassMasterOnly>

    </div>
</template>


<script setup lang="ts">
const appStore = useAppStore()
const { success, error } = useNotify()
const reportCardStore = useReportCardStore()
const { can } = useAuth()
const { classOptions: masterClasses, ensureLoaded: ensureClassMasterLoaded } = useClassMaster()
const classStore = useClassStore()
const termStore = useTermStore()

const generating = ref(false)

const scopes = [
    { value: 'TERM', label: 'Whole term', description: 'Every assessment of the term - the normal report card.' },
    { value: 'ASSESSMENTS', label: 'Chosen assessments', description: 'Only the assessments you pick, e.g. First Test, or First Test + Second Test.' },
    { value: 'YEAR', label: 'All terms of the year', description: 'Every term of the academic year you are currently viewing, with each child\'s final score.' }
]

const form = reactive({
    classId: '',
    streamId: '',
    sectionId: '',
    termId: '',
    scope: 'TERM' as 'TERM' | 'ASSESSMENTS' | 'YEAR',
    assessmentIds: [] as string[],
    includeAttendance: true,
    includeRanking: true
})

const result = ref<{ generated: number, passed: number, failed: number, classAverage: number } | null>(null)

const assessmentOptions = ref<ReportCardAssessmentOption[]>([])
const loadingAssessments = ref(false)

// Streams and sections of the picked class - each one is generated on its own, so JSS 1 A and JSS 1 B can be
// done at different times. Both stay optional: left blank, it's the whole class.
const { viewingYear } = storeToRefs(useAcademicYearStore())
const streams = ref<{ label: string, value: string }[]>([])
const sections = ref<{ label: string, value: string }[]>([])

async function loadSections() {
    sections.value = []
    if (!form.classId) return

    const res = await classStore.findAllSections(form.classId, form.streamId, viewingYear.value?.id || '')
    sections.value = (res || []).map((s: ClassSection) => ({ label: s.section.name, value: s.section.id }))
    if (!sections.value.some(s => s.value === form.sectionId)) form.sectionId = ''
}

watch(() => form.streamId, loadSections)

watch(() => form.classId, async (classId) => {
    form.assessmentIds = []
    assessmentOptions.value = []
    form.streamId = ''
    form.sectionId = ''
    streams.value = []
    sections.value = []
    if (!classId) return

    const resultStreams = await classStore.findAllStreams(classId)
    streams.value = (resultStreams || []).map((s: ClassStream) => ({ label: s.stream.name, value: s.stream.id }))
    await loadSections()

    loadingAssessments.value = true
    try {
        assessmentOptions.value = await ReportCardApi().assessments(classId)
    } finally {
        loadingAssessments.value = false
    }
})

function toggleAssessment(id: string, checked: boolean) {
    form.assessmentIds = checked
        ? [...form.assessmentIds, id]
        : form.assessmentIds.filter(e => e !== id)
}

const canGenerate = computed(() =>
    !!form.classId
    && (form.scope === 'YEAR' ? !!viewingYear.value?.id : !!form.termId)
    && (form.scope !== 'ASSESSMENTS' || form.assessmentIds.length > 0)
)


// A teacher can only generate for the classes they're class master of.
const isTeacherOnly = computed(() =>
    can(Role.TEACHER) && !can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]))

const classes = computed(() => isTeacherOnly.value
    ? masterClasses.value
    : classStore.records.map(e => ({ label: e.name, value: e.id })))
const terms = computed(() => termStore.records.map(e => ({ label: e.name, value: e.id })))

async function generateReportCards() {
    if (!canGenerate.value) {
        error(form.scope === 'ASSESSMENTS' && form.classId && form.termId
            ? 'Pick at least one assessment'
            : form.scope === 'YEAR' ? 'Please select a Class (and make sure an academic year is selected)' : 'Please select a Class and Term')
        return
    }

    generating.value = true
    try {
        const res = await reportCardStore.generate({
            classId: form.classId,
            termId: form.scope === 'YEAR' ? undefined : form.termId,
            academicYearId: form.scope === 'YEAR' ? viewingYear.value?.id : undefined,
            includeAttendance: form.includeAttendance,
            includeRanking: form.includeRanking,
            assessmentIds: form.scope === 'ASSESSMENTS' ? form.assessmentIds : [],
            wholeYear: form.scope === 'YEAR',
            streamId: form.streamId || undefined,
            sectionId: form.sectionId || undefined
        })

        if (!res) return

        result.value = res

        if (res.generated > 0) {
            success(`${res.generated} report card${res.generated === 1 ? '' : 's'} generated successfully`)
        } else {
            error('No students with recorded grades were found for this class and term')
        }
    } catch (err: any) {
        error(err?.message || 'Failed to generate report cards')
    } finally {
        generating.value = false
    }
}

onMounted(() => {
    appStore.setTitle('Generate Report Cards')
    if (isTeacherOnly.value) ensureClassMasterLoaded()
    else classStore.fetchAll(1, 100)
    termStore.fetchAll(1, 100)
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
