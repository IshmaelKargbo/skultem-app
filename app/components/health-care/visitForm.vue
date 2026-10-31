<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { settings, loadSettings, complaintOptions, changed } = useHealthCare()
const { success: toastSuccess, error: toastError, warning: toastWarning } = useNotify()

const saving = ref(false)
const studentId = ref(String(route.query.student || ''))
const complaints = ref<string[]>([])
const complaintOther = ref('')
const arrivedAt = ref('')
const broughtBy = ref('')
const temperature = ref<number | null>(null)
const notes = ref('')
const continuesVisitId = ref<string | null>(null)
const overLimitReason = ref('')

const { searchTerm, students, loading: studentsLoading } = useStudentSearch(25, () => [studentId.value])

const check = ref<HealthCareVisitCheck | null>(null)
const checking = ref(false)

const hasOther = computed(() => complaints.value.includes('OTHER'))
const limit = computed(() => continuesVisitId.value ? null : check.value?.limit ?? null)
const refused = computed(() => !!limit.value?.refused)
const needsReason = computed(() => !!limit.value?.needsReason)

const missing = computed(() => {
  if (!studentId.value) return 'Choose a student'
  if (check.value?.openVisitId) return 'Already in the sick bay'
  if (!complaints.value.length) return 'Choose a complaint'
  if (hasOther.value && !complaintOther.value.trim()) return 'Describe the complaint'
  if (settings.value?.requireBroughtBy && !broughtBy.value.trim()) return 'Record who brought the student'
  if (settings.value?.requireTemperature && temperature.value === null) return 'Record the temperature'
  if (!refused.value && needsReason.value && !overLimitReason.value.trim()) return 'Give a reason'
  return ''
})

const limitAlert = computed(() => {
  const l = limit.value
  if (!l || l.result === 'ALLOW') return null
  if (l.refused) return { color: 'error' as const, icon: 'i-lucide-ban', title: 'Limit reached' }
  if (l.urgent) return { color: 'warning' as const, icon: URGENT_ICON, title: 'Over the limit - urgent complaint' }
  if (l.needsReason) return { color: 'warning' as const, icon: 'i-lucide-message-circle-warning', title: 'Limit reached' }
  return { color: 'info' as const, icon: 'i-lucide-info', title: 'Over the limit' }
})

let request = 0
async function runCheck() {
  check.value = null
  if (!studentId.value) return
  const mine = ++request
  checking.value = true
  try {
    const res = await HealthCareApi().check(studentId.value, complaints.value)
    if (mine === request) check.value = res
  } catch (err: any) {
    if (mine === request) toastError(err?.message || 'Failed to check the student')
  } finally {
    if (mine === request) checking.value = false
  }
}

watch(studentId, () => {
  continuesVisitId.value = null
  overLimitReason.value = ''
  runCheck()
})
watch(complaints, () => { if (studentId.value) runCheck() })

// Back where the nurse came from (the dashboard, the visit list...), or the dashboard when opened directly.
function leave() {
  if (window.history.state?.back) router.back()
  else navigateTo('/health-care')
}

// One key per attempt, so a retry after a dropped connection doesn't start a second visit.
let idempotencyKey = crypto.randomUUID()

async function start() {
  if (missing.value && !(refused.value && studentId.value && complaints.value.length)) return
  saving.value = true
  try {
    const res = await HealthCareApi().start({
      studentId: studentId.value,
      arrivedAt: fromLocalInput(arrivedAt.value),
      complaints: complaints.value,
      complaintOther: complaintOther.value || null,
      broughtBy: broughtBy.value || null,
      temperature: temperature.value,
      notes: notes.value || null,
      continuesVisitId: continuesVisitId.value,
      overLimitReason: overLimitReason.value || null
    }, idempotencyKey)
    changed()
    if (res.turnedAway) {
      toastWarning(`${check.value?.studentName ?? 'The student'} was recorded as turned away`)
      await navigateTo('/health-care', { replace: true })
      return
    }
    if (res.message) toastWarning(res.message)
    else toastSuccess('Visit started')
    // Replace, so "back" from the new visit doesn't return to an already-used form.
    if (res.visit) await navigateTo(`/health-care/visits/${res.visit.id}`, { replace: true })
  } catch (err: any) {
    toastError(err?.message || 'Failed to start the visit')
    idempotencyKey = crypto.randomUUID()
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (studentId.value) runCheck()
  try {
    await loadSettings()
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the complaint list')
  }
})
</script>

<template>
  <div class="grid gap-3 lg:grid-cols-3">
    <!-- The visit -->
    <UCard class="lg:col-span-2">
      <template #header>
        <h3 class="text-lg font-semibold">Start a Sick Bay Visit</h3>
        <p class="text-sm text-muted">Record a student who has come to the sick bay.</p>
      </template>

      <div class="space-y-5">
        <UFormField label="Student" required>
          <USelectMenu v-model="studentId" v-model:search-term="searchTerm" value-key="value" :items="students"
            :loading="studentsLoading" ignore-filter :icon="SEARCH_ICON" placeholder="Search for a student"
            :disabled="saving" class="w-full" />
        </UFormField>

        <UFormField label="Complaint" required help="Urgent complaints are never turned away by a limit.">
          <USelectMenu v-model="complaints" multiple value-key="value" :items="complaintOptions"
            placeholder="What's wrong?" :disabled="saving" class="w-full">
            <template #item-trailing="{ item }">
              <UBadge v-if="(item as any).urgent" size="xs" color="error" variant="soft" label="Urgent" />
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField v-if="hasOther" label="Describe the complaint" required>
          <UInput v-model="complaintOther" :maxlength="500" placeholder="e.g. Stung by a bee" class="w-full" />
        </UFormField>

        <!-- Continue a visit from earlier today: it then doesn't count towards limits (V-9) -->
        <UFormField v-if="check?.continuable?.length && !check.openVisitId" label="Same problem as an earlier visit today?"
          help="A follow-on visit for the same problem doesn't count towards the visit limit.">
          <URadioGroup v-model="continuesVisitId" :items="[
            { label: 'No, this is a new problem', value: null },
            ...check.continuable.map(c => ({
              label: `Continues ${formatTime(c.arrivedAt)} visit`,
              description: c.complaints + (c.outcome ? ` · ${outcomeStyle[c.outcome].label}` : ''),
              value: c.id
            }))
          ]" />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Arrived at" help="Leave empty for now. Today only.">
            <UInput v-model="arrivedAt" type="datetime-local" :max="toLocalInput(new Date().toISOString())" class="w-full" />
          </UFormField>
          <UFormField label="Temperature (°C)" :required="settings?.requireTemperature">
            <UInputNumber v-model="temperature" :min="30" :max="45" :step="0.1" :format-options="{ minimumFractionDigits: 1 }"
              placeholder="e.g. 37.2" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Brought by" :required="settings?.requireBroughtBy">
          <UInput v-model="broughtBy" :maxlength="255" placeholder="e.g. Class teacher, Mr Kamara" class="w-full" />
        </UFormField>

        <UFormField label="Notes" help="What you observed.">
          <UTextarea v-model="notes" :rows="4" :maxlength="2000" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex flex-wrap items-center gap-3">
          <UButton v-if="refused" color="error" icon="i-lucide-ban" label="Record as Turned Away" :loading="saving"
            :disabled="!studentId || !complaints.length" @click="start" />
          <UButton v-else icon="i-lucide-plus" label="Start Visit" :loading="saving" :disabled="!!missing || checking"
            @click="start" />
          <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="leave" />
          <span v-if="missing && !refused && !saving" class="text-xs text-muted">{{ missing }}</span>
        </div>
      </template>
    </UCard>

    <!-- What the system knows about this student's visits, and the school's limits -->
    <div class="space-y-3">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Recent Visits</h3>
        </template>

        <p v-if="!studentId" class="text-sm text-muted">Choose a student to see their recent sick bay visits.</p>
        <USkeleton v-else-if="checking && !check" class="h-24 w-full rounded-xl" />
        <template v-else-if="check">
          <UAlert v-if="check.openVisitId" color="warning" variant="soft" icon="i-lucide-bed"
            :title="`${check.studentName} is already in the sick bay`"
            description="Close or follow up that visit before starting another.">
            <template #actions>
              <UButton :to="`/health-care/visits/${check.openVisitId}`" size="xs" color="warning" label="Open Visit" />
            </template>
          </UAlert>
          <div v-else class="space-y-3">
            <div>
              <p class="font-medium">{{ check.studentName }}</p>
              <p class="text-xs text-muted">{{ check.studentClass }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-default p-3">
                <p class="text-[11px] uppercase tracking-wide text-muted">This week</p>
                <p class="text-xl font-semibold">{{ check.visitsThisWeek }}</p>
              </div>
              <div class="rounded-xl border border-default p-3">
                <p class="text-[11px] uppercase tracking-wide text-muted">This term</p>
                <p class="text-xl font-semibold">{{ check.visitsThisTerm }}</p>
              </div>
            </div>
            <p v-if="check.lastVisitAt" class="text-xs text-muted">
              Last visit {{ formatDateTime(check.lastVisitAt) }} · {{ check.lastVisitComplaints }}
            </p>
            <p v-else class="text-xs text-muted">No earlier visits.</p>
            <ULink :to="`/students/${check.studentId}/health-care`" class="text-xs text-primary">See full record</ULink>
          </div>
        </template>
      </UCard>

      <template v-if="limitAlert && limit">
        <UAlert :color="limitAlert.color" variant="soft" :icon="limitAlert.icon" :title="limitAlert.title"
          :description="limit.message || undefined" />
        <UCard v-if="needsReason">
          <UFormField label="Reason for the extra visit" required>
            <UTextarea v-model="overLimitReason" :rows="3" :maxlength="500"
              placeholder="e.g. Sent by the class teacher with a fever" class="w-full" />
          </UFormField>
        </UCard>
      </template>
    </div>
  </div>
</template>
