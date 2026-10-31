<script setup lang="ts">
// Records a medicine given during an open visit (docs/HEALTH_CARE.md §6.3). If the same medicine was given to the
// student within the school's window, the nurse is told when and, if the school asks, gives a reason. It's never
// refused: the nurse may know something the system doesn't (M-2).
const props = defineProps<{ visit: HealthCareVisit }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [visit: HealthCareVisit] }>()

const { success: toastSuccess, error: toastError } = useNotify()
const saving = ref(false)
const name = ref('')
const dose = ref('')
const givenAt = ref('')
const repeatReason = ref('')
const repeat = ref<HealthCareMedicationCheck | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) return
  name.value = ''
  dose.value = ''
  givenAt.value = ''
  repeatReason.value = ''
  repeat.value = null
})

let timer: ReturnType<typeof setTimeout>
let request = 0
watch(name, (value) => {
  clearTimeout(timer)
  repeat.value = null
  if (!value.trim()) return
  timer = setTimeout(async () => {
    const mine = ++request
    try {
      const res = await HealthCareApi().medicationCheck(props.visit.id, value.trim())
      if (mine === request) repeat.value = res
    } catch {
      // The check only informs; saving still checks on the server.
    }
  }, 400)
})

const needsReason = computed(() => repeat.value?.action === 'REASON')
const missing = computed(() => !name.value.trim() || !dose.value.trim() || (needsReason.value && !repeatReason.value.trim()))

async function save() {
  if (missing.value) return
  saving.value = true
  try {
    const res = await HealthCareApi().addMedication(props.visit.id, {
      name: name.value.trim(),
      dose: dose.value.trim(),
      givenAt: fromLocalInput(givenAt.value),
      repeatReason: repeatReason.value || null
    })
    toastSuccess('Medication recorded')
    open.value = false
    emit('saved', res)
  } catch (err: any) {
    toastError(err?.message || 'Failed to record the medication')
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
          <h3 class="text-lg font-semibold">Record Medication</h3>
          <p class="mt-1 text-sm text-muted">Given to {{ props.visit.studentName }}.</p>
        </template>

        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Medicine" required>
              <UInput v-model="name" :maxlength="120" placeholder="e.g. Paracetamol" autofocus class="w-full" />
            </UFormField>
            <UFormField label="Dose" required>
              <UInput v-model="dose" :maxlength="120" placeholder="e.g. 500 mg" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Given at" description="Leave empty for now.">
            <UInput v-model="givenAt" type="datetime-local" :min="toLocalInput(props.visit.arrivedAt)"
              :max="toLocalInput(new Date().toISOString())" class="w-full" />
          </UFormField>

          <UAlert v-if="repeat" :color="needsReason ? 'warning' : 'info'" variant="soft" :icon="MEDICATION_ICON"
            title="Given recently" :description="repeat.message" />
          <UFormField v-if="needsReason" label="Reason" required>
            <UTextarea v-model="repeatReason" :rows="2" :maxlength="500" placeholder="e.g. Earlier dose was vomited" class="w-full" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Cancel" variant="outline" color="neutral" :disabled="saving" @click="() => { open = false }" />
            <UButton label="Record" :icon="MEDICATION_ICON" :loading="saving" :disabled="missing" @click="save" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
