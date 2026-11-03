<template>
    <div v-if="record" class="cursor-pointer border-l-2 transition-colors hover:border-primary/40"
        :class="[borderClass(record.status), selected?.id === record.id ? 'ring-2 ring-primary/40' : '']">
        <div class="flex items-start gap-3 p-3">
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="min-w-0 truncate font-semibold text-highlighted">{{ record.subject }}</h3>
                    <span v-if="record.clazz"
                        class="inline-flex shrink-0 items-center gap-1 rounded-md bg-elevated px-2 py-0.5 text-xs font-medium text-highlighted ring-1 ring-default">
                        <UIcon name="i-lucide-school" class="size-3.5 text-muted" />{{ record.clazz }}
                    </span>
                    <UBadge size="sm" variant="subtle" :color="statusColor(record.status)"
                        :label="statusLabel(record.status)" class="shrink-0" />
                    <!-- Who it's waiting on - the school decides (class master, admin or exam officer). -->
                    <UBadge v-if="record.status === 'Pending Review' && waitingOn" size="sm" variant="outline"
                        color="neutral" :icon="waitingOn.icon" :label="waitingOn.label" class="shrink-0" />
                </div>

                <p class="mt-0.5 truncate text-xs text-muted">
                    <span class="font-medium text-primary">{{ record.assessment }}</span> &middot; {{ record.term }}
                    <template v-if="record.teacher"> &middot; {{ record.teacher }}</template>
                </p>

                <div class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs-base text-muted">
                    <span>{{ record.studentCount }} students</span>
                    <span class="font-medium text-success">
                        Avg {{ record.avergeScore }}
                    </span>

                    <span>{{ record.passPercentage }}% pass</span>
                </div>

                <GradeDistributionBar class="mt-2.5" :height="1" :show-label="false" :average="record.avgPercentage"
                    :pass="record.passPercentage" :fail="record.failPercentage" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
type ApprovalRequestStatus = 'Pending Review' | 'Approved' | 'Returned'

const { record } = defineProps<{
    record: AssessmentApprovalRequest | null
    selected?: AssessmentApprovalRequest | null
}>()

// A class master's own subject goes to an admin even where class masters approve.
const waitingOn = computed(() => {
    if (!record?.approver) return null
    if (record.approver === 'CLASS_MASTER' && record.requiresAdminReview) {
        return { label: 'With an admin (class master\'s own subject)', icon: GRADE_APPROVER_ICON.ADMIN }
    }
    return { label: `With the ${GRADE_APPROVER_LABEL[record.approver].toLowerCase()}`, icon: GRADE_APPROVER_ICON[record.approver] }
})

function statusLabel(status: ApprovalRequestStatus) {
    if (status === "Pending Review") return "Pending Approval"
    return status
}

function statusColor(status: ApprovalRequestStatus) {
    if (status === "Approved") return "success"
    if (status === "Returned") return "error"
    return "warning"
}

function borderClass(status: ApprovalRequestStatus) {
    if (status === "Approved") return "border-l-success"
    if (status === "Returned") return "border-l-error"
    return "border-l-primary"
}
</script>
