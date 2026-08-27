<script setup lang="ts">
const store = useReportStore()
const { grades: records, loading } = storeToRefs(store)

const { student, term } = defineProps<{
    term: string
    student: string
    clazz: string
}>()

// Grouped by assessment (Test 1, Test 2, Exam, ...) - each one gets its own expandable section,
// in the order it runs, same as the student's own Academic Information page.
const groups = computed(() => {
    const map = new Map<string, any[]>()

    for (const grade of records.value || []) {
        const key = grade.name || 'Other'
        const items = map.get(key) ?? []
        items.push(grade)
        map.set(key, items)
    }

    return Array.from(map.entries())
        .map(([key, items]) => {
            const scores = items.map((item: any) => Number(item.score ?? 0)).filter((n: number) => !Number.isNaN(n))
            const passed = items.filter((item: any) => Number(item.score ?? 0) >= 50).length
            const failed = Math.max(items.length - passed, 0)
            const average = scores.length
                ? (scores.reduce((sum: number, n: number) => sum + n, 0) / scores.length).toFixed(1)
                : '0.0'
            const position = Number((items[0] as any)?.level ?? Number.MAX_SAFE_INTEGER)

            return {
                key,
                title: key,
                items,
                passed,
                failed,
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

async function runReport() {
    if (!term) return

    await store.runReport(
        {
            entity: "grades",
            filters: [
                {
                    field: "studentAssessment.enrollment.student.id",
                    value: student,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: "cycle.term.id",
                    value: term,
                    operator: "EQUALS",
                    type: "select"
                }
            ]
        },
        1,
        200
    )
}

watch(() => [term, student], runReport, { immediate: true })
</script>

<template>
    <div class="block space-y-3 md:hidden">
        <div v-if="loading" class="space-y-3">
            <div
                v-for="i in 3"
                :key="i"
                class="rounded-xl border-2 border-gray-100 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-950"
            >
                <div class="flex items-center justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                        <USkeleton class="h-5 w-5 rounded-full" />
                        <USkeleton class="h-5 w-32" />
                        <USkeleton class="h-6 w-16 rounded-full" />
                    </div>

                    <USkeleton class="h-5 w-16" />
                </div>
            </div>
        </div>

        <div v-else-if="groups.length" class="space-y-3">
            <div
                v-for="group in groups"
                :key="group.key"
                class="overflow-hidden rounded-xl border border-default border-l-4"
                :class="group.passed === group.items.length ? 'border-l-success-500' : 'border-l-warning-500'"
            >
                <button
                    type="button"
                    class="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-3 text-left transition hover:bg-elevated/40"
                    @click="toggle(group.key)"
                >
                    <div class="flex min-w-0 items-center gap-2">
                        <UIcon
                            :name="expandedKeys.has(group.key) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                            class="size-4 shrink-0 text-muted"
                        />

                        <h4 class="truncate text-sm font-semibold">
                            {{ group.title }}
                        </h4>

                        <UBadge
                            :color="group.passed === group.items.length ? 'success' : 'warning'"
                            variant="solid"
                            size="sm"
                            class="shrink-0 rounded-full"
                        >
                            {{ group.passed === group.items.length ? 'All Passed' : `${group.failed} Attention` }}
                        </UBadge>
                    </div>

                    <span class="shrink-0 text-xs text-muted">
                        Avg <span class="font-semibold text-highlighted">{{ group.average }}%</span>
                    </span>
                </button>

                <div v-if="expandedKeys.has(group.key)" class="space-y-2 border-t border-default p-3">
                    <div
                        v-for="subject in group.items"
                        :key="subject.id"
                        class="flex items-center justify-between gap-2 rounded-lg bg-elevated/40 px-3 py-2"
                    >
                        <div class="min-w-0">
                            <p class="truncate text-sm font-medium">{{ subject.subject }}</p>
                            <p class="truncate text-[11px] text-muted">{{ subject.teacher }}</p>
                        </div>

                        <div class="flex shrink-0 items-center gap-2">
                            <span class="text-sm">
                                {{ subject.score }}% <span class="text-muted">({{ subject.weightScore }}%)</span>
                            </span>

                            <UBadge
                                size="sm"
                                variant="soft"
                                :color="subject.grade === 'A'
                                    ? 'success'
                                    : subject.grade === 'B'
                                        ? 'primary'
                                        : subject.grade === 'C'
                                            ? 'warning'
                                            : subject.grade === null
                                                ? 'neutral'
                                                : 'error'"
                            >
                                {{ subject.grade || 'N/A' }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 dark:border-gray-700"
        >
            <UIcon name="i-lucide-book-x" class="mb-2 text-4xl text-muted" />

            <p class="font-medium">
                No Academic Records Found
            </p>

            <p class="text-sm text-muted">
                Try selecting another term.
            </p>
        </div>
    </div>
</template>
