<template>
    <UCard>
        <div class="space-y-2 text-center">
            <p class="text-2xl font-display font-semibold">{{ count }}</p>
            <p>{{ grade }} Grades</p>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { id, term, grade } = defineProps<{
    id: string
    term: string
    grade: string
}>()

const isReady = ref(false)
const count = ref("0")
const studentStore = useStudentStore()

const { activeCycle } = storeToRefs(studentStore)

async function fetchRecord() {
    if (activeCycle == null) return
    const res = await store.runAnalytic({
        entity: "assessments",
        title: "Grade Count",
        filters: [
            {
                field: "studentAssessment.enrollment.student.id",
                value: id,
                operator: "EQUALS",
                type: "select"
            },
            {
                field: 'cycle.term.id',
                value: term,
                operator: "EQUALS",
                type: "select"
            }
        ],
        metrics: [
            {
                name: "Average",
                aggregation: "count",
                field: "grade",
                tags: {
                    groupBy: "grade",
                    field: "grade",
                    value: grade
                }
            }
        ],
        chartType: "stat"
    })

    const widget = res?.data ?? res
    const currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
    count.value = currentAverage.toFixed(0)

    isReady.value = true
}

watch
    (
        () => term,
        async () => {
            isReady.value = false
            await fetchRecord()
        },
        { immediate: true }
    )
</script>