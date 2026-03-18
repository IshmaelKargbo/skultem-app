<script lang="ts" setup>
const store = useReportStore()
const { saves: records, loading: isLoading } = storeToRefs(store)

const reportTypes: Record<string, string> = {
    ledger:     'Ledger report',
    payments:   'Payments summary',
    attendance: 'Attendance analysis',
    behaviour:  'Behaviour report',
    students:   'Student report',
    fees:       'Fees report',
    grades:     'Grades report',
}

const buildPreview = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 100000
    }
    const bars = []
    for (let i = 0; i < 5; i += 1) {
        hash = (hash * 17 + i * 13) % 60
        bars.push(20 + (hash % 60))
    }
    return bars
}

const savedReports = computed(() => records.value.map((report: any) => ({
    ...report,
    description: reportTypes[report.type] || 'Saved report',
    updated:     report.updatedAt ? formatDateTime(report.updatedAt) : '-',
    preview:     buildPreview(report.id || report.name || report.type),
})))

const stats = computed(() => {
    const total = savedReports.value.length
    const latest = savedReports.value
        .map((r) => r.updatedAt)
        .filter(Boolean)
        .sort()
        .at(-1)

    return [
        { label: 'Total Saved',  value: total,                                        icon: 'lucide:bar-chart-3', color: 'warning' },
        { label: 'Last Updated', value: latest ? formatDateTime(latest as string) : '-', icon: 'lucide:clock',      color: 'success' },
    ]
})
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard v-for="card in stats" :key="card.label">
            <div class="flex items-center justify-between">
                <div v-if="isLoading" class="space-y-2">
                    <USkeleton class="h-3 w-24" />
                    <USkeleton class="h-8 w-16" />
                </div>
                <div v-else class="space-y-2">
                    <p class="text-xs text-mute">{{ card.label }}</p>
                    <p class="text-2xl font-semibold">{{ card.value }}</p>
                </div>
                <UBadge v-if="!isLoading" :icon="card.icon" class="p-2" size="xl" variant="subtle" :color="card.color" />
            </div>
        </UCard>
    </div>
</template>