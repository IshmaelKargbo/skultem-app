<template>
        <div class="grid gap-5 grid-cols-4 space-y-0 w-full">
        <UCard>
            <div class="space-y-1">
                <p class="text-xs text-mute">Total Students</p>

                <div v-if="isLoading" class="animate-pulse space-y-2">
                    <div class="h-7 w-24 bg-gray-200 rounded" />
                    <div class="h-4 w-28 bg-gray-200 rounded" />
                </div>

                <template v-else-if="report">
                    <div class="flex justify-between items-center">
                        <p class="text-2xl font-display font-semibold">{{ report.totalStudents }}</p>
                        <UBadge :icon="ATTENDANCE_ICON" variant="subtle" size="xl" class="p-1.5" color="primary" />
                    </div>
                    <div class="flex text-xs text-primary space-x-1">
                        <UIcon name="" />
                        <p class="text-xs">+{{ report.studentGrowth }} from last month</p>
                    </div>
                </template>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-xs text-mute">Total Teachers</p>

                <div v-if="isLoading" class="animate-pulse space-y-2">
                    <div class="h-7 w-24 bg-gray-200 rounded" />
                    <div class="h-4 w-28 bg-gray-200 rounded" />
                </div>

                <template v-else-if="report">
                    <div class="flex justify-between items-center">
                        <p class="text-2xl font-display font-semibold">{{ report.totalTeachers }}</p>
                        <UBadge :icon="TEACHER_ICON" variant="subtle" size="xl" class="p-1.5" color="warning" />
                    </div>
                    <div class="flex text-xs text-muted space-x-1">
                        <p class="text-xs">All departments</p>
                    </div>
                </template>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-xs text-mute">Active Year</p>

                <div v-if="isLoading" class="animate-pulse space-y-2">
                    <div class="h-7 w-24 bg-gray-200 rounded" />
                    <div class="h-4 w-28 bg-gray-200 rounded" />
                </div>

                <template v-else-if="report">
                    <div class="flex justify-between items-center">
                        <p class="text-2xl font-display font-semibold">{{ report.activeYear }}</p>
                        <UBadge :icon="ATTENDANCE_ICON" variant="subtle" size="xl" class="p-1.5" color="info" />
                    </div>
                    <div class="flex text-xs text-muted space-x-1">
                        <p class="text-xs">{{ report.activeTerm }} Active</p>
                    </div>
                </template>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-1">
                <p class="text-xs text-mute">Monthly Revenue</p>

                <div v-if="isLoading" class="animate-pulse space-y-2">
                    <div class="h-7 w-24 bg-gray-200 rounded" />
                    <div class="h-4 w-28 bg-gray-200 rounded" />
                </div>

                <template v-else-if="report">
                    <div class="flex justify-between items-center">
                        <p class="text-2xl font-display font-semibold">{{ format(report.monthlyRevenue) }}</p>
                        <UBadge :icon="PAYMENT_ICON" variant="subtle" size="xl" class="p-1.5" color="success" />
                    </div>
                    <div class="flex text-xs text-success space-x-1">
                         <UIcon name="lucide:line-chart" />
                        <p class="text-xs">+{{ report.revenueGrowthPercent }}% from last month</p>
                    </div>
                </template>
            </div>
        </UCard>
        </div>
</template>

<script setup lang="ts">
const isLoading = ref(true)
const { format } = useMoney()

const store = useDashboardStore();

const report = ref<AdminDashboardReport>()

async function fetchRecord() {
    isLoading.value = true
    const res = await store.fetchAdminReport()
    if (res == null) return
    report.value = res
    isLoading.value = false
}

onMounted(async () => await fetchRecord())
</script>