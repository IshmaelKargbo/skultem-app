<template>
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }">
    <template #header>
      <div class="flex justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-door-open" class="size-5 text-primary" />
          <div>
            <h3 class="font-semibold">Rooms</h3>
            <p class="text-xs-base text-muted hidden md:block">
              Manage classrooms and spaces available for scheduling
            </p>
          </div>
        </div>

        <div>
          <UButton icon="i-lucide-plus" class="w-full justify-center sm:w-auto hidden md:flex"
            @click="addRoom">
            Add Room
          </UButton>
          <UButton icon="i-lucide-plus" class=" md:hidden" @click="addRoom" />
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <TimetableRoomAdd v-for="(room, index) in rooms" :index="index" :record="room" :key="room.id"
        @remove-room="removeRoom" />
      <TimetableRoomDeletePrompt :index="selectIndex" v-model:open="deleteModal" :room-id="selectRoom?.id || ''"
        :room-name="selectRoom?.name || ''" />

      <div v-if="rooms.length === 0"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default py-10 text-center">
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
const deleteModal = ref(false)

const selectIndex = ref('')
const selectRoom = ref<Room>()

function addRoom() {
  store.addRoom()
}

function removeRoom(param: Room, index: string) {
  selectRoom.value = param
  selectIndex.value = index
  deleteModal.value = true
}

async function fetchRecord() {
  try {
    await store.searchRoom(0, 0, "")
  } catch (error: any) {
    useNotify().error(error)
  }
}

onMounted(async () => {
  await fetchRecord()
})
</script>
