<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <div>
            <div class="flex py-2 justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-2xl font-semibold">School Ledger</p>
                    <p class="text-mute">Complete financial transaction history</p>
                </div>
                <div class="space-x-3">
                    <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export CSV"
                        :loading="exportingCsv" @click="exportLedger('csv')" />
                    <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export PDF"
                        :loading="exportingPdf" @click="exportLedger('pdf')" />
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
                        <USelectMenu placeholder="Select Type" />
                    </UFormField>
                    <UFormField label="Class" class="flex-1">
                        <USelectMenu placeholder="Select Class" />
                    </UFormField>
                    <UFormField label="Term" class="flex-1">
                        <USelectMenu placeholder="Select Term" />
                    </UFormField>
                </div>
            </UCard>
        </div>
        <LedgerReport />
        <LedgerTable />
    </div>
</template>

<script setup lang="ts">
const exportingCsv = ref(false)
const exportingPdf = ref(false)
const toast = useToast()

async function exportLedger(format: 'csv' | 'pdf') {
    const loading = format === 'csv' ? exportingCsv : exportingPdf
    loading.value = true
    try {
        const { blob, filename } = await ReportApi().exportLedger(format)
        downloadBlob(blob, filename)
        toast.add({ title: 'Ledger exported', color: 'success' })
    } catch (err: any) {
        toast.add({ title: err.message || 'Failed to export ledger', color: 'error' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Ledger')
    document.title = 'Ledger | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN, Role.ACCOUNTANT]
})
</script>
