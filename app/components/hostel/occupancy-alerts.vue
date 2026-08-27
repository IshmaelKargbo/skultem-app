<script setup lang="ts">
const store = useHostelStore()
const { fullRooms } = storeToRefs(store)
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon :name="ROOM_FULL_ICON" class="size-5 text-warning" />
        <h3 class="font-semibold">Rooms at Capacity</h3>
        <UBadge v-if="fullRooms.length" color="warning" variant="subtle" size="sm">
          {{ fullRooms.length }}
        </UBadge>
      </div>
    </template>

    <div v-if="!fullRooms.length" class="flex flex-col items-center gap-3 py-16">
      <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-success-50 dark:bg-success-500/10">
        <UIcon name="i-lucide-check-circle" class="text-3xl text-success-500" />
      </div>
      <p class="text-sm text-muted">No rooms are at full capacity right now.</p>
    </div>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="room in fullRooms"
        :key="room.id"
        class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warning-50 dark:bg-warning-500/10">
            <UIcon :name="ROOM_ICON" class="size-5 text-warning-500" />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              Room {{ room.name }}
              <span class="font-normal text-muted">· {{ room.hostel.name }}</span>
            </p>

            <p class="truncate text-xs text-muted">
              {{ room.type.name }} · {{ store.roomOccupancy(room.id).capacity }} bed{{ room.type.capacity > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <UBadge color="warning" variant="soft" size="sm" class="shrink-0">
          Full
        </UBadge>
      </li>
    </ul>
  </UCard>
</template>
