<template>
    <div class="p-5 space-y-5">
        <div>
            <div class="flex py-2 justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-2xl font-semibold">School Ledger</p>
                    <p class="font-light text-mute">Complete financial transaction history</p>
                </div>
                <div>
                    <FeeDiscountAdd :refresh-report="refreshReport" />
                </div>
            </div>
        </div>
        <div>
            <UCard>
                <div class="flex space-x-5">
                    <UFormField label="Start Date" class="flex-1">
                        <UInput type="date" />
                    </UFormField>
                    <UFormField label="End Date" class="flex-1">
                        <UInput type="date" />
                    </UFormField>
                    <UFormField label="Transaction Type" class="flex-1">
                        <USelect placeholder="Select Type" />
                    </UFormField>
                    <UFormField label="Class" class="flex-1">
                        <USelect placeholder="Select Class" />
                    </UFormField>
                    <UFormField label="Term" class="flex-1">
                        <USelect placeholder="Select Term" />
                    </UFormField>
                </div>
            </UCard>
        </div>
        <LedgerReport />
        <LedgerTable />
    </div>
</template>

<script setup lang="ts">
const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Ledger')
    document.title = 'Ledger | Skultem'
})
</script>