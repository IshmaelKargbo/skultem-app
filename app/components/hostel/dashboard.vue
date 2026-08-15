<script setup lang="ts">
const store = useHostelStore()
const { hostels, rooms, allocations } = storeToRefs(store)

const recentAllocations = computed(() => allocations.value.slice(0, 6))
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'primary',
        label: 'Hostels',
        isReady: true,
        value: hostels.length,
        subtle: `${rooms.length} rooms total`,
        icon: HOSTEL_ICON
      }" />

      <Metric :record="{
        color: 'success',
        label: 'Beds Occupied',
        isReady: true,
        value: store.occupiedBeds,
        subtle: `${store.freeBeds} beds free`,
        icon: BED_ICON
      }" />

      <Metric :record="{
        color: 'warning',
        label: 'Rooms Full',
        isReady: true,
        value: store.fullRooms.length,
        subtle: 'at maximum occupancy',
        icon: ROOM_FULL_ICON
      }" />

      <Metric :record="{
        color: 'info',
        label: 'Students Allocated',
        isReady: true,
        value: store.activeAllocations.length,
        subtle: 'active allocations',
        icon: STUDENT_ICON
      }" />
    </div>

    <HostelOccupancyAlerts />

    <div class="grid gap-4 xl:grid-cols-3">
      <UCard class="xl:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Recent Allocations</h3>
            <UButton to="/hostel/allocation" label="View all" variant="link" size="sm" trailing-icon="i-lucide-arrow-right" />
          </div>
        </template>

        <div v-if="!recentAllocations.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="ALLOCATE_ICON" class="text-3xl text-primary-500" />
          </div>
          <p class="text-sm text-muted">No allocations yet.</p>
        </div>

        <ul v-else class="divide-y divide-default">
          <li v-for="allocation in recentAllocations" :key="allocation.id" class="flex items-center justify-between gap-3 p-4">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <UIcon :name="STUDENT_ICON" class="size-4 text-primary" />
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ allocation.studentName }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ allocation.room.hostel.name }} · Room {{ allocation.room.name }}
                </p>
              </div>
            </div>

            <UBadge :color="allocationStatusStyle[allocation.status].color" variant="soft" class="shrink-0">
              {{ allocationStatusStyle[allocation.status].label }}
            </UBadge>
          </li>
        </ul>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Occupancy by Hostel</h3>
            <UButton to="/hostel/hostels" label="Manage" variant="link" size="sm" trailing-icon="i-lucide-arrow-right" />
          </div>
        </template>

        <div v-if="!hostels.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-success-50 dark:bg-success-500/10">
            <UIcon name="i-lucide-check-circle" class="text-3xl text-success-500" />
          </div>
          <p class="text-sm text-muted">No hostels added yet.</p>
        </div>

        <ul v-else class="divide-y divide-default">
          <li v-for="hostel in hostels" :key="hostel.id" class="space-y-2 p-4">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="font-medium text-highlighted">{{ hostel.name }}</span>
              <span class="text-muted">{{ store.rooms.filter(r => r.hostel.id === hostel.id).length }} rooms</span>
            </div>
            <UProgress :model-value="hostel.capacity ? Math.round((store.activeAllocations.filter(a => a.room.hostel.id === hostel.id).length / hostel.capacity) * 100) : 0" color="primary" size="sm" />
          </li>
        </ul>
      </UCard>
    </div>
  </div>
</template>
