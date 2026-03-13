<template>
    <div class="p-5 space-y-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Saved Reports</p>
                <p class="text-mute text-xs">Access and manage your saved reports</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <UButton :icon="PLUS_ICON" label="Create New Report" to="/analytics/builder" />
            </div>
        </div>
        <div class="mt-5 flex">
            <Tab :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Report Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved Reports', to: '/analytics/saved', exact: true }
            ]" />
        </div>
        <UCard>
            <UInput v-model="search" placeholder="Search saved reports..." icon="lucide:search" />
        </UCard>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard v-for="card in stats" :key="card.label">
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <p class="text-xs text-mute">{{ card.label }}</p>
                        <p class="text-2xl font-semibold text-slate-900">{{ card.value }}</p>
                    </div>
                    <div :class="['h-12 w-12 rounded-xl flex items-center justify-center', card.bg]">
                        <UIcon :name="card.icon" class="text-2xl" :class="card.color" />
                    </div>
                </div>
            </UCard>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <UCard v-for="report in filteredReports" :key="report.id">
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <UIcon name="lucide:bar-chart-3" class="text-lg text-slate-700" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-base font-semibold text-slate-900">{{ report.name }}</p>
                            <p class="text-sm text-mute">{{ report.description }}</p>
                        </div>
                    </div>
                    <div class="rounded-xl bg-slate-50 h-28 flex items-center justify-center">
                        <div class="flex items-end gap-2">
                            <span v-for="(bar, index) in report.preview" :key="index"
                                class="w-2 rounded-full bg-blue-400" :style="{ height: `${bar}px` }" />
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-mute">
                        <span>Updated {{ report.updated }}</span>
                        <UButton variant="outline" color="neutral" size="xs" label="Open"
                            :to="`/analytics/builder?id=${report.id}`" />
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
const PLUS_ICON = 'lucide:plus'

const search = ref('')
const loading = ref(false)

type SavedReport = {
    id: string
    name: string
    type: string
    format: string
    createdAt?: string
    updatedAt?: string
    description: string
    updated: string
    preview: number[]
}

const reportTypes: Record<string, string> = {
    ledger: 'Ledger report',
    payments: 'Payments summary',
    attendance: 'Attendance analysis',
    behaviour: 'Behaviour report',
    students: 'Student report',
    fees: 'Fees report',
    grades: 'Grades report'
}

const savedReports = ref<SavedReport[]>([])

const stats = computed(() => {
    const total = savedReports.value.length
    const popular = savedReports.value.reduce<Record<string, number>>((acc, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1
        return acc
    }, {})
    const mostPopularType = Object.entries(popular).sort((a, b) => b[1] - a[1])[0]?.[0]
    const mostPopularLabel = mostPopularType ? (reportTypes[mostPopularType] || mostPopularType) : '-'
    const latest = savedReports.value
        .map((report) => report.updatedAt)
        .filter(Boolean)
        .sort()
        .slice(-1)[0]
    const lastUpdated = latest ? formatDateTime(latest as string) : '-'

    return [
        { label: 'Total Saved', value: total, icon: 'lucide:bar-chart-3', bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Most Popular', value: mostPopularLabel, icon: 'lucide:bar-chart-3', bg: 'bg-violet-50', color: 'text-violet-600' },
        { label: 'Last Updated', value: lastUpdated, icon: 'lucide:clock', bg: 'bg-emerald-50', color: 'text-emerald-600' }
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

const loadReports = async () => {
    loading.value = true
    try {
        const res = await ReportApi().listReports(1, 50)
        if (!res) return
        savedReports.value = (res.data || []).map((report: any) => ({
            ...report,
            description: reportTypes[report.type] || 'Saved report',
            updated: report.updatedAt ? formatDateTime(report.updatedAt) : '-',
            preview: buildPreview(report.id || report.name || report.type)
        }))
    } finally {
        loading.value = false
    }
}

const filteredReports = computed(() => {
    if (!search.value) return savedReports.value
    const term = search.value.toLowerCase()
    return savedReports.value.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    )
})

onMounted(() => {
    useAppStore().setTitle('Analytics')
    document.title = 'Saved Reports | Analytics | Skultem'
    loadReports()
})
</script>
