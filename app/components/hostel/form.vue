<script setup lang="ts">
import * as yup from 'yup'

const { record } = defineProps<{ record?: Hostel }>()

const store = useHostelStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!record)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

function defaultState() {
  return {
    name: record?.name || '',
    type: record?.type || '' as HostelType | '',
    capacity: record?.capacity ?? 1,
    rooms: record?.rooms ?? 1,
    supervisor: record?.supervisor || ''
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  name: yup.string().trim().required('Hostel name is required'),
  type: yup.mixed<HostelType>().oneOf(hostelTypeOptions.map(o => o.value), 'Type is required').required('Type is required'),
  capacity: yup.number().typeError('Capacity must be a number').required('Capacity is required').min(1, 'Capacity must be at least 1'),
  rooms: yup.number().typeError('Room count must be a number').required('Room count is required').min(1, 'Must have at least 1 room'),
  supervisor: yup.string().trim().required('Supervisor is required')
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    const payload = {
      name: state.name.trim(),
      type: state.type as HostelType,
      capacity: state.capacity,
      rooms: state.rooms,
      supervisor: state.supervisor.trim()
    }

    if (isEdit.value && record) {
      store.updateHostel({ id: record.id, ...payload })
      toastSuccess('Hostel updated successfully')
    } else {
      store.createHostel(payload)
      toastSuccess('Hostel added successfully')
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
      <UButton v-else color="primary" label="Add Hostel" :icon="ADD_ICON" @click="open = true" />
    </slot>

    <template #header>
      <div class="flex w-full items-center justify-between gap-3">
        <p class="text-lg font-semibold">
          {{ isEdit ? 'Edit Hostel' : 'Add Hostel' }}
        </p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField required label="Name" name="name">
          <UInput v-model="state.name" placeholder="e.g. Main Hostel" :disabled="isLoading" class="w-full">
            <template #leading>
              <UIcon :name="HOSTEL_ICON" class="text-muted" />
            </template>
          </UInput>
        </UFormField>

        <UFormField required label="Type" name="type">
          <USelectMenu
            v-model="state.type"
            value-key="value"
            :items="hostelTypeOptions"
            placeholder="Select hostel type"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField required label="Capacity (Beds)" name="capacity">
            <UInput v-model.number="state.capacity" type="number" :min="1" placeholder="e.g. 120" :disabled="isLoading" class="w-full" />
          </UFormField>

          <UFormField required label="Rooms" name="rooms">
            <UInput v-model.number="state.rooms" type="number" :min="1" placeholder="e.g. 32" :disabled="isLoading" class="w-full" />
          </UFormField>
        </div>

        <UFormField required label="Supervisor" name="supervisor">
          <UInput v-model="state.supervisor" placeholder="e.g. Mr. Kamara" :disabled="isLoading" class="w-full">
            <template #leading>
              <UIcon name="i-lucide-user-round" class="text-muted" />
            </template>
          </UInput>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-3">
        <UButton :icon="SAVE_ICON" label="Save" :loading="isLoading" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
