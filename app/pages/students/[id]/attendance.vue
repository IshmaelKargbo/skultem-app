<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold">
                            Attendance
                        </h3>
                        <p class="text-sm text-muted">
                            Student attendance overview and recent records.
                        </p>
                    </div>

                    <div class="w-full md:w-1/3">
                        <USelectMenu v-model="state.term" :items="terms" value-key="value" size="lg"
                            placeholder="Select Term" />
                    </div>
                </div>
            </template>
            <StudentViewAttendanceCycle :student="student" :term="term" />
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 7" :key="i"
                    class="flex items-center justify-between rounded-xl border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-950 bg-white p-4">
                    <div class="space-y-2">
                        <USkeleton class="h-4 w-40" />
                        <USkeleton class="h-3 w-28" />
                    </div>

                    <USkeleton class="h-6 w-20 rounded-full" />
                </div>
            </div>

            <div v-else-if="attendances.length" class="space-y-3">
                <div v-for="(attendance, i) in attendances" :key="i"
                    class="flex items-center justify-between rounded-xl border-2 border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-neutral-800 p-4">
                    <div>
                        <p class="font-medium">
                            {{ formatDateString(attendance.date) }}
                        </p>

                        <p class="text-sm text-muted">
                            {{ attendance.reason || 'No remarks' }}
                        </p>
                    </div>

                    <UBadge :color="getStatusColor(attendance.state)" variant="soft">
                        {{ attendance.state }}
                    </UBadge>
                </div>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed dark:border-gray-700 border-gray-200 py-10">
                <UIcon name="i-lucide-calendar-x" class="mb-2 text-4xl text-muted" />

                <p class="font-medium">
                    No attendance records
                </p>

                <p class="text-sm text-muted">
                    Attendance records will appear here.
                </p>
            </div>
            <template #footer>
                <div class="flex items-center justify-between">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size"
                        :total="meta?.total" show-edges />
                </div>
            </template>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

const store = useStudentStore()
const reportStore = useReportStore()
const { record, activeCycle } = storeToRefs(store)
const { attendances, meta } = storeToRefs(reportStore)
const route = useRoute()
const router = useRouter()
const state = reactive({
    term: ''
})
const student = computed(() => record.value)
const terms = computed(() =>
    activeCycle.value?.terms.map(term => ({
        label: term.name,
        value: term.id
    })) || []
)
const term = computed(() => activeCycle.value?.terms.find(e => e.id == state.term))

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

function updateQuery(newQuery: Record<string, any>) {
    const merged = { ...route.query, ...newQuery }

    if (
        merged.page === route.query.page &&
        merged.size === route.query.size
    ) {
        return
    }

    router.replace({ query: merged })
}

async function fetchCycle() {
    if (!student.value?.sessionId) return

    await store.fetchActiveCycle(student.value.sessionId)

    const activeTerm = activeCycle.value?.terms.find(
        term => term.status === 'ACTIVE'
    )

    if (activeTerm && state.term == "") {
        state.term = activeTerm.id
    }
}

async function fetchAttendance() {
    if (!record.value?.id) return

    await reportStore.runReport(
        {
            entity: 'attendances',
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: record.value.id,
                    operator: 'EQUALS',
                    type: 'select'
                },
                {
                    field: 'date',
                    value: term.value?.startDate || '',
                    valueTo: term.value?.endDate,
                    operator: "BETWEEN",
                    type: "date"
                }
            ]
        },
        1,
        7
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Present':
            return 'success'

        case 'Late':
            return 'warning'

        default:
            return 'error'
    }
}

watch(() => page.value, async () => {
    router.replace({
        query: {
            page: page.value
        }
    })

    await fetchCycle()
    await fetchAttendance()
}, { immediate: true })

watch(
    () => record.value,
    async value => {
        if (!value) return

        await fetchCycle()
        await fetchAttendance()
    },
    { immediate: true }
)

watch(
    () => state.term,
    async value => {
        if (!value) return

        await fetchCycle()
        await fetchAttendance()
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack(true)

    document.title = 'Attendance | View Student | Students | Skultem'
})
</script>