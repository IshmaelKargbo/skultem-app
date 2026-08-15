<script setup lang="ts">
const store = usePromotionStore()
const { batches } = storeToRefs(store)

const columns = [
  { id: 'class', header: 'Class' },
  { id: 'outcomes', header: 'Outcomes' },
  { accessorKey: 'totalCount', header: 'Total' },
  { accessorKey: 'performedBy', header: 'Performed By' },
  { accessorKey: 'performedAt', header: 'Date' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-history" class="size-5 text-primary" />
        <h3 class="font-semibold">Promotion History</h3>
      </div>
    </template>

    <UTable :columns="columns" :data="batches">
      <template #empty-state>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="PROMOTE_STUDENTS_ICON" class="text-3xl text-primary-500" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-highlighted">No promotions recorded yet</h3>
            <p class="mt-1 text-sm text-muted">Confirmed promotion batches will appear here.</p>
          </div>
        </div>
      </template>

      <template #class-cell="{ row }">
        <div class="flex items-center gap-2">
          <p class="font-medium text-highlighted">
            {{ row.original.fromClassName }} <UIcon name="i-lucide-arrow-right" class="mx-1 inline size-3.5 text-muted" /> {{ row.original.toClassName }}
          </p>
          <UBadge v-if="row.original.isDemo" color="neutral" variant="subtle" icon="i-lucide-flask-conical" size="sm">
            Sample
          </UBadge>
        </div>
      </template>

      <template #outcomes-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge color="success" variant="subtle" size="sm">{{ row.original.promotedCount }} promoted</UBadge>
          <UBadge v-if="row.original.repeatedCount" color="warning" variant="subtle" size="sm">{{ row.original.repeatedCount }} repeated</UBadge>
          <UBadge v-if="row.original.graduatedCount" color="info" variant="subtle" size="sm">{{ row.original.graduatedCount }} graduated</UBadge>
        </div>
      </template>

      <template #performedAt-cell="{ row }">
        <p class="text-sm text-muted">{{ formatDateTime(row.original.performedAt) }}</p>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <AcademicsPromoteView :batch="row.original" />
        </div>
      </template>
    </UTable>
  </UCard>
</template>
