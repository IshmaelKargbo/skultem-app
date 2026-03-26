<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <div class="flex justify-between items-center">
            <div class="space-y-0.5">
                <p class="text-2xl font-semibold">Finance Dashboard</p>
                <p class="text-mute">Overview of financial operations</p>
            </div>
            <div class="space-x-3">
                <UButton to="/fees-structures" label="Create Fee Structure" :icon="ADD_ICON" />
                <UButton to="/payments" label="Record Payment" color="neutral" :icon="PAYMENT_ICON" variant="outline" />
                <UButton to="/reports" label="Generate Report" color="neutral" :icon="REPORT_ICON" variant="outline" />
            </div>
        </div>
        <DashboardAccountantReport />
        <div class="grid grid-cols-2 gap-5">
            <DashboardAccountantRevenue />
            <DashboardAccountantOutstanding />
        </div>
        <DashboardAccountantTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Dashboard')
    document.title = "Dashboard | Skultem"
})
</script>