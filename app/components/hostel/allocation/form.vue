<script setup lang="ts">
import * as yup from 'yup'

const store = useHostelStore()
const { success: toastSuccess, error: toastError } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const roomOptions = computed(() => store.listAvailableRooms)

function defaultState() {
  return {
    roomId: '',
    studentName: '',
    admissionNo: '',
    className: ''
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  roomId: yup.string().required('Select a room'),
  studentName: yup.string().required('Student name is required'),
  admissionNo: yup.string().required('Admission number is required'),
  className: yup.string().required('Class is required')
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    store.allocateStudent(state)
    toastSuccess('Student allocated successfully')
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
    <UButton color="primary" label="New Allocation" :icon="ALLOCATE_ICON" @click="open = true" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">Allocate Student</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Room" name="roomId" required>
          <USelectMenu v-model="state.roomId" value-key="value" :items="roomOptions" placeholder="Select an available room" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Student Name" name="studentName" required>
          <UInput v-model="state.studentName" placeholder="e.g. Amara Kamara" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Admission No." name="admissionNo" required>
          <UInput v-model="state.admissionNo" placeholder="e.g. STD-1042" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Class" name="className" required>
          <UInput v-model="state.className" placeholder="e.g. JSS 2A" :disabled="isLoading" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Allocate" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
