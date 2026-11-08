<template>
  <USlideover :dismissible="false" :open="open" @update:open="(value) => emit('update:open', value)">
    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ record ? 'Edit Paper' : 'Add Paper' }}</p>
        <div class="flex items-center gap-1">
          <GuideButton v-if="open" guide="exam-paper-form" />
          <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
        </div>
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="w-full space-y-4" @submit="onSubmit">
        <div data-guide="paper-subject" class="grid grid-cols-3 gap-3">
          <UFormField required label="Subject" name="subjectId" class="col-span-2">
            <USelectMenu v-model="state.subjectId" :items="subjectOptions" value-key="value" label-key="label"
              placeholder="Choose a subject" class="w-full" :disabled="saving" />
          </UFormField>
          <UFormField label="Paper" name="paper">
            <UInputMenu v-model="state.paper" :items="EXAM_PAPER_NAMES" create-item placeholder="e.g. Paper 1"
              class="w-full" :disabled="saving" @create="(v: string) => { state.paper = v }" />
          </UFormField>
        </div>

        <UFormField data-guide="paper-classes" required label="Classes sitting this paper" name="classIds"
          help="Pick every class that sits it together, e.g. all of JSS 1 in the hall.">
          <USelectMenu v-model="state.classIds" multiple :items="classOptions" value-key="value" label-key="label"
            placeholder="Choose classes" class="w-full" :disabled="saving" />
          <div v-if="classOptions.length > 1" class="mt-1.5 flex gap-2">
            <UButton size="xs" variant="link" color="neutral" class="px-0" label="Select all" :disabled="saving"
              @click="() => { state.classIds = classOptions.map(c => c.value) }" />
            <UButton v-if="state.classIds.length" size="xs" variant="link" color="neutral" class="px-0" label="Clear"
              :disabled="saving" @click="() => { state.classIds = [] }" />
          </div>
        </UFormField>

        <div data-guide="paper-time" class="space-y-4">
        <UFormField required label="Date" name="examDate" :help="periodHint">
          <UInput v-model="state.examDate" type="date" :min="minDate" :max="maxDate" class="w-full"
            :disabled="saving" />
        </UFormField>

        <div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField required label="Starts" name="startTime">
              <UInput v-model="state.startTime" type="time" class="w-full" :disabled="saving" />
            </UFormField>
            <UFormField required label="Ends" name="endTime">
              <UInput v-model="state.endTime" type="time" class="w-full" :disabled="saving" />
            </UFormField>
          </div>
          <!-- The usual two sittings of an exam day. -->
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            <UButton v-for="s in sittings" :key="s.label" size="xs" variant="soft" color="neutral" :label="s.label"
              :disabled="saving" @click="() => { state.startTime = s.start; state.endTime = s.end }" />
            <span v-if="duration" class="self-center text-xs text-muted">{{ duration }}</span>
          </div>
        </div>
        </div>

        <div data-guide="paper-invigilators" class="space-y-4">
        <UFormField label="Venue" name="venue">
          <UInput v-model="state.venue" placeholder="e.g. Main Hall" class="w-full" :disabled="saving" />
        </UFormField>

        <UFormField label="Invigilators" name="invigilatorIds"
          help="We'll stop you if one of them is already invigilating at that time.">
          <USelectMenu v-model="state.invigilatorIds" multiple :items="teacherOptions" value-key="value"
            label-key="label" placeholder="No invigilator yet" class="w-full" :disabled="saving" />
        </UFormField>
        </div>

        <UFormField label="Notes" name="notes">
          <UTextarea v-model="state.notes" placeholder="e.g. Bring a calculator" :rows="2" autoresize class="w-full"
            :disabled="saving" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div data-guide="paper-save" class="flex flex-wrap gap-3">
        <UButton :icon="SAVE_ICON" :loading="saving" label="Save" @click="submit(false)" />
        <UButton v-if="!record" variant="soft" :disabled="saving" label="Save and add another"
          @click="submit(true)" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="close" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const { open, record, timetable, prefill, classOptions, subjectOptions, teacherOptions } = defineProps<{
  open: boolean
  record: ExamPaper | null
  timetable: ExamTimetable | null
  // A new paper can start with a subject and classes picked, e.g. from the missing-papers list.
  prefill?: { subjectId?: string, classIds?: string[] } | null
  classOptions: { label: string, value: string }[]
  subjectOptions: { label: string, value: string }[]
  teacherOptions: { label: string, value: string }[]
}>()

const emit = defineEmits<{ 'update:open': [boolean], saved: [ExamTimetable] }>()

const api = ExamOfficeApi()
const { error: toastError, success: toastSuccess } = useNotify()
const saving = ref(false)
const formRef = ref<any>(null)
const keepOpen = ref(false)

const sittings = [
  { label: 'Morning 9:00–11:00', start: '09:00', end: '11:00' },
  { label: 'Midday 11:30–13:30', start: '11:30', end: '13:30' },
  { label: 'Afternoon 14:00–16:00', start: '14:00', end: '16:00' },
]

const empty = () => ({
  subjectId: undefined as string | undefined,
  paper: '',
  classIds: [] as string[],
  examDate: '',
  startTime: '09:00',
  endTime: '11:00',
  venue: '',
  invigilatorIds: [] as string[],
  notes: '',
})
const state = reactive(empty())

const schema = yup.object({
  subjectId: yup.string().required('Choose a subject'),
  classIds: yup.array().min(1, 'Choose at least one class'),
  examDate: yup.string().required('Choose the exam date'),
  startTime: yup.string().required('Choose a start time'),
  endTime: yup.string().required('Choose an end time')
    .test('after-start', 'Has to be after the start time', (value, ctx) => !value || !ctx.parent.startTime || value > ctx.parent.startTime),
})

const minDate = computed(() => timetable?.startDate ?? timetable?.termStartDate)
const maxDate = computed(() => timetable?.endDate ?? timetable?.termEndDate)
const periodHint = computed(() => minDate.value && maxDate.value
  ? `${timetable?.startDate ? 'Exam period' : timetable?.termName}: ${formatDate(minDate.value)} – ${formatDate(maxDate.value)}`
  : undefined)

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function minutesBetween(start: string, end: string) {
  return toMinutes(end) - toMinutes(start)
}

// Capped at 23:59 so the time input stays valid.
function addMinutes(time: string, minutes: number) {
  const total = Math.min(toMinutes(time) + minutes, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const duration = computed(() => {
  if (!state.startTime || !state.endTime || state.endTime <= state.startTime) return ''
  const minutes = minutesBetween(state.startTime, state.endTime)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h ? `${h} hr` : ''}${h && m ? ' ' : ''}${m ? `${m} min` : ''}`
})

watch(() => open, (isOpen) => {
  if (!isOpen) return
  reset()
})

function reset(next?: Partial<ReturnType<typeof empty>>) {
  Object.assign(state, empty(), record
    ? {
        subjectId: record.subjectId,
        paper: record.paper ?? '',
        classIds: record.classes.map(c => c.id),
        examDate: record.examDate,
        startTime: examTime(record.startTime),
        endTime: examTime(record.endTime),
        venue: record.venue ?? '',
        invigilatorIds: record.invigilators.map(i => i.id),
        notes: record.notes ?? '',
      }
    : {
        subjectId: prefill?.subjectId,
        classIds: prefill?.classIds ?? (classOptions.length === 1 ? [classOptions[0]!.value] : []),
        examDate: minDate.value ?? '',
      }, next ?? {})
}

function close() {
  emit('update:open', false)
}

function submit(another: boolean) {
  keepOpen.value = another
  formRef.value?.submit()
}

async function onSubmit() {
  if (!timetable) return
  saving.value = true
  const payload: SaveExamPaperDto = {
    subjectId: state.subjectId!,
    paper: state.paper || undefined,
    examDate: state.examDate,
    startTime: state.startTime,
    endTime: state.endTime,
    classIds: state.classIds,
    invigilatorIds: state.invigilatorIds,
    venue: state.venue || undefined,
    notes: state.notes || undefined,
  }
  try {
    const saved = record
      ? await api.updatePaper(record.id, payload)
      : await api.addPaper(timetable.id, payload)
    if (!saved) return
    toastSuccess(record ? 'Paper updated' : 'Paper added')
    emit('saved', saved)
    if (keepOpen.value && !record) {
      // Same day, classes and venue - the next paper usually follows in the next sitting.
      reset({ examDate: state.examDate, classIds: state.classIds, venue: state.venue, startTime: state.endTime,
        endTime: addMinutes(state.endTime, minutesBetween(state.startTime, state.endTime)) })
    } else {
      close()
    }
  } catch (err: any) {
    toastError(err?.message || 'Could not save the paper')
  } finally {
    saving.value = false
  }
}
</script>
