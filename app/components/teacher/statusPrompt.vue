<script setup lang="ts">
const props = defineProps<{
  open: boolean
  teacherId: string
  teacherName: string
  active: boolean // current status - true when ACTIVE, so the action offered is to deactivate
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  changed: [Teacher]
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useTeacherStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)

function close() {
  open.value = false
}

async function confirm() {
  loading.value = true
  try {
    const res = await store.setStatus(props.teacherId, !props.active)
    if (res) {
      toastSuccess(props.active
        ? `${props.teacherName} has been deactivated - they can no longer log in.`
        : `${props.teacherName} has been reactivated.`)
      emit('changed', res)
    }
    close()
  } catch (err: any) {
    toastError(err.message)
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
            {{ active ? 'Deactivate Staff' : 'Reactivate Staff' }}
          </h3>
        </template>

        <UAlert
          :color="active ? 'error' : 'success'"
          variant="soft"
          :title="active ? `Deactivate ${teacherName}?` : `Reactivate ${teacherName}?`"
          :description="active
            ? `They'll be signed out immediately and won't be able to log in until reactivated. Their payroll and attendance history is kept.`
            : `They'll be able to log in again right away.`"
        />

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="close" />
            <UButton :label="active ? 'Deactivate' : 'Reactivate'" :color="active ? 'error' : 'success'"
              :icon="active ? 'lucide:user-x' : 'lucide:user-check'" :loading="loading" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
