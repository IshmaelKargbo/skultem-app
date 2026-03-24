<template>
    <div class="p-7 h-full overflow-y-auto">
        <div class="bg-white border border-gray-200 rounded-md p-3">
            <div class="flex px-3 py-2 border-b justify-between pb-3 items-center border-gray-200">
                <p class="text-xl font-semibold">Students Management</p>
                <div class="space-x-2">
                    <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export CSV"
                        :loading="exportingCsv" @click="exportStudents('csv')" />
                    <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export PDF"
                        :loading="exportingPdf" @click="exportStudents('pdf')" />
                    <StudentAdd />
                </div>
            </div>
            <StudentTable />
            
        </div>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useStudentStore());
const exportingCsv = ref(false)
const exportingPdf = ref(false)
const toast = useToast()

async function exportStudents(format: 'csv' | 'pdf') {
    const loading = format === 'csv' ? exportingCsv : exportingPdf
    loading.value = true
    try {
        const { blob, filename } = await ReportApi().exportStudents(format)
        downloadBlob(blob, filename)
        toast.add({ title: 'Students exported', color: 'success' })
    } catch (err: any) {
        toast.add({ title: err.message || 'Failed to export students', color: 'error' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Students');
    document.title = 'Students | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN, Role.ACCOUNTANT]
})
</script>
