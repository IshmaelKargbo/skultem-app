<template>
  <USlideover v-model:open="open" :dismissible="false">
    <!-- Trigger -->
    <UButton color="primary" label="Add House" icon="prime:plus" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-lg font-semibold">Create House</h2>

        <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <!-- House Name -->
        <UFormField label="House Name" name="name" required>
          <UInput v-model="state.name" placeholder="Example: Red House" :disabled="isLoading" />

          <template #help>
            Name of the athletic house students will belong to.
          </template>
        </UFormField>

        <!-- House Masters -->
        <UFormField label="House Masters" name="masters" required>
          <USelectMenu v-model="state.masters" multiple :items="teachers" value-key="value" :disabled="isLoading"
            placeholder="Select teachers" />

          <template #help>
            Select one or more teachers responsible for managing this house.
          </template>
        </UFormField>

        <!-- Motto -->
        <UFormField label="House Motto" name="motto" required>
          <UTextarea v-model="state.motto" placeholder="Example: Unity, Strength and Excellence" :rows="3"
            :disabled="isLoading" />

          <template #help>
            A short slogan or motto representing the spirit of the house.
          </template>
        </UFormField>

        <UFormField label="House Color" name="color" required>
          <div class="space-y-4">
            <!-- HEX Input (single source of truth) -->
            <UInput v-model="state.color" placeholder="#009865" :disabled="isLoading" />

            <!-- Color Picker synced with same value -->
            <UColorPicker v-model="state.color" :throttle="100" />

            <!-- Preview -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg border" :style="{ backgroundColor: state.color }" />

              <span class="text-sm text-muted">
                {{ state.color }}
              </span>
            </div>
          </div>

          <template #help>
            Enter a HEX color or pick one visually. Both stay synchronized.
          </template>
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton icon="lucide:save" label="Create House" :loading="isLoading" @click="formRef?.submit()" />

        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const store = useHouseStore()
const teacherStore = useTeacherStore()

const { records } = storeToRefs(teacherStore)
const { success: toastSuccess, error: toastError } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const teachers = computed(() =>
  records.value.map((teacher) => ({
    label: `${teacher.user.givenNames} ${teacher.user.familyName}`,
    value: teacher.id
  }))
)

type HouseForm = {
  name: string
  motto: string
  color: string
  masters: string[]
}

const initialState: HouseForm = {
  name: '',
  motto: '',
  color: '#ff0000',
  masters: []
}

const state = reactive<HouseForm>({
  ...initialState
})

const schema = yup.object({
  name: yup
    .string()
    .required('House name is required'),

  motto: yup
    .string()
    .required('House motto is required'),

  color: yup
    .string()
    .required('House color is required'),

  masters: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one house master is required')
    .required()
})

function resetForm() {
  Object.assign(state, initialState)
}

function close() {
  open.value = false
  resetForm()
}

async function onSubmit(event: { data: HouseForm }) {
  try {
    isLoading.value = true

    await store.create(state)
    store.fetchAll(1, runtimeConf().limit)

    toastSuccess('House created successfully')

    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to create house')
  } finally {
    isLoading.value = false
  }
}

async function fetchTeachers() {
  await teacherStore.fetchAll(0, 0)
}

onMounted(fetchTeachers)
</script>