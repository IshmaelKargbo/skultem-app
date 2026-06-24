<template>
  <UCard>
    <UForm :schema="schema" :state="state" @submit.prevent="submit" :key="record.id" class="flex items-start space-x-3">
      <div class="grid flex-1 gap-3 grid-cols-3">
        <UFormField label="Room Name" name="name" required>
          <UInput :disabled="layer == 'created'" v-model="state.name" placeholder="e.g. Science Lab" class="w-full" />
        </UFormField>

        <UFormField label="Room No." name="roomNo" required class="w-full">
          <UInput :disabled="layer == 'created'" v-model="state.roomNo" placeholder="e.g. A-101" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description" required>
          <UInput :disabled="layer == 'created'" v-model="state.description" placeholder="e.g. 2nd floor, 30-seat capacity" class="w-full" />
        </UFormField>
      </div>

      <div class="flex space-x-1">
        <UButton :loading="isLoading" type="submit" :icon="SAVE_ICON" v-if="canSave" variant="ghost" color="primary"
          square class="self-end sm:self-start sm:mt-6" />
        <UButton type="submit" v-if="layer == 'created'" :icon="EDIT_ICON" variant="ghost" color="warning" square
          class="self-end sm:self-start sm:mt-6" />
        <UButton @click="removeRoom" :icon="DELETE_ICON" variant="ghost" color="error" square
          class="self-end sm:self-start sm:mt-6" />
      </div>
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>
import * as yup from 'yup'

const isLoading = ref(false)
const { record, index } = defineProps<{
  record: Room
  index: number
}>()
const store = useTimetableStore()
const emit = defineEmits(['removeRoom'])
const layer = ref<'init' | 'created' | 'edit'>(record.id ? 'created' : 'init')

const canSave = computed(() => layer.value == 'edit' || layer.value == 'init')

const schema = yup.object({
  name: yup
    .string()
    .required('Room name is required')
    .trim(),
  roomNo: yup
    .string()
    .required('Room number is required')
    .trim(),
  description: yup
    .string()
    .required('Room description is required')
    .trim()
})

const state = reactive<{
  name: string
  roomNo: string
  description: string
}>({
  name: record.name,
  roomNo: record.no,
  description: record.description
})

function removeRoom() {
  emit('removeRoom', index)
}

async function submit() {
  try {
    isLoading.value = true
    await store.createRoom({
      name: state.name,
      no: state.roomNo,
      description: state.description
    }, index)
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}
</script>