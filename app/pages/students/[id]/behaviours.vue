<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold md:text-lg">
                            Behaviours
                        </h3>
                        <p class="text-xs-base text-muted">
                            Behaviour notes and observations recorded for this student.
                        </p>
                    </div>
                </div>
            </template>

            <!-- Summary -->
            <div class="mb-6 grid md:gap-4 gap-3 grid-cols-2 md:grid-cols-3">
                <div class="rounded-xl border-2 border-primary-300 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-950">
                    <p class="text-[11px] uppercase text-muted">
                        Total Records
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold">
                        {{ summary.total }}
                    </h2>
                </div>

                <div class="rounded-xl border-2 border-success-300 bg-success-50 p-4 dark:border-success-800 dark:bg-success-950">
                    <p class="text-[11px] uppercase text-muted">
                        Positive
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold text-success-600">
                        {{ summary.positive }}
                    </h2>
                </div>

                <div class="col-span-2 md:col-span-1 rounded-xl border-2 border-error-300 bg-error-50 p-4 dark:border-error-800 dark:bg-error-950">
                    <p class="text-[11px] uppercase text-muted">
                        Negative
                    </p>
                    <USkeleton v-if="loading" class="mt-1 h-8 w-16" />
                    <h2 v-else class="mt-1 text-2xl font-bold text-error-600">
                        {{ summary.negative }}
                    </h2>
                </div>
            </div>

            <!-- Records -->
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 3" :key="i" class="rounded-xl border-2 border-gray-100 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <USkeleton class="h-5 w-5 rounded-full" />
                            <USkeleton class="h-5 w-48" />
                            <USkeleton class="h-6 w-20 rounded-full" />
                        </div>

                        <USkeleton class="h-5 w-24" />
                    </div>
                </div>
            </div>

            <div v-else-if="records.length" class="space-y-3">
                <div v-for="row in records" :key="row.id"
                    class="overflow-hidden rounded-xl border border-default border-l-4 p-4"
                    :class="row.kind === 'POSITIVE' ? 'border-l-success-500' : 'border-l-error-500'"
                >
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-2.5">
                            <UIcon :name="row.kind === 'POSITIVE' ? 'i-lucide-thumbs-up' : 'i-lucide-triangle-alert'"
                                class="size-4 shrink-0"
                                :class="row.kind === 'POSITIVE' ? 'text-success-500' : 'text-error-500'"
                            />

                            <h4 class="truncate font-semibold">
                                {{ row.category }}
                            </h4>

                            <UBadge :color="row.kind === 'POSITIVE' ? 'success' : 'error'" variant="solid" size="sm"
                                class="shrink-0 rounded-full"
                            >
                                {{ parseBehaviourKind[row.kind] }}
                            </UBadge>
                        </div>
                    </div>

                    <p class="mt-2 text-sm text-muted">
                        {{ row.note || 'No behaviour note recorded.' }}
                    </p>
                    <p class="mt-2 text-xs text-muted">
                        {{ formatDateTime(row.createdAt) }}<template v-if="row.classLabel"> · {{ row.classLabel }}</template>
                    </p>
                </div>
            </div>

            <div v-else-if="!failed"
                class="flex flex-col items-center space-y-2 justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 md:p-10 p-4">
                <UIcon name="i-lucide-shield-check" class="mb-2 text-4xl text-muted" />

                <p class="font-medium text-sm">
                    No behaviour records found
                </p>

                <p class="text-xs-base text-center text-muted">
                    Behaviour notes for this student will appear here.
                </p>
            </div>

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="records.length"
                    :total="meta?.total" noun="records" :error="listError" @retry="loadMore" />
            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
definePageMeta({
    // The roles the backend lets read behaviour records - not accountants.
    role: [Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const route = useRoute()
const studentId = computed(() => String(route.params.id))

// The student's own records - every class and year, newest first, loaded as you scroll - found by the student, not by
// matching a name within one class's first 100 records.
const { items: records, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
    useInfiniteList<any>((page, size) => BehaviourApi().getByStudent(studentId.value, page, size) as any)

// Counts over all of the student's records, not just the ones loaded so far.
const summary = ref({ total: 0, positive: 0, negative: 0 })
async function fetchSummary() {
    summary.value = (await BehaviourApi().studentSummary(studentId.value).catch(() => null)) ?? { total: 0, positive: 0, negative: 0 }
}

watch(studentId, () => { reload(); fetchSummary() }, { immediate: true })

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack((route.query.back as string) || '/students')

    document.title = 'Behaviours | View Student | Students | Skultem'
})
</script>
