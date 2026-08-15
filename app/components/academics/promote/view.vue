<script setup lang="ts">
const { batch } = defineProps<{ batch: PromotionBatch }>()

const open = ref(false)

const columns = [
  { id: 'student', header: 'Student' },
  { id: 'outcome', header: 'Outcome' },
  { id: 'target', header: 'Target Class' }
]
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-2xl' }">
    <UButton :icon="VIEW_ICON" size="xs" color="neutral" variant="ghost" @click="open = true" />

    <template #content>
      <UCard :ui="{ body: 'max-h-[75vh] overflow-y-auto' }">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold">
                  {{ batch.fromClassName }} <UIcon name="i-lucide-arrow-right" class="mx-1 inline size-3.5 text-muted" /> {{ batch.toClassName }}
                </h3>
                <UBadge v-if="batch.isDemo" color="neutral" variant="subtle" icon="i-lucide-flask-conical" size="sm">
                  Sample data
                </UBadge>
              </div>

              <p class="mt-1 text-sm text-muted">
                Recorded by {{ batch.performedBy }} · {{ formatDateTime(batch.performedAt) }}
              </p>
            </div>

            <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="open = false" />
          </div>
        </template>

        <div class="mb-4 flex flex-wrap gap-2">
          <UBadge color="success" variant="subtle">{{ batch.promotedCount }} promoted</UBadge>
          <UBadge v-if="batch.repeatedCount" color="warning" variant="subtle">{{ batch.repeatedCount }} repeated</UBadge>
          <UBadge v-if="batch.graduatedCount" color="info" variant="subtle">{{ batch.graduatedCount }} graduated</UBadge>
          <UBadge color="neutral" variant="subtle">{{ batch.totalCount }} total</UBadge>
        </div>

        <UTable :columns="columns" :data="batch.students">
          <template #empty-state>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon :name="PROMOTE_STUDENTS_ICON" class="text-2xl text-muted" />
              <p class="text-sm text-muted">No student details were recorded for this batch.</p>
            </div>
          </template>

          <template #student-cell="{ row }">
            <p class="font-medium text-highlighted">{{ row.original.name }}</p>
            <p class="text-xs text-muted">Admission No. {{ row.original.admissionNumber }}</p>
          </template>

          <template #outcome-cell="{ row }">
            <UBadge :color="promotionOutcomeStyle[row.original.outcome].color" variant="soft">
              {{ promotionOutcomeStyle[row.original.outcome].label }}
            </UBadge>
          </template>

          <template #target-cell="{ row }">
            <p class="text-sm text-muted">{{ row.original.targetClassName || '—' }}</p>
          </template>
        </UTable>
      </UCard>
    </template>
  </UModal>
</template>
