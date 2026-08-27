<script setup lang="ts">
const store = useHostelStore()
const { roomTypes } = storeToRefs(store)
const { format } = useMoney()

const search = ref('')
const deleteModal = ref(false)
const selected = ref<RoomType>()

const data = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return roomTypes.value

  return roomTypes.value.filter(e =>
    e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
  )
})

const roomCount = (typeId: string) => store.roomsByType(typeId).length

const columns = [
  { accessorKey: 'name', header: 'Room Type' },
  { id: 'capacity', header: 'Capacity' },
  { id: 'price', header: 'Price / Term' },
  { id: 'rooms', header: 'Rooms' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function remove(type: RoomType) {
  selected.value = type
  deleteModal.value = true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search room types..." class="w-full sm:w-72" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="ROOM_TYPE_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No room types found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Create room types to price and categorize hostel rooms.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="ROOM_TYPE_ICON" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-highlighted">
                {{ row.original.name }}
              </p>

              <p class="max-w-xs truncate text-xs text-muted">
                {{ row.original.description }}
              </p>
            </div>
          </div>
        </template>

        <template #capacity-cell="{ row }">
          <UBadge color="neutral" variant="subtle" :icon="BED_ICON">
            {{ row.original.capacity }} {{ row.original.capacity > 1 ? 'beds' : 'bed' }}
          </UBadge>
        </template>

        <template #price-cell="{ row }">
          <span class="font-medium text-highlighted">{{ format(row.original.price) }}</span>
        </template>

        <template #rooms-cell="{ row }">
          <UBadge color="neutral" variant="subtle">
            {{ roomCount(row.original.id) }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <HostelRoomTypeAdd :type="row.original" />

            <UButton
              :icon="DELETE_ICON"
              size="xs"
              color="error"
              variant="ghost"
              @click="remove(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <HostelRoomTypeDeletePrompt
      v-model:open="deleteModal"
      :type-id="selected?.id || ''"
      :type-name="selected?.name || ''"
    />
  </div>
</template>
