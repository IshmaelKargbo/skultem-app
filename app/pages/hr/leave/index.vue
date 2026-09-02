<template>
    <div class="space-y-4 px-4 md:px-6">
        <Heading :title="isAdmin ? 'Leave Management' : 'My Leave Requests'"
            :subtitle="isAdmin ? 'Track and manage employee leave requests.' : 'Submit and track your own leave requests.'">
            <UButton icon="i-lucide-plus" to="/hr/leave/add" label="New Request" />
        </Heading>

        <!-- Summary Cards - admin only -->
        <div v-if="isAdmin" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric :record="{ icon: 'i-lucide-file-text', label: 'Total Requests', value: summary?.total ?? 0, isReady: !!summary, color: 'primary' }" />
            <Metric :record="{ icon: 'i-lucide-clock-3', label: 'Pending', value: summary?.pending ?? 0, isReady: !!summary, color: 'warning' }" />
            <Metric :record="{ icon: 'i-lucide-check-circle', label: 'Approved', value: summary?.approved ?? 0, isReady: !!summary, color: 'success' }" />
            <Metric :record="{ icon: 'i-lucide-x-circle', label: 'Rejected', value: summary?.rejected ?? 0, isReady: !!summary, color: 'error' }" />
        </div>

        <UAlert v-if="error" color="error" variant="soft" icon="i-lucide-alert-circle"
            title="Couldn't load leave requests" :description="error" />

        <!-- Filters - admin only -->
        <UCard v-if="isAdmin">
            <div class="grid gap-3 md:grid-cols-4">
                <UInput v-model="search" icon="i-lucide-search" placeholder="Search employee..." class="md:col-span-2" />
                <USelect v-model="status" :items="statusOptions" value-key="value" placeholder="Status" />
                <USelect v-model="type" :items="typeOptions" value-key="value" placeholder="Leave Type" />
            </div>
        </UCard>

        <!-- Loading -->
        <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <USkeleton v-for="i in 6" :key="i" class="h-56 w-full rounded-xl" />
        </div>

        <!-- Requests -->
        <div v-else-if="records.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <UCard v-for="request in records" :key="request.id"
                class="transition-colors hover:border-primary/40">
                <div class="space-y-4">

                    <div class="flex flex-col items-center justify-center gap-3">
                        <UAvatar size="xl" :src="request.teacher?.user?.photo || undefined" :alt="teacherName(request.teacher)" />
                        <div>
                            <h3 class="text-center font-semibold">{{ teacherName(request.teacher) }}</h3>
                            <p class="text-center text-xs text-muted">{{ request.teacher?.staffId }}</p>
                        </div>
                    </div>

                    <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-muted">Leave Type</span>
                            <span class="font-medium">{{ leaveTypeLabel(request.type) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-muted">Duration</span>
                            <span class="font-medium">{{ request.durationDays }} Day{{ request.durationDays === 1 ? '' : 's' }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-muted">Dates</span>
                            <span class="font-medium">{{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <UBadge :color="leaveStatusColor(request.status)" size="lg" variant="soft" class="w-full items-center justify-center">
                            {{ clean(request.status) }}
                        </UBadge>

                        <UButton size="sm" class="w-full items-center justify-center" icon="i-lucide-eye"
                            :to="`/hr/leave/${request.id}`">
                            View
                        </UButton>
                    </div>

                </div>
            </UCard>
        </div>

        <!-- Empty -->
        <UCard v-else class="py-16">
            <div class="flex flex-col items-center gap-3 text-center">
                <UIcon name="i-lucide-calendar-x" class="text-4xl text-muted" />
                <h3 class="font-semibold">No leave requests yet</h3>
                <p class="text-sm text-muted">{{ isAdmin ? 'No requests match your filters.' : 'You have not submitted any leave requests.' }}</p>
                <UButton size="sm" icon="i-lucide-plus" to="/hr/leave/add">New Request</UButton>
            </div>
        </UCard>

        <div v-if="!loading && records.length" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Showing :meta="meta" />
            <UPagination v-if="meta.total > meta.size" v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>

    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const store = useLeaveStore()
const { records, meta, loading, summary, error } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
]

// LEAVE_TYPE_OPTIONS (from utils/leave.ts) has no "clear filter" entry - it's also used for the
// add-request form, where every option should be a real type. Add one just for this filter.
const typeOptions = [{ label: 'All Types', value: '' }, ...LEAVE_TYPE_OPTIONS]

const search = ref(String(route.query.search ?? ''))
const status = ref(String(route.query.status ?? ''))
const type = ref(String(route.query.type ?? ''))

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => router.replace({ query: { ...route.query, page: val } })
})

function teacherName(teacher?: Teacher) {
    if (!teacher) return ''
    return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function leaveTypeLabel(value: LeaveType) {
    return LEAVE_TYPE_OPTIONS.find(o => o.value === value)?.label || clean(value)
}

function load() {
    if (isAdmin.value) {
        store.fetchAll(page.value, 9, { search: search.value, status: status.value, type: type.value })
    } else {
        store.fetchMine(page.value, 9)
    }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch([search, status, type], () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        router.replace({ query: { ...route.query, search: search.value || undefined, status: status.value || undefined, type: type.value || undefined, page: 1 } })
    }, 300)
})

watch(() => [route.query.page, route.query.search, route.query.status, route.query.type], load)

onMounted(() => {
    useAppStore().setTitle(isAdmin.value ? 'Leave Management' : 'My Leave Requests')
    useAppStore().setBack('/payroll')
    document.title = 'Leave Management | Skultem'

    load()
    if (isAdmin.value) store.fetchSummary()
})

onBeforeUnmount(() => clearTimeout(searchTimeout))

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
