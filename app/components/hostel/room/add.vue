<script setup lang="ts">
import * as yup from 'yup'

const { room } = defineProps<{ room?: Room }>()

const store = useHostelStore()
const { hostels, roomTypes } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!room)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const hostelOptions = computed(() => hostels.value.map(e => ({ label: e.name, value: e.id })))
const typeOptions = computed(() => roomTypes.value.map(e => ({ label: `${e.name} (${e.capacity} bed${e.capacity > 1 ? 's' : ''})`, value: e.id })))

function defaultState() {
  return {
    name: room?.name || '',
    hostelId: room?.hostel.id || '',
    typeId: room?.type.id || ''
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  name: yup.string().required('Room name is required'),
  hostelId: yup.string().required('Hostel is required'),
  typeId: yup.string().required('Room type is required')
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    if (isEdit.value && room) {
      store.updateRoom({ id: room.id, ...state })
      toastSuccess('Room updated successfully')
    } else {
      store.createRoom(state)
      toastSuccess('Room added successfully')
    }
    close()
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <USlideover :dismissible="false" v-model:open="open">
    <slot name="trigger" :open="() => (open = true)">
      <UButton
        v-if="isEdit"
        :icon="EDIT_ICON"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="open = true"
      />
      <UButton v-else color="primary" label="Add Room" :icon="ADD_ICON" @click="open = true" />
    </slot>

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ isEdit ? 'Edit Room' : 'Add Room' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Room Name / Number" name="name" required>
          <UInput v-model="state.name" placeholder="e.g. 12A" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Hostel" name="hostelId" required>
          <USelectMenu v-model="state.hostelId" value-key="value" :items="hostelOptions" placeholder="Select hostel" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Room Type" name="typeId" required>
          <USelectMenu v-model="state.typeId" value-key="value" :items="typeOptions" placeholder="Select room type" :disabled="isLoading" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
