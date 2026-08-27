<template>
    <UCard v-if="record" :ui="{ body: 'p-4' }" class="cursor-pointer border-l-4 transition-colors hover:border-primary/40"
        :class="[borderClass(record.status), selected?.id === record.id ? 'ring-2 ring-primary/40' : '']">
        <div class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="lucide:clipboard-check" class="text-primary-500" />
            </div>

            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="min-w-0 truncate font-semibold text-highlighted">{{ record.subject }}</h3>
                    <UBadge size="sm" variant="subtle" :color="statusColor(record.status)"
                        :label="statusLabel(record.status)" class="shrink-0" />
                </div>

                <p class="mt-0.5 truncate text-xs text-muted">
                    <span class="font-medium text-primary">{{ record.assessment }}</span> &middot; {{ record.term }}
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
    </UCard>
</template>

<script setup lang="ts">
type ApprovalRequestStatus = 'Pending Review' | 'Approved' | 'Returned'

const { record } = defineProps<{
    record: AssessmentApprovalRequest | null
    selected?: AssessmentApprovalRequest | null
}>()

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
