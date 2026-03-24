<template>
    <div class="p-7 space-y-5">
        <div>
            <div class="flex py-2 justify-between items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-xl font-normal">Fee Structure Management</p>
                    <p class="font-light text-muted">Create and manage fee structures</p>
                </div>
                <div class="space-x-3">
                    <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export CSV"
                        :loading="exportingCsv" @click="exportFees('csv')" />
                    <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export PDF"
                        :loading="exportingPdf" @click="exportFees('pdf')" />
                    <FeeStructureAdd />
                </div>
            </div>
        </div>
        <UCard>
            <div class="flex space-x-3">
                <div class="flex-1">
                    <UFormField label="Search">
                        <UInput placeholder="Search by class or category" :leading-icon="SEARCH_ICON" />
                    </UFormField>
                </div>
                <div class="w-1/3 flex space-x-3">
                    <UFormField label="Academic Year" class="w-full">
                        <USelectMenu placeholder="Select Academic Year" />
                    </UFormField>
                    <UFormField label="Class" class="w-full">
                        <USelectMenu placeholder="Select Class" />
                    </UFormField>
                </div>
            </div>
        </UCard>
        <UCard>
            <FeeStructureTable />
            <div class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { DOWNLOAD_ICON, SEARCH_ICON } from '~/utils/icons'
import { downloadBlob } from '~/utils/report'
import { ReportApi } from '~/api/report.api'

const page = ref(1);
const { meta } = storeToRefs(useFeeStructureStore());
const exportingCsv = ref(false)
const exportingPdf = ref(false)
const toast = useToast()

async function exportFees(format: 'csv' | 'pdf') {
    const loading = format === 'csv' ? exportingCsv : exportingPdf
    loading.value = true
    try {
        const { blob, filename } = await ReportApi().exportFees(format)
        downloadBlob(blob, filename)
        toast.add({ title: 'Fee structures exported', color: 'success' })
    } catch (err: any) {
        toast.add({ title: err.message || 'Failed to export fee structures', color: 'error' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Fees Structures');
})

definePageMeta({
    title: 'Fees Structures',
    role: [Role.ACCOUNTANT]
})
</script>
