<template>
    <div class="p-5 space-y-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Reports</p>
                <p class="text-mute text-xs">Create custom reports and explore your school data</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <UButton variant="outline" color="neutral" :icon="SAVED_ICON" label="Saved Reports"
                    to="/analytics/saved" />
                <UButton :icon="PLUS_ICON" label="New Report" to="/analytics/builder" />
            </div>
        </div>
        <div class="mt-5 flex">
            <Tab :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Report Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved Reports', to: '/analytics/saved', exact: true }
            ]" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <UCard v-for="card in reportStats" :key="card.label">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-mute">{{ card.label }}</p>
                        <p class="text-2xl font-semibold text-slate-900">{{ card.value }}</p>
                    </div>
                    <div :class="['h-12 w-12 rounded-xl flex items-center justify-center', card.bg]">
                        <UIcon :name="card.icon" class="text-2xl" :class="card.color" />
                    </div>
                </div>
            </UCard>
        </div>

        <div class="space-y-2">
            <p class="text-lg font-semibold">Quick Explore</p>
            <p class="text-sm text-mute">Start exploring your data by selecting an entity below</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <UCard v-for="item in quickExplore" :key="item.title"
                class="hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
                @click="goToBuilder(item.entity)">
                <div class="flex items-start gap-4">
                    <div :class="['h-12 w-12 rounded-xl flex items-center justify-center', item.bg]">
                        <UIcon :name="item.icon" class="text-xl" :class="item.color" />
                    </div>
                    <div class="space-y-1">
                        <p class="text-base font-semibold text-slate-900">{{ item.title }}</p>
                        <p class="text-sm text-mute">{{ item.description }}</p>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ReportApi } from '~/api/report.api'

const isLoadingReports = ref(false)

const SAVED_ICON = 'lucide:bookmark'
const PLUS_ICON = 'lucide:plus'

type SavedReport = {
    id: string
    name: string
    type: string
    format: string
    createdAt?: string
    updatedAt?: string
}

const savedReports = ref<SavedReport[]>([])

const reportStats = computed(() => {
    const total = savedReports.value.length
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    const thisWeek = savedReports.value.filter((report) => {
        if (!report.createdAt) return false
        return new Date(report.createdAt) >= weekAgo
    }).length
    const scheduled = 0

    return [
        { label: 'Total Reports', value: total, icon: 'lucide:bar-chart-3', bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Reports This Week', value: thisWeek, icon: 'lucide:trending-up', bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'Saved Reports', value: total, icon: 'lucide:bookmark', bg: 'bg-violet-50', color: 'text-violet-600' },
        { label: 'Scheduled Reports', value: scheduled, icon: 'lucide:calendar', bg: 'bg-amber-50', color: 'text-amber-600' }
    ]
})

const quickExplore = [
    {
        title: 'Students',
        description: 'Explore student data, demographics, and enrollment',
        icon: 'lucide:users',
        bg: 'bg-blue-50',
        color: 'text-blue-600',
        entity: 'students'
    },
    {
        title: 'Payments',
        description: 'Review payment activity and trends',
        icon: 'lucide:user-round',
        bg: 'bg-violet-50',
        color: 'text-violet-600',
        entity: 'payments'
    },
    {
        title: 'Behaviour',
        description: 'Track behaviour trends by class',
        icon: 'lucide:shield-check',
        bg: 'bg-emerald-50',
        color: 'text-emerald-600',
        entity: 'behaviour'
    },
    {
        title: 'Attendance',
        description: 'Track attendance trends by class or term',
        icon: 'lucide:calendar-check',
        bg: 'bg-sky-50',
        color: 'text-sky-600',
        entity: 'attendance'
    },
    {
        title: 'Fees',
        description: 'Review fee summaries and outstanding balances',
        icon: 'lucide:wallet',
        bg: 'bg-amber-50',
        color: 'text-amber-600',
        entity: 'fees'
    },
    {
        title: 'Assessments',
        description: 'Compare grades, averages, and distributions',
        icon: 'lucide:graduation-cap',
        bg: 'bg-rose-50',
        color: 'text-rose-600',
        entity: 'grades'
    }
]

const goToBuilder = (entity: string) => {
    navigateTo(`/reports/builder?entity=${entity}`)
}

const loadSavedReports = async () => {
    isLoadingReports.value = true
    try {
        const res = await ReportApi().listReports(1, 50)
        if (!res) return
        savedReports.value = res.data || []
    } finally {
        isLoadingReports.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Analytics')
    document.title = 'Reports | Analytics | Skultem'
    loadSavedReports()
})
</script>
