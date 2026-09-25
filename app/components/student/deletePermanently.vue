<script setup lang="ts">
// For a student entered by mistake. Irreversible: the student is removed with their fees, ledger,
// assessments, attendance and report cards. Typing the admission number is the confirmation, and
// the server refuses when payments were recorded (withdraw or expel those students instead).
const props = defineProps<{
  open: boolean
  studentId: string
  studentName: string
  admissionNumber: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  deleted: []
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useStudentStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)
const confirmation = ref('')

const matches = computed(() =>
  !!props.admissionNumber && confirmation.value.trim().toLowerCase() === props.admissionNumber.trim().toLowerCase())

watch(() => props.open, (isOpen) => {
  if (isOpen) confirmation.value = ''
})

async function confirm() {
  if (!matches.value) return

  loading.value = true
  try {
    const res = await store.deletePermanently(props.studentId, confirmation.value.trim())
    toastSuccess(`${res?.studentName ?? props.studentName} was permanently deleted.`)
    emit('deleted')
    open.value = false
  } catch (err: any) {
    toastError(err?.message || 'Failed to delete the student')
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
          <h3 class="text-lg font-semibold text-error">
            Delete student permanently
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert color="error" variant="soft" icon="lucide:triangle-alert" :title="`Delete ${studentName}?`">
            <template #description>
              <p>This cannot be undone. It permanently removes the student and everything recorded for them:</p>
              <ul class="mt-2 list-disc space-y-0.5 pl-5">
                <li>Enrolments and subject choices</li>
                <li>Fees charged and the fee ledger</li>
                <li>Assessments and scores</li>
                <li>Attendance, behaviour and report cards</li>
              </ul>
              <p class="mt-2">
                Use this for a student added by mistake. If they attended the school, withdraw or expel them
                instead. Students with payments recorded can't be deleted.
              </p>
            </template>
          </UAlert>

          <UFormField :label="`Type ${admissionNumber} to confirm`" required>
            <UInput v-model="confirmation" class="w-full" :disabled="loading" :placeholder="admissionNumber"
              autocomplete="off" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="open = false" />
            <UButton label="Delete permanently" color="error" icon="lucide:trash-2" :loading="loading"
              :disabled="!matches" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
