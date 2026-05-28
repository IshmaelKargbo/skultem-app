<script lang="ts" setup>
const { student, term } = defineProps<{
    student: Student | undefined,
    term: Term | undefined
}>()

const widgetStore = useWidgetStore()
const loading = ref(true)

const report = reactive<{
    present: number
    late: number
    absent: number
    excused: number
    total: number
}>({
    absent: 0,
    excused: 0,
    late: 0,
    present: 0,
    total: 0
})

async function fetchRecord() {
    loading.value = true
    if (!term || !student) return

    const [count] = await Promise.all([
        widgetStore.runAnalytic({
            entity: "attendances",
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: student?.id,
                    operator: 'EQUALS',
                    type: 'select'
                },
                {
                    field: 'date',
                    value: term?.startDate || '',
                    valueTo: term?.endDate,
                    operator: "BETWEEN",
                    type: "date"
                }
            ],
            metrics: [
                {
                    name: "Present",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Present" }
                },
                {
                    name: "Absent",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Absent" }
                },
                {
                    name: "Excused",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Excused" }
                },
                {
                    name: "Late",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Late" }
                },
                {
                    name: "Total",
                    aggregation: "count"
                }
            ],
            chartType: "stat"
        }, 1, 10),
    ])

    const datasets = count?.data.datasets || []

    const present = datasets.find((e: any) => e.label === 'Present')
    const late = datasets.find((e: any) => e.label === 'Late')
    const absent = datasets.find((e: any) => e.label === 'Absent')
    const excused = datasets.find((e: any) => e.label === 'Excused')
    const total = datasets.find((e: any) => e.label === 'Total')

    report.present = present?.data?.[0] ?? 0
    report.late = late?.data?.[0] ?? 0
    report.absent = absent?.data?.[0] ?? 0
    report.excused = excused?.data?.[0] ?? 0
    report.total = total?.data?.[0] ?? 0
    loading.value = false
}

watch(() => [term, student], () => fetchRecord(), { immediate: true })
</script>

<template>
    <div class="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <div class="rounded-xl border-2 border-indigo-300 bg-indigo-50  dark:border-indigo-800 dark:bg-indigo-950 p-4">
            <p class="text-[11px] uppercase text-muted">
                Total Days
            </p>
            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-indigo-200 dark:bg-indigo-800" />
            <h2 v-else class="mt-1 text-2xl font-bold">
                {{ report.total }}
            </h2>
        </div>

        <div
            class="rounded-xl border-2 border-success-300 bg-success-50  dark:border-success-800 dark:bg-success-950 p-4">
            <p class="text-[11px] uppercase text-muted">
                Present
            </p>

            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-success-200 dark:bg-success-800" />
            <h2 v-else class="mt-1 text-2xl font-bold text-success-600">
                {{ report.present }}
            </h2>
        </div>

        <div class="rounded-xl border-2 border-error-300 bg-error-50  dark:border-error-800 dark:bg-error-950 p-4">
            <p class="text-[11px] uppercase text-muted">
                Absent
            </p>

            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-error-200 dark:bg-error-800" />
            <h2 v-else class="mt-1 text-2xl font-bold text-error-600 dark:text-warning-600">
                {{ report.absent }}
            </h2>
        </div>

        <div
            class="rounded-xl border-2 border-warning-300 bg-warning-50  dark:border-warning-800 dark:bg-warning-950 p-4">
            <p class="text-[11px] uppercase text-muted">
                Late
            </p>
            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-warning-200 dark:bg-warning-800" />
            <h2 v-else class="mt-1 text-2xl font-bold text-warning-600 dark:text-warning-600">
                {{ report.late }}
            </h2>
        </div>
    </div>
</template>
