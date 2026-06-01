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

    const amountPaid = paid?.data?.[0] + partial?.data?.[0] || 0;
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="border-2 border-info-300 bg-indigo-50  dark:border-indigo-800 dark:bg-indigo-950 rounded-xl p-4">
            <p class="text-[11px] uppercase text-muted">
                Total Fees
            </p>

            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-success-200 dark:bg-info-800" />
            <h2 v-else class="text-2xl font-bold mt-1">
                {{ format(report.total) }}
            </h2>
        </div>

        <div class="border-2 border-success-300 bg-success-50  dark:border-success-800 dark:bg-success-950 rounded-xl p-4">
            <p class="text-[11px] uppercase text-muted">
                Paid Amount
            </p>

            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-success-200 dark:bg-success-800" />
            <h2 v-else class="text-2xl font-bold text-success-600 mt-1">
                {{ format(report.paid) }}
            </h2>
        </div>

        <div class="border-2 border-warning-300 bg-warning-50  dark:border-warning-800 dark:bg-warning-950 rounded-xl p-4">
            <p class="text-[11px] uppercase text-muted">
                Outstanding Balance
            </p>

            <USkeleton v-if="loading" class="mt-1 h-8 w-16 bg-warning-200 dark:bg-warning-800" />
            <h2 v-else class="text-2xl font-bold text-warning-600 mt-1">
                {{ format(report.outstanding) }}
            </h2>
        </div>
    </div>
</template>
