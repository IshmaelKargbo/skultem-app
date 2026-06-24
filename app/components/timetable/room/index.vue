<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-door-open" class="size-5 text-primary" />
          <div>
            <h3 class="font-semibold">Rooms</h3>
            <p class="text-sm text-muted">
              Manage classrooms and spaces available for scheduling
            </p>
          </div>
        </div>

        <UButton icon="i-lucide-plus" size="sm" @click="addRoom">
          Add Room
        </UButton>
      </div>
    </template>

    <div class="space-y-3">
      <TimetableRoomAdd v-for="(room, index) in rooms" :index="index" :record="room" :key="room.id"
        @remove-room="removeRoom" />

      <div v-if="rooms.length === 0"
        class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-default py-10 text-center">
        <UIcon name="i-lucide-door-closed" class="size-8 text-muted" />
        <p class="text-sm text-muted">No rooms added yet</p>
        <UButton variant="soft" size="sm" icon="i-lucide-plus" @click="addRoom">
          Add your first room
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
const { rooms } = storeToRefs(store)

function addRoom() {
  store.addRoom()
}

function removeRoom(index: number) {
  store.removeRoom(index)
}

async function fetchRecord() {
 await store.searchRoom(1, 10, "")
}

onMounted(async () => {
  await fetchRecord()
})
</script>