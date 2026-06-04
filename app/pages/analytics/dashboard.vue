<template>
    <div class="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 h-full overflow-y-auto">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Analytics Dashboard</p>
                <p class="text-mute">Overview of key metrics and insights</p>
            </div>
            <div class="grid w-full grid-cols-1 gap-2 md:flex md:w-auto md:flex-wrap md:gap-3">
                <UButton variant="outline" color="neutral" :icon="SAVE_ICON" label="Saved Reports"
                    to="/analytics/saved" />
            </div>
        </div>
        <div class="mt-5">
            <TabMobile class="md:hidden" :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved', to: '/analytics/saved', exact: true },
                { label: 'Widgets', to: '/analytics/dashboard', exact: true }
            ]" />
            <Tab class="hidden md:block" :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Report Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved Reports', to: '/analytics/saved', exact: true },
                { label: 'Dashboard Widgets', to: '/analytics/dashboard', exact: true }
            ]" />
        </div>
        <div class="space-y-5">
            <div class="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <WidgetTotalStudent />
                <WidgetTotalTeacher />
                <WidgetAttendanceRate />
                <WidgetCollectionRate />
            </div>
            <div class="grid gap-4 md:gap-5 grid-cols-1 lg:grid-cols-2">
                <UCard>
                    <WidgetStudentGender />
                </UCard>
                <UCard>
                    <WidgetAttendanceTrend />
                </UCard>
                <UCard class="lg:col-span-2">
                    <WidgetStudentPerformance />
                </UCard>
                <UCard>
                    <WidgetClassPerformance />
                </UCard>
                <UCard>
                    <WidgetSubjectPerformance />
                </UCard>
                <UCard class="lg:col-span-2">
                    <WidgetFeeCollectionClass />
                </UCard>
                <UCard>
                    <WidgetFeeCollectionSummary />
                </UCard>
                <UCard>
                    <WidgetFeeCategorySummary />
                </UCard>
            </div>
        </div>
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
           <WidgetTopPerformanceClass />
            <WidgetOutstandingFee />
            <WidgetActiveAcademic />
        </div>
    </div>
</template>
<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Analytics')
    document.title = 'Dashboard | Analytics | Skultem'
})

definePageMeta({
    role: [Role.PROPRIETOR, Role.OWNER]
})
</script>
