<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Saved Reports</p>
                <p class="text-mute">Access and manage your saved reports</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <UButton :icon="ADD_ICON" label="Create New Report" to="/analytics/builder" />
            </div>
        </div>
        <div class="mt-5 flex">
            <Tab :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Report Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved Reports', to: '/analytics/saved', exact: true },
                { label: 'Dashboard Widgets', to: '/analytics/dashboard', exact: true }
            ]" />
        </div>
        <UCard>
            <UInput v-model="search" placeholder="Search saved reports..." icon="lucide:search" />
        </UCard>
        <ReportSavedReport />

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ReportSavedCardSkeleton v-if="loading" v-for="item in 6" :key="item" />
            <ReportSavedCard v-else v-for="report in filteredReports" :record="report" :key="report.id" />
        </div>
    </div>
</template>

<script setup lang="ts">
const search = ref('')
const store = useReportStore()
const { saves: records, loading } = storeToRefs(store)

const reportTypes: Record<string, string> = {
    ledger: 'Ledger report',
    payments: 'Payments summary',
    attendance: 'Attendance analysis',
    behaviour: 'Behaviour report',
    students: 'Student report',
    fees: 'Fees report',
    grades: 'Grades report'
}

const savedReports = computed(() => records.value.map((report: any) => ({
    ...report,
    description: reportTypes[report.type] || 'Saved report',
    updated: report.updatedAt ? formatDateTime(report.updatedAt) : '-',
    preview: buildPreview(report.id || report.name || report.type)
})))

const stats = computed(() => {
    const total = savedReports.value.length
    const latest = savedReports.value
        .map((report) => report.updatedAt)
        .filter(Boolean)
        .sort()
        .slice(-1)[0]
    const lastUpdated = latest ? formatDateTime(latest as string) : '-'

    return [
        { label: 'Total Saved', value: total, icon: 'lucide:bar-chart-3', bg: 'bg-blue-50', color: 'warning' },
        { label: 'Last Updated', value: lastUpdated, icon: 'lucide:clock', bg: 'bg-emerald-50', color: 'success' }
    ]
})

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

const filteredReports = computed(() => {
    if (!search.value) return savedReports.value
    const term = search.value.toLowerCase()
    return savedReports.value.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    )
})

onMounted(async () => {
    useAppStore().setTitle('Analytics')
    document.title = 'Saved Reports | Analytics | Skultem'
    await store.fetchAll(1, runtimeConf().limit)
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
