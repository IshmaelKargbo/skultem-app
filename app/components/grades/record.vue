<template>
    <div v-if="record" class="p-4 border-2 border-gray-200 rounded-xl space-y-2 cursor-pointer hover:bg-primary-50 hover:border-primary-300"
        :class="[ selected?.id === record.id ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-200' ]">

        <div class="flex items-center justify-between w-full">
            <p class="font-medium text-base">{{ record.subject }} - <span class="text-info-400">{{ record.assessment
            }}</span> - <span class="text-success-400">{{ record.term }}</span></p>
            <UBadge size="md" variant="outline" :color="statusColor(record.status)"
                :label="statusLabel(record.status)" />

        </div>

        <p class="text-sm text-gray-500">

        </p>

        <div class="flex gap-4 text-xs text-gray-500">

            <div class="flex items-center space-x-1">
                <span>{{ record.studentCount }} - </span>
                <UIcon :name="STUDENT_ICON" class="text-lg" />
            </div>

            <span class="font-medium text-green-600">
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
