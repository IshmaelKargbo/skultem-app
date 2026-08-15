<script setup lang="ts">
import * as yup from 'yup'

const { type } = defineProps<{ type?: RoomType }>()

const store = useHostelStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!type)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

function defaultState() {
  return {
    name: type?.name || '',
    description: type?.description || '',
    capacity: type?.capacity ?? 1,
    price: type?.price ?? 0
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  capacity: yup.number().min(1, 'At least 1 bed is required').required(),
  price: yup.number().min(0, 'Price cannot be negative').required('Price is required')
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    if (isEdit.value && type) {
      store.updateRoomType({ id: type.id, ...state })
      toastSuccess('Room type updated successfully')
    } else {
      store.createRoomType(state)
      toastSuccess('Room type added successfully')
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
      <UButton v-else color="primary" label="Add Room Type" :icon="ADD_ICON" @click="open = true" />
    </slot>

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ isEdit ? 'Edit Room Type' : 'Add Room Type' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="e.g. Double Room" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description" required>
          <UTextarea
            v-model="state.description"
            placeholder="Briefly describe this room type"
            :rows="3"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Capacity (Beds)" name="capacity" required>
            <UInput v-model.number="state.capacity" type="number" min="1" :disabled="isLoading" class="w-full" />
          </UFormField>

          <UFormField label="Price per Term" name="price" required>
            <UInput v-model.number="state.price" type="number" min="0" :disabled="isLoading" class="w-full">
              <template #leading>
                <span class="text-xs text-muted">Le</span>
              </template>
            </UInput>
          </UFormField>
        </div>
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
