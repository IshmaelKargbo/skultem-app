<script setup lang="ts">
const store = useHostelStore()
const { rooms, hostels } = storeToRefs(store)
const occupancy = store.roomOccupancy

const search = ref('')
const hostelFilter = ref('')
const deleteModal = ref(false)
const selected = ref<HostelRoom>()

// No "All hostels" entry - a Reka UI Combobox item's value can't be an empty string (it throws
// "A <ComboboxItem /> must have a value prop that is not an empty string" the moment the list
// renders, breaking every item in it). The placeholder below covers "nothing selected", and the
// select's own :clear button gets back to it.
const hostelOptions = computed(() => hostels.value.map(e => ({ label: e.name, value: e.id })))

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return rooms.value.filter(room => {
    const matchesSearch = !q
      || room.name.toLowerCase().includes(q)
      || room.hostel.name.toLowerCase().includes(q)

    const matchesHostel = !hostelFilter.value || room.hostel.id === hostelFilter.value

    return matchesSearch && matchesHostel
  })
})

const columns = [
  { accessorKey: 'name', header: 'HostelRoom' },
  { accessorKey: 'hostel.name', header: 'Hostel' },
  { accessorKey: 'type.name', header: 'Type' },
  { id: 'occupancy', header: 'Occupancy' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function remove(room: HostelRoom) {
  selected.value = room
  deleteModal.value = true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search room or hostel..." class="w-full sm:w-72" />
      <USelectMenu v-model="hostelFilter" value-key="value" :items="hostelOptions" placeholder="All hostels" clear
        class="w-full sm:w-56" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="ROOM_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No rooms found
              </h3>

              <p class="mt-1 text-sm text-muted">
                HostelRooms added to a hostel will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="ROOM_ICON" class="text-primary-500" />
            </div>

            <p class="font-medium text-highlighted">
              HostelRoom {{ row.original.name }}
            </p>
          </div>
        </template>

        <template #occupancy-cell="{ row }">
          <UBadge :color="occupancy(row.original.id).occupied >= occupancy(row.original.id).capacity ? 'error' : 'success'" variant="soft">
            {{ occupancy(row.original.id).occupied }} / {{ occupancy(row.original.id).capacity }} occupied
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <HostelHostelRoomAdd :room="row.original" />

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

    <HostelHostelRoomDeletePrompt
      v-model:open="deleteModal"
      :room-id="selected?.id || ''"
      :room-name="selected?.name || ''"
    />
  </div>
</template>
