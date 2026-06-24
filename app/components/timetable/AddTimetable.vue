<template>
  <UModal v-model:open="subjectModal" :ui="{ footer: 'justify-end' }">
    <template #header>
      <h3 class="text-lg font-semibold">Add Subject</h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Subject">
          <USelectMenu v-model="subject.subject" :items="list" value-key="value" placeholder="Select a subject"
            class="w-full" />
        </UFormField>

        <UFormField label="Room">
          <USelectMenu v-model="subject.room" :items="listRooms" value-key="value" placeholder="Select a room"
            class="w-full" />
        </UFormField>

        <UFormField label="Color">
          <div class="flex flex-wrap gap-2">
            <button v-for="color in colorOptions" :key="color.value" type="button"
              class="size-8 rounded-full border-2 transition-transform" :class="[
                color.swatch,
                subject.color === color.value
                  ? 'border-primary scale-110'
                  : 'border-transparent'
              ]" @click="subject.color = color.value" />
          </div>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="subjectModal = false" />

      <UButton label="Add Subject" :disabled="!subject.subject" @click="save" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  save: [any]
}>()

const subjectStore = useClassSubjectStore()
const { list } = storeToRefs(subjectStore)

const timetableStore = useTimetableStore()
const { listRooms } = storeToRefs(timetableStore)

const subjectModal = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const colorOptions = [
  {
    value: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900',
    swatch: 'bg-blue-200 dark:bg-blue-900'
  },
  {
    value: 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900',
    swatch: 'bg-green-200 dark:bg-green-900'
  },
  {
    value: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900',
    swatch: 'bg-purple-200 dark:bg-purple-900'
  },
  {
    value: 'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900',
    swatch: 'bg-orange-200 dark:bg-orange-900'
  },
  {
    value: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900',
    swatch: 'bg-cyan-200 dark:bg-cyan-900'
  },
  {
    value: 'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900',
    swatch: 'bg-pink-200 dark:bg-pink-900'
  },
  {
    value: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900',
    swatch: 'bg-yellow-200 dark:bg-yellow-900'
  },
  {
    value: 'bg-primary/5 border-primary/20',
    swatch: 'bg-primary/30'
  }
]

const subject = ref({
  subject: '',
  room: '',
  color: colorOptions[0].value
})

function save() {
  subjectModal.value = false
}
</script>