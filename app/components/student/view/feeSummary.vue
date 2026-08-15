<script lang="ts" setup>
const widgetStore = useWidgetStore()
const { record } = storeToRefs(useStudentStore())
const { format } = useMoney()
const loading = ref(true)

const report = reactive<{
    paid: number
    outstanding: number
    total: number
}>({
    paid: 0,
    outstanding: 0,
    total: 0
})

const percentPaid = computed(() => {
    if (report.total <= 0) return 0

    return Math.round((report.paid / report.total) * 100)
})

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashOffset = computed(() => CIRCUMFERENCE * (1 - percentPaid.value / 100))

const tiles = computed(() => [
    {
        key: 'Total',
        value: format(report.total),
        text: 'text-highlighted',
        border: 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-950'
    },
    {
        key: 'Paid',
        value: format(report.paid),
        text: 'text-success-600 dark:text-success-400',
        border: 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-950'
    },
    {
        key: 'Outstanding',
        value: format(report.outstanding),
        text: 'text-warning-600 dark:text-warning-400',
        border: 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950'
    }
])

async function fetchRecord() {
    loading.value = true
    if (record.value == null) return

    const [count] = await Promise.all([
        widgetStore.runAnalytic({
            entity: "fees",
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: record.value?.id,
                    operator: 'EQUALS',
                    type: 'select'
                }
            ],
            metrics: [
                { field: "amountPaid", aggregation: "sum", name: "Paid", tags: { value: "Paid", field: "status" } },
                { field: "amountPaid", aggregation: "sum", name: "Partial", tags: { value: "Partial", field: "status" } },
                { field: "amount", aggregation: "sum", name: "Total" }
            ],
            chartType: "stat"
        }, 1, 10),
    ])

    const datasets = count?.data.datasets || []

    const paid = datasets.find((e: any) => e.label === 'Paid')
    const partial = datasets.find((e: any) => e.label === 'Partial')
    const total = datasets.find((e: any) => e.label === 'Total')

    const amountPaid = paid?.data?.[0] + partial?.data?.[0] || 0
    const outstanding = (total?.data?.[0] || 0) - amountPaid
    Object.assign(report, {
        paid: amountPaid,
        total: total?.data?.[0] || 0,
        outstanding: outstanding
    })
    loading.value = false
}

watch(() => record.value, () => fetchRecord(), { immediate: true })
</script>

<template>
    <UCard class="mb-6">
        <div class="flex flex-col items-center gap-6 lg:flex-row">
            <!-- Ring -->
            <div class="flex shrink-0 flex-col items-center">
                <div class="relative h-32 w-32">
                    <svg viewBox="0 0 120 120" class="h-32 w-32 -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke-width="14"
                            class="stroke-warning-100 dark:stroke-warning-950" />

                        <circle cx="60" cy="60" r="52" fill="none" stroke-width="14" stroke-linecap="round"
                            :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="dashOffset"
                            class="stroke-success-500 transition-all duration-700 ease-out" />
                    </svg>

                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <USkeleton v-if="loading" class="h-7 w-12" />

                        <span v-else class="text-2xl font-bold text-highlighted">
                            {{ percentPaid }}%
                        </span>

                        <span class="text-[10px] font-semibold uppercase tracking-wide text-muted">
                            Paid
                        </span>
                    </div>
                </div>

                <div class="mt-3 flex items-center gap-4">
                    <div class="flex items-center gap-1.5">
                        <span class="h-2 w-2 rounded-full bg-success-500" />
                        <span class="text-xs text-muted">Paid</span>
                    </div>

                    <div class="flex items-center gap-1.5">
                        <span class="h-2 w-2 rounded-full bg-warning-400" />
                        <span class="text-xs text-muted">Outstanding</span>
                    </div>
                </div>
            </div>

            <!-- Stat tiles -->
            <div class="grid w-full flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <div v-for="tile in tiles" :key="tile.key" class="rounded-xl border-2 p-4 text-center"
                    :class="tile.border"
                >
                    <USkeleton v-if="loading" class="mx-auto h-7 w-20" />

                    <h2 v-else class="text-2xl font-bold" :class="tile.text">
                        {{ tile.value }}
                    </h2>

                    <p class="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        {{ tile.key }}
                    </p>
                </div>
            </div>
        </div>
    </UCard>
</template>
