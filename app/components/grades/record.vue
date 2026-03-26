<template>
    <div v-if="record" class="p-5 px-7 border-b border-gray-300 space-y-2 cursor-pointer hover:bg-gray-50"
        :class="{ 'bg-app-50 border-app-500': selected?.id === record.id }">

        <div class="flex items-center justify-between w-full">

            <p class="font-medium text-base">{{ record.subject }} · {{ record.assessment }}</p>

            <UBadge size="sm" variant="outline" :color="statusColor(record.status)"
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
