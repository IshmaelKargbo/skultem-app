<script lang="ts" setup>
// Totals for the fees listed below it on the student's Fees tab - worked out from those same rows, so the two always
// agree (it used to sum only the first 10 fee records and ignored discounts).
const props = defineProps<{ fees: Fee[], loading?: boolean }>()
const { format } = useMoney()
const loading = computed(() => !!props.loading)

const report = computed(() => {
    const sum = (pick: (f: Fee) => number) => props.fees.reduce((total, f) => total + (Number(pick(f)) || 0), 0)
    return {
        total: sum(f => f.amount),
        discount: sum(f => (f as any).discount ?? 0),
        paid: sum(f => f.amountPaid),
        outstanding: sum(f => f.outstanding)
    }
})

// Against what is actually owed (after discounts).
const percentPaid = computed(() => {
    const owed = report.value.total - report.value.discount
    if (owed <= 0) return report.value.total > 0 ? 100 : 0
    return Math.min(100, Math.round((report.value.paid / owed) * 100))
})

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashOffset = computed(() => CIRCUMFERENCE * (1 - percentPaid.value / 100))

const tiles = computed(() => [
    {
        key: 'Total',
        value: format(report.value.total),
        text: 'text-highlighted',
        border: 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-950'
    },
    {
        key: 'Paid',
        value: format(report.value.paid),
        text: 'text-success-600 dark:text-success-400',
        border: 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-950'
    },
    {
        key: 'Outstanding',
        value: format(report.value.outstanding),
        text: 'text-warning-600 dark:text-warning-400',
        border: 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950'
    },
    // Only when the student has one - Total less Discount less Paid is Outstanding.
    ...(report.value.discount > 0 ? [{
        key: 'Discount',
        value: format(report.value.discount),
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
    }] : [])
])

</script>

<template>
    <div class="mb-6 md:border border-default md:p-4 md:rounded-2xl">
        <div class="flex flex-col items-center gap-6 lg:flex-row">
            <!-- Ring -->
            <div class="flex shrink-0 flex-col items-center">
                <div class="relative h-32 w-32">
                    <svg viewBox="0 0 100 100" class="h-32 w-32 -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke-width="14"
                            class="stroke-warning-100 dark:stroke-warning-950" />

                        <circle cx="50" cy="50" r="42" fill="none" stroke-width="14" stroke-linecap="round"
                            :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="dashOffset"
                            class="stroke-success-500 transition-all duration-700 ease-out" />
                    </svg>

                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <USkeleton v-if="loading" class="h-7 w-12" />

                        <span v-else class="md:text-2xl text-xl font-bold text-highlighted">
                            {{ percentPaid }}%
                        </span>

                        <span class="md:text-[10px] text-[8px] font-semibold uppercase tracking-wide text-muted">
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
            <div class="grid w-full flex-1 grid-cols-2 gap-3 md:grid-cols-3">
                <div v-for="tile in tiles" :key="tile.key" class="rounded-xl border-2 p-4 text-center last:col-span-2 last:md:col-span-1"
                    :class="tile.border"
                >
                    <USkeleton v-if="loading" class="mx-auto h-7 w-20" />

                    <h2 v-else class="md:text-2xl font-bold" :class="tile.text">
                        {{ tile.value }}
                    </h2>

                    <p class="md:mt-1 md:text-[11px] text-[8px] font-semibold uppercase tracking-wide text-muted">
                        {{ tile.key }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
