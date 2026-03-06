<template>
    <div v-if="record"
        class="p-4 border-b border-gray-300 cursor-pointer hover:bg-gray-50"
        :class="{ 'bg-app-50 border-app-500': selected?.id === record.id }">

        <div class="flex justify-between">

            <div class="flex gap-3">

                <UAvatar :alt="record.teacher" />

                <div class="space-y-1">

                    <div class="flex items-center gap-2">

                        <p class="font-medium">{{ record.teacher }}</p>

                        <UBadge size="xs" variant="outline" :color="statusColor(record.status)"
                            :label="statusLabel(record.status)" />

                    </div>

                    <p class="text-sm text-gray-500">
                        {{ record.subject }} · {{ record.assessment }}
                    </p>

                    <div class="flex gap-4 text-xs text-gray-500">

                        <div class="flex items-center space-x-1">
                            <UIcon name="hugeicons:students" class="text-lg" />
                            <span>{{ record.studentCount }} students</span>
                        </div>

                        <span class="font-medium text-green-600">
                            Avg {{ record.avergeScore }}
                        </span>

                        <span>{{ record.passPercentage }}% pass</span>

                    </div>

                    <GradeDistributionBar :height="1" :show-label="false" :average="record.avgPercentage" :pass="record.passPercentage"
                        :fail="record.failPercentage" />
                </div>
            </div>
            <p class="text-xs text-gray-400">{{ record.time }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
type ApprovalRequestStatus = 'Pending Review' | 'Approved' | 'Returned'

const {record} = defineProps<{
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
