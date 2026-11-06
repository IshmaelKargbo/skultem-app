<template>
  <USlideover :dismissible="false" :open="open" @update:open="(value) => emit('update:open', value)">
    <template #header>
      <div class="flex w-full items-center justify-between">
        <div class="min-w-0">
          <p class="text-lg font-semibold">{{ record ? 'Timetable details' : 'Set up timetable' }}</p>
          <p class="truncate text-xs text-muted">{{ assessmentName }} · {{ term?.name }}</p>
        </div>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="w-full space-y-4" @submit="onSubmit">
        <UFormField required label="Title" name="title" help="Printed at the top of the timetable.">
          <UInput v-model="state.title" placeholder="e.g. First Term Examination" class="w-full" :disabled="saving" />
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="First day" name="startDate">
            <UInput v-model="state.startDate" type="date" :min="term?.startDate" :max="term?.endDate" class="w-full"
              :disabled="saving" />
          </UFormField>
          <UFormField label="Last day" name="endDate">
            <UInput v-model="state.endDate" type="date" :min="state.startDate || term?.startDate" :max="term?.endDate"
              class="w-full" :disabled="saving" />
          </UFormField>
        </div>
        <p class="-mt-2 text-xs text-muted">Papers can only be set on days inside this period.</p>

        <UFormField label="Instructions to candidates" name="instructions"
          help="Shown on the timetable and on every class printout.">
          <UTextarea v-model="state.instructions" :rows="6" autoresize class="w-full" :disabled="saving" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="saving" :label="record ? 'Save' : 'Set up timetable'"
          @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="close" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const { open, record, term, assessmentId, assessmentName } = defineProps<{
  open: boolean
  // null = setting up a new timetable for assessmentId
  record: ExamTimetable | null
  term: Term | null
  assessmentId: string | null
  assessmentName: string
}>()

const emit = defineEmits<{ 'update:open': [boolean], saved: [ExamTimetable] }>()

const api = ExamOfficeApi()
const { error: toastError, success: toastSuccess } = useNotify()
const saving = ref(false)
const formRef = ref<any>(null)

const state = reactive({ title: '', startDate: '', endDate: '', instructions: '' })

const schema = yup.object({
  title: yup.string().trim().required('Give the timetable a title').max(150),
  endDate: yup.string().test('after-start', 'Has to be on or after the first day',
    (value, ctx) => !value || !ctx.parent.startDate || value >= ctx.parent.startDate),
})

watch(() => open, (isOpen) => {
  if (!isOpen) return
  Object.assign(state, record
    ? {
        title: record.title,
        startDate: record.startDate ?? '',
        endDate: record.endDate ?? '',
        instructions: record.instructions ?? '',
      }
    : {
        // e.g. "First Term Exam"
        title: `${term?.name ?? ''} ${assessmentName}`.trim(),
        startDate: '',
        endDate: '',
        instructions: DEFAULT_EXAM_INSTRUCTIONS,
      })
})

function close() {
  emit('update:open', false)
}

async function onSubmit() {
  if (!term) return
  saving.value = true
  const payload: SaveExamTimetableDto = {
    termId: term.id,
    assessmentId: assessmentId ?? undefined,
    title: state.title.trim(),
    startDate: state.startDate || null,
    endDate: state.endDate || null,
    instructions: state.instructions || null,
  }
  try {
    const saved = record
      ? await api.updateTimetable(record.id, payload)
      : await api.createTimetable(payload)
    if (!saved) return
    toastSuccess(record ? 'Timetable updated' : 'Timetable set up. Now add its papers.')
    emit('saved', saved)
    close()
  } catch (err: any) {
    toastError(err?.message || 'Could not save the timetable')
  } finally {
    saving.value = false
  }
}
</script>
