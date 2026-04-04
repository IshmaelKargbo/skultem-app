<script lang="ts" setup>
const { student, term } = defineProps<{
    student: Student | undefined,
    term: Term | undefined
}>()

const widgetStore = useWidgetStore()
const { loading } = storeToRefs(widgetStore)

const report = reactive<{
    present: number
    late: number
    absent: number
    excused: number
}>({
    absent: 0,
    excused: 0,
    late: 0,
    present: 0
})

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
                    name: "Absent",
                    aggregation: "percentage",
                    field: "state",
                    tags: { field: "state", value: "Absent" }
                },
                {
                    name: "Excused",
                    aggregation: "percentage",
                    field: "state",
                    tags: { field: "state", value: "Excused" }
                },
                {
                    name: "Late",
                    aggregation: "percentage",
                    field: "state",
                    tags: { field: "state", value: "Late" }
                }
            ],
            chartType: "stat"
        }, 1, 10),
    ])

    const datasets = count?.data.datasets || []

    const present = datasets.find((e: any) => e.label === 'Present')
    const late = datasets.find((e: any) => e.label === 'Late')
    const absent = datasets.find((e: any) => e.label === 'Absent')
    const excused = datasets.find((e: any) => e.label === 'Excused')

    report.present = present?.data?.[0] ?? 0
    report.late = late?.data?.[0] ?? 0
    report.absent = absent?.data?.[0] ?? 0
    report.excused = excused?.data?.[0] ?? 0
}

watch(() => [term, student], () => fetchRecord(), { immediate: true })
</script>
<template>
    <UCard>
        <template #header>
            <div class="flex justify-between items-center">
                <p class="text-mute">Monthly Breakdown</p>
            </div>
        </template>
        <div>
            <div class="space-y-2 mb-4">
                <div class="flex justify-between font-semibold">
                    <p>Present Days</p>
                    <p>{{ report.present }}%</p>
                </div>
                <div>
                    <UProgress :loading="loading" color="neutral" size="md" :max="100" v-model="report.present" />
                </div>
            </div>
            <div class="space-y-2 mb-4">
                <div class="flex justify-between font-semibold">
                    <p>Absent Days</p>
                    <p>{{ report.absent }}%</p>
                </div>

                <div>
                    <UProgress :loading="loading" color="neutral" size="md" :max="100" v-model="report.absent" />
                </div>
            </div>
            <div class="space-y-2 mb-4">
                <div class="flex justify-between font-semibold">
                    <p>Late Days</p>
                    <p>{{ report.late }}%</p>
                </div>

                <div>
                    <UProgress :loading="loading" color="neutral" size="md" :max="100" v-model="report.late" />
                </div>
            </div>
            <div class="space-y-2 mb-4">
                <div class="flex justify-between font-semibold">
                    <p>Excused Days</p>
                    <p>{{ report.excused }}%</p>
                </div>
                <div>
                    <UProgress :loading="loading" color="neutral" size="md" :max="100" v-model="report.excused" />
                </div>
            </div>
        </div>
    </UCard>
</template>
