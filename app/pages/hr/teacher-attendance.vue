<template>
      <div id="attendance-scroll" class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Teachers Attendance" subtitle="Track teacher attendance and export reports" />
        <AttendanceReport />
        <AttendanceAdminMark />
        <AttendanceHistory />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const route = useRoute()
const router = useRouter()
const state = reactive({
    term: 'current-week'
})

const loading = ref(false)
const meta = reactive({
    size: 7,
    total: 7,
    page: 1,
    showingFrom: 1,
    showingTo: 7,
    totalPages: 1
})

const terms = [
    { label: 'Current Week', value: 'current-week' },
    { label: 'Last Week', value: 'last-week' },
    { label: 'This Month', value: 'this-month' },
]

const summary = {
    present: 38,
    late: 4,
    absent: 3,
    rate: '88.4%'
}

const attendances = ref([
    { date: 'Monday, 17 Jun 2026', reason: 'On time for morning briefing', state: 'Present' },
    { date: 'Tuesday, 18 Jun 2026', reason: 'Checked in after class setup', state: 'Late' },
    { date: 'Wednesday, 19 Jun 2026', reason: 'Sick leave approved by admin', state: 'Absent' },
    { date: 'Thursday, 20 Jun 2026', reason: 'On-site before 7:30 AM', state: 'Present' },
    { date: 'Friday, 21 Jun 2026', reason: 'No remarks', state: 'Present' },
    { date: 'Saturday, 22 Jun 2026', reason: 'Department meeting attendance', state: 'Present' },
    { date: 'Sunday, 23 Jun 2026', reason: 'No records', state: 'Absent' },
])

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

function updateQuery(newQuery: Record<string, any>) {
    const merged = { ...route.query, ...newQuery }

    if (merged.page === route.query.page && merged.size === route.query.size) {
        return
    }

    router.replace({ query: merged })
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

watch(
    () => page.value,
    () => {
        router.replace({
            query: {
                page: page.value
            }
        })
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('HR')
    useAppStore().setBack(true)
    document.title = 'Teacher Attendance | HR | Skultem'
})
</script>
