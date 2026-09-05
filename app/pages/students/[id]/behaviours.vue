<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-lg">
                            Behaviours
                        </h3>
                        <p class="text-sm text-muted">
                            Behaviour notes and observations recorded for this student.
                        </p>
                    </div>
                </div>
            </template>

            <!-- Summary -->
            <div class="mb-6 grid gap-4 grid-cols-2">
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
                </div>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10">
                <UIcon name="i-lucide-shield-check" class="mb-2 text-4xl text-muted" />

                <p class="font-medium">
                    No behaviour records found
                </p>

                <p class="text-sm text-muted">
                    Behaviour notes for this student will appear here.
                </p>
            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const route = useRoute()
const store = useStudentStore()
const behaviourStore = useBehaviourStore()
const { record } = storeToRefs(store)
const { records: allRecords, loading } = storeToRefs(behaviourStore)

const studentName = computed(() =>
    record.value ? `${record.value.givenNames} ${record.value.familyName}`.trim() : ''
)

const records = computed(() => allRecords.value.filter(row => row.student === studentName.value))

const summary = computed(() => ({
    total: records.value.length,
    positive: records.value.filter(row => row.kind === 'POSITIVE').length,
    negative: records.value.filter(row => row.kind !== 'POSITIVE').length
}))

async function fetchBehaviours() {
    if (!record.value?.classId) return

    await behaviourStore.fetchAll(record.value.classId, 1, 100)
}

watch(
    () => record.value,
    async value => {
        if (!value) return

        await fetchBehaviours()
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack((route.query.back as string) || '/students')

    document.title = 'Behaviours | View Student | Students | Skultem'
})
</script>
