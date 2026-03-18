<template>
    <div class="p-5 space-y-5">
        <div class="flex justify-between items-center">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Attendance</p>
                <p class="text-mute">Track class attendance and export reports</p>
            </div>
            <div class="space-x-3">
                <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export CSV"
                    :loading="exportingCsv" @click="exportAttendance('csv')" />
                <UButton variant="outline" color="neutral" :icon="DOWNLOAD_ICON" label="Export PDF"
                    :loading="exportingPdf" @click="exportAttendance('pdf')" />
            </div>
        </div>
        <AttendanceReport />
        <AttendanceMark />
        <AttendanceHistory />
    </div>
</template>

<script setup lang="ts">
import { DOWNLOAD_ICON } from '~/utils/icons'
import { downloadBlob } from '~/utils/report'
import { ReportApi } from '~/api/report.api'

const route = useRoute()
const toast = useToast()
const exportingCsv = ref(false)
const exportingPdf = ref(false)

async function exportAttendance(format: 'csv' | 'pdf') {
    const classSessionId = route.query.class as string
    if (!classSessionId) {
        toast.add({ title: 'Select a class session first', color: 'warning' })
        return
    }

    const loading = format === 'csv' ? exportingCsv : exportingPdf
    loading.value = true
    try {
        const { blob, filename } = await ReportApi().exportAttendance(classSessionId, format)
        downloadBlob(blob, filename)
        toast.add({ title: 'Attendance exported', color: 'success' })
    } catch (err: any) {
        toast.add({ title: err.message || 'Failed to export attendance', color: 'error' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Attendance')
    document.title = 'Attendance | Skultem'
})

onUnmounted(() => {
    useAttendanceStore().cleanUp()
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT]
})
</script>
