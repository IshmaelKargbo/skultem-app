<template>
    <div class="space-y-4 px-4 md:px-6">

        <div v-if="loading" class="space-y-4">
            <USkeleton class="h-24 w-full rounded-xl" />
            <USkeleton class="h-64 w-full rounded-xl" />
        </div>

        <template v-else-if="leave">
            <Heading title="Leave Details" subtitle="Review this leave request." />

            <!-- Status banner - the page's primary message + the actions that resolve it -->
            <div class="flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
                :class="bannerStyle">
                <div class="flex items-center gap-4">
                    <div class="grid size-11 shrink-0 place-items-center rounded-full" :class="bannerIconWrap">
                        <UIcon :name="statusIcon" class="size-6" :class="bannerIconColor" />
                    </div>

                    <div>
                        <p class="font-semibold leading-tight">
                            {{ statusHeadline }}
                        </p>
                        <p class="text-sm text-muted">
                            {{ leaveTypeLabel }} · {{ leave.durationDays }} day{{ leave.durationDays === 1 ? '' : 's' }} · submitted {{ formatDate(leave.createdAt) }}
                        </p>
                    </div>
                </div>

                <div v-if="isAdmin && leave.status === 'PENDING'" class="flex gap-2">
                    <UButton color="error" variant="soft" icon="i-lucide-x" :loading="rejecting" @click="reject">
                        Reject
                    </UButton>

                    <UButton color="success" icon="i-lucide-check" :loading="approving" @click="approve">
                        Approve
                    </UButton>
                </div>

                <UBadge v-else :color="leaveStatusColor(leave.status)" variant="soft" size="lg" class="self-start sm:self-center">
                    {{ clean(leave.status) }}
                </UBadge>
            </div>

            <div class="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div class="sticky top-6 space-y-4">

                    <!-- Employee Card -->
                    <UCard>
                        <div class="flex items-start gap-4">
                            <UAvatar size="2xl" :src="leave.teacher?.user?.photo || undefined" :alt="teacherName" />

                            <div class="min-w-0 flex-1">
                                <h2 class="truncate text-lg font-semibold">
                                    {{ teacherName }}
                                </h2>

                                <p class="text-sm text-muted">
                                    {{ leave.teacher?.staffId }}
                                </p>
                            </div>
                        </div>

                        <div class="mt-6 grid grid-cols-2 gap-3">
                            <div class="rounded-xl bg-muted/40 p-4 text-center">
                                <p class="text-xs text-muted">Leave Type</p>
                                <p class="mt-1 font-semibold">{{ leaveTypeLabel }}</p>
                            </div>

                            <div class="rounded-xl bg-muted/40 p-4 text-center">
                                <p class="text-xs text-muted">Status</p>
                                <UBadge :color="leaveStatusColor(leave.status)" variant="soft" class="mt-1">
                                    {{ clean(leave.status) }}
                                </UBadge>
                            </div>
                        </div>
                    </UCard>

                    <!-- Timeline -->
                    <UCard>
                        <template #header>
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-history" class="text-primary" />
                                <span class="font-semibold">Approval Timeline</span>
                            </div>
                        </template>

                        <div class="relative">
                            <div class="absolute bottom-0 left-3 top-0 w-px bg-default" />

                            <div v-for="step in timeline" :key="step.title" class="relative mb-6 flex gap-4 last:mb-0">
                                <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full" :class="timelineDotStyle(step.color)">
                                    <UIcon :name="step.icon" class="size-3.5 text-inverted" />
                                </div>

                                <div class="flex-1 rounded-xl bg-muted/30 p-4">
                                    <p class="font-medium">{{ step.title }}</p>
                                    <p class="mt-1 text-xs text-muted">{{ step.date }}</p>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>

                <div class="space-y-4">

                    <!-- Leave Information -->
                    <UCard>
                        <template #header>
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-calendar-days" class="size-4 text-muted" />
                                <span class="font-semibold">Leave Information</span>
                            </div>
                        </template>

                        <div class="rounded-xl border border-default bg-elevated/40 p-5">
                            <div class="flex items-center justify-between gap-4">
                                <div class="flex flex-col items-center text-center">
                                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <UIcon name="i-lucide-calendar-days" class="text-lg" />
                                    </div>
                                    <p class="mt-3 text-xs uppercase tracking-wider text-muted">Start Date</p>
                                    <p class="font-semibold">{{ formatDate(leave.startDate) }}</p>
                                </div>

                                <div class="flex flex-1 items-center gap-3">
                                    <span class="h-px flex-1 bg-default" />
                                    <UBadge size="lg" variant="soft" color="primary" class="rounded-full px-4">
                                        {{ leave.durationDays }} day{{ leave.durationDays === 1 ? '' : 's' }}
                                    </UBadge>
                                    <span class="h-px flex-1 bg-default" />
                                </div>

                                <div class="flex flex-col items-center text-center">
                                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-error/10 text-error">
                                        <UIcon name="i-lucide-flag" class="text-lg" />
                                    </div>
                                    <p class="mt-3 text-xs uppercase tracking-wider text-muted">End Date</p>
                                    <p class="font-semibold">{{ formatDate(leave.endDate) }}</p>
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Reason -->
                    <UCard>
                        <template #header>
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-file-text" class="size-4 text-muted" />
                                <span class="font-semibold">Reason</span>
                            </div>
                        </template>

                        <p class="text-sm leading-relaxed">
                            {{ leave.reason }}
                        </p>
                    </UCard>

                    <!-- Review note -->
                    <UCard v-if="leave.reviewNote">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-message-square" class="size-4 text-muted" />
                                <span class="font-semibold">Review Note</span>
                            </div>
                        </template>

                        <p class="text-sm leading-relaxed">
                            {{ leave.reviewNote }}
                        </p>
                    </UCard>

                </div>
            </div>
        </template>

        <UCard v-else class="py-16">
            <div class="text-center">
                <UIcon name="i-lucide-file-x" class="mx-auto text-5xl text-muted" />
                <h3 class="mt-4 text-lg font-semibold">{{ error ? "Couldn't load this request" : 'Leave request not found' }}</h3>
                <p v-if="error" class="mt-1 text-sm text-muted">{{ error }}</p>
            </div>
        </UCard>

    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const route = useRoute()
const notify = useNotify()
const store = useLeaveStore()
const { current: leave, loadingCurrent: loading, error } = storeToRefs(store)

const approving = ref(false)
const rejecting = ref(false)

const teacherName = computed(() => {
    const t = leave.value?.teacher
    if (!t) return ''
    return `${t.user?.givenNames || ''} ${t.user?.familyName || ''}`.trim()
})

const leaveTypeLabel = computed(() => LEAVE_TYPE_OPTIONS.find(o => o.value === leave.value?.type)?.label || clean(leave.value?.type))

const statusIcon = computed(() => {
    switch (leave.value?.status) {
        case 'APPROVED': return 'i-lucide-check-circle-2'
        case 'REJECTED': return 'i-lucide-circle-x'
        default: return 'i-lucide-clock-3'
    }
})

const statusHeadline = computed(() => {
    switch (leave.value?.status) {
        case 'APPROVED': return 'This leave request has been approved'
        case 'REJECTED': return 'This leave request has been rejected'
        default: return isAdmin.value ? 'Awaiting your approval' : 'Awaiting approval'
    }
})

// Banner background/icon styling per status - soft tint, not a solid block, so it reads as
// "context" rather than a loud alert on every page load.
const bannerStyle = computed(() => {
    switch (leave.value?.status) {
        case 'APPROVED': return 'border-success/20 bg-success/5'
        case 'REJECTED': return 'border-error/20 bg-error/5'
        default: return 'border-warning/20 bg-warning/5'
    }
})

const bannerIconWrap = computed(() => {
    switch (leave.value?.status) {
        case 'APPROVED': return 'bg-success/15'
        case 'REJECTED': return 'bg-error/15'
        default: return 'bg-warning/15'
    }
})

const bannerIconColor = computed(() => {
    switch (leave.value?.status) {
        case 'APPROVED': return 'text-success'
        case 'REJECTED': return 'text-error'
        default: return 'text-warning'
    }
})

function timelineDotStyle(color: string) {
    switch (color) {
        case 'success': return 'bg-success'
        case 'error': return 'bg-error'
        default: return 'bg-warning'
    }
}

const timeline = computed(() => {
    if (!leave.value) return []

    const steps = [
        { title: 'Request Submitted', date: formatDateTime(leave.value.createdAt), icon: 'i-lucide-circle-check-big', color: 'success' }
    ]

    if (leave.value.status === 'PENDING') {
        steps.push({ title: 'Awaiting Approval', date: 'Current stage', icon: 'i-lucide-clock-3', color: 'warning' })
    } else if (leave.value.status === 'APPROVED') {
        steps.push({ title: 'Approved', date: leave.value.reviewedAt ? formatDateTime(leave.value.reviewedAt) : '', icon: 'i-lucide-check', color: 'success' })
    } else if (leave.value.status === 'REJECTED') {
        steps.push({ title: 'Rejected', date: leave.value.reviewedAt ? formatDateTime(leave.value.reviewedAt) : '', icon: 'i-lucide-x', color: 'error' })
    }

    return steps
})

async function approve() {
    if (!leave.value) return
    approving.value = true
    try {
        await store.review(leave.value.id, true)
        notify.success('Leave request approved.')
    } catch (err: any) {
        notify.error(err?.message || 'Unable to approve leave request.')
    } finally {
        approving.value = false
    }
}

async function reject() {
    if (!leave.value) return
    rejecting.value = true
    try {
        await store.review(leave.value.id, false)
        notify.success('Leave request rejected.')
    } catch (err: any) {
        notify.error(err?.message || 'Unable to reject leave request.')
    } finally {
        rejecting.value = false
    }
}

watch(
    () => route.params.id,
    async (id) => {
        if (!id) return
        await store.fetchById(id as string)

        useAppStore().setTitle('Leave Details')
        useAppStore().setBack('/hr/leave')
        document.title = 'Leave Details | Skultem'
    },
    { immediate: true }
)

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
