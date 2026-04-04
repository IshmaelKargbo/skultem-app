<script setup lang="ts">
const store = useReportStore()
const assessmentStore = useAssessmentStore()

const rows = ref<any[]>([])
const expanded = ref<Record<string, boolean>>({})

const { student, term, clazz } = defineProps<{
    term: string
    student: string
    clazz: string
}>()

const { grades: records } = storeToRefs(store)

type Score = {
    assessment: string
    name: string
    score?: number
    weightScore?: number
    status?: string
}

function toggleScores(subject: string) {
    expanded.value[subject] = !expanded.value[subject]
}

function calculateWeightedTotal(row: any) {
    const scores: Score[] = row.scores || []

    let totalScore = 0
    let totalWeight = 0

    scores.forEach(s => {
        if (s.status === "APPROVED" || s.status === "COMPLETED") {
            totalScore += s.score || 0
            totalWeight += s.weightScore || 0
        }
    })

    return [totalScore, totalWeight]
}

function prepareRecord() {
    const map = new Map()

    records.value.forEach(r => {
        if (!map.has(r.subject)) {
            map.set(r.subject, {
                subject: r.subject,
                teacher: r.teacher,
                scores: [] as Score[]
            })
        }

        const subject = map.get(r.subject)

        subject.scores.push({
            assessment: r.assessment,
            name: r.name,
            score: r.score,
            weightScore: r.weightScore,
            status: r.status
        })
    })

    rows.value = Array.from(map.values())

    rows.value.forEach(row => {
        const allCompleted = row.scores.every((s: Score) => s.status === "COMPLETED")

        row.total = allCompleted ? calculateWeightedTotal(row) : [0, 0]
        row.allCompleted = allCompleted

        if (expanded.value[row.subject] === undefined) {
            expanded.value[row.subject] = false
        }
    })

    rows.value.sort((a, b) => b.total[0] - a.total[0])
}

async function fetchAssessment() {
    if (!clazz) return
    await assessmentStore.fetchClassAssessments(clazz)
}

async function runReport() {
    if (!term) return

    await store.runReport(
        {
            entity: "grades",
            filters: [
                {
                    field: "studentAssessment.enrollment.student.id",
                    value: student,
                    operator: "EQUALS",
                    type: "select"
                },
                {
                    field: "cycle.term.id",
                    value: term,
                    operator: "EQUALS",
                    type: "select"
                }
            ]
        },
        1,
        200
    )

    prepareRecord()
}

function checkFinal(row: any) {
    const [score, weight] = calculateWeightedTotal(row)
    return `${score} (${weight})`
}

watch(
    () => term,
    async () => {
        await fetchAssessment()
        await runReport()
    },
    { immediate: true }
)

onMounted(async () => {
    await assessmentStore.fetchGradingScale().catch(() => null)
})
</script>

<template>
    <div class="md:hidden block space-y-2">
        <UCard v-for="row in rows" :key="row.subject">
            <template #header>
                <div class="flex justify-between cursor-pointer" @click="toggleScores(row.subject)">
                    <div class="flex space-x-3 items-center">
                        <UAvatar size="lg" :alt="row.subject" />

                        <div>
                            <p class="text-sm font-medium">{{ row.subject }}</p>
                            <p class="text-[11px] text-muted">{{ row.teacher }}</p>
                        </div>
                    </div>
                    <div class="flex space-x-3 items-center">
                        <div class="flex flex-col items-end">
                            <p class="text-muted text-[11px]">Final Grade</p>
                            <p class="font-semibold">{{ checkFinal(row) }}</p>
                        </div>

                        <UIcon :name="expanded[row.subject] ? 'iconoir:nav-arrow-down' : 'weui:arrow-outlined'"
                            class="text-lg text-mute" variant="link" />
                    </div>
                </div>
            </template>

            <template v-if="expanded[row.subject]" #default>
                <div class="space-y-1.5">
                    <div v-for="(score, i) in row.scores" :key="i" class="flex justify-between pb-1.5" :class="{
                        'border-b border-gray-100':
                            Number.parseInt(i) + 1 < row.scores.length
                    }">
                        <p class="text-sm">{{ score.name }}</p>

                        <p class="text-sm">
                            <span>{{ score.score ?? '-' }}</span>
                            <span class="text-muted"> ({{ score.weightScore ?? '-' }}) </span>
                        </p>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>