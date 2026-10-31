<script setup lang="ts">
// One sick bay visit (docs/HEALTH_CARE.md §5). While open, the nurse updates the details and treatment, records
// medication and closes it. Afterwards it's locked: follow-up notes are added instead, parents can be notified by
// hand where the school allows, and a visit recorded by mistake is voided - kept, but no longer counted.
const props = defineProps<{ id: string }>()

const { canRecord, canSupervise } = useHealthCareAccess()
const { settings, loadSettings, complaintOptions, changed } = useHealthCare()
const { success: toastSuccess, error: toastError, warning: toastWarning } = useNotify()

const visit = ref<HealthCareVisit | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    visit.value = await HealthCareApi().visit(props.id)
    sync()
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the visit')
  } finally {
    loading.value = false
  }
}

function apply(v: HealthCareVisit) {
  visit.value = v
  sync()
  changed()
}

// Editable copy of an open visit's details.
const form = reactive({
  complaints: [] as string[],
  complaintOther: '',
  broughtBy: '',
  temperature: null as number | null,
  notes: '',
  treatment: ''
})
function sync() {
  const v = visit.value
  if (!v) return
  form.complaints = v.complaints.map(c => c.code)
  form.complaintOther = v.complaintOther ?? ''
  form.broughtBy = v.broughtBy ?? ''
  form.temperature = v.temperature
  form.notes = v.notes ?? ''
  form.treatment = v.treatment ?? ''
}

// Complaints already on the visit stay choosable even if the school has since hidden them.
const complaintItems = computed(() => {
  const items = [...complaintOptions.value]
  for (const c of visit.value?.complaints ?? []) {
    if (!items.some(i => i.value === c.code)) items.push({ label: c.label, value: c.code, urgent: c.urgent })
  }
  return items
})

const isOpen = computed(() => visit.value?.status === 'OPEN')
const editable = computed(() => isOpen.value && canRecord.value && !visit.value?.needsFollowUp)
const dirty = computed(() => {
  const v = visit.value
  if (!v) return false
  return form.complaints.join(',') !== v.complaints.map(c => c.code).join(',')
    || form.complaintOther !== (v.complaintOther ?? '') || form.broughtBy !== (v.broughtBy ?? '')
    || form.temperature !== v.temperature || form.notes !== (v.notes ?? '') || form.treatment !== (v.treatment ?? '')
})

const saving = ref(false)
async function saveDetails() {
  if (!visit.value) return
  saving.value = true
  try {
    apply(await HealthCareApi().update(visit.value.id, {
      complaints: form.complaints,
      complaintOther: form.complaintOther || null,
      broughtBy: form.broughtBy || null,
      temperature: form.temperature,
      notes: form.notes || null,
      treatment: form.treatment || null
    }))
    toastSuccess('Visit updated')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save the visit')
  } finally {
    saving.value = false
  }
}

const medicationOpen = ref(false)
const removingId = ref('')
async function removeMedication(m: HealthCareMedication) {
  if (!visit.value) return
  removingId.value = m.id
  try {
    apply(await HealthCareApi().removeMedication(visit.value.id, m.id))
  } catch (err: any) {
    toastError(err?.message || 'Failed to remove the line')
  } finally {
    removingId.value = ''
  }
}

const closeOpen = ref(false)
const followUpOpen = ref(false)
async function startClose() {
  // Unsaved changes to the treatment go with the closing; anything else is saved first.
  if (dirty.value) await saveDetails()
  closeOpen.value = true
}

const note = ref('')
const noting = ref(false)
async function addNote() {
  if (!visit.value || !note.value.trim()) return
  noting.value = true
  try {
    apply(await HealthCareApi().addNote(visit.value.id, note.value.trim()))
    note.value = ''
    toastSuccess('Note added')
  } catch (err: any) {
    toastError(err?.message || 'Failed to add the note')
  } finally {
    noting.value = false
  }
}

const voidOpen = ref(false)
const voiding = ref(false)
async function voidVisit(reason: string) {
  if (!visit.value) return
  voiding.value = true
  try {
    apply(await HealthCareApi().voidVisit(visit.value.id, reason))
    voidOpen.value = false
    toastSuccess('Visit voided')
  } catch (err: any) {
    toastError(err?.message || 'Failed to void the visit')
  } finally {
    voiding.value = false
  }
}

const notifying = ref(false)
async function notify() {
  if (!visit.value) return
  notifying.value = true
  try {
    const res = await HealthCareApi().notifyParents(visit.value.id)
    apply(res)
    if (res.notifyProblem === 'NONE') toastWarning('No parent could be notified in the app. Contact them directly.')
    else if (res.notifyProblem === 'FAILED') toastWarning('Some parents could not be notified. Try again or contact them directly.')
    else toastSuccess('Parents notified')
  } catch (err: any) {
    toastError(err?.message || 'Failed to notify the parents')
  } finally {
    notifying.value = false
  }
}

const badge = computed(() => visit.value ? visitBadge(visit.value) : null)

onMounted(() => {
  load()
  loadSettings().catch(() => { })
})
</script>

<template>
  <div v-if="loading && !visit" class="space-y-3">
    <USkeleton class="h-28 w-full rounded-xl" />
    <USkeleton class="h-64 w-full rounded-xl" />
  </div>

  <div v-else-if="visit" class="space-y-3">
    <!-- Who and when -->
    <UCard>
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <ULink :to="`/students/${visit.studentId}/health-care`" class="text-lg font-semibold hover:text-primary">
              {{ visit.studentName }}
            </ULink>
            <UBadge v-if="badge" variant="soft" :color="badge.color" :label="badge.label" />
            <UBadge v-if="visit.urgent" variant="soft" color="error" :icon="URGENT_ICON" label="Urgent" />
          </div>
          <p class="text-sm text-muted">{{ visit.studentClass }}</p>
          <p class="text-sm" :class="visit.voidedAt ? 'line-through text-muted' : ''">
            Arrived {{ formatDateTime(visit.arrivedAt) }}
            <template v-if="visit.leftAt"> · left {{ formatTime(visit.leftAt) }} · {{ formatMinutes(visit.minutesIn) }}</template>
            <template v-else-if="isOpen && !visit.needsFollowUp"> · in for {{ formatMinutes(visit.minutesIn) }}</template>
            <template v-if="visit.openedByName"> · seen by {{ visit.openedByName }}</template>
          </p>
          <p v-if="visit.continuesVisitId" class="text-xs text-muted">
            Continues an <ULink :to="`/health-care/visits/${visit.continuesVisitId}`" class="text-primary">earlier visit today</ULink>
            - not counted towards limits.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton v-if="isOpen && canRecord && !visit.needsFollowUp" icon="i-lucide-check" label="Close Visit" @click="startClose" />
          <UButton v-if="isOpen && visit.needsFollowUp && canSupervise" color="warning" :icon="FOLLOW_UP_ICON"
            label="Follow Up" @click="() => { followUpOpen = true }" />
          <UButton v-if="visit.status !== 'VOIDED' && canSupervise" color="error" variant="outline" icon="i-lucide-ban"
            label="Void" @click="() => { voidOpen = true }" />
        </div>
      </div>

      <UAlert v-if="visit.voidedAt" class="mt-4" color="neutral" variant="soft" icon="i-lucide-ban"
        :title="`Voided by ${visit.voidedByName || 'unknown'} ${formatDateTime(visit.voidedAt)}`"
        :description="`${visit.voidReason}. This visit is kept on record but not counted in reports or limits.`" />
      <UAlert v-if="visit.longStay" class="mt-4" color="warning" variant="soft" icon="i-lucide-clock-alert"
        :title="`In the sick bay for ${formatMinutes(visit.minutesIn)}`"
        description="Longer than the school's alert time. Decide whether the student can go back to class, go home or needs referring." />
      <UAlert v-if="visit.needsFollowUp" class="mt-4" color="warning" variant="soft" :icon="FOLLOW_UP_ICON"
        title="Needs follow-up"
        description="This visit was never closed and the student's school day has ended. Follow it up with what happened." />
      <UAlert v-if="visit.overLimit" class="mt-4" :color="visit.overLimit.urgent ? 'error' : 'warning'" variant="soft"
        :icon="visit.overLimit.urgent ? URGENT_ICON : 'i-lucide-gauge'"
        :title="`Over the limit: ${visit.overLimit.ruleName}`"
        :description="`${visit.overLimit.count} earlier ${visit.overLimit.count === 1 ? 'visit' : 'visits'} this ${periodLabel[visit.overLimit.period]} (limit ${visit.overLimit.maxVisits}). `
          + (visit.overLimit.urgent ? 'Allowed because the complaint was urgent.'
            : visit.overLimit.reason ? `Reason given by ${visit.overLimit.byName || 'the nurse'}: ${visit.overLimit.reason}` : 'Warned.')" />
    </UCard>

    <div class="grid gap-3 lg:grid-cols-3">
      <!-- Details and treatment -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h3 class="font-semibold">Details and Treatment</h3>
        </template>

        <div v-if="editable" class="space-y-4">
          <UFormField label="Complaint" required>
            <USelectMenu v-model="form.complaints" multiple value-key="value" :items="complaintItems" class="w-full" />
          </UFormField>
          <UFormField v-if="form.complaints.includes('OTHER')" label="Describe the complaint" required>
            <UInput v-model="form.complaintOther" :maxlength="500" class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Temperature (°C)" :required="settings?.requireTemperature">
              <UInputNumber v-model="form.temperature" :min="30" :max="45" :step="0.1" class="w-full" />
            </UFormField>
            <UFormField label="Brought by" :required="settings?.requireBroughtBy">
              <UInput v-model="form.broughtBy" :maxlength="255" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" :rows="3" :maxlength="2000" class="w-full" />
          </UFormField>
          <UFormField label="Treatment given" :required="settings?.requireTreatment">
            <UTextarea v-model="form.treatment" :rows="3" :maxlength="2000" placeholder="e.g. Cleaned and dressed graze on left knee" class="w-full" />
          </UFormField>
          <div class="flex justify-end">
            <UButton label="Save" :loading="saving" :disabled="!dirty || !form.complaints.length" @click="saveDetails" />
          </div>
        </div>

        <dl v-else class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <dt class="text-xs uppercase tracking-wide text-muted">Complaint</dt>
            <dd class="mt-1 flex flex-wrap gap-1.5">
              <UBadge v-for="c in visit.complaints" :key="c.code" variant="soft" :color="c.urgent ? 'error' : 'neutral'" :label="c.label" />
              <span v-if="visit.complaintOther" class="text-sm">({{ visit.complaintOther }})</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-muted">Temperature</dt>
            <dd class="mt-1 text-sm">{{ visit.temperature !== null ? `${visit.temperature} °C` : '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-muted">Brought by</dt>
            <dd class="mt-1 text-sm">{{ visit.broughtBy || '-' }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs uppercase tracking-wide text-muted">Notes</dt>
            <dd class="mt-1 whitespace-pre-line text-sm">{{ visit.notes || '-' }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs uppercase tracking-wide text-muted">Treatment given</dt>
            <dd class="mt-1 whitespace-pre-line text-sm">{{ visit.treatment || '-' }}</dd>
          </div>
        </dl>
      </UCard>

      <div class="space-y-3">
        <!-- Medication -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold">Medication</h3>
              <UButton v-if="editable && settings?.medicationAllowed" size="xs" variant="soft" icon="i-lucide-plus"
                label="Add" @click="() => { medicationOpen = true }" />
            </div>
          </template>
          <p v-if="!visit.medications.length" class="text-sm text-muted">
            {{ settings && !settings.medicationAllowed ? 'This school doesn\'t give medication in the sick bay.' : 'None given.' }}
          </p>
          <ul v-else class="divide-y divide-default">
            <li v-for="m in visit.medications" :key="m.id" class="flex items-start justify-between gap-2 py-2">
              <div>
                <p class="text-sm font-medium">{{ m.name }} <span class="font-normal">{{ m.dose }}</span></p>
                <p class="text-xs text-muted">{{ formatTime(m.givenAt) }}<template v-if="m.recordedByName"> · {{ m.recordedByName }}</template></p>
                <p v-if="m.repeatReason" class="text-xs text-warning">Repeat: {{ m.repeatReason }}</p>
              </div>
              <UButton v-if="editable" size="xs" variant="ghost" color="error" :icon="DELETE_ICON"
                :loading="removingId === m.id" aria-label="Remove line" @click="removeMedication(m)" />
            </li>
          </ul>
        </UCard>

        <!-- Outcome -->
        <UCard v-if="visit.status !== 'OPEN' && visit.outcome">
          <template #header>
            <h3 class="font-semibold">Outcome</h3>
          </template>
          <div class="space-y-2 text-sm">
            <UBadge variant="soft" :color="outcomeStyle[visit.outcome].color" :icon="outcomeStyle[visit.outcome].icon"
              :label="outcomeStyle[visit.outcome].label" />
            <p v-if="visit.collectedBy">Collected by {{ visit.collectedBy }} ({{ visit.collectedByRelation }})</p>
            <p v-if="visit.referredTo">Referred to {{ visit.referredTo }}<template v-if="visit.ambulanceCalled"> · ambulance called</template></p>
            <p v-if="visit.accompaniedBy">Accompanied by {{ visit.accompaniedBy }}</p>
            <p v-if="visit.followUpReason" class="text-muted">Departure not recorded. Followed up: {{ visit.followUpReason }}</p>
            <p class="text-xs text-muted">Closed by {{ visit.closedByName || 'unknown' }} {{ visit.closedAt ? formatDateTime(visit.closedAt) : '' }}</p>
          </div>
        </UCard>

        <!-- Parents -->
        <UCard v-if="visit.status === 'CLOSED'">
          <template #header>
            <h3 class="font-semibold">Parents</h3>
          </template>
          <div class="space-y-2 text-sm">
            <ul v-if="visit.parentNotifications.length" class="space-y-1">
              <li v-for="p in visit.parentNotifications" :key="p.userId + p.at" class="flex items-center gap-2">
                <UIcon :name="BELL_ICON" class="size-4 text-success" />
                {{ p.name || 'Parent' }} · {{ formatDateTime(p.at) }}
              </li>
            </ul>
            <p v-if="visit.notifyProblem === 'NONE'" class="text-warning">No parent could be notified in the app. Contact them directly.</p>
            <p v-else-if="visit.notifyProblem === 'FAILED'" class="text-warning">Some parents could not be notified.</p>
            <p v-else-if="!visit.parentNotifications.length" class="text-muted">Parents were not notified.</p>
            <UButton v-if="visit.canNotifyParents && canRecord" size="sm" variant="soft" :icon="BELL_ICON"
              :label="visit.notifyProblem ? 'Try Again' : 'Notify Parents'" :loading="notifying" @click="notify" />
          </div>
        </UCard>
      </div>
    </div>

    <!-- Follow-up notes -->
    <UCard v-if="visit.status === 'CLOSED' || visit.followUpNotes.length">
      <template #header>
        <h3 class="font-semibold">Follow-up Notes</h3>
        <p class="text-xs text-muted">Anything learned after the visit. Notes are kept as written.</p>
      </template>
      <ul v-if="visit.followUpNotes.length" class="mb-4 space-y-3">
        <li v-for="n in visit.followUpNotes" :key="n.id" class="rounded-xl border border-default p-3">
          <p class="whitespace-pre-line text-sm">{{ n.text }}</p>
          <p class="mt-1 text-xs text-muted">{{ n.byName || 'Unknown' }} · {{ formatDateTime(n.at) }}</p>
        </li>
      </ul>
      <div v-if="visit.status === 'CLOSED' && canSupervise" class="space-y-2">
        <UTextarea v-model="note" :rows="2" :maxlength="2000" placeholder="e.g. Parent called: off school for 3 days" class="w-full" />
        <div class="flex justify-end">
          <UButton label="Add Note" :loading="noting" :disabled="!note.trim()" @click="addNote" />
        </div>
      </div>
    </UCard>

    <HealthCareAddMedication v-model:open="medicationOpen" :visit="visit" @saved="apply" />
    <HealthCareCloseVisit v-model:open="closeOpen" :visit="visit" @closed="apply" />
    <HealthCareCloseVisit v-model:open="followUpOpen" :visit="visit" follow-up @closed="apply" />
    <LibraryAttendanceReasonModal v-model:open="voidOpen" title="Void Visit"
      description="Only for a visit recorded by mistake. It stays on record but is no longer counted. This can't be undone."
      confirm-label="Void Visit" color="error" :loading="voiding" placeholder="e.g. Recorded for the wrong student"
      @confirm="voidVisit" />
  </div>
</template>
