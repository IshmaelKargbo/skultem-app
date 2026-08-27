<template>
    <div class="px-4 sm:px-6  space-y-4">
        <section class="rounded-2xl bg-white/80 p-4 shadow ring-2 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 sm:p-5 lg:p-6">
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
