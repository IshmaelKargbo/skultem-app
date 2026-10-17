<script setup lang="ts">
const route = useRoute()
const { success, error: toastError } = useNotify()

const id = computed(() => route.params.id as string)

const onboarding = ref<Onboarding>()
const staff = ref<StaffMember[]>([])
const loading = ref(true)
const notFound = ref(false)
const busy = ref(false)

async function load() {
  try {
    onboarding.value = await LeadApi().onboarding(id.value)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

// Every change returns the whole onboarding fresh, so the progress and status stay true to the steps.
async function act(run: () => Promise<Onboarding | undefined>, done?: string) {
  busy.value = true
  try {
    const next = await run()
    if (next) onboarding.value = next
    if (done) success(done)
  } catch (err: any) {
    toastError(err.message)
  } finally {
    busy.value = false
  }
}

const staffItems = computed(() => staff.value.map(s => ({ label: s.name, value: s.id })))

// ---- steps ----
const toggleDone = (step: OnboardingStep) =>
  act(() => LeadApi().updateStep(id.value, step.id, { status: step.status === 'DONE' ? 'PENDING' : 'DONE' }))
const toggleApplicable = (step: OnboardingStep) =>
  act(() => LeadApi().updateStep(id.value, step.id, { applicable: !step.applicable }),
    step.applicable ? 'Step switched off for this school' : 'Step switched on')
const setStarted = (step: OnboardingStep) =>
  act(() => LeadApi().updateStep(id.value, step.id, { status: step.status === 'IN_PROGRESS' ? 'PENDING' : 'IN_PROGRESS' }))
const setDue = (step: OnboardingStep, value: string | undefined) =>
  act(() => LeadApi().updateStep(id.value, step.id, value ? { dueDate: value } : { clearDueDate: true }))
const setStepAssignee = (step: OnboardingStep, userId: string | null) =>
  act(() => LeadApi().updateStep(id.value, step.id, userId ? { assignedToId: userId } : { clearAssignee: true }))

const noteOpen = ref<string | null>(null)
const noteText = ref('')
function openNote(step: OnboardingStep) {
  noteOpen.value = noteOpen.value === step.id ? null : step.id
  noteText.value = step.note ?? ''
}
async function saveNote(step: OnboardingStep) {
  await act(() => LeadApi().updateStep(id.value, step.id, { note: noteText.value }), 'Note saved')
  noteOpen.value = null
}

const newStep = ref('')
async function addStep() {
  if (!newStep.value.trim()) return
  await act(() => LeadApi().addStep(id.value, newStep.value.trim()), 'Step added')
  newStep.value = ''
}

const removeTarget = ref<OnboardingStep | null>(null)
const removeOpen = ref(false)
const confirmRemove = () => act(() => LeadApi().removeStep(id.value, removeTarget.value!.id), 'Step removed')

// ---- who and which school ----
const schoolSearch = ref('')
const schools = ref<{ label: string, value: string }[]>([])
const schoolsLoading = ref(false)

async function findSchools(term: string) {
  schoolsLoading.value = true
  try {
    const res = await SystemApi().listSchools(1, 20, { query: term.trim() || undefined }) as any
    schools.value = (res?.data ?? []).map((s: any) => ({ label: `${s.name} (${s.domain})`, value: s.id }))
  } finally {
    schoolsLoading.value = false
  }
}
let schoolTimer: ReturnType<typeof setTimeout>
watch(schoolSearch, (t) => { clearTimeout(schoolTimer); schoolTimer = setTimeout(() => findSchools(t), 300) })
onBeforeUnmount(() => clearTimeout(schoolTimer))

const assignedTo = computed({
  get: () => onboarding.value?.assignedToId ?? undefined,
  set: (v) => act(() => LeadApi().updateOnboarding(id.value, { assignedToId: v ?? null, schoolId: onboarding.value?.schoolId ?? null }), 'Responsibility updated')
})
const linkedSchool = computed({
  get: () => onboarding.value?.schoolId ?? undefined,
  set: (v) => act(() => LeadApi().updateOnboarding(id.value, { assignedToId: onboarding.value?.assignedToId ?? null, schoolId: v ?? null }), 'School linked')
})

const overdue = computed(() => onboarding.value?.steps.filter(s => s.overdue).length ?? 0)

onMounted(async () => {
  useAppStore().setTitle('System Admin · Onboarding')
  useAppStore().setBack('/onboarding')
  document.title = 'Onboarding | System Admin | Skultem'
  staff.value = await LeadApi().staff().catch(() => [])
  findSchools('')
  await load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <UCard v-if="notFound">
      <div class="flex flex-col items-center gap-2 py-10">
        <UIcon name="i-lucide-list-x" class="text-4xl text-gray-400" />
        <p class="text-gray-500">This onboarding doesn't exist any more.</p>
        <UButton to="/onboarding" variant="soft" label="Back to onboarding" />
      </div>
    </UCard>

    <template v-else>
      <Heading :title="onboarding ? (onboarding.linkedSchoolName || onboarding.schoolName || onboarding.leadName) : 'Onboarding'"
        :subtitle="onboarding ? `Contact: ${onboarding.leadName}` : ''">
        <UBadge v-if="onboarding" size="lg" variant="subtle" :color="onboarding.status === 'COMPLETED' ? 'success' : 'primary'"
          :label="onboarding.status === 'COMPLETED' ? 'Launched' : `${onboarding.percent}% done`" />
        <UButton v-if="onboarding" icon="i-lucide-target" variant="soft" label="Open lead" :to="`/leads/${onboarding.leadId}`" />
      </Heading>

      <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
        <USkeleton class="h-96 lg:col-span-2" />
        <USkeleton class="h-64" />
      </div>

      <div v-else-if="onboarding" class="grid items-start gap-4 lg:grid-cols-3">
        <!-- Steps -->
        <div class="space-y-4 lg:col-span-2">
          <UAlert v-if="onboarding.status === 'COMPLETED' && !onboarding.schoolId" color="info" variant="soft" icon="i-lucide-link"
            title="Every step is done" description="Link the school it became on the right so the lead can be closed as converted." />
          <UAlert v-if="overdue" color="error" variant="soft" icon="i-lucide-alarm-clock"
            :title="`${overdue} step${overdue === 1 ? ' is' : 's are'} overdue`" />

          <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-semibold">Checklist</span>
                  <span class="text-xs text-muted">{{ onboarding.doneSteps }} of {{ onboarding.totalSteps }} steps</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-elevated">
                  <div class="h-full rounded-full transition-all" :class="onboarding.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'"
                    :style="{ width: `${onboarding.percent}%` }" />
                </div>
              </div>
            </template>

            <ul class="divide-y divide-default">
              <li v-for="step in onboarding.steps" :key="step.id" class="space-y-2 px-4 py-3" :class="step.applicable ? '' : 'opacity-60'">
                <div class="flex items-start gap-3">
                  <UCheckbox :model-value="step.status === 'DONE'" :disabled="busy || !step.applicable" class="mt-0.5"
                    @update:model-value="toggleDone(step)" />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium" :class="step.status === 'DONE' ? 'text-muted line-through' : 'text-highlighted'">
                      {{ step.label }}
                    </p>
                    <p class="text-xs text-muted">
                      <template v-if="!step.applicable">Doesn't apply to this school</template>
                      <template v-else-if="step.status === 'DONE'">Done{{ step.completedAt ? ' ' + formatDate(step.completedAt) : '' }}{{ step.completedByName ? ' by ' + step.completedByName : '' }}</template>
                      <template v-else-if="step.status === 'IN_PROGRESS'">In progress</template>
                      <template v-else>Not started</template>
                      <template v-if="step.assignedToName"> · {{ step.assignedToName }}</template>
                      <template v-if="step.dueDate"> · <span :class="step.overdue ? 'font-medium text-error' : ''">due {{ formatDate(step.dueDate) }}</span></template>
                    </p>
                    <p v-if="step.note && noteOpen !== step.id" class="mt-1 whitespace-pre-wrap rounded-md bg-elevated/50 px-2 py-1 text-xs">{{ step.note }}</p>
                  </div>

                  <UDropdownMenu :content="{ align: 'end' }" :items="[
                    [
                      { label: step.status === 'IN_PROGRESS' ? 'Mark not started' : 'Mark in progress', icon: 'i-lucide-play', disabled: !step.applicable || step.status === 'DONE', onSelect: () => setStarted(step) },
                      { label: step.note ? 'Edit note' : 'Add note', icon: 'i-lucide-sticky-note', onSelect: () => openNote(step) },
                      { label: step.applicable ? 'Doesn\'t apply to this school' : 'Switch back on', icon: step.applicable ? 'i-lucide-ban' : 'i-lucide-rotate-ccw', onSelect: () => toggleApplicable(step) }
                    ],
                    ...(step.key === 'CUSTOM' ? [[{ label: 'Remove step', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => { removeTarget = step; removeOpen = true } }]] : [])
                  ]">
                    <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
                  </UDropdownMenu>
                </div>

                <div v-if="step.applicable && step.status !== 'DONE'" class="ml-8 flex flex-wrap gap-2">
                  <USelect :model-value="step.assignedToId ?? undefined" :items="staffItems" value-key="value" size="xs"
                    placeholder="Assign" icon="i-lucide-user" class="w-40" :disabled="busy"
                    @update:model-value="setStepAssignee(step, ($event as string) || null)" />
                  <UInput :model-value="step.dueDate ?? ''" type="date" size="xs" class="w-40" :disabled="busy"
                    @update:model-value="setDue(step, $event as string)" />
                </div>

                <div v-if="noteOpen === step.id" class="ml-8 space-y-2">
                  <UTextarea v-model="noteText" :rows="2" autoresize maxlength="5000" class="w-full" placeholder="Anything the team should know about this step" />
                  <div class="flex gap-2">
                    <UButton size="xs" label="Save note" :loading="busy" @click="saveNote(step)" />
                    <UButton size="xs" variant="ghost" color="neutral" label="Cancel" @click="noteOpen = null" />
                  </div>
                </div>
              </li>
            </ul>

            <template #footer>
              <form class="flex gap-2" @submit.prevent="addStep">
                <UInput v-model="newStep" class="flex-1" maxlength="255" icon="i-lucide-plus" placeholder="Add a step just for this school, e.g. Collect the school logo" />
                <UButton type="submit" label="Add step" variant="soft" :loading="busy" :disabled="!newStep.trim()" />
              </form>
            </template>
          </UCard>
        </div>

        <!-- Who and which school -->
        <div class="space-y-4 lg:sticky lg:top-6">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2"><UIcon name="i-lucide-user-check" class="text-primary" /><span class="font-semibold">Responsible</span></div>
            </template>
            <USelect v-model="assignedTo" :items="staffItems" value-key="value" class="w-full" placeholder="Nobody yet" :disabled="busy" />
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2"><UIcon name="i-lucide-school" class="text-primary" /><span class="font-semibold">School on Skultem</span></div>
            </template>
            <div class="space-y-2">
              <USelectMenu v-model="linkedSchool" v-model:search-term="schoolSearch" :items="schools" value-key="value" ignore-filter
                :loading="schoolsLoading" class="w-full" placeholder="Link the school once it exists" :disabled="busy" />
              <p class="text-xs text-muted">
                When every step is done and a school is linked, the lead is closed as converted.
              </p>
            </div>
          </UCard>

          <UCard>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between"><dt class="text-muted">Started</dt><dd>{{ onboarding.startedAt ? formatDate(onboarding.startedAt) : '—' }}</dd></div>
              <div v-if="onboarding.completedAt" class="flex justify-between"><dt class="text-muted">Launched</dt><dd>{{ formatDate(onboarding.completedAt) }}</dd></div>
              <div class="flex justify-between"><dt class="text-muted">Now on</dt><dd class="max-w-40 truncate text-right">{{ onboarding.currentStep || 'All done' }}</dd></div>
            </dl>
          </UCard>
        </div>
      </div>
    </template>

    <ConfirmDeleteModal v-if="removeTarget" v-model:open="removeOpen" title="Remove Step" :item-name="removeTarget.label"
      :on-confirm="confirmRemove" description="This removes the step from this school's checklist." />
  </div>
</template>
