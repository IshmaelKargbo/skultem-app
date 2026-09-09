<template>
    <Metric :record="{
        label: 'Attendance Rate',
        color: 'info',
        value: `${attendanceRate}%`,
        isReady: isReady,
        icon: ATTENDANCE_ICON,
        subtle: 'Based on all attendance records'
    }" />
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { id } = defineProps<{
    id: string
}>()

const emit = defineEmits<{ ready: [value: number] }>()

const isReady = ref(false)
const attendanceRate = ref("0.0")

async function fetchRecord() {
    const res = await store.runAnalytic({
        entity: "attendances",
        title: "Attendance Rate",
        filters: [
            {
                field: 'enrollment.student.id',
                value: id,
                operator: 'EQUALS',
                type: 'select'
            },
            {
                field: 'enrollment.student.id',
                value: id,
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

    const rate = Math.min(present + late, 100)
    attendanceRate.value = rate.toFixed(1)

    isReady.value = true
    emit('ready', rate)
}

watch(() => id, async () => {
    await fetchRecord()
}, { immediate: true })
</script>