<script setup lang="ts">
// Withdraw (stop enrolment), expel or reinstate a student - one dialog, three modes. The record,
// fees owed and history are kept in every case; see backend EndStudentEnrollmentUseCase.
const props = defineProps<{
  open: boolean
  studentId: string
  studentName: string
  mode: 'withdraw' | 'expel' | 'reinstate'
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  changed: []
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useStudentStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)

const today = new Date().toISOString().slice(0, 10)
const state = reactive({ reason: '', exitDate: today, note: '' })

const isExpel = computed(() => props.mode === 'expel')
const isReinstate = computed(() => props.mode === 'reinstate')
const reasons = computed(() => (isExpel.value ? EXPEL_REASONS : WITHDRAW_REASONS))

const copy = computed(() => ({
  withdraw: {
    title: 'Stop enrolment',
    color: 'warning' as const,
    icon: 'lucide:user-minus',
    action: 'Withdraw student',
    alert: `${props.studentName} will be removed from their class list, attendance and grading. Their record, fees owed and history are kept, and you can reinstate them later.`
  },
  expel: {
    title: 'Expel student',
    color: 'error' as const,
    icon: 'lucide:user-x',
    action: 'Expel student',
    alert: `${props.studentName} will be removed from their class list, attendance and grading and marked as expelled. Their record, fees owed and history are kept, and you can reinstate them later.`
  },
  reinstate: {
    title: 'Reinstate student',
    color: 'success' as const,
    icon: 'lucide:user-check',
    action: 'Reinstate student',
    alert: `${props.studentName} will be an active student again and get their place back in this year's class.`
  }
}[props.mode]))

watch(() => props.open, (isOpen) => {
  if (isOpen) Object.assign(state, { reason: '', exitDate: today, note: '' })
})

const canSubmit = computed(() => isReinstate.value || !isExpel.value || !!state.reason.trim())

async function confirm() {
  if (!canSubmit.value) {
    toastError('Give a reason for the expulsion.')
    return
  }

  loading.value = true
  try {
    if (isReinstate.value) {
      await store.reinstate(props.studentId)
      toastSuccess(`${props.studentName} has been reinstated.`)
    } else {
      const payload = { reason: state.reason || undefined, exitDate: state.exitDate || undefined, note: state.note || undefined }
      if (isExpel.value) await store.expel(props.studentId, payload)
      else await store.withdraw(props.studentId, payload)
      toastSuccess(isExpel.value ? `${props.studentName} has been expelled.` : `${props.studentName}'s enrolment has been stopped.`)
    }
    emit('changed')
    open.value = false
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ copy.title }}
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert :color="copy.color" variant="soft" :icon="copy.icon" :title="`${copy.action}?`"
            :description="copy.alert" />

          <template v-if="!isReinstate">
            <UFormField :label="isExpel ? 'Reason' : 'Reason (optional)'" :required="isExpel">
              <USelectMenu v-model="state.reason" :items="reasons" placeholder="Select a reason" class="w-full"
                :disabled="loading" />
            </UFormField>

            <UFormField label="Effective date" help="The day they left. Defaults to today.">
              <UInput v-model="state.exitDate" type="date" :max="today" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Note (optional)">
              <UTextarea v-model="state.note" :rows="3" :maxlength="2000" class="w-full" :disabled="loading"
                placeholder="Anything worth keeping on file" />
            </UFormField>
          </template>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="open = false" />
            <UButton :label="copy.action" :color="copy.color" :icon="copy.icon" :loading="loading"
              :disabled="!canSubmit" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
