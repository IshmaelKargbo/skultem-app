<template>
  <div class="mt-6 space-y-6">

    <div class="grid gap-6 md:grid-cols-2">

      <!-- School Timing -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-clock-3" class="size-5 text-primary" />
            <div>
              <h3 class="font-semibold">School Timing</h3>
              <p class="text-sm text-muted">
                Set the overall school schedule
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="School Starts">
            <UInput v-model="settings.startTime" type="time" class="w-full" />
          </UFormField>

          <UFormField label="School Ends">
            <UInput v-model="settings.endTime" type="time" class="w-full" />
          </UFormField>

          <UFormField label="Period Duration (mins)">
            <UInputNumber v-model="settings.periodDuration" class="w-full" />
          </UFormField>

          <UFormField label="Break Duration (mins)">
            <UInputNumber v-model="settings.breakDuration" class="w-full" />
          </UFormField>

          <UFormField label="Lunch Duration (mins)">
            <UInputNumber v-model="settings.lunchDuration" class="w-full" />
          </UFormField>

          <UFormField label="Periods Per Day">
            <UInputNumber v-model="settings.periodsPerDay" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Working Days -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
            <div>
              <h3 class="font-semibold">Working Days</h3>
              <p class="text-sm text-muted">
                Choose days classes are held
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="day in workingDays"
            :key="day.name"
            class="flex items-center justify-between rounded-xl border border-default p-4"
            :class="{ 'opacity-50': !day.enabled }"
          >
            <div>
              <p class="font-medium">
                {{ day.name }}
              </p>

              <p class="text-sm text-muted">
                {{ day.enabled ? `${settings.startTime} - ${settings.endTime}` : 'No classes' }}
              </p>
            </div>

            <USwitch v-model="day.enabled" />
          </div>
        </div>
      </UCard>

    </div>

    <!-- Rooms -->
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

          <UButton
            icon="i-lucide-plus"
            size="sm"
            @click="addRoom"
          >
            Add Room
          </UButton>
        </div>
      </template>

      <div class="space-y-3">

        <div
          v-for="(room, index) in rooms"
          :key="room.id"
          class="flex flex-col gap-3 rounded-xl border border-default p-4 sm:flex-row sm:items-start"
        >
          <div class="grid flex-1 gap-3 sm:grid-cols-[1fr_140px_2fr]">
            <UFormField label="Room Name" :name="`room-name-${room.id}`">
              <UInput
                v-model="room.name"
                placeholder="e.g. Science Lab"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Room No." :name="`room-no-${room.id}`">
              <UInput
                v-model="room.roomNo"
                placeholder="e.g. A-101"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Description" :name="`room-desc-${room.id}`">
              <UInput
                v-model="room.description"
                placeholder="e.g. 2nd floor, 30-seat capacity"
                class="w-full"
              />
            </UFormField>
          </div>

          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            square
            class="self-end sm:self-start sm:mt-6"
            :disabled="rooms.length === 1"
            @click="removeRoom(index)"
          />
        </div>

        <div
          v-if="rooms.length === 0"
          class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-default py-10 text-center"
        >
          <UIcon name="i-lucide-door-closed" class="size-8 text-muted" />
          <p class="text-sm text-muted">No rooms added yet</p>
          <UButton variant="soft" size="sm" icon="i-lucide-plus" @click="addRoom">
            Add your first room
          </UButton>
        </div>

      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const settings = reactive({
    startTime: '09:00',
    endTime: '15:15',
    periodDuration: 45,
    breakDuration: 15,
    lunchDuration: 45,
    periodsPerDay: 7,

    preventConflicts: true,
    balanceSubjects: true,
    preferMorning: false,

    notifyTeachers: true,
    notifyStudents: true,
    emailAlerts: false
})

const workingDays = ref([
    { name: 'Monday', enabled: true },
    { name: 'Tuesday', enabled: true },
    { name: 'Wednesday', enabled: true },
    { name: 'Thursday', enabled: true },
    { name: 'Friday', enabled: true }
])

let nextRoomId = 1
function makeRoomId() {
  return nextRoomId++
}

const rooms = ref([
  { id: makeRoomId(), name: 'Science Lab', roomNo: 'A-101', description: '2nd floor, 30-seat capacity' },
  { id: makeRoomId(), name: 'Main Hall', roomNo: 'G-001', description: 'Ground floor, assemblies & exams' }
])

function addRoom() {
  rooms.value.push({ id: makeRoomId(), name: '', roomNo: '', description: '' })
}

function removeRoom(index: number) {
  rooms.value.splice(index, 1)
}
</script>