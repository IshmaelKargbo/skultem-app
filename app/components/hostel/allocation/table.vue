<script setup lang="ts">
const store = useHostelStore()
const { allocations } = storeToRefs(store)

const search = ref('')
const statusFilter = ref<'ALL' | AllocationStatus>('ALL')
const { success: toastSuccess, error: toastError } = useNotify()

const statusOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Vacated', value: 'VACATED' }
]

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return allocations.value.filter(allocation => {
    const matchesSearch = !q
      || allocation.studentName.toLowerCase().includes(q)
      || allocation.admissionNo.toLowerCase().includes(q)
      || allocation.room.name.toLowerCase().includes(q)

    const matchesStatus = statusFilter.value === 'ALL' || allocation.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const columns = [
  { id: 'student', header: 'Student' },
  { id: 'room', header: 'Room' },
  { accessorKey: 'allocatedAt', header: 'Allocated' },
  { id: 'status', header: 'Status' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function vacate(allocation: Allocation) {
  try {
    store.vacateAllocation(allocation.id)
    toastSuccess(`${allocation.studentName} marked as vacated`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to vacate allocation')
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search student or room..." class="w-full sm:w-72" />
      <USelectMenu v-model="statusFilter" value-key="value" :items="statusOptions" class="w-full sm:w-48" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="ALLOCATE_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No allocations found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Students allocated to hostel rooms will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #student-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="STUDENT_ICON" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-highlighted">
                {{ row.original.studentName }}
              </p>

              <p class="text-xs text-muted">
                {{ row.original.admissionNo }} · {{ row.original.className }}
              </p>
            </div>
          </div>
        </template>

        <template #room-cell="{ row }">
          <p class="font-medium text-highlighted">{{ row.original.room.hostel.name }}</p>
          <p class="text-xs text-muted">Room {{ row.original.room.name }}</p>
        </template>

        <template #allocatedAt-cell="{ row }">
          <p class="text-sm text-muted">{{ formatDate(row.original.allocatedAt) }}</p>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="allocationStatusStyle[row.original.status].color" variant="soft">
            {{ allocationStatusStyle[row.original.status].label }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              v-if="row.original.status === 'ACTIVE'"
              :icon="VACATE_ICON"
              size="xs"
              color="neutral"
              variant="soft"
              label="Vacate"
              @click="vacate(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
