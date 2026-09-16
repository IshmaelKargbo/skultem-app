<template>
    <div class="space-y-5">
        <div v-if="run" class="space-y-5">
            <ReportTableStudent v-if="entity.toLowerCase() == 'students'" />
            <ReportTableTeacher v-if="entity.toLowerCase() == 'teachers'" />
            <ReportTableClazz v-if="entity.toLowerCase() == 'classes'" />
            <ReportTableSubject v-if="entity.toLowerCase() == 'subjects'" />
            <ReportTableAttendance v-if="entity.toLowerCase() == 'attendances'" />
            <ReportTableFee v-if="entity.toLowerCase() == 'fees'" />
            <ReportTablePayment v-if="entity.toLowerCase() == 'payments'" />
            <ReportTableGrade v-if="entity.toLowerCase() == 'grades'" />
            <UCard>
                <div>
                    <p>Export Report</p>
                    <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <UButton :icon="DOWNLOAD_ICON" label="Export CSV" size="lg" class="w-full flex justify-center"
                            color="neutral" variant="outline" :loading="exportingCsv" :disabled="exportingPdf"
                            @click="exportReport('csv')" />
                        <UButton :icon="DOWNLOAD_ICON" label="Export PDF" size="lg" class="w-full flex justify-center"
                            color="neutral" variant="outline" :loading="exportingPdf" :disabled="exportingCsv"
                            @click="exportReport('pdf')" />
                    </div>
                </div>
            </UCard>
        </div>

    </div>
</template>

<script setup lang="ts">
const store = useReportStore()
const { entity, run, report } = storeToRefs(store)
const notify = useNotify()

const exportingCsv = ref(false)
const exportingPdf = ref(false)

async function exportReport(format: 'csv' | 'pdf') {
    if (report.value == null) return

    const loading = format === 'csv' ? exportingCsv : exportingPdf
    loading.value = true
    try {
        const { blob, filename } = await ReportApi().exportBuilderReport(report.value, format)
        downloadBlob(blob, filename)
    } catch (err: any) {
        notify.error(err?.message || 'Failed to export report')
    } finally {
        loading.value = false
    }
}
</script>
