<script setup lang="ts">
import * as yup from 'yup'

const { entry } = defineProps<{ entry?: CalendarEntry }>()

const store = useCommunicateStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!entry)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const typeOptions = [
  { label: 'Event', value: 'EVENT' },
  { label: 'Holiday', value: 'HOLIDAY' }
]

function defaultState() {
  return {
    title: entry?.title || '',
    description: entry?.description || '',
    type: entry?.type || 'EVENT',
    startDate: entry?.startDate ? entry.startDate.slice(0, 10) : '',
    endDate: entry?.endDate ? entry.endDate.slice(0, 10) : '',
    location: entry?.location || ''
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().required(),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required')
    .test('after-start', 'End date must be on or after start date', function (value) {
      if (!value || !this.parent.startDate) return true
      return new Date(value).getTime() >= new Date(this.parent.startDate).getTime()
    }),
  location: yup.string().optional()
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    const payload = {
      title: state.title,
      description: state.description,
      type: state.type as CalendarEntryType,
      startDate: new Date(state.startDate).toISOString(),
      endDate: new Date(state.endDate).toISOString(),
      location: state.location
    }

    if (isEdit.value && entry) {
      await store.updateEntry({ id: entry.id, ...payload })
      toastSuccess('Entry updated successfully')
    } else {
      await store.createEntry(payload)
      toastSuccess('Entry added successfully')
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
  <UModal :dismissible="false" v-model:open="open">
    <UButton
      v-if="isEdit"
      :icon="EDIT_ICON"
      size="xs"
      color="neutral"
      variant="ghost"
      @click="open = true"
    />
    <UButton v-else color="primary" label="Add Event / Holiday" :icon="ADD_ICON" @click="open = true" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ isEdit ? 'Edit Entry' : 'Add Event / Holiday' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
    <UForm
  ref="formRef"
  :schema="schema"
  :state="state"
  class="space-y-5"
  @submit="onSubmit"
>
  <!-- Type -->
  <UFormField
    label="Type"
    name="type"
    required
  >
    <USelectMenu
      v-model="state.type"
      value-key="value"
      :items="typeOptions"
      icon="i-lucide-calendar-check"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Title -->
  <UFormField
    label="Title"
    name="title"
    required
  >
    <UInput
      v-model="state.title"
      icon="i-lucide-text"
      placeholder="e.g. Independence Day"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Description -->
  <UFormField
    label="Description"
    name="description"
    required
  >
    <UTextarea
      v-model="state.description"
      :rows="3"
      placeholder="Add a description..."
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>

  <!-- Dates -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <UFormField
      label="Start Date"
      name="startDate"
      required
    >
      <UInput
        v-model="state.startDate"
        type="date"
        icon="i-lucide-calendar-days"
        :disabled="isLoading"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="End Date"
      name="endDate"
      required
    >
      <UInput
        v-model="state.endDate"
        type="date"
        icon="i-lucide-calendar-days"
        :disabled="isLoading"
        class="w-full"
      />
    </UFormField>
  </div>

  <!-- Location -->
  <UFormField
    v-if="state.type === 'EVENT'"
    label="Location"
    name="location"
    hint="Optional"
  >
    <UInput
      v-model="state.location"
      icon="i-lucide-map-pin"
      placeholder="e.g. Main Auditorium"
      :disabled="isLoading"
      class="w-full"
    />
  </UFormField>
</UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </UModal>
</template>
