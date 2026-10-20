<script setup lang="ts">
// Corrects how a student was admitted (new, transfer, re-enrolled, existing). Moving between "new" and
// "returning" students also re-bills them, so the effect is explained before it is saved and reported after.
const props = defineProps<{ studentId: string, studentName: string, current?: string }>()
const emit = defineEmits<{ changed: [ChangeEnrollmentTypeResult] }>()

const store = useStudentStore()
const { success, error: toastError } = useNotify()

const open = ref(false)
const saving = ref(false)
const selected = ref<string>('')
const problem = ref('')

const isNewGroup = (t?: string) => t === 'NEW' || t === 'TRANSFER'
const changesFees = computed(() => !!selected.value && !!props.current && isNewGroup(selected.value) !== isNewGroup(props.current))
const canSave = computed(() => !!selected.value && selected.value !== props.current)

defineExpose({ open: () => { selected.value = props.current ?? ''; problem.value = ''; open.value = true } })

async function save() {
  saving.value = true
  problem.value = ''
  try {
    const res = await store.changeEnrollmentType(props.studentId, selected.value)
    if (!res) return

    const parts = [
      res.feesAdded.length ? `${res.feesAdded.length} fee${res.feesAdded.length === 1 ? '' : 's'} added` : '',
      res.feesRemoved.length ? `${res.feesRemoved.length} removed` : ''
    ].filter(Boolean)
    success(`${props.studentName} is now ${ENROLLMENT_TYPES.find(t => t.value === res.enrollmentType)?.label.toLowerCase()}${parts.length ? ` - ${parts.join(', ')}` : ''}`)
    emit('changed', res)
    open.value = false
  } catch (err: any) {
    // Shown in the panel: it can be long (it names the fees that are in the way).
    problem.value = err?.message || 'The enrollment type could not be changed'
    toastError('Enrollment type not changed')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">Change enrollment type</h3>
            <p class="text-sm text-muted">How {{ studentName }} was admitted to the school.</p>
          </div>
        </template>

        <div class="space-y-4">
          <URadioGroup v-model="selected" :items="[...ENROLLMENT_TYPES]" value-key="value" variant="card" :disabled="saving" />

          <UAlert v-if="changesFees" color="info" variant="soft" icon="i-lucide-receipt"
            title="Their fees may change"
            description="Only if their class has fees set for new students only, or returning students only. Those are switched to match the new type; every other fee stays as it is. It can't go ahead if a fee that would be removed already has a payment or discount." />

          <UAlert v-if="problem" color="error" variant="soft" icon="i-lucide-circle-alert" title="Not changed" :description="problem" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" :disabled="saving" @click="open = false" />
            <UButton label="Save change" icon="i-lucide-save" :loading="saving" :disabled="!canSave" @click="save" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
