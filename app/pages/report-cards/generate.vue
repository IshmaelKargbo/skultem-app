<template>
    <div class="space-y-6 mt-6 p-4 md:px-6">

        <!-- Header -->
        <Heading title="Generate Report Cards" subtitle="Generate report cards for every student in a class and term.">
            <UButton icon="i-lucide-file-text" color="primary" class="justify-center" :loading="generating"
                :disabled="!form.classId || !form.termId" @click="generateReportCards">
                Generate Report Cards
            </UButton>
        </Heading>

        <div class="grid gap-6 xl:grid-cols-3">

            <!-- Form -->
            <UCard class="xl:col-span-2 rounded-3xl">

                <template #header>
                    <div>
                        <h2 class="font-semibold">
                            Report Settings
                        </h2>

                        <p class="text-sm text-muted">
                            Choose the class and term to generate report cards for.
                        </p>
                    </div>
                </template>

                <div class="grid gap-5 md:grid-cols-2">

                    <UFormField label="Class" required>
                        <USelectMenu v-model="form.classId" :items="classes" :loading="classStore.loading"
                            value-key="value" label-key="label" placeholder="Select class" />
                    </UFormField>

                    <UFormField label="Term" required>
                        <USelectMenu v-model="form.termId" :items="terms" :loading="termStore.loading"
                            value-key="value" label-key="label" placeholder="Select term" />
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

                    <UCheckbox v-model="form.includeAttendance" label="Attendance"
                        description="Attendance percentage for the term" />

                    <UCheckbox v-model="form.includeRanking" label="Class Ranking"
                        description="Each student's position in class" />

                </div>

            </UCard>

        </div>

        <!-- Result -->
        <UCard v-if="result" class="rounded-3xl">

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

        <UCard v-else-if="!generating" class="rounded-3xl">
            <div class="flex flex-col items-center justify-center py-14 text-center">
                <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                    <UIcon name="i-lucide-file-text" class="size-6 text-primary-500" />
                </div>
                <h3 class="text-sm font-semibold text-highlighted">No report cards generated yet</h3>
                <p class="mt-1 max-w-sm text-xs text-muted">
                    Choose a class and term above, then generate report cards for every student with grades recorded
                    that term.
                </p>
            </div>
        </UCard>

    </div>
</template>


<script setup lang="ts">
const appStore = useAppStore()
const { success, error } = useNotify()
const reportCardStore = useReportCardStore()
const classStore = useClassStore()
const termStore = useTermStore()

const generating = ref(false)

const form = reactive({
    classId: '',
    termId: '',
    includeAttendance: true,
    includeRanking: true
})

const result = ref<{ generated: number, passed: number, failed: number, classAverage: number } | null>(null)

const classes = computed(() => classStore.records.map(e => ({ label: e.name, value: e.id })))
const terms = computed(() => termStore.records.map(e => ({ label: e.name, value: e.id })))

async function generateReportCards() {
    if (!form.classId || !form.termId) {
        error('Please select a Class and Term')
        return
    }

    generating.value = true
    try {
        const res = await reportCardStore.generate({
            classId: form.classId,
            termId: form.termId,
            includeAttendance: form.includeAttendance,
            includeRanking: form.includeRanking
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
    classStore.fetchAll(1, 100)
    termStore.fetchAll(1, 100)
})

definePageMeta({
    role: [
        Role.ADMIN,
        Role.PROPRIETOR,
        Role.OWNER
    ]
})
</script>
