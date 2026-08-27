<script lang="ts" setup>
import type { Row } from '@tanstack/vue-table'
const { record } = defineProps<{
    record: AssessmentTemplate
}>()

const showAssessment = ref(false)
function parseAssessmentCount(assessments: Assessment[]) {
    return assessments?.length || 0
}

const editRecord = ref<AssessmentTemplate | null>(null)
const editState = ref(false)
const assignRecord = ref<AssessmentTemplate | null>(null)
const assignState = ref(false)

function toggleAssessessment() {
    showAssessment.value = !showAssessment.value
}


function calculateTotal(assessments: Assessment[]) {
    return assessments?.reduce((sum, item) => sum + item.weight, 0) || 0
}

function statusColor(total: number) {
    if (total === 100) return 'success'
    if (total > 100) return 'error'
    return 'warning'
}

function statusLabel(total: number) {
    if (total === 100) return 'Balanced'
    if (total > 100) return 'Overweighted'
    return 'Incomplete'
}

function getRowItems(row: Row<AssessmentTemplate>) {
    return [
        {
            label: row.original.assessments?.length ? 'Edit Assessments' : 'Add Assessments',
            icon: 'i-lucide-clipboard-list',
            onClick: () => {
                assignRecord.value = row.original
                assignState.value = true
            }
        },
        {
            label: 'Edit Record',
            icon: 'i-lucide-edit',
            onClick: () => {
                editState.value = true
                editRecord.value = row.original
            }
        },
        {
            label: 'Delete Record',
            icon: 'i-lucide-trash'
        }
    ]
}

</script>

<template>
    <div>
        <UCard variant="outline" class="overflow-hidden" :ui="{
            body: 'sm:p-0 p-0'
        }">
            <!-- Header -->
            <div class="border-b border-gray-100 p-3 dark:border-gray-800">
                <div class="flex items-center justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                        <div
                            class="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                            <UIcon name="i-lucide-clipboard-list" class="size-5" />
                        </div>

                        <div class="min-w-0">
                            <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {{ record.name }}
                            </h3>

                            <p class="truncate text-xs-base text-gray-500">
                                {{ parseAssessmentCount(record.assessments) }} assessment(s)
                            </p>
                        </div>
                    </div>

                    <UDropdownMenu :items="getRowItems({ original: record } as any)" :content="{ align: 'end' }">
                        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                            class="rounded-xl" />
                    </UDropdownMenu>
                </div>
            </div>

            <!-- Description -->
            <div v-if="record.description" class="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p class="text-xs text-muted">
                    {{ record.description }}
                </p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-3">
                <div class="rounded-xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
                    <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
                        Pass Mark
                    </p>

                    <p class="text-sm font-semibold">
                        {{ record.passMark }}%
                    </p>
                </div>

                <div class="rounded-xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
                    <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
                        Total Weight
                    </p>

                    <p class="text-sm font-semibold">
                        {{ calculateTotal(record.assessments) }}%
                    </p>
                </div>
            </div>

            <!-- Status -->
            <div class="px-4 pb-3">
                <div class="mb-2 flex items-center justify-between">
                    <p class="text-xs font-medium text-gray-500">
                        Template Status
                    </p>

                    <UBadge :label="statusLabel(calculateTotal(record.assessments))"
                        :color="statusColor(calculateTotal(record.assessments))" variant="soft" />
                </div>

                <UProgress :max="100" :model-value="Math.min(calculateTotal(record.assessments), 100)"
                    :color="statusColor(calculateTotal(record.assessments))" />

                <p v-if="calculateTotal(record.assessments) !== 100" class="mt-1 text-xs-base text-amber-600">
                    Total assessment weight should equal 100%.
                </p>
                <p class="mt-1 text-xs-base" v-else>Total assessment weight set to 100%</p>
            </div>

            <!-- Assessment Items -->
            <div class="border-t border-gray-100 p-3 dark:border-gray-800">
                <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                        Assessments
                    </h4>

                    <div class="flex space-x-1">
                        <UBadge :label="`${parseAssessmentCount(record.assessments)} Items`" variant="soft"
                            color="neutral" />
                        <UButton @click="toggleAssessessment" :icon="CHEVRON_DOWN_ICON" size="xs" variant="ghost" />
                    </div>
                </div>

                <div v-if="showAssessment">
                    <div v-if="record.assessments?.length" class="space-y-2">
                        <div v-for="assessment in [...record.assessments].sort((a, b) => a.position - b.position)"
                            :key="assessment.id"
                            class="flex items-center justify-between rounded-xl bg-gray-50 border border-default p-2.5 dark:bg-neutral-800">
                            <div class="min-w-0">
                                <p class="truncate text-sm font-medium">
                                    {{ assessment.name }}
                                </p>

                                <p class="text-xs-base text-gray-500">
                                    Position {{ assessment.position }}
                                </p>
                            </div>

                            <UBadge :label="`${assessment.weight}%`" variant="soft" color="primary" />
                        </div>
                    </div>

                    <div v-else
                        class="rounded-xl flex items-center justify-center border border-dashed border-gray-300 h-40 text-center dark:border-gray-700">
                        <p class="text-sm text-gray-500">
                            No assessments assigned yet.
                        </p>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
