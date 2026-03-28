<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <Heading title="Finance Dashboard" subtitle="Overview of financial operations">
            <div class="space-x-3">
                <UButton to="/fees-structures" label="Create Fee Structure" :icon="ADD_ICON" />
                <UButton to="/payments" label="Record Payment" color="neutral" :icon="PAYMENT_ICON" variant="outline" />
                <UButton to="/reports" label="Generate Report" color="neutral" :icon="REPORT_ICON" variant="outline" />
            </div>
        </Heading>
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