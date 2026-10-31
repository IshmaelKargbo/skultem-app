<script setup lang="ts">
// The school's health care rules (docs/HEALTH_CARE.md §6). Principal-level users change them; the nurse sees them
// read-only (P-3). Changes apply to visits started afterwards - past visits keep the rules they were recorded under.
const { canManageSettings } = useHealthCareAccess()
const { settings, loadSettings } = useHealthCare()
const { success: toastSuccess, error: toastError } = useNotify()

const loading = ref(true)
const saving = ref(false)
const readonly = computed(() => !canManageSettings.value)

type Draft = Omit<HealthCareSettings, 'complaintList' | 'customized' | 'updatedByName' | 'updatedAt'>
const draft = ref<Draft | null>(null)
const lockedUrgent = ['BREATHING', 'DIZZINESS_FAINTING', 'ALLERGIC_REACTION', 'INJURY_CUT', 'INJURY_SPRAIN', 'NOSEBLEED']
const alwaysShown = [...lockedUrgent, 'OTHER']

function fromSettings(s: HealthCareSettings): Draft {
  return JSON.parse(JSON.stringify({
    limitRules: s.limitRules,
    medicationAllowed: s.medicationAllowed,
    sameMedicineHours: s.sameMedicineHours,
    sameMedicineAction: s.sameMedicineAction,
    maxMedicationLines: s.maxMedicationLines,
    requireBroughtBy: s.requireBroughtBy,
    requireTemperature: s.requireTemperature,
    requireTreatment: s.requireTreatment,
    requireNotesOnReturn: s.requireNotesOnReturn,
    notifyOutcomes: s.notifyOutcomes,
    allowManualNotify: s.allowManualNotify,
    notifyPrincipalOnReferral: s.notifyPrincipalOnReferral,
    principalAlertVisits: s.principalAlertVisits,
    principalAlertPeriod: s.principalAlertPeriod,
    longStayMinutes: s.longStayMinutes,
    complaints: s.complaints
  }))
}

async function load() {
  loading.value = true
  try {
    const s = await loadSettings(true)
    if (s) draft.value = fromSettings(s)
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the health care settings')
  } finally {
    loading.value = false
  }
}

const dirty = computed(() => !!draft.value && !!settings.value
  && JSON.stringify(draft.value) !== JSON.stringify(fromSettings(settings.value)))

async function save() {
  if (!draft.value) return
  saving.value = true
  try {
    settings.value = await HealthCareApi().saveSettings(draft.value)
    draft.value = fromSettings(settings.value)
    toastSuccess('Health care settings saved')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save the settings')
  } finally {
    saving.value = false
  }
}

// Limit rules
function addRule() {
  draft.value?.limitRules.push({ id: null, name: 'One visit a week', levels: [], maxVisits: 1, period: 'WEEK', action: 'REASON', enabled: true })
}
function removeRule(index: number) {
  draft.value?.limitRules.splice(index, 1)
}

// Optional numbers: a switch turns each one on (with a sensible value) or off (null).
function optional<K extends 'sameMedicineHours' | 'maxMedicationLines' | 'longStayMinutes' | 'principalAlertVisits'>(key: K, value: number) {
  return computed({
    get: () => draft.value?.[key] !== null && draft.value?.[key] !== undefined,
    set: (on: boolean) => {
      if (!draft.value) return
      draft.value[key] = on ? value : null
      if (key === 'principalAlertVisits') draft.value.principalAlertPeriod = on ? 'TERM' : null
    }
  })
}
const sameMedicineOn = optional('sameMedicineHours', 4)
const maxLinesOn = optional('maxMedicationLines', 3)
const longStayOn = optional('longStayMinutes', 60)
const principalAlertOn = optional('principalAlertVisits', 5)

function toggleOutcome(outcome: HealthCareOutcome, on: boolean) {
  if (!draft.value) return
  const set = new Set(draft.value.notifyOutcomes)
  if (on) set.add(outcome)
  else set.delete(outcome)
  draft.value.notifyOutcomes = [...set]
}

// Complaint list
const standard = computed(() => (settings.value?.complaintList ?? []).filter(c => c.standard))
function isHidden(code: string) {
  return draft.value?.complaints.hidden.includes(code) ?? false
}
function isUrgent(code: string) {
  return lockedUrgent.includes(code) || (draft.value?.complaints.urgent.includes(code) ?? false)
}
function setFlag(list: 'hidden' | 'urgent', code: string, on: boolean) {
  if (!draft.value) return
  const set = new Set(draft.value.complaints[list])
  if (on) set.add(code)
  else set.delete(code)
  draft.value.complaints[list] = [...set]
}
const newComplaint = ref('')
function addComplaint() {
  const label = newComplaint.value.trim()
  if (!label || !draft.value) return
  draft.value.complaints.custom.push({ code: null, label, urgent: false, hidden: false })
  newComplaint.value = ''
}
function removeComplaint(index: number) {
  draft.value?.complaints.custom.splice(index, 1)
}

const principalPeriods = periodOptions.filter(p => p.value !== 'DAY')

onMounted(load)
</script>

<template>
  <div v-if="loading || !draft" class="space-y-3">
    <USkeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-xl" />
  </div>

  <div v-else class="space-y-3">
    <UAlert v-if="readonly" color="info" variant="soft" icon="i-lucide-lock"
      title="Set by the school's leadership"
      description="These are the rules your school uses for the sick bay. A principal or the school owner can change them." />

    <!-- Visit limits -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="font-semibold">Visit Limits</h3>
            <p class="text-xs text-muted">
              How often a student may come to the sick bay. Urgent complaints are never turned away, whatever the
              rule says. A visit continuing one from earlier the same day doesn't count.
            </p>
          </div>
          <UButton v-if="!readonly" size="sm" variant="soft" icon="i-lucide-plus" label="Add Rule" @click="addRule" />
        </div>
      </template>

      <p v-if="!draft.limitRules.length" class="py-4 text-center text-sm text-muted">
        No limits: students can visit as often as they need. The nurse still sees how many visits each student has had.
      </p>
      <div v-else class="space-y-3">
        <div v-for="(rule, i) in draft.limitRules" :key="rule.id ?? i"
          class="space-y-3 rounded-xl border border-default p-4" :class="rule.enabled ? '' : 'opacity-60'">
          <div class="flex flex-col gap-3 md:flex-row md:items-end">
            <UFormField label="Name" class="flex-1">
              <UInput v-model="rule.name" :maxlength="100" :disabled="readonly" class="w-full" />
            </UFormField>
            <UFormField label="Max visits" class="md:w-28">
              <UInputNumber v-model="rule.maxVisits" :min="1" :max="50" :disabled="readonly" class="w-full" />
            </UFormField>
            <UFormField label="Per" class="md:w-44">
              <USelectMenu v-model="rule.period" value-key="value" :items="periodOptions" :search-input="false" :disabled="readonly" class="w-full" />
            </UFormField>
          </div>
          <div class="flex flex-col gap-3 md:flex-row md:items-end">
            <UFormField label="When reached" class="md:w-56">
              <USelectMenu v-model="rule.action" value-key="value" :items="limitActionOptions" :search-input="false" :disabled="readonly" class="w-full" />
            </UFormField>
            <UFormField label="Applies to" description="Leave empty for the whole school." class="flex-1">
              <USelectMenu v-model="rule.levels" multiple value-key="value" :items="levelOptions" placeholder="Whole school"
                :search-input="false" :disabled="readonly" class="w-full" />
            </UFormField>
            <div class="flex items-center gap-3 md:pb-1.5">
              <USwitch v-model="rule.enabled" label="On" :disabled="readonly" />
              <UButton v-if="!readonly" size="sm" variant="ghost" color="error" :icon="DELETE_ICON" aria-label="Remove rule" @click="removeRule(i)" />
            </div>
          </div>
          <p class="text-xs text-muted">
            {{ limitActionOptions.find(a => a.value === rule.action)?.description }} once a student has had
            {{ rule.maxVisits }} {{ rule.maxVisits === 1 ? 'visit' : 'visits' }} this {{ periodLabel[rule.period] }}.
          </p>
        </div>
      </div>
    </UCard>

    <div class="grid gap-3 lg:grid-cols-2">
      <!-- Medication -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">Medication</h3>
          <p class="text-xs text-muted">Whether medicine is given in the sick bay, and checks on repeat doses.</p>
        </template>
        <div class="space-y-4">
          <USwitch v-model="draft.medicationAllowed" label="Medication is given and recorded" :disabled="readonly" />
          <template v-if="draft.medicationAllowed">
            <div class="space-y-2">
              <USwitch v-model="sameMedicineOn" label="Check for the same medicine given recently" :disabled="readonly" />
              <div v-if="sameMedicineOn" class="flex flex-col gap-3 pl-1 sm:flex-row sm:items-end">
                <UFormField label="Within (hours)" class="sm:w-32">
                  <UInputNumber v-model="draft.sameMedicineHours" :min="1" :max="24" :disabled="readonly" class="w-full" />
                </UFormField>
                <UFormField label="Then" class="sm:w-48">
                  <USelectMenu v-model="draft.sameMedicineAction" value-key="value" :search-input="false" :disabled="readonly"
                    :items="[{ label: 'Warn', value: 'WARN' }, { label: 'Ask for a reason', value: 'REASON' }]" class="w-full" />
                </UFormField>
              </div>
            </div>
            <div class="space-y-2">
              <USwitch v-model="maxLinesOn" label="Limit medication lines per visit" :disabled="readonly" />
              <UFormField v-if="maxLinesOn" label="At most" class="sm:w-32">
                <UInputNumber v-model="draft.maxMedicationLines" :min="1" :max="10" :disabled="readonly" class="w-full" />
              </UFormField>
            </div>
          </template>
        </div>
      </UCard>

      <!-- Required fields -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">What Must Be Recorded</h3>
          <p class="text-xs text-muted">Student, arrival time, complaint and outcome are always required.</p>
        </template>
        <div class="space-y-3">
          <USwitch v-model="draft.requireBroughtBy" label="Who brought the student" :disabled="readonly" />
          <USwitch v-model="draft.requireTemperature" label="Temperature on arrival" :disabled="readonly" />
          <USwitch v-model="draft.requireTreatment" label="Treatment given, before closing" :disabled="readonly" />
          <USwitch v-model="draft.requireNotesOnReturn" label="A note when sending a student back to class" :disabled="readonly" />
        </div>
      </UCard>
    </div>

    <!-- Notifications -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Who Is Told</h3>
        <p class="text-xs text-muted">In-app notifications. Parents need an account to be notified.</p>
      </template>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3">
          <p class="text-sm font-medium">Notify parents automatically when the student is…</p>
          <UCheckbox v-for="o in outcomeOptions" :key="o.value" :label="o.label" :disabled="readonly"
            :model-value="draft.notifyOutcomes.includes(o.value)" @update:model-value="(v: any) => toggleOutcome(o.value, !!v)" />
          <USwitch v-model="draft.allowManualNotify" label="The nurse can notify parents for other visits" :disabled="readonly" />
        </div>
        <div class="space-y-4">
          <USwitch v-model="draft.notifyPrincipalOnReferral" label="Tell the principal when a student is referred to hospital" :disabled="readonly" />
          <div class="space-y-2">
            <USwitch v-model="principalAlertOn" label="Tell the principal when a student reaches a number of visits" :disabled="readonly" />
            <div v-if="principalAlertOn" class="flex flex-col gap-3 sm:flex-row sm:items-end">
              <UFormField label="Visits" class="sm:w-28">
                <UInputNumber v-model="draft.principalAlertVisits" :min="1" :max="50" :disabled="readonly" class="w-full" />
              </UFormField>
              <UFormField label="Per" class="sm:w-44">
                <USelectMenu :model-value="draft.principalAlertPeriod ?? undefined" value-key="value" :items="principalPeriods"
                  :search-input="false" :disabled="readonly" class="w-full"
                  @update:model-value="(v: LimitPeriod) => { if (draft) draft.principalAlertPeriod = v }" />
              </UFormField>
            </div>
          </div>
          <div class="space-y-2">
            <USwitch v-model="longStayOn" label="Highlight long stays in the sick bay" :disabled="readonly" />
            <UFormField v-if="longStayOn" label="After (minutes)" class="sm:w-32">
              <UInputNumber v-model="draft.longStayMinutes" :min="10" :max="240" :step="5" :disabled="readonly" class="w-full" />
            </UFormField>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Complaint list -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Complaint List</h3>
        <p class="text-xs text-muted">
          Hide complaints your school doesn't use, add your own, and mark which are urgent. The six standard urgent
          complaints and "Other" are always shown and always urgent.
        </p>
      </template>
      <div class="grid gap-6 lg:grid-cols-2">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Standard</p>
          <ul class="divide-y divide-default rounded-xl border border-default">
            <li v-for="c in standard" :key="c.code" class="flex items-center justify-between gap-3 px-3 py-2"
              :class="isHidden(c.code) ? 'opacity-60' : ''">
              <span class="text-sm">{{ c.label }}</span>
              <div class="flex items-center gap-4">
                <UCheckbox label="Urgent" :model-value="isUrgent(c.code)" :disabled="readonly || lockedUrgent.includes(c.code)"
                  @update:model-value="(v: any) => setFlag('urgent', c.code, !!v)" />
                <UCheckbox label="Hidden" :model-value="isHidden(c.code)" :disabled="readonly || alwaysShown.includes(c.code)"
                  @update:model-value="(v: any) => setFlag('hidden', c.code, !!v)" />
              </div>
            </li>
          </ul>
        </div>
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Added by your school</p>
          <p v-if="!draft.complaints.custom.length" class="text-sm text-muted">None yet.</p>
          <ul v-else class="mb-3 divide-y divide-default rounded-xl border border-default">
            <li v-for="(c, i) in draft.complaints.custom" :key="c.code ?? `new-${i}`" class="flex items-center gap-3 px-3 py-2"
              :class="c.hidden ? 'opacity-60' : ''">
              <UInput v-model="c.label" :maxlength="60" size="sm" :disabled="readonly" class="flex-1" />
              <UCheckbox v-model="c.urgent" label="Urgent" :disabled="readonly" />
              <UCheckbox v-model="c.hidden" label="Hidden" :disabled="readonly" />
              <UButton v-if="!readonly" size="xs" variant="ghost" color="error" :icon="DELETE_ICON"
                :aria-label="`Remove ${c.label}`" @click="removeComplaint(i)" />
            </li>
          </ul>
          <div v-if="!readonly" class="flex gap-2">
            <UInput v-model="newComplaint" :maxlength="60" placeholder="e.g. Asthma attack" class="flex-1" @keyup.enter="addComplaint" />
            <UButton variant="soft" icon="i-lucide-plus" label="Add" :disabled="!newComplaint.trim()" @click="addComplaint" />
          </div>
          <p v-if="!readonly" class="mt-2 text-xs text-muted">A complaint used by past visits can be hidden but not removed.</p>
        </div>
      </div>
    </UCard>

    <div v-if="!readonly" class="sticky bottom-3 z-10 flex items-center justify-end gap-3 rounded-xl border border-default bg-default/95 p-3 shadow-sm backdrop-blur">
      <p class="mr-auto text-xs text-muted">
        <template v-if="settings?.customized && settings.updatedAt">Last changed by {{ settings.updatedByName || 'unknown' }} {{ formatDateTime(settings.updatedAt) }}.</template>
        <template v-else>Using the default rules.</template>
        Changes apply to visits started after saving.
      </p>
      <UButton label="Discard" variant="outline" color="neutral" :disabled="!dirty || saving" @click="() => { if (settings) draft = fromSettings(settings) }" />
      <UButton label="Save Settings" :loading="saving" :disabled="!dirty" @click="save" />
    </div>
  </div>
</template>
