<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Reports</p>
                <p class="text-mute">Create custom reports and explore your school data</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <UButton variant="outline" color="neutral" :icon="SAVED_ICON" label="Saved Reports"
                    to="/analytics/saved" />
                <UButton :icon="ADD_ICON" label="New Report" to="/analytics/builder" />
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
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <UCard v-for="card in reportStats" :key="card.label">
                <div class="flex items-center justify-between">
                    <div v-if="isLoadingReports" class="space-y-2">
                        <USkeleton class="h-3 w-24" />
                        <USkeleton class="h-8 w-16" />
                    </div>
                    <div v-else>
                        <p class="text-xs text-mute">{{ card.label }}</p>
                        <p class="text-2xl font-semibold text-slate-900">{{ card.value }}</p>
                    </div>
                    <UBadge v-if="!isLoadingReports" :icon="card.icon" class="p-2" size="xl" variant="subtle" :color="card.color" />
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
                    <UBadge :icon="item.icon" class="p-2" size="xl" variant="subtle" color="primary" />
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
const isLoadingReports = ref(true)

const SAVED_ICON = 'lucide:bookmark'
const ADD_ICON = 'lucide:plus'

const store = useReportStore()

const savedReports = computed(() => store.saves)

const reportStats = computed(() => {
    const total = savedReports.value.length
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    const thisWeek = savedReports.value.filter((report) => {
        if (!report.createdAt) return false
        return new Date(report.createdAt) >= weekAgo
    }).length

    return [
        { label: 'Total Reports',     value: total,    icon: 'lucide:bar-chart-3', color: 'success' },
        { label: 'Reports This Week', value: thisWeek, icon: 'lucide:trending-up', color: 'warning' },
        { label: 'Saved Reports',     value: total,    icon: 'lucide:bookmark',    color: 'info'    },
    ]
})

const quickExplore = [
    {
        title: 'Students',
        description: 'Explore student data, demographics, and enrollment',
        icon: 'lucide:users',
        entity: 'students',
    },
    {
        title: 'Payments',
        description: 'Review payment activity and trends',
        icon: 'lucide:credit-card',
        entity: 'payments',
    },
    {
        title: 'Behaviour',
        description: 'Track behaviour trends by class',
        icon: 'lucide:shield-check',
        entity: 'behaviour',
    },
    {
        title: 'Attendance',
        description: 'Track attendance trends by class or term',
        icon: 'lucide:calendar-check',
        entity: 'attendance',
    },
    {
        title: 'Fees',
        description: 'Review fee summaries and outstanding balances',
        icon: 'lucide:wallet',
        entity: 'fees',
    },
    {
        title: 'Assessments',
        description: 'Compare grades, averages, and distributions',
        icon: 'lucide:graduation-cap',
        entity: 'grades',
    },
]

const goToBuilder = (entity: string) => {
    navigateTo(`/analytics/builder?entity=${entity}`)
}

const loadSavedReports = async () => {
    isLoadingReports.value = true
    try {
        await store.fetchAll(0, 0)
    } finally {
        isLoadingReports.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Analytics')
    document.title = 'Reports | Analytics | Skultem'
    loadSavedReports()
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>