<script setup lang="ts">
const store = useCommunicateStore()
const { broadcasts } = storeToRefs(store)

const search = ref('')
const statusFilter = ref<'ALL' | BroadcastStatus>('ALL')

const statusOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Failed', value: 'FAILED' }
]

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return broadcasts.value
    .filter(b => {
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.message.toLowerCase().includes(q)
      const matchesStatus = statusFilter.value === 'ALL' || b.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const columns = [
  { id: 'broadcast', header: 'Broadcast' },
  { accessorKey: 'audience', header: 'Audience' },
  { id: 'delivery', header: 'Delivery' },
  { id: 'status', header: 'Status' },
  { id: 'date', header: 'Date' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search broadcasts..." class="w-full sm:w-72" />
      <USelectMenu v-model="statusFilter" value-key="value" :items="statusOptions" class="w-full sm:w-48" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BROADCAST_HISTORY_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">No broadcasts yet</h3>
              <p class="mt-1 text-sm text-muted">Broadcasts you send or schedule will appear here.</p>
            </div>
          </div>
        </template>

        <template #broadcast-cell="{ row }">
          <div class="max-w-sm">
            <p class="font-medium text-highlighted">{{ row.original.title }}</p>
            <p class="mt-0.5 truncate text-xs text-muted">{{ row.original.message }}</p>
            <div class="mt-1.5 flex flex-wrap gap-1">
              <UBadge v-for="channel in row.original.channels" :key="channel" color="neutral" variant="subtle" size="sm">
                {{ channel }}
              </UBadge>
            </div>
          </div>
        </template>

        <template #audience-cell="{ row }">
          <UBadge color="neutral" variant="subtle">{{ audienceLabel(row.original.audience) }}</UBadge>
        </template>

        <template #delivery-cell="{ row }">
          <p class="text-sm text-muted">
            <span class="font-medium text-highlighted">{{ row.original.deliveredCount }}</span> / {{ row.original.recipientsCount }}
          </p>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="broadcastStatusStyle[row.original.status].color" variant="soft">
            {{ broadcastStatusStyle[row.original.status].label }}
          </UBadge>
        </template>

        <template #date-cell="{ row }">
          <p class="text-sm text-muted">
            {{ formatDateTime(row.original.sentAt || row.original.scheduledAt || row.original.createdAt) }}
          </p>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
