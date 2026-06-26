```vue
<template>
    <div class="space-y-6 mt-6 p-4">

        <!-- Hero -->
        <UCard class="overflow-hidden rounded-3xl">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <p class="text-sm font-medium text-primary">
                        Documents
                    </p>

                    <h1 class="mt-2 text-3xl font-bold">
                        Generate Report Cards
                    </h1>

                    <p class="mt-2 text-sm text-muted">
                        Generate, preview and publish report cards for students.
                    </p>
                </div>

                <div class="flex flex-wrap gap-3">
                    <UButton icon="i-lucide-eye" variant="outline">
                        Preview
                    </UButton>

                    <UButton icon="i-lucide-file-text" color="primary" :loading="loading" @click="generateReportCards">
                        Generate Report Cards
                    </UButton>
                </div>

            </div>
        </UCard>

        <!-- Statistics -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <UCard class="rounded-3xl">
                <div class="flex items-center gap-4">

                    <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                        <UIcon name="i-lucide-users" class="text-xl text-primary" />
                    </div>

                    <div>
                        <p class="text-xs text-muted">
                            Students
                        </p>

                        <p class="text-2xl font-bold">
                            {{ students.length }}
                        </p>
                    </div>

                </div>
            </UCard>

            <UCard class="rounded-3xl">
                <div class="flex items-center gap-4">

                    <div class="flex size-12 items-center justify-center rounded-2xl bg-green-500/10">
                        <UIcon name="i-lucide-circle-check-big" class="text-xl text-green-600" />
                    </div>

                    <div>
                        <p class="text-xs text-muted">
                            Passed
                        </p>

                        <p class="text-2xl font-bold text-green-600">
                            40
                        </p>
                    </div>

                </div>
            </UCard>

            <UCard class="rounded-3xl">
                <div class="flex items-center gap-4">

                    <div class="flex size-12 items-center justify-center rounded-2xl bg-red-500/10">
                        <UIcon name="i-lucide-circle-x" class="text-xl text-red-600" />
                    </div>

                    <div>
                        <p class="text-xs text-muted">
                            Failed
                        </p>

                        <p class="text-2xl font-bold text-red-600">
                            5
                        </p>
                    </div>

                </div>
            </UCard>

            <UCard class="rounded-3xl">
                <div class="flex items-center gap-4">

                    <div class="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10">
                        <UIcon name="i-lucide-chart-column" class="text-xl text-amber-600" />
                    </div>

                    <div>
                        <p class="text-xs text-muted">
                            Average
                        </p>

                        <p class="text-2xl font-bold">
                            72%
                        </p>
                    </div>

                </div>
            </UCard>

        </div>

        <div class="grid gap-6 xl:grid-cols-3">

            <!-- Form -->
            <UCard class="xl:col-span-2 rounded-3xl">

                <template #header>
                    <div>
                        <h2 class="font-semibold">
                            Report Settings
                        </h2>

                        <p class="text-sm text-muted">
                            Choose the academic information and filters.
                        </p>
                    </div>
                </template>

                <div class="grid gap-5 md:grid-cols-2">

                    <UFormField label="Academic Year">
                        <USelectMenu v-model="form.academicYearId" :items="academicYears" value-key="value"
                            label-key="label" placeholder="Select academic year" />
                    </UFormField>
                    <UFormField label="Term">
                        <USelectMenu v-model="form.termId" :items="terms" value-key="value" label-key="label"
                            placeholder="Select term" />
                    </UFormField>

                    <UFormField label="Class">
                        <USelectMenu v-model="form.classId" :items="classes" value-key="value" label-key="label"
                            placeholder="Select class" />
                    </UFormField>

                    <UFormField label="Section">
                        <USelectMenu v-model="form.sectionId" :items="sections" value-key="value" label-key="label"
                            placeholder="Select section" />
                    </UFormField>

                    <UFormField label="Stream">
                        <USelectMenu v-model="form.streamId" :items="streams" value-key="value" label-key="label"
                            placeholder="Select stream" />
                    </UFormField>

                </div>

            </UCard>

            <!-- Options -->
            <UCard class="rounded-3xl">

                <template #header>
                    <h2 class="font-semibold">
                        Include
                    </h2>
                </template>

                <div class="space-y-5">

                    <UCheckbox v-model="form.includeRemarks" label="Teacher Remarks" />

                    <UCheckbox v-model="form.includeAttendance" label="Attendance" />

                    <UCheckbox v-model="form.includeRanking" label="Ranking" />

                    <UCheckbox label="Principal Signature" />

                    <UCheckbox label="School Stamp" />

                    <UCheckbox label="QR Verification" />

                </div>

            </UCard>

        </div>

        <!-- Preview -->
        <UCard class="rounded-3xl">

            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-semibold">
                            Generation Summary
                        </h2>

                        <p class="text-sm text-muted">
                            Preview the report card configuration.
                        </p>
                    </div>

                    <UBadge color="primary">
                        {{ students.length }} Students
                    </UBadge>
                </div>
            </template>

            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">
                        Academic Year
                    </p>

                    <p class="mt-1 font-medium">
                        Selected Year
                    </p>
                </div>

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">
                        Term
                    </p>

                    <p class="mt-1 font-medium">
                        Selected Term
                    </p>
                </div>

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">
                        Class
                    </p>

                    <p class="mt-1 font-medium">
                        Selected Class
                    </p>
                </div>

                <div class="rounded-2xl bg-muted/40 p-4">
                    <p class="text-xs text-muted">
                        Students
                    </p>

                    <p class="mt-1 font-medium">
                        {{ students.length }}
                    </p>
                </div>

            </div>

            <div class="mt-8 flex flex-wrap gap-3">
                <UButton icon="i-lucide-file-text" color="primary" size="lg" :loading="generating"
                    @click="generateReportCards">
                    Generate Report Cards
                </UButton>

                <UButton icon="i-lucide-download" variant="outline" size="lg" @click="downloadPdf">
                    Download PDF
                </UButton>
            </div>

        </UCard>
   
        <UModal v-model:open="openPreview">
            <template #content>
                <div class="p-6 space-y-5">

                    <div>
                        <h2 class="text-xl font-bold">
                            Report Cards Generated
                        </h2>

                        <p class="text-sm text-muted mt-1">
                            {{ totalStudents }} report cards are ready.
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-3">

                        <UButton icon="i-lucide-eye" color="primary" to="/report-cards">
                            View Report Cards
                        </UButton>

                        <UButton icon="i-lucide-download" variant="outline" @click="downloadPdf">
                            Download PDF
                        </UButton>

                    </div>

                </div>
            </template>
        </UModal>
    </div>
</template>


<script setup lang="ts">
const appStore = useAppStore()
const { success, error } = useNotify()

const loading = ref(false)
const generating = ref(false)
const openPreview = ref(false)

const form = reactive({
    academicYearId: '',
    termId: '',
    classId: '',
    sectionId: '',
    streamId: '',
    studentIds: [] as string[],
    includeRemarks: true,
    includeAttendance: true,
    includeRanking: true
})

/*
|--------------------------------------------------------------------------
| Dummy Select Data
|--------------------------------------------------------------------------
*/

const academicYears = ref([
    {
        label: '2025 / 2026',
        value: '1'
    },
    {
        label: '2026 / 2027',
        value: '2'
    }
])

const terms = ref([
    {
        label: 'First Term',
        value: '1'
    },
    {
        label: 'Second Term',
        value: '2'
    },
    {
        label: 'Third Term',
        value: '3'
    }
])

const classes = ref([
    {
        label: 'JSS1',
        value: '1'
    },
    {
        label: 'JSS2',
        value: '2'
    },
    {
        label: 'JSS3',
        value: '3'
    }
])

const sections = ref([
    {
        label: 'A',
        value: '1'
    },
    {
        label: 'B',
        value: '2'
    }
])

const streams = ref([
    {
        label: 'Science',
        value: '1'
    },
    {
        label: 'Arts',
        value: '2'
    },
    {
        label: 'Commercial',
        value: '3'
    }
])

/*
|--------------------------------------------------------------------------
| Students
|--------------------------------------------------------------------------
*/

const students = ref([
    {
        id: '1',
        admissionNo: 'KWIS001',
        name: 'John Kamara',
        average: 81,
        position: 1,
        status: 'Passed'
    },
    {
        id: '2',
        admissionNo: 'KWIS002',
        name: 'Mariama Sesay',
        average: 76,
        position: 2,
        status: 'Passed'
    },
    {
        id: '3',
        admissionNo: 'KWIS003',
        name: 'Mohamed Koroma',
        average: 58,
        position: 12,
        status: 'Passed'
    },
    {
        id: '4',
        admissionNo: 'KWIS004',
        name: 'Fatmata Bangura',
        average: 42,
        position: 30,
        status: 'Failed'
    },
    {
        id: '5',
        admissionNo: 'KWIS005',
        name: 'Abdul Kargbo',
        average: 67,
        position: 8,
        status: 'Passed'
    }
])

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

const totalStudents = computed(() => students.value.length)

const passedStudents = computed(() =>
    students.value.filter(
        student => student.status === 'Passed'
    ).length
)

const failedStudents = computed(() =>
    students.value.filter(
        student => student.status === 'Failed'
    ).length
)

const classAverage = computed(() => {
    if (!students.value.length) return 0

    const total = students.value.reduce(
        (sum, student) => sum + student.average,
        0
    )

    return Math.round(total / students.value.length)
})

/*
|--------------------------------------------------------------------------
| Generate Report Cards
|--------------------------------------------------------------------------
*/

async function generateReportCards() {
    if (
        !form.academicYearId ||
        !form.termId ||
        !form.classId
    ) {
        error(
            'Please select Academic Year, Term and Class'
        )

        return
    }

    generating.value = true

    try {
        await new Promise(resolve =>
            setTimeout(resolve, 1500)
        )

        success(
            `${students.value.length} report cards generated successfully`
        )

        openPreview.value = true
    }
    catch (err: any) {
        error(
            err?.message ||
            'Failed to generate report cards'
        )
    }
    finally {
        generating.value = false
    }
}

/*
|--------------------------------------------------------------------------
| Download PDF
|--------------------------------------------------------------------------
*/

async function downloadPdf() {
    success(
        'Downloading report cards PDF...'
    )
}

/*
|--------------------------------------------------------------------------
| Reset
|--------------------------------------------------------------------------
*/

function resetFilters() {
    form.academicYearId = ''
    form.termId = ''
    form.classId = ''
    form.sectionId = ''
    form.streamId = ''
    form.studentIds = []
}

/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(() => {
    appStore.setTitle(
        'Generate Report Cards'
    )
})

definePageMeta({
    role: [
        Role.ADMIN,
        Role.PROPRIETOR,
        Role.OWNER
    ]
})
</script>
```
