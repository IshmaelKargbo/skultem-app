<template>
    <StudentView>
        <UCard>
            <template #header>
                <div>
                    <h3 class="text-lg font-semibold">
                        Report Cards
                    </h3>
                    <p class="text-sm text-muted">
                        Every report card generated for this student, across terms.
                    </p>
                </div>
            </template>

            <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <UCard v-for="i in 3" :key="i" variant="outline">
                    <USkeleton class="h-4 w-2/3" />
                    <USkeleton class="mt-4 h-20 w-full rounded-2xl" />
                </UCard>
            </div>

            <div v-else-if="records.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <UCard v-for="item in records" :key="item.id" variant="outline"
                    class="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">

                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-semibold">{{ item.termName }}</h4>
                            <p class="text-xs text-muted">{{ item.academicYearName }} · {{ item.className }}</p>
                        </div>

                        <UBadge :label="item.passed ? 'Passed' : 'Attention'" :color="item.passed ? 'success' : 'warning'"
                            variant="soft" />
                    </div>

                    <div class="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-5 text-center">
                        <p class="text-xs uppercase tracking-wide text-muted">Average Score</p>
                        <h2 class="mt-2 text-3xl font-bold text-primary">{{ item.average.toFixed(1) }}%</h2>
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <div class="rounded-xl border border-default p-3">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-award" class="text-primary" />
                                <span class="text-xs text-muted">Grade</span>
                            </div>
                            <p class="mt-1 font-semibold">{{ item.overallGrade || 'N/A' }}</p>
                        </div>

                        <div class="rounded-xl border border-default p-3">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-trophy" class="text-warning" />
                                <span class="text-xs text-muted">Position</span>
                            </div>
                            <p class="mt-1 font-semibold">{{ item.position ? ordinal(item.position) : 'N/A' }}</p>
                        </div>
                    </div>

                    <UButton block class="mt-4" icon="i-lucide-eye" variant="soft" :to="`/report-cards/${item.id}`">
                        View Report Card
                    </UButton>
                </UCard>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 text-center">
                <UIcon name="i-lucide-file-text" class="mb-3 size-12 text-muted" />
                <h3 class="text-base font-semibold">No report cards yet</h3>
                <p class="mt-1 text-sm text-muted">Report cards for this student will appear here once generated.</p>
            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useReportCardStore()
const { studentRecords: records, loadingStudent: loading } = storeToRefs(store)

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

watch(
    () => route.params.id,
    (studentId) => {
        if (studentId) store.fetchByStudent(studentId as string)
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack((route.query.back as string) || '/students')

    document.title = 'Report Cards | View Student | Students | Skultem'
})
</script>
