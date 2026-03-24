<script lang="ts" setup>
const { student, term } = defineProps<{
    student: Student | undefined,
    term: Term | undefined
}>()

const widgetStore = useWidgetStore()
const { loading } = storeToRefs(widgetStore)

const report = ref<{
    rate: string
    present: string
    late: string
    absent: string
    excused: string
}>()

async function fetchRecord() {
    if (!term || !student) return

    const [count] = await Promise.all([
        widgetStore.runAnalytic({
            entity: "attendances",
            title: "Attendance Rate",
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: student?.id,
                    operator: 'EQUALS',
                    type: 'select'
                },
                {
                    field: 'date',
                    value: term?.startDate || '',
                    valueTo: term?.endDate,
                    operator: "BETWEEN",
                    type: "date"
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
                    name: "Present Count",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Present" }
                },
                {
                    name: "Absent",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Absent" }
                },
                {
                    name: "Excused",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Excused" }
                },
                {
                    name: "Late",
                    aggregation: "percentage",
                    field: "state",
                    tags: { field: "state", value: "Late" }
                },
                {
                    name: "Late Count",
                    aggregation: "count",
                    field: "state",
                    tags: { field: "state", value: "Late" }
                }
            ],
            chartType: "stat"
        }, 1, 10),
    ])

    const datasets = count.datasets || []

    const present = datasets.find((e: any) => e.label === 'Present Count')
    const presentRate = datasets.find((e: any) => e.label === 'Present')
    const late = datasets.find((e: any) => e.label === 'Late Count')
    const lateRate = datasets.find((e: any) => e.label === 'Late')
    const absent = datasets.find((e: any) => e.label === 'Absent')
    const excused = datasets.find((e: any) => e.label === 'Excused')

    const rateValue = (presentRate?.data?.[0] ?? 0) + (lateRate?.data?.[0] ?? 0)

    report.value = {
        present: String(present?.data?.[0] ?? 0),
        late: String(late?.data?.[0] ?? 0),
        absent: String(absent?.data?.[0] ?? 0),
        excused: String(excused?.data?.[0] ?? 0),
        rate: `${Math.round(rateValue)}%`
    }
}

watch(() => [term, student], () => fetchRecord(), { immediate: true })
</script>
<template>
    <div class="grid gap-3 grid-cols-5">
        <Metric :record="{
            label: 'Attendance Rate',
            icon: ATTENDANCE_ICON,
            value: report?.rate,
            isReady: !loading,
            color: 'success',
            subtle: 'This term'
        }" />
        <Metric :record="{
            label: 'Days Present',
            icon: ATTENDANCE_PRESENT_ICON,
            value: report?.present,
            isReady: !loading,
            color: 'info',
            subtle: 'This term'
        }" />
        <Metric :record="{
            label: 'Days Absent',
            icon: ATTENDANCE_ABSENT_ICON,
            value: report?.absent,
            isReady: !loading,
            color: 'error',
            subtle: 'This term'
        }" />
        <Metric :record="{
            label: 'Times Late',
            icon: ATTENDANCE_LATE_ICON,
            value: report?.late,
            isReady: !loading,
            color: 'warning',
            subtle: 'This term'
        }" />
        <Metric :record="{
            label: 'Times Excuse',
            icon: ATTENDANCE_EXCUSED_ICON,
            value: report?.excused,
            isReady: !loading,
            color: 'primary',
            subtle: 'This term'
        }" />
    </div>
</template>
