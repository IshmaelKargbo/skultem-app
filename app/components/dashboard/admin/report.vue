<template>
    <div class="grid gap-5 grid-cols-4">
        <UCard>
            <div class="space-y-5">
                <div class="flex justify-between items-center">
                    <p class="text-muted text-xs">Total Students</p>
                    <UIcon :name="STUDENT_ICON" class="text-base text-info" />
                </div>
                <div class="space-y-1">
                    <USkeleton v-if="isLoading" class="w-16 h-10" />
                    <p v-else-if="report" class="text-2xl font-semibold">{{ report.totalStudents }}</p>
                    <USkeleton v-if="isLoading" class="w-32 h-2.5" />
                    <div v-else-if="report" class="flex text-success space-x-1">
                        <UIcon name="lucide:line-chart" />
                        <p class="text-xs">+{{ report.studentGrowth }} from last month</p>
                    </div>
                </div>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-5">
                <div class="flex justify-between items-center">
                    <p class="text-muted text-xs">Total Teachers</p>
                    <UIcon :name="TEACHER_ICON" class="text-base text-info" />
                </div>
                <div class="space-y-1">
                    <USkeleton v-if="isLoading" class="w-16 h-10" />
                    <p v-else-if="report" class="text-2xl font-semibold">{{ report.totalTeachers }}</p>
                    <USkeleton v-if="isLoading" class="w-32 h-2.5" />
                    <div v-else class="flex text-muted space-x-1">
                        <p class="text-xs">All departments</p>
                    </div>
                </div>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-5">
                <div class="flex justify-between items-center">
                    <p class="text-muted text-xs">Active Year</p>
                    <UIcon :name="ATTENDANCE_ICON" class="text-base text-info" />
                </div>
                <div class="space-y-1">
                    <USkeleton v-if="isLoading" class="w-16 h-10" />
                    <p v-else-if="report" class="text-2xl font-semibold">{{ report.activeYear }}</p>
                    <USkeleton v-if="isLoading" class="w-32 h-2.5" />
                    <div v-else-if="report" class="flex text-muted space-x-1">
                        <p class="text-xs">{{ report.activeTerm }} Active</p>
                    </div>
                </div>
            </div>
        </UCard>
        <UCard>
            <div class="space-y-5">
                <div class="flex justify-between items-center">
                    <p class="text-muted text-xs">Monthly Revenue</p>
                    <UIcon :name="PAYMENT_ICON" class="text-base text-info" />
                </div>
                <div class="space-y-1">
                    <USkeleton v-if="isLoading" class="w-16 h-10" />
                    <p v-else-if="report" class="text-2xl font-semibold">{{ format(report.monthlyRevenue) }}</p>
                    <USkeleton v-if="isLoading" class="w-32 h-2.5" />
                    <div v-else-if="report" class="flex text-success space-x-1">
                        <UIcon name="lucide:line-chart" />
                        <p class="text-xs">+{{ report.revenueGrowthPercent }}% from last month</p>
                    </div>
                </div>
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