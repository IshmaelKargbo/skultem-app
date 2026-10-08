<template>
  <USlideover v-model:open="open" :dismissible="false">
    <!-- Trigger -->
    <UButton v-if="!house" color="primary" label="Add House" icon="prime:plus" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-lg font-semibold">{{ house ? 'Edit House' : 'Create House' }}</h2>

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
        <UButton icon="lucide:save" :label="house ? 'Save Changes' : 'Create House'" :loading="isLoading" @click="formRef?.submit()" />

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

const props = defineProps<{ house?: House }>()
const emit = defineEmits<{ saved: [] }>()

// With a `house` this edits it and is opened by the parent (v-model:open); without one it's the
// "Add House" button + create form.
const open = defineModel<boolean>('open', { default: false })
const isLoading = ref(false)
const formRef = ref()

const teachers = computed(() =>
  records.value.map((teacher) => ({
    label: teacherLabel(teacher),
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

watch(open, (value) => {
  if (value && props.house) {
    Object.assign(state, {
      name: props.house.name,
      motto: props.house.motto,
      color: props.house.color,
      masters: props.house.houseMasters.map(m => m.id)
    })
  }
})

function close() {
  open.value = false
  resetForm()
}

async function onSubmit(event: { data: HouseForm }) {
  try {
    isLoading.value = true

    if (props.house) {
      await store.update(props.house.id, { ...state })
      toastSuccess('House updated successfully')
    } else {
      await store.create(state)
      toastSuccess('House created successfully')
    }
    store.fetchAll(1, runtimeConf().limit)
    emit('saved')

    close()
  } catch (error: any) {
    toastError(error?.message || (props.house ? 'Failed to update house' : 'Failed to create house'))
  } finally {
    isLoading.value = false
  }
}

async function fetchTeachers() {
  await teacherStore.fetchAll(0, 0)
}

onMounted(fetchTeachers)
</script>