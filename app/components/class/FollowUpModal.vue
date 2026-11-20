<script setup lang="ts">
// One flagged student: why they're flagged, what to do, who to contact, what's been done so far - and a form to
// record what was done now. The same follow-up log the mobile app uses.
const props = defineProps<{
  classId: string
  student: { id: string, name: string, photo?: string | null, admissionNumber?: string | null } | null
  attention?: StudentAttention
  history: FollowUp[]
  guardian?: { name: string, phone: string }
  passMark?: number | null
  attendanceExpected?: number | null
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ recorded: [FollowUp] }>()
const { success, error: toastError } = useNotify()

const action = ref<FollowUpAction | null>(null)
const note = ref('')
const resolved = ref(false)
const saving = ref(false)

watch(open, (v) => {
  if (v) {
    action.value = null
    note.value = ''
    resolved.value = false
  }
})

const reasons = computed(() => props.attention
  ? attentionReasons(props.attention, { attendanceExpected: props.attendanceExpected, passMark: props.passMark })
  : [])
const nextStep = computed(() => props.attention ? attentionNextStep(props.attention) : '')
const status = computed(() => followUpStatus(props.attention, props.history[0]))
const ready = computed(() => !!action.value && (action.value !== 'OTHER' || !!note.value.trim()))
const levelColor = computed(() => props.attention?.severity === 'CRITICAL' ? 'error'
  : props.attention?.severity === 'WATCH' ? 'neutral' : 'warning')

async function save() {
  if (!props.student || !action.value) return
  saving.value = true
  try {
    const f = await FollowUpApi().record(props.classId, {
      studentId: props.student.id,
      action: action.value,
      note: note.value.trim() || null,
      resolved: resolved.value
    })
    success(`Follow-up recorded for ${props.student.name}`)
    emit('recorded', f)
    open.value = false
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'Couldn\'t record the follow-up')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="student ? `Follow up · ${student.name}` : 'Follow up'"
    :description="student?.admissionNumber || undefined">
    <template #body>
      <div v-if="student" class="space-y-5 text-sm">
        <div v-if="attention" class="space-y-3 rounded-xl p-4"
          :class="levelColor === 'error' ? 'bg-error/10' : levelColor === 'warning' ? 'bg-warning/10' : 'bg-elevated/60'">
          <UBadge :color="levelColor" variant="solid" size="sm">{{ ATTENTION_LEVEL_LABEL[attention.severity] }}</UBadge>
          <div>
            <p class="font-semibold text-highlighted">Why</p>
            <ul class="mt-1 list-disc space-y-0.5 pl-5 text-default">
              <li v-for="r in reasons" :key="r">{{ r }}</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-highlighted">What to do</p>
            <p class="mt-0.5 text-default">{{ nextStep }}</p>
          </div>
        </div>

        <div v-if="guardian?.name" class="flex items-center gap-3 rounded-xl border border-default p-3">
          <UIcon name="i-lucide-user-round" class="size-5 text-muted" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-highlighted">{{ guardian.name }}</p>
            <p class="text-xs text-muted">{{ guardian.phone || 'No phone number on record' }}</p>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <p class="font-semibold text-highlighted">Follow-ups</p>
            <UBadge :color="status.color" variant="subtle" size="sm" :icon="status.icon">{{ status.text }}</UBadge>
          </div>
          <div v-if="history.length" class="mt-2 space-y-2">
            <div v-for="f in history.slice(0, 5)" :key="f.id" class="rounded-lg border border-default p-2.5">
              <p class="font-medium text-highlighted">
                {{ followUpActionLabel(f.action) }}<span v-if="f.resolved" class="text-success"> · resolved</span>
              </p>
              <p v-if="f.note" class="mt-0.5 text-default">{{ f.note }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ whenSaid(f.createdAt) }}<template v-if="f.recordedBy"> · {{ f.recordedBy }}</template></p>
            </div>
          </div>
          <p v-else class="mt-1 text-xs text-muted">Nothing recorded yet.</p>
        </div>

        <div class="space-y-3 border-t border-default pt-4">
          <p class="font-semibold text-highlighted">What did you do?</p>
          <div class="flex flex-wrap gap-2">
            <UButton v-for="a in FOLLOW_UP_ACTIONS" :key="a.value" size="sm" :label="a.label"
              :color="action === a.value ? 'primary' : 'neutral'" :variant="action === a.value ? 'solid' : 'outline'"
              @click="() => { action = a.value }" />
          </div>
          <UFormField :label="action === 'OTHER' ? 'What happened (needed)' : 'What happened (optional)'">
            <UTextarea v-model="note" :rows="2" autoresize :maxlength="1000" class="w-full"
              placeholder="e.g. Mother says he was sick; back on Monday" />
          </UFormField>
          <USwitch v-model="resolved" label="This is resolved" description="Nothing more to do for now" />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full gap-2">
        <UButton class="flex-1 justify-center" label="Cancel" color="neutral" variant="soft" :disabled="saving"
          @click="() => { open = false }" />
        <UButton class="flex-1 justify-center" label="Save follow-up" icon="i-lucide-check" :loading="saving"
          :disabled="!ready" @click="save" />
      </div>
    </template>
  </UModal>
</template>
