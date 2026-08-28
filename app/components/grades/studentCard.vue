<script lang="ts" setup>
defineProps<{
  record: StudentAssessment
  assessments: Assessment[]
  position: string | number
  total: number
}>()

const emit = defineEmits<{
  "score-change": [assessmentId: string, value: unknown]
}>()
</script>

<template>
  <UCard
    :ui="{ body: 'sm:p-0 p-0' }"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <UAvatar
            size="xl"
            :src="record.photo"
            :alt="record.name"
            class="ring-2 ring-primary/20"
          />

          <div class="min-w-0">
            <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {{ record.name }}
            </h3>

            <p class="text-xs-base text-muted">
              Position
              <span class="font-medium text-primary">{{ position }}</span>
            </p>
          </div>
        </div>

        <div class="rounded-xl bg-gray-50 border border-default px-4 py-2 text-center">
          <p class="text-lg font-bold text-primary">{{ total }}</p>
        </div>
      </div>
    </template>

    <!-- Assessments -->
    <div class="divide-y divide-gray-100 dark:divide-white/5">
      <div
        v-for="assessment in assessments"
        :key="assessment.id"
        class="flex items-center justify-between p-3 transition"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
            {{ assessment.name }}
          </p>

          <p class="mt-1 text-xs text-gray-500">Weight {{ assessment.weight }}</p>
        </div>

        <div
          v-if="isEditableStatus(getStudentScore(record, assessment.id)?.status as ScoreStatus)"
          class="w-24 shrink-0"
        >
          <UInput
            size="md"
            class="w-full"
            :ui="{ base: 'text-base' }"
            :model-value="getStudentScore(record, assessment.id)?.score"
            type="number"
            min="0"
            max="100"
            @update:model-value="emit('score-change', assessment.id, $event)"
          />
        </div>

        <div v-else class="flex flex-col items-end gap-1 shrink-0">
          <UBadge size="sm" variant="soft" :color="statusBadgeColor(assessment.status)">
            {{ clean(assessment.status) }}
          </UBadge>

          <p class="text-sm font-semibold mt-1">
            {{ getStudentScore(record, assessment.id)?.score ?? '-' }}
            <span class="text-xs text-gray-500">
              ({{ getStudentScore(record, assessment.id)?.weightScore ?? '-' }})
            </span>
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
