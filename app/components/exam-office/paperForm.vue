<template>
  <USlideover :dismissible="false" :open="open" @update:open="(value) => emit('update:open', value)">
    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ record ? 'Edit Paper' : 'Add Paper' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="w-full space-y-4" @submit="onSubmit">
        <UFormField required label="Class" name="classId">
          <USelectMenu v-model="state.classId" :items="classOptions" value-key="value" label-key="label"
            placeholder="Choose a class" class="w-full" :disabled="saving" />
        </UFormField>

        <div class="grid grid-cols-3 gap-3">
          <UFormField required label="Subject" name="subjectId" class="col-span-2">
            <USelectMenu v-model="state.subjectId" :items="subjectOptions" value-key="value" label-key="label"
              placeholder="Choose a subject" class="w-full" :disabled="saving" />
          </UFormField>
          <UFormField label="Paper" name="paper">
            <UInput v-model="state.paper" placeholder="e.g. Paper 1" class="w-full" :disabled="saving" />
          </UFormField>
        </div>

        <UFormField required label="Date" name="examDate" :help="termHint">
          <UInput v-model="state.examDate" type="date" :min="term?.startDate" :max="term?.endDate" class="w-full"
            :disabled="saving" />
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField required label="Starts" name="startTime">
            <UInput v-model="state.startTime" type="time" class="w-full" :disabled="saving" />
          </UFormField>
          <UFormField required label="Ends" name="endTime">
            <UInput v-model="state.endTime" type="time" class="w-full" :disabled="saving" />
          </UFormField>
        </div>

        <UFormField label="Venue" name="venue">
          <UInput v-model="state.venue" placeholder="e.g. Main Hall" class="w-full" :disabled="saving" />
        </UFormField>

        <UFormField label="Invigilator" name="invigilatorId"
          help="We'll stop you if they're already invigilating at that time.">
          <USelectMenu v-model="state.invigilatorId" :items="teacherOptions" value-key="value" label-key="label"
            placeholder="No invigilator yet" class="w-full" :disabled="saving" />
        </UFormField>

        <UFormField label="Notes" name="notes">
          <UTextarea v-model="state.notes" placeholder="e.g. Bring a calculator" :rows="2" autoresize class="w-full"
            :disabled="saving" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="saving" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="close" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const { open, record, term, classOptions, subjectOptions, teacherOptions } = defineProps<{
  open: boolean
  record: ExamSchedule | null
  term: Term | null
  classOptions: { label: string, value: string }[]
  subjectOptions: { label: string, value: string }[]
  teacherOptions: { label: string, value: string }[]
}>()

const emit = defineEmits<{ 'update:open': [boolean], saved: [] }>()

const api = ExamOfficeApi()
const { error: toastError, success: toastSuccess } = useNotify()
const saving = ref(false)
const formRef = ref<any>(null)

const empty = () => ({
  classId: undefined as string | undefined,
  subjectId: undefined as string | undefined,
  paper: '',
  examDate: '',
  startTime: '09:00',
  endTime: '11:00',
  venue: '',
  invigilatorId: undefined as string | undefined,
  notes: '',
})
const state = reactive(empty())

const schema = yup.object({
  classId: yup.string().required('Choose a class'),
  subjectId: yup.string().required('Choose a subject'),
  examDate: yup.string().required('Choose the exam date'),
  startTime: yup.string().required('Choose a start time'),
  endTime: yup.string().required('Choose an end time')
    .test('after-start', 'Has to be after the start time', (value, ctx) => !value || !ctx.parent.startTime || value > ctx.parent.startTime),
})

const termHint = computed(() => term ? `${term.name}: ${formatDate(term.startDate)} – ${formatDate(term.endDate)}` : undefined)

watch(() => open, (isOpen) => {
  if (!isOpen) return
  Object.assign(state, empty(), record ? {
    classId: record.classId,
    subjectId: record.subjectId,
    paper: record.paper ?? '',
    examDate: record.examDate,
    startTime: examTime(record.startTime),
    endTime: examTime(record.endTime),
    venue: record.venue ?? '',
    invigilatorId: record.invigilatorId ?? undefined,
    notes: record.notes ?? '',
  } : {})
})

function close() {
  emit('update:open', false)
}

async function onSubmit() {
  if (!term) return
  saving.value = true
  const payload: SaveExamScheduleDto = {
    termId: term.id,
    classId: state.classId!,
    subjectId: state.subjectId!,
    paper: state.paper || undefined,
    examDate: state.examDate,
    startTime: state.startTime,
    endTime: state.endTime,
    venue: state.venue || undefined,
    invigilatorId: state.invigilatorId || undefined,
    notes: state.notes || undefined,
  }
  try {
    if (record) await api.updateSchedule(record.id, payload)
    else await api.createSchedule(payload)
    toastSuccess(record ? 'Paper updated' : 'Paper added')
    emit('saved')
    close()
  } catch (err: any) {
    toastError(err?.message || 'Could not save the paper')
  } finally {
    saving.value = false
  }
}
</script>
