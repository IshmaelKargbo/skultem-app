<script setup lang="ts">
const store = useReportStore()
const assessmentStore = useAssessmentStore()
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UTable = resolveComponent('UTable')
const UCard = resolveComponent('UCard')
const UIcon = resolveComponent('UIcon')

const rows = ref<StudentAssessment[]>([])
const { assessments, gradingScale } = storeToRefs(assessmentStore)
const gradingBands = computed(() => gradingScale.value?.bands || [])
const { student, term, clazz } = defineProps<{
    term: string
    student: string
    clazz: string
}>()
const { grades: records, loading } = storeToRefs(store)
const columns = ref<any[]>([])

const parseStatusColor: Record<string, string> = {
    "DRAFT": "info",
    "SUBMITED": "info",
    "APPROVED": "success",
    "RETURNED": "warning",
    "COMPLETED": "success",
    "LOCKED": "neutral"
}

const parseStatus: Record<string, string> = {
    "DRAFT": "Draft",
    "SUBMITED": "Submited",
    "APPROVED": "Approved",
    "RETURNED": "Returned",
    "COMPLETED": "Completed",
    "LOCKED": "Locked"
}

// Build table columns dynamically
function buildColumns() {
    const baseColumn = [
        { accessorKey: "subject", header: "Subject" },
        { accessorKey: "teacher", header: "Teacher" }
    ]

    const assessmentColumns = assessments.value.map(a => ({
        id: a.id,
        header: `${a.name} (${a.weight})`,
        accessorKey: a.id,
        cell: ({ row }: any) => {
            const scoreObj = row.original.scores.find((s: any) => s.assessment === a.id)
            if (!scoreObj || scoreObj.weightScore === undefined || (scoreObj.status != "APPROVED" && scoreObj.status != "COMPLETED"))
                return h("div", { class: "text-gray-400" }, "-")


            const scoreTxt = `${scoreObj.score} (${scoreObj.weightScore})`

            return h("div", { class: "font-medium text-gray-800" }, scoreTxt)
        }
    }))

    const summaryColumns = [
        {
            id: "total",
            header: "Final (100)",
            cell: ({ row }: any) => {
                const total = calculateWeightedTotal(row.original)
                const totalTxt = `${total[0]} (${total[1]})`
                return h("div", { class: "font-semibold" }, totalTxt)
            }
        }
    ]

    columns.value = [...baseColumn, ...assessmentColumns, ...summaryColumns]
}

function calculateWeightedTotal(row: any) {
    const scores = row.scores as Array<{ score?: number; weightScore?: number; status: string }>
    if (!scores || scores.length === 0) return 0

    const totalScore = scores.reduce((sum, s) => {
        const value = (s.status === "APPROVED" || s.status === "COMPLETED") ? s.score || 0 : 0
        return sum + value
    }, 0)

    const totalWeight = scores.reduce((sum, s) => {
        const value = (s.status === "APPROVED" || s.status === "COMPLETED") ? s.weightScore || 0 : 0
        return sum + value
    }, 0)
    return [totalScore, totalWeight]
}

function calculateGrade(row: any) {
    const scores = row.scores as Array<{ score?: number; status?: string; weightScore?: number }>
    const allCompleted = scores.every(s => s.status === 'COMPLETED')
    if (!allCompleted) return '-'

    const total = calculateWeightedTotal(row)

    const band = gradingBands.value.find(item => total[1] >= item.minScore && total[1] <= item.maxScore)
    return band?.grade || '-'
}

function prepareRecord() {
    const map = new Map<string, any>()

    records.value.forEach(r => {
        if (!map.has(r.subject)) {
            map.set(r.subject, {
                subject: r.subject,
                teacher: r.teacher,
                scores: [] as Array<{ assessment: string; score?: number; weightScore?: number; status?: string }>
            })
        }
        const subject = map.get(r.subject)
        subject.scores.push({
            assessment: r.assessment,
            score: r.score,
            weightScore: r.weightScore,
            status: r.status
        })
    })

    rows.value = Array.from(map.values())

    rows.value.forEach(row => {
        const allCompleted = row.scores.every((s: any) => s.status === 'COMPLETED')
        row.total = allCompleted ? calculateWeightedTotal(row) : 0
        row.allCompleted = allCompleted
    })

    rows.value.sort((a, b) => (b.total || 0) - (a.total || 0))

    buildColumns()
}

async function fetchAssessment() {
    if (!clazz) return
    await assessmentStore.fetchClassAssessments(clazz)
}

async function runReport() {
    if (!term) return
    await store.runReport({
        entity: "grades",
        filters: [
            {
                field: "studentAssessment.enrollment.student.id",
                value: student,
                operator: "EQUALS",
                type: "select"
            },
            {
                field: 'cycle.term.id',
                value: term,
                operator: "EQUALS",
                type: "select"
            }
        ]
    })

    prepareRecord()
}

watch(() => term, async () => {
    await fetchAssessment()
    await runReport()
}, { immediate: true })

onMounted(async () => {
    await assessmentStore.fetchGradingScale().catch(() => null)
})
</script>

<template>
    <UCard>
        <div>
            <div class="flex items-center justify-between">
                <p class="text-muted">Subject Grades</p>
                <UButton label="Download" :icon="DOWNLOAD_ICON" variant="outline" color="neutral" />
            </div>
            <div class="border-t border-gray-200 mt-3">
                <UTable :columns="columns" :data="rows" :loading="loading">
                    <template #empty-state>
                        <div class="flex flex-col items-center gap-2 py-10">
                            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                            <p class="text-gray-500">No Attendance found.</p>
                        </div>
                    </template>
                    <template #status-cell="{ row }">
                        <UBadge :label="parseStatus[row.original.status]" variant="outline"
                            :color="parseStatusColor[row.original.status]" />
                    </template>
                </UTable>
            </div>
        </div>
    </UCard>
</template>
