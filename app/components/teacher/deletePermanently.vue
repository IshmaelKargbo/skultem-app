<script setup lang="ts">
// For a teacher or staff member added by mistake. Irreversible; the server refuses while they have any history
// (subjects, class master roles, salary, payslips, leave, attendance, library loans) - deactivate those instead.
// The full name is the confirmation.
const props = defineProps<{
  teacherId: string
  name: string
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ deleted: [] }>()

const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)
const confirmation = ref('')

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
const matches = computed(() => !!props.name && normalize(confirmation.value) === normalize(props.name))

watch(open, (isOpen) => {
  if (isOpen) confirmation.value = ''
})

async function confirm() {
  if (!matches.value) return

  loading.value = true
  try {
    const res = await TeacherApi().deletePermanently(props.teacherId, confirmation.value.trim())
    toastSuccess(`${res?.name ?? props.name} was permanently deleted.`)
    open.value = false
    emit('deleted')
  } catch (err: any) {
    toastError(err?.message || 'Failed to delete this staff member')
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
          <h3 class="text-lg font-semibold text-error">Delete permanently</h3>
        </template>

        <div class="space-y-4">
          <UAlert color="error" variant="soft" icon="lucide:triangle-alert" :title="`Delete ${name}?`">
            <template #description>
              <p>This cannot be undone. It removes the staff record and their access to this school.</p>
              <p class="mt-2">
                Use this for someone added by mistake. Anyone with subjects, a class, salary, payslips, leave,
                attendance or library loans on record can't be deleted - deactivate them instead, which keeps that
                history.
              </p>
            </template>
          </UAlert>

          <UFormField :label="`Type ${name} to confirm`" required>
            <UInput v-model="confirmation" class="w-full" :disabled="loading" :placeholder="name" autocomplete="off" />
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
