<script setup lang="ts">
// Ends a visit with an outcome (docs/HEALTH_CARE.md §5.3), or - with `followUp` - closes one nobody closed before
// the school day ended: then a reason is required and no departure time is recorded (§5.4). Sent home needs who
// collected the student; referred needs where to. Whether parents are told follows the school's settings (§6.5).
const props = defineProps<{ visit: HealthCareVisit, followUp?: boolean }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ closed: [visit: HealthCareVisit] }>()

const { settings, loadSettings } = useHealthCare()
const { success: toastSuccess, error: toastError, warning: toastWarning } = useNotify()

const saving = ref(false)
const outcome = ref<HealthCareOutcome>('RETURNED_TO_CLASS')
const leftAt = ref('')
const treatment = ref('')
const collectedBy = ref('')
const collectedByRelation = ref('')
const referredTo = ref('')
const ambulanceCalled = ref(false)
const accompaniedBy = ref('')
const notes = ref('')
const notifyParents = ref(false)
const reason = ref('')

watch(open, async (isOpen) => {
  if (!isOpen) return
  outcome.value = 'RETURNED_TO_CLASS'
  leftAt.value = ''
  treatment.value = props.visit.treatment ?? ''
  collectedBy.value = ''
  collectedByRelation.value = ''
  referredTo.value = ''
  ambulanceCalled.value = false
  accompaniedBy.value = ''
  notes.value = ''
  notifyParents.value = false
  reason.value = ''
  loadSettings().catch(() => { })
})

const autoNotify = computed(() => settings.value?.notifyOutcomes.includes(outcome.value) ?? false)
const canChooseNotify = computed(() => !props.followUp && !autoNotify.value && !!settings.value?.allowManualNotify)

const missing = computed(() => {
  if (props.followUp && !reason.value.trim()) return 'Give a reason'
  if (!props.followUp && settings.value?.requireTreatment && !treatment.value.trim()) return 'Record the treatment given'
  if (outcome.value === 'SENT_HOME' && (!collectedBy.value.trim() || !collectedByRelation.value.trim()))
    return 'Record who collected the student'
  if (outcome.value === 'REFERRED' && !referredTo.value.trim()) return 'Record where the student was referred'
  if (!props.followUp && outcome.value === 'RETURNED_TO_CLASS' && settings.value?.requireNotesOnReturn
    && !notes.value.trim() && !props.visit.notes) return 'Add a note'
  return ''
})

async function save() {
  if (missing.value) return
  saving.value = true
  const body: HealthCareCloseBody = {
    outcome: outcome.value,
    leftAt: props.followUp ? null : fromLocalInput(leftAt.value),
    treatment: treatment.value || null,
    collectedBy: collectedBy.value || null,
    collectedByRelation: collectedByRelation.value || null,
    referredTo: referredTo.value || null,
    ambulanceCalled: ambulanceCalled.value,
    accompaniedBy: accompaniedBy.value || null,
    notes: notes.value || null,
    notifyParents: notifyParents.value
  }
  try {
    const res = props.followUp
      ? await HealthCareApi().followUp(props.visit.id, { ...body, reason: reason.value })
      : await HealthCareApi().close(props.visit.id, body)
    if (res.notifyProblem === 'NONE') toastWarning('Visit closed. No parent could be notified in the app - contact them directly.')
    else if (res.notifyProblem === 'FAILED') toastWarning('Visit closed, but some parents could not be notified. Try "Notify parents" again.')
    else toastSuccess(res.parentNotifications.length ? 'Visit closed and parents notified' : 'Visit closed')
    open.value = false
    emit('closed', res)
  } catch (err: any) {
    toastError(err?.message || 'Failed to close the visit')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :dismissible="!saving">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ props.followUp ? 'Follow Up Visit' : 'Close Visit' }}</h3>
          <p class="mt-1 text-sm text-muted">
            {{ props.visit.studentName }} · in since {{ formatDateTime(props.visit.arrivedAt) }}
          </p>
        </template>

        <div class="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <UAlert v-if="props.followUp" color="warning" variant="soft" icon="i-lucide-info"
            description="The school day is over and this visit was never closed. Record what happened - no departure time is entered." />

          <UFormField label="How did the visit end?" required>
            <URadioGroup v-model="outcome" :items="outcomeOptions" orientation="horizontal" />
          </UFormField>

          <div v-if="outcome === 'SENT_HOME'" class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Collected by" required>
              <UInput v-model="collectedBy" :maxlength="255" placeholder="e.g. Fatmata Kamara" class="w-full" />
            </UFormField>
            <UFormField label="Relationship" required>
              <UInput v-model="collectedByRelation" :maxlength="255" placeholder="e.g. Mother" class="w-full" />
            </UFormField>
          </div>

          <template v-if="outcome === 'REFERRED'">
            <UFormField label="Referred to" required>
              <UInput v-model="referredTo" :maxlength="255" placeholder="e.g. Connaught Hospital" class="w-full" />
            </UFormField>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Accompanied by">
                <UInput v-model="accompaniedBy" :maxlength="255" placeholder="e.g. School nurse" class="w-full" />
              </UFormField>
              <UFormField label="Ambulance">
                <UCheckbox v-model="ambulanceCalled" label="An ambulance was called" class="mt-2" />
              </UFormField>
            </div>
          </template>

          <UFormField label="Treatment given" :required="!props.followUp && settings?.requireTreatment">
            <UTextarea v-model="treatment" :rows="2" :maxlength="2000" placeholder="e.g. Rested, given water"
              class="w-full" />
          </UFormField>

          <UFormField v-if="props.followUp" label="Reason" required description="What happened, and why the visit wasn't closed at the time.">
            <UTextarea v-model="reason" :rows="2" :maxlength="500" placeholder="e.g. Left at the bell with their class" class="w-full" />
          </UFormField>
          <template v-else>
            <UFormField label="Left at" description="Leave empty for now.">
              <UInput v-model="leftAt" type="datetime-local" :min="toLocalInput(props.visit.arrivedAt)"
                :max="toLocalInput(new Date().toISOString())" class="w-full" />
            </UFormField>
            <UFormField label="Notes" :required="outcome === 'RETURNED_TO_CLASS' && settings?.requireNotesOnReturn && !props.visit.notes">
              <UTextarea v-model="notes" :rows="2" :maxlength="2000" class="w-full" />
            </UFormField>
          </template>

          <p v-if="autoNotify" class="flex items-center gap-2 text-sm text-muted">
            <UIcon :name="BELL_ICON" class="size-4" /> The student's parents will be notified.
          </p>
          <UCheckbox v-else-if="canChooseNotify" v-model="notifyParents" label="Notify the student's parents" />
        </div>

        <template #footer>
          <div class="flex flex-wrap items-center justify-end gap-3">
            <span v-if="missing" class="mr-auto text-xs text-muted">{{ missing }}</span>
            <UButton label="Back" variant="outline" color="neutral" :disabled="saving" @click="() => { open = false }" />
            <UButton label="Close Visit" :color="props.followUp ? 'warning' : 'primary'"
              :loading="saving" :disabled="!!missing" @click="save" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
