<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <div>
            <div class="flex justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-2xl font-semibold">School Ledger</p>
                    <p class="text-mute">Complete financial transaction history</p>
                </div>
            </div>
        </div>
        <LedgerReport />
        <UCard>
            <div class="flex space-x-5">
                <UInput type="date" />
                <UInput type="date" />
                <USelectMenu placeholder="Select Type" />
                <USelectMenu placeholder="Select Class" />
                <USelectMenu placeholder="Select Term" />
            </div>
        </UCard>
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
    role: [Role.ACCOUNTANT, Role.PROPRIETOR]
})
</script>
