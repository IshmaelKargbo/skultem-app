<template>
    <Metric :record="{
        label: 'Attendance Rate',
        color: 'info',
        value: summary?.percentage != null ? `${summary.percentage}%` : '-',
        isReady: isReady,
        icon: ATTENDANCE_ICON,
        subtle: summary
            ? `${summary.termName} · ${summary.present + summary.late} of ${summary.schoolDays} school days`
            : 'No term in progress'
    }" />
</template>

<script setup lang="ts">
// Term so far over every school day (see GetStudentTermAttendanceUseCase) - the same figure as the
// student's attendance page, so unmarked days count against it rather than dropping out.
// term: the selected term (parent dashboard's picker); omitted = the active term.
const { id, term } = defineProps<{
    id: string
    term?: string
}>()

const emit = defineEmits<{ ready: [value: number] }>()

const isReady = ref(false)
const summary = ref<StudentTermAttendanceDetail | null>(null)

async function fetchRecord() {
    if (!id) return
    isReady.value = false
    try {
        summary.value = await AttendanceApi().getStudentTermAttendanceDetail(id, { termId: term || undefined }) ?? null
    } catch {
        summary.value = null // e.g. between terms
    } finally {
        isReady.value = true
    }
    emit('ready', summary.value?.percentage ?? 0)
}

watch(() => [id, term], fetchRecord, { immediate: true })
</script>
