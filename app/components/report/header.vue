<template>
    <div class="space-y-4 sm:space-y-5">
        <div class="space-y-1">
            <p class="text-xl font-display font-semibold sm:text-3xl">Financial Reports</p>
            <p class="text-sm text-mute sm:text-base">Comprehensive financial analytics and reports</p>
        </div>

        <UCard class="overflow-hidden" :ui="{ body: 'p-4 sm:p-5' }">
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <UInput type="date" class="w-full" />
                <UInput type="date" class="w-full" />
                <USelectMenu placeholder="Select Type" class="w-full" />
                <USelectMenu placeholder="Select Class" class="w-full" />
                <USelectMenu placeholder="Select Term" class="w-full" />
            </div>
        </UCard>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
                <div class="flex items-start gap-3">
                    <UBadge variant="subtle" color="primary" size="xl" class="p-1.5 shrink-0" :icon="REPORT_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Revenue by Class</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
                <div class="flex items-start gap-3">
                    <UBadge color="info" variant="subtle" size="xl" class="p-1.5 shrink-0" :icon="IMPROVED_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Revenue by Term</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
                <div class="flex items-start gap-3">
                    <UBadge color="error" variant="subtle" size="xl" class="p-1.5 shrink-0" :icon="PAYMENT_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Outstanding Fees</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard :ui="{ body: 'p-4 sm:p-5' }">
                <div class="flex items-start gap-3">
                    <UBadge variant="subtle" color="success" size="xl" class="p-1.5 shrink-0"
                        :icon="STUDENT_FEES_ICON" />
                    <div class="min-w-0">
                        <p class="text-xs text-mute">Profit & Loss</p>
                        <p class="truncate font-medium">Download Report</p>
                    </div>
                </div>
            </UCard>
        </div>
        <div>
            <TabMobile class="md:hidden" :tabs="[
                  { label: 'Revenue Analysis', to: '/reports', exact: true },
                { label: 'Outstanding Fees', to: '/reports/outstanding' },
                { label: 'Expense Report', to: '/reports/expense' },
                { label: 'Payment History', to: '/reports/history' },
                { label: 'Profit & Loss', to: '/reports/profit-loss' }
            ]" />
            <Tab class="hidden md:flex" :tabs="[
                { label: 'Revenue Analysis', to: '/reports', exact: true },
                { label: 'Outstanding Fees', to: '/reports/outstanding' },
                { label: 'Expense Report', to: '/reports/expense' },
                { label: 'Payment History', to: '/reports/history' },
                { label: 'Profit & Loss', to: '/reports/profit-loss' }
            ]" />
        </div>

    </div>
</template>
