<template>
    <Metric :record="{
        label: 'Attendance Rate',
        color: 'success',
        value: `${attendanceRate}%`,
        isReady: isReady,
        icon: ATTENDANCE_ICON,
        subtle: 'Based on all attendance records'
    }" />
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { classId } = defineProps<{
    classId: string | undefined
}>()

const isReady = ref(false)
const attendanceRate = ref("0.0")

async function fetchRecord() {
    if (classId == null) return
    const res = await store.runAnalytic({
        entity: "attendances",
        title: "Attendance Rate",
        filters: [
            {
                field: 'enrollment.clazz.id',
                value: classId,
                operator: 'EQUALS',
                type: 'select'
            }
        ],
        metrics: [
            {
                name: "Present",
                aggregation: "percentage",
                field: "state",
                tags: { field: "state", value: "Present" }
            },
            {
                name: "Late",
                aggregation: "percentage",
                field: "state",
                tags: { field: "state", value: "Late" }
            }
        ],
        chartType: "stat"
    })

    const widget = res?.data ?? res
    if (!widget?.datasets) return

    const present = Number(widget.datasets[0]?.data?.[0] ?? 0)
    const late = Number(widget.datasets[1]?.data?.[0] ?? 0)

    attendanceRate.value = Math.min(present + late, 100).toFixed(1)

    isReady.value = true
}

watch(() => classId, async () => {
    await fetchRecord()
}, { immediate: true })
</script>