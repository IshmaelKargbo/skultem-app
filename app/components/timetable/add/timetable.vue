<template>
  <UModal v-model:open="subjectModal" :ui="{ footer: 'justify-end' }">
    <template #header>
      <h3 class="text-lg font-semibold">{{ isEdit ? 'Edit Subject' : 'Add Subject' }}</h3>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" @submit.prevent="save" class="space-y-4">
        <UFormField label="Subject" name="subject" required>
          <USelectMenu v-model="state.subject" :items="list" value-key="value" label-key="label"
            placeholder="Select a subject" class="w-full" />
        </UFormField>

        <UFormField label="Room" name="room" required>
          <USelectMenu v-model="state.room" :items="listRooms" value-key="value" label-key="label"
            placeholder="Select a room" class="w-full" />
        </UFormField>

        <UFormField label="Color">
          <div class="flex flex-wrap gap-2">
            <button v-for="color in colorOptions" :key="color.value" type="button"
              class="size-8 rounded-full border-2 transition-transform" :class="[
                color.swatch,
                state.color === color.value
                  ? 'border-primary scale-110'
                  : 'border-transparent'
              ]" @click="state.color = color.value" />
          </div>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />

      <UButton :loading="loading" :label="isEdit ? 'Edit Subject' : 'Add Subject'" color="primary"
        @click="formRef?.submit?.()" />
    </template>
  </UModal>
</template>
<script setup lang="ts">
import * as yup from 'yup'
interface TimetableForm {
  subject: string
  room: string
  color: string
}

const loading = ref(false)
const props = defineProps<{
  open: boolean, period: string | undefined, day: string | undefined, index: string | undefined, state?: {
    roomId: string,
    subjectId: string,
    color: string
  }
}>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const isEdit = computed(() => props.state?.subjectId ? true : false)

const subjectModal = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const subjectStore = useTeacherSubjectStore()
const { list } = storeToRefs(subjectStore)

const store = useTimetableStore()
const { listRooms } = storeToRefs(store)

const formRef = ref()

const schema = yup.object({
  subject: yup.string().required('Subject is required'),
  room: yup.string().required('Room is required')
})

const state = reactive<TimetableForm>({
  subject: props.state?.subjectId || '',
  room: props.state?.roomId || '',
  color: props.state?.color || ''
})

const colorOptions = [
  { value: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900', swatch: 'bg-blue-200 dark:bg-blue-900' },
  { value: 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900', swatch: 'bg-green-200 dark:bg-green-900' },
  { value: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900', swatch: 'bg-purple-200 dark:bg-purple-900' },
  { value: 'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900', swatch: 'bg-orange-200 dark:bg-orange-900' },
  { value: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900', swatch: 'bg-cyan-200 dark:bg-cyan-900' },
  { value: 'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900', swatch: 'bg-pink-200 dark:bg-pink-900' },
  { value: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900', swatch: 'bg-yellow-200 dark:bg-yellow-900' },
  { value: 'bg-primary/5 border-primary/20', swatch: 'bg-primary/30' }
]

async function save() {
  if (!props.index) return
  try {
    loading.value = true
    await store.setTimetable({
      period: props.period || '',
      subject: state.subject,
      day: props.day || '',
      room: state.room,
      color: state.color
    }, props.index)
    close()
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    loading.value = false
  }
}

watch(() => props.state, (value) => {
  if (!value) return

  state.subject = value.subjectId
  state.color = value.color
  state.room = value.roomId

}, { immediate: true })

const close = () => {
  subjectModal.value = false
  Object.keys(state).forEach((key) => (state[key as keyof TimetableForm] = ''))
}
</script>