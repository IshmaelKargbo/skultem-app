<script setup lang="ts">
const store = useCommunicateStore()
const { calendar } = storeToRefs(store)

const search = ref('')
const typeFilter = ref<'ALL' | CalendarEntryType>('ALL')
const deleteModal = ref(false)
const selected = ref<CalendarEntry>()

const typeOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Events', value: 'EVENT' },
  { label: 'Holidays', value: 'HOLIDAY' }
]

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return calendar.value
    .filter(e => {
      const matchesSearch = !q || e.title.toLowerCase().includes(q)
      const matchesType = typeFilter.value === 'ALL' || e.type === typeFilter.value
      return matchesSearch && matchesType
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

const columns = [
  { id: 'title', header: 'Title' },
  { id: 'dates', header: 'Dates' },
  { accessorKey: 'location', header: 'Location' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function remove(entry: CalendarEntry) {
  selected.value = entry
  deleteModal.value = true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search events & holidays..." class="w-full sm:w-72" />
      <USelectMenu v-model="typeFilter" value-key="value" :items="typeOptions" class="w-full sm:w-48" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="EVENT_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">No events or holidays found</h3>
              <p class="mt-1 text-sm text-muted">Upcoming events and holidays will appear here.</p>
            </div>
          </div>
        </template>

        <template #title-cell="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl"
              :class="row.original.type === 'HOLIDAY' ? 'bg-warning-50 dark:bg-warning-500/10' : 'bg-primary-50 dark:bg-primary-500/10'"
            >
              <UIcon :name="row.original.type === 'HOLIDAY' ? HOLIDAY_ICON : EVENT_ICON" :class="row.original.type === 'HOLIDAY' ? 'text-warning-500' : 'text-primary-500'" />
            </div>

            <div>
              <p class="font-medium text-highlighted">{{ row.original.title }}</p>
              <p class="max-w-xs truncate text-xs text-muted">{{ row.original.description }}</p>
            </div>
          </div>
        </template>

        <template #dates-cell="{ row }">
          <UBadge :color="row.original.type === 'HOLIDAY' ? 'warning' : 'info'" variant="subtle" class="mb-1">
            {{ row.original.type === 'HOLIDAY' ? 'Holiday' : 'Event' }}
          </UBadge>
          <p class="text-sm text-muted">
            {{ formatDate(row.original.startDate) }}
            <template v-if="row.original.endDate !== row.original.startDate"> — {{ formatDate(row.original.endDate) }}</template>
          </p>
        </template>

        <template #location-cell="{ row }">
          <p class="text-sm text-muted">{{ row.original.location || '—' }}</p>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <CommunicateEventAdd :entry="row.original" />

            <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(row.original)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <CommunicateEventDeletePrompt
      v-model:open="deleteModal"
      :entry-id="selected?.id || ''"
      :entry-title="selected?.title || ''"
    />
  </div>
</template>
