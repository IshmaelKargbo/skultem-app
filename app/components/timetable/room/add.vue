<template>
  <UCard>
    <UForm :schema="schema" :state="state" @submit.prevent="submit" :key="record.id" class="flex items-start space-x-3">
      <div class="grid flex-1 gap-3 grid-cols-3">
        <UFormField label="Room Name" name="name" required>
          <UInput :disabled="mode == 'created'" v-model="state.name" placeholder="e.g. Science Lab" class="w-full" />
        </UFormField>

        <UFormField label="Room No." name="roomNo" required class="w-full">
          <UInput :disabled="mode == 'created'" v-model="state.roomNo" placeholder="e.g. A-101" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description" required>
          <UInput :disabled="mode == 'created'" v-model="state.description"
            placeholder="e.g. 2nd floor, 30-seat capacity" class="w-full" />
        </UFormField>
      </div>

      <div class="flex space-x-1">
        <UButton :loading="isLoading" type="submit" :icon="SAVE_ICON" v-if="canSave" variant="ghost" color="primary"
          square class="self-end sm:self-start sm:mt-6" />
        <UButton @click="mode = 'edit'" v-if="mode == 'created'" :icon="EDIT_ICON" variant="ghost" color="warning"
          square class="self-end sm:self-start sm:mt-6" />
        <UButton @click="removeRoom" :icon="DELETE_ICON" variant="ghost" color="error" square
          class="self-end sm:self-start sm:mt-6" />
      </div>
    </UForm>
  </UCard>
</template>
<script lang="ts" setup>
import * as yup from 'yup'

const props = defineProps<{
  record: Room
  index: number
}>()

const emit = defineEmits<{
  removeRoom: [room: Room, index: string]
}>()

const store = useTimetableStore()

const isLoading = ref(false)
const mode = ref<'init' | 'created' | 'edit'>(
  props.record.id ? 'created' : 'init'
)

const canSave = computed(() =>
  ['init', 'edit'].includes(mode.value)
)

const schema = yup.object({
  name: yup.string().trim().required('Room name is required'),
  roomNo: yup.string().trim().required('Room number is required'),
  description: yup.string().trim().required('Room description is required')
})

const state = reactive({
  id: props.record.id,
  name: props.record.name,
  roomNo: props.record.no,
  description: props.record.description
})

function removeRoom() {
  emit('removeRoom', props.record, props.index.toString())
}

async function submit() {
  try {
    isLoading.value = true

    const payload = {
      name: state.name,
      no: state.roomNo,
      description: state.description
    }

    if (state.id) {
      await store.updateRoom(
        {
          id: state.id,
          ...payload
        },
        props.index
      )
    } else {
      await store.createRoom(payload, props.index)
    }

    mode.value = 'created'
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.record,
  (record) => {
    state.id = record.id
    state.name = record.name
    state.roomNo = record.no
    state.description = record.description

    mode.value = record.id ? 'created' : 'init'
  },
  { immediate: true, deep: true }
)
</script>