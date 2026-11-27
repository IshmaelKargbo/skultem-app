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

// value: the term's attendance %, or null when there's nothing to judge yet (no term, or no school days so
// far); threshold: the student's minimum attendance %.
const emit = defineEmits<{ ready: [value: number | null, threshold: number | null] }>()

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
    // Most school days still unmarked: the rate says more about the register than the child, so it's not
    // something to warn a parent about (the same rule as the mobile app).
    const s = summary.value
    const mostlyUnmarked = !!s && s.notMarked > s.schoolDays - s.notMarked
    emit('ready', mostlyUnmarked ? null : s?.percentage ?? null, s?.threshold ?? null)
}

watch(() => [id, term], fetchRecord, { immediate: true })
</script>
