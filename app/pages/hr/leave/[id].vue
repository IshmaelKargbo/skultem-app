<template>
    <div class="space-y-6">

        <!-- Header -->
        <div>
            <h1 class="text-2xl font-bold">
                Leave Details
            </h1>

            <p class="text-sm text-muted">
                Review and manage employee leave requests.
            </p>
        </div>

        <!-- Status banner — the page's primary message + the actions that resolve it -->
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
                        {{ leave.type }} · {{ leave.duration }} · submitted {{ submittedRelative }}
                    </p>
                </div>
            </div>

            <div v-if="leave.status === 'Pending'" class="flex gap-2">

                <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/hr/leave">
                    Back
                </UButton>
                <UButton color="error" variant="soft" icon="i-lucide-x" @click="rejectLeave">
                    Reject
                </UButton>

                <UButton color="success" icon="i-lucide-check" @click="approveLeave">
                    Approve
                </UButton>
            </div>

            <UBadge v-else :color="statusColor" variant="soft" size="lg" class="self-start sm:self-center">
                {{ leave.status }}
            </UBadge>
        </div>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div class="sticky top-6 space-y-5">

                <!-- Employee Card -->
                <UCard class="overflow-hidden rounded-3xl">


                    <div class="flex items-start gap-4">

                        <!-- Avatar -->
                        <UAvatar size="3xl" :alt="leave.employee.name" />

                        <!-- Details -->
                        <div class="min-w-0 flex-1">


                            <div>
                                <h2 class="truncate text-lg font-semibold">
                                    {{ leave.employee.name }}
                                </h2>

                                <p class="text-sm text-muted">
                                    {{ leave.employee.position }}
                                </p>
                            </div>


                        </div>

                    </div>

                    <!-- Stats -->
                    <div class="mt-6 grid grid-cols-2 gap-3">

                        <div class="rounded-2xl bg-muted/40 p-4 text-center">
                            <p class="text-xs text-muted">
                                Leave Type
                            </p>

                            <p class="mt-1 font-semibold">
                                {{ leave.type }}
                            </p>
                        </div>

                        <div class="rounded-2xl bg-muted/40 p-4 text-center">
                            <p class="text-xs text-muted">
                                Status
                            </p>

                            <UBadge :color="statusColor" variant="soft" class="mt-1">
                                {{ leave.status }}
                            </UBadge>
                        </div>

                    </div>

                </UCard>

                <!-- Timeline -->
                <UCard class="rounded-3xl">

                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-history" class="text-primary" />

                            <span class="font-semibold">
                                Approval Timeline
                            </span>
                        </div>
                    </template>

                    <div class="relative">

                        <!-- vertical line -->
                        <div class="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />

                        <div v-for="step in leave.timeline" :key="step.title"
                            class="relative mb-6 flex gap-4 last:mb-0">

                            <!-- icon -->
                            <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full"
                                :class="timelineDotStyle(step.color)">
                                <UIcon :name="step.icon" class="size-3.5 text-white" />
                            </div>

                            <!-- content -->
                            <div class="flex-1 rounded-2xl bg-muted/30 p-4">

                                <p class="font-medium">
                                    {{ step.title }}
                                </p>

                                <p class="mt-1 text-xs text-muted">
                                    {{ step.date }}
                                </p>

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
                    <div class="space-y-6">

                        <!-- Date Timeline -->
                        <div
                            class="rounded-3xl border border-default bg-gradient-to-br from-gray-50 to-white p-5 dark:from-neutral-900 dark:to-neutral-950">

                            <div class="flex items-center justify-between gap-4">

                                <!-- Start -->
                                <div class="flex flex-col items-center text-center">
                                    <div
                                        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary dark:bg-primary-500/10">
                                        <UIcon name="i-lucide-calendar-days" class="text-lg" />
                                    </div>

                                    <p class="mt-3 text-xs uppercase tracking-wider text-muted">
                                        Start Date
                                    </p>

                                    <p class="font-semibold">
                                        {{ leave.startDate }}
                                    </p>
                                </div>

                                <!-- Middle -->
                                <div class="flex flex-1 items-center gap-3">

                                    <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />

                                    <UBadge size="lg" variant="soft" color="primary" class="rounded-full px-4">
                                        {{ leave.duration }}
                                    </UBadge>

                                    <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />

                                </div>

                                <!-- End -->
                                <div class="flex flex-col items-center text-center">
                                    <div
                                        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10">
                                        <UIcon name="i-lucide-flag" class="text-lg" />
                                    </div>

                                    <p class="mt-3 text-xs uppercase tracking-wider text-muted">
                                        End Date
                                    </p>

                                    <p class="font-semibold">
                                        {{ leave.endDate }}
                                    </p>
                                </div>

                            </div>

                        </div>

                        <!-- Details -->
                        <div class="grid gap-4 md:grid-cols-2">

                            <!-- Leave Type -->
                            <div class="rounded-2xl border border-default p-4">

                                <div class="flex items-center gap-3">

                                    <div
                                        class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10">
                                        <UIcon name="i-lucide-briefcase" />
                                    </div>

                                    <div>
                                        <p class="text-xs text-muted">
                                            Leave Type
                                        </p>

                                        <p class="font-semibold">
                                            {{ leave.type }}
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <!-- Status -->
                            <div class="rounded-2xl border border-default p-4">

                                <div class="flex items-center gap-3">

                                    <div
                                        class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10">
                                        <UIcon name="i-lucide-clock-3" />
                                    </div>

                                    <div class="flex-1">
                                        <p class="text-xs text-muted">
                                            Current Status
                                        </p>

                                        <UBadge :color="statusColor" variant="soft" size="lg" class="mt-1">
                                            {{ leave.status }}
                                        </UBadge>
                                    </div>

                                </div>

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

                <!-- Attachments -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-paperclip" class="size-4 text-muted" />
                            <span class="font-semibold">Supporting Documents</span>
                        </div>
                    </template>

                    <div
                        class="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                        <div class="flex items-center gap-3">
                            <div class="grid size-10 shrink-0 place-items-center rounded-lg bg-error/10">
                                <UIcon name="i-lucide-file-text" class="size-5 text-error" />
                            </div>

                            <div>
                                <p class="text-sm font-medium leading-tight">
                                    {{ leave.attachment.name }}
                                </p>
                                <p class="text-xs text-muted">
                                    Uploaded by employee
                                </p>
                            </div>
                        </div>

                        <UButton variant="ghost" icon="i-lucide-download" size="sm">
                            Download
                        </UButton>
                    </div>
                </UCard>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const leave = reactive({
    employee: {
        name: "Mary Kamara",
        department: "Finance Department",
        position: "Accountant"
    },

    type: "Sick Leave",
    duration: "3 Days",

    startDate: "15 June 2026",
    endDate: "17 June 2026",
    submittedAt: "12 June 2026 • 10:30 AM",

    status: "Pending",

    reason:
        "Employee requires medical treatment and has attached supporting documents from the hospital.",

    attachment: {
        name: "Medical_Report.pdf"
    },

    timeline: [
        {
            title: "Request Submitted",
            date: "12 June 2026 • 10:30 AM",
            icon: "i-lucide-circle-check-big",
            color: "success"
        },
        {
            title: "Awaiting HR Approval",
            date: "Current stage",
            icon: "i-lucide-clock-3",
            color: "warning"
        }
    ]
})

const statusColor = computed(() => {
    switch (leave.status) {
        case "Approved":
            return "success"

        case "Rejected":
            return "error"

        case "Pending":
            return "warning"

        default:
            return "neutral"
    }
})

const statusIcon = computed(() => {
    switch (leave.status) {
        case "Approved":
            return "i-lucide-check-circle-2"

        case "Rejected":
            return "i-lucide-circle-x"

        case "Pending":
            return "i-lucide-clock-3"

        default:
            return "i-lucide-circle"
    }
})

const statusHeadline = computed(() => {
    switch (leave.status) {
        case "Approved":
            return "This leave request has been approved"

        case "Rejected":
            return "This leave request has been rejected"

        case "Pending":
            return "Awaiting your approval"

        default:
            return leave.status
    }
})

// Banner background/icon styling per status — soft tint, not a solid block,
// so it reads as "context" rather than a loud alert on every page load.
const bannerStyle = computed(() => {
    switch (leave.status) {
        case "Approved":
            return "border-success/20 bg-success/5"
        case "Rejected":
            return "border-error/20 bg-error/5"
        case "Pending":
            return "border-warning/20 bg-warning/5"
        default:
            return "border-default bg-elevated/50"
    }
})

const bannerIconWrap = computed(() => {
    switch (leave.status) {
        case "Approved":
            return "bg-success/15"
        case "Rejected":
            return "bg-error/15"
        case "Pending":
            return "bg-warning/15"
        default:
            return "bg-default"
    }
})

const bannerIconColor = computed(() => {
    switch (leave.status) {
        case "Approved":
            return "text-success"
        case "Rejected":
            return "text-error"
        case "Pending":
            return "text-warning"
        default:
            return "text-muted"
    }
})

function timelineDotStyle(color: string) {
    switch (color) {
        case "success":
            return "bg-success"
        case "error":
            return "bg-error"
        case "warning":
            return "bg-warning"
        default:
            return "bg-neutral"
    }
}

// Lightweight relative-time label for the banner subtext.
const submittedRelative = computed(() => {
    return leave.submittedAt
})

function approveLeave() {
    leave.status = "Approved"

    leave.timeline.push({
        title: "Approved by HR",
        date: new Date().toLocaleString(),
        icon: "i-lucide-check",
        color: "success"
    })
}

function rejectLeave() {
    leave.status = "Rejected"

    leave.timeline.push({
        title: "Rejected by HR",
        date: new Date().toLocaleString(),
        icon: "i-lucide-x",
        color: "error"
    })
}
</script>