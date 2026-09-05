<script setup lang="ts">
const store = useHostelStore()
const { hostels } = storeToRefs(store)

const search = ref('')
const typeFilter = ref('')
const deleteOpen = ref(false)
const selected = ref<Hostel>()

// No "All types" entry - a Reka UI Combobox item's value can't be an empty string (it throws
// "A <ComboboxItem /> must have a value prop that is not an empty string" the moment the list
// renders, breaking every item in it). The placeholder below covers "nothing selected", and the
// select's own :clear button gets back to it.
const typeOptions = computed(() => hostelTypeOptions)

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return hostels.value.filter(hostel => {
    const matchesSearch = !q
      || hostel.name.toLowerCase().includes(q)
      || hostel.supervisor.toLowerCase().includes(q)

    const matchesType = !typeFilter.value || hostel.type === typeFilter.value

    return matchesSearch && matchesType
  })
})

const columns = [
  { accessorKey: 'name', header: 'Hostel' },
  { id: 'capacity', header: 'Capacity' },
  { accessorKey: 'rooms', header: 'Rooms' },
  { accessorKey: 'supervisor', header: 'Supervisor' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function remove(hostel: Hostel) {
  selected.value = hostel
  deleteOpen.value = true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search name or supervisor..." class="w-full sm:w-72" />
      <USelectMenu v-model="typeFilter" value-key="value" :items="typeOptions" placeholder="All types" clear
        class="w-full sm:w-48" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="HOSTEL_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No hostels found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Add a hostel to start tracking capacity and supervision.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="HOSTEL_ICON" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-highlighted">
                {{ row.original.name }}
              </p>

              <p class="text-xs text-muted">
                {{ parseHostelType[row.original.type] }}
              </p>
            </div>
          </div>
        </template>

        <template #capacity-cell="{ row }">
          <UBadge color="neutral" variant="subtle" :icon="BED_ICON">
            {{ row.original.capacity }} beds
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <HostelForm :record="row.original" />

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

    <HostelDeletePrompt v-model:open="deleteOpen" :hostel-id="selected?.id || ''" :hostel-name="selected?.name || ''" />
  </div>
</template>
