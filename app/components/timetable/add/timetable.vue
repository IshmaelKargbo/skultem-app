<template>
  <UModal v-model:open="subjectModal" :ui="{ footer: 'justify-end' }">
    <template #header>
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p v-if="isOption" class="text-xs text-muted">
          Students split in this period and go to the subject they take.
        </p>
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" @submit.prevent="save" class="space-y-4">
        <!-- The other options already in this period -->
        <div v-if="others.length" class="rounded-xl border border-default bg-elevated/50 p-3">
          <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
            <UIcon name="i-lucide-split" class="size-3.5 text-primary" />
            {{ isEdit ? 'Other options in this period' : 'Already in this period' }}
          </p>
          <ul class="space-y-1.5">
            <li v-for="entry in others" :key="entry.id" class="flex items-center gap-2 text-sm">
              <span class="h-5 w-1 shrink-0 rounded-full border" :class="entry.color" />
              <span class="font-medium text-highlighted">{{ entry.subject }}</span>
              <span class="truncate text-xs text-muted">{{ entry.teacher || '—' }} · {{ entry.room || '—' }}</span>
            </li>
          </ul>
        </div>

        <!-- A Library period takes the whole period, so it's only offered when nothing else is in the slot. -->
        <UFormField v-if="!isOption" label="This period is">
          <div class="grid grid-cols-2 gap-2">
            <button v-for="k in kinds" :key="k.value" type="button"
              class="flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors"
              :class="state.kind === k.value ? 'border-primary bg-primary/5 text-highlighted' : 'border-default text-muted hover:border-primary/50'"
              @click="() => { state.kind = k.value }">
              <UIcon :name="k.icon" class="size-4 shrink-0" :class="state.kind === k.value ? 'text-primary' : ''" />
              <span>
                <span class="block font-medium">{{ k.label }}</span>
                <span class="block text-xs text-muted">{{ k.hint }}</span>
              </span>
            </button>
          </div>
        </UFormField>

        <UAlert v-if="state.kind === 'LIBRARY'" color="neutral" variant="soft" :icon="LIBRARY_ICON"
          title="The whole class goes to the library"
          description="The librarian sees this period every week under Library → Attendance → Class Sessions and takes the register. No teacher is needed." />

        <UFormField v-if="state.kind === 'SUBJECT'" label="Subject" name="subject" required>
          <USelectMenu v-model="state.subject" :items="subjectItems" value-key="value" label-key="label"
            placeholder="Select a subject" class="w-full" />
        </UFormField>

        <UFormField label="Room" name="room" required
          :help="others.length ? 'Pick where this group meets. Rooms already used in this period are marked.' : undefined">
          <USelectMenu v-model="state.room" :items="roomItems" value-key="value" label-key="label"
            placeholder="Select a room" class="w-full">
            <template #empty>
              <p class="p-2 text-sm text-muted">No rooms yet. Add rooms under Timetable → Settings.</p>
            </template>
          </USelectMenu>
        </UFormField>

        <UAlert v-if="roomClash" color="warning" variant="soft" icon="i-lucide-triangle-alert"
          :title="`${roomClash.room} is also used by ${roomClash.subject} in this period`"
          description="Both groups will be in the same room at the same time. Pick another room if they shouldn't share." />

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
      <UButton v-if="isEdit" class="mr-auto" :label="others.length ? 'Remove option' : state.kind === 'LIBRARY' ? 'Remove Library period' : 'Remove subject'"
        color="error" variant="ghost" :icon="DELETE_ICON" :loading="removing" :disabled="loading"
        @click="remove" />

      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />

      <UButton
        :loading="loading"
        :disabled="removing"
        :label="isEdit ? 'Save Changes' : isOption ? 'Add Option' : state.kind === 'LIBRARY' ? 'Add Library Period' : 'Add Subject'"
        color="primary"
        @click="formRef?.submit?.()"
      />
    </template>
  </UModal>
</template>
<script setup lang="ts">
import * as yup from 'yup'
interface TimetableForm {
  kind: TimetableKind
  subject: string
  room: string
  color: string
}

const kinds: { value: TimetableKind, label: string, hint: string, icon: string }[] = [
  { value: 'SUBJECT', label: 'A lesson', hint: 'Taught by the subject teacher', icon: BOOK_ICON },
  { value: 'LIBRARY', label: 'Library period', hint: 'Run by the librarian', icon: LIBRARY_ICON }
]

const loading = ref(false)
const props = defineProps<{
  open: boolean, period: string | undefined, day: string | undefined, index: string | undefined, state?: {
    id?: string,
    kind?: TimetableKind,
    roomId: string,
    subjectId: string,
    color: string
  },
  // Every subject already in this period/day slot
  slot?: Timetable[]
}>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const isEdit = computed(() => !!props.state?.id)
const removing = ref(false)

// The slot's other entries - what this one sits beside as an option.
const others = computed(() => (props.slot ?? []).filter(t => t.id !== props.state?.id))
const isOption = computed(() => others.value.length > 0)

const title = computed(() => {
  if (isEdit.value) return isOption.value ? 'Edit Option' : state.kind === 'LIBRARY' ? 'Edit Library Period' : 'Edit Subject'
  return isOption.value ? 'Add Option' : 'Add to Timetable'
})

const subjectModal = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const subjectStore = useTeacherSubjectStore()
const { list } = storeToRefs(subjectStore)

const store = useTimetableStore()
const { listRooms } = storeToRefs(store)

const formRef = ref()

// Options run at the same time, so the same subject or room can't appear twice in one period.
const subjectItems = computed(() => {
  const taken = new Set(others.value.map(t => t.subjectId))
  return list.value.filter((item: any) => !taken.has(item.value))
})
// Every room stays selectable (a school may have only one); rooms another option already uses are marked.
const roomItems = computed(() => {
  const usedBy = new Map(others.value.map(t => [t.roomId, t.subject]))
  return listRooms.value.map((item: any) => usedBy.has(item.value)
    ? { ...item, label: `${item.label} · used by ${usedBy.get(item.value)}` }
    : item)
})

const roomClash = computed(() => others.value.find(t => t.roomId && t.roomId === state.room))

const schema = yup.object({
  // A Library period has no subject.
  subject: yup.string().when('kind', {
    is: 'SUBJECT',
    then: s => s.required('Subject is required'),
    otherwise: s => s.notRequired()
  }),
  room: yup.string().required('Room is required')
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

const defaultColor = colorOptions[colorOptions.length - 1]!.value

const state = reactive<TimetableForm>({
  kind: 'SUBJECT',
  subject: '',
  room: '',
  color: defaultColor,
})

async function save() {
  if (!props.index) return
  try {
    loading.value = true
    const saved = await store.setTimetable({
      period: props.period || '',
      kind: state.kind,
      subject: state.kind === 'LIBRARY' ? '' : state.subject,
      day: props.day || '',
      room: state.room,
      color: state.color,
      entry: props.state?.id || undefined
    }, props.index)
    if (saved) close()
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    loading.value = false
  }
}

function syncState(value?: { kind?: TimetableKind; roomId: string; subjectId: string; color: string }) {
  state.kind = value?.kind === 'LIBRARY' ? 'LIBRARY' : 'SUBJECT'
  state.subject = value?.subjectId || ''
  state.room = value?.roomId || ''
  state.color = value?.color || defaultColor
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      syncState(props.state)
    }
  },
  { immediate: true }
)

watch(
  () => props.state,
  (value) => {
    if (props.open) {
      syncState(value)
    }
  },
  { deep: true }
)

async function remove() {
  if (!props.state?.id || !props.period || props.index === undefined) return
  try {
    removing.value = true
    await store.removeTimetableEntry(props.period, props.index, props.state.id)
    close()
  } catch (error: any) {
    useNotify().error(error)
  } finally {
    removing.value = false
  }
}

const close = () => {
  subjectModal.value = false
  syncState()
}
</script>
