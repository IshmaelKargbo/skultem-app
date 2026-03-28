<template>
    <div class="space-y-5">
        <div class="flex justify-between items-center border-gray-200">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Financial Reports</p>
                <p class="text-mute">Comprehensive financial analytics and reports</p>
            </div>
        </div>
        <UCard>
            <div class="flex space-x-2">
                <UInput type="date" />
                <UInput type="date" />
                <USelectMenu placeholder="Select Type" />
                <USelectMenu placeholder="Select Class" />
                <USelectMenu placeholder="Select Term" />
            </div>
        </UCard>
        <div class="grid gap-3 grid-cols-4">
            <UCard>
                <div class="flex space-x-3 items-center">
                    <UBadge variant="subtle" color="primary" size="xl" class="p-1.5" :icon="REPORT_ICON" />
                    <div>
                        <p class="text-xs text-mute">Revenue by Class</p>
                        <p>Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard>
                <div class="flex space-x-3 items-center">
                    <UBadge color="info" variant="subtle" size="xl" class="p-1.5" :icon="IMPROVED_ICON" />
                    <div>
                        <p class="text-xs text-mute">Revenue by Term</p>
                        <p>Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard>
                <div class="flex space-x-3 items-center">
                    <UBadge color="error" variant="subtle" size="xl" class="p-1.5" :icon="PAYMENT_ICON" />
                    <div>
                        <p class="text-xs text-mute">Outstanding Fees</p>
                        <p>Download Report</p>
                    </div>
                </div>
            </UCard>
            <UCard>
                <div class="flex space-x-3 items-center">
                    <UBadge variant="subtle" color="success" size="xl" class="p-1.5" :icon="STUDENT_FEES_ICON" />
                    <div>
                        <p class="text-xs text-mute">Profit & Loss</p>
                        <p>Download Report</p>
                    </div>
                </div>
            </UCard>
        </div>
        <Tab :tabs="[
            { label: 'Revenue Analysis', to: '/reports', exact: true },
            { label: 'Outstanding Fees', to: '/reports/outstanding' },
            { label: 'Expense Report', to: '/reports/expense' },
            { label: 'Payment History', to: '/reports/history' },
            { label: 'Profit & Loss', to: '/reports/profit-loss' }
        ]" />
    </div>
</template>
