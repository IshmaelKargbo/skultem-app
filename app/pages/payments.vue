<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <!-- Header -->
        <div class="flex py-2 justify-between items-center border-gray-200">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Payment Recording</p>
                <p class="text-mute">
                    Record and manage student fee payments
                </p>
            </div>
            <div class="space-x-3">
                <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export CSV"
                    :loading="exportingCsv" @click="exportPayments('csv')" />
                <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export PDF"
                    :loading="exportingPdf" @click="exportPayments('pdf')" />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <FeePaymentNew />
            <FeePaymentList />
        </div>
    </div>
</template>

<script setup lang="ts">
import { DOWNLOAD_ICON } from '~/utils/icons'
import { downloadBlob } from '~/utils/report'
import { ReportApi } from '~/api/report.api'

const exportingCsv = ref(false)
const exportingPdf = ref(false)
const toast = useToast()

async function exportPayments(format: 'csv' | 'pdf') {
    const loading = format === 'csv' ? exportingCsv : exportingPdf
    loading.value = true
    try {
        const { blob, filename } = await ReportApi().exportPayments(format)
        downloadBlob(blob, filename)
        toast.add({ title: 'Payments exported', color: 'success' })
    } catch (err: any) {
        toast.add({ title: err.message || 'Failed to export payments', color: 'error' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Payments')
    document.title = 'Payments | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT]
})
</script>
