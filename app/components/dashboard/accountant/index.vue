<template>
    <div class="p-4 sm:p-6 lg:p-7 space-y-5 h-full overflow-y-auto">
        <section class="rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-5 lg:p-6">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="space-y-1.5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                        Finance Dashboard
                    </p>
                    <h1 class="text-2xl font-display font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        Overview of financial operations
                    </h1>
                    <p class="max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                        Track revenue, outstanding fees, and recent payment records from one clean view.
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-end">
                    <UButton to="/fees-payment/structure/add" label="Create Fee Structure" :icon="ADD_ICON" />
                    <UButton to="/fees-payment/pay" label="Record Payment" color="neutral" :icon="PAYMENT_ICON" variant="outline" />
                    <UButton to="/reports" label="Generate Report" color="neutral" :icon="REPORT_ICON" variant="outline" />
                </div>
            </div>
        </section>
        <DashboardAccountantReport />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
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
