<template>
    <div v-if="record" class="p-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl space-y-2 cursor-pointer hover:bg-primary-50/70 dark:hover:bg-primary-950/30 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        :class="[ selected?.id === record.id ? 'bg-primary-50/80 dark:bg-primary-950/35 border-primary-300 dark:border-primary-700' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800' ]">

        <div class="flex items-center justify-between w-full">
            <p class="font-medium text-base">{{ record.subject }} -
                <span class="text-primary-600 dark:text-primary-300">{{ record.assessment }}</span> -
                <span class="text-emerald-600 dark:text-emerald-300">{{ record.term }}</span>
            </p>
            <UBadge size="md" variant="outline" :color="statusColor(record.status)"
                :label="statusLabel(record.status)" />

        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">

        </p>

        <div class="flex gap-4 text-xs text-gray-500 dark:text-gray-400">

            <div class="flex items-center space-x-1">
                <span>{{ record.studentCount }} - </span>
                <UIcon :name="STUDENT_ICON" class="text-lg" />
            </div>

            <span class="font-medium text-emerald-600 dark:text-emerald-300">
                Avg {{ record.avergeScore }}
            </span>

            <span>{{ record.passPercentage }}% pass</span>

        </div>
        <GradeDistributionBar :height="2" :show-label="false" :average="record.avgPercentage"
            :pass="record.passPercentage" :fail="record.failPercentage" />
    </div>
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

</script>
