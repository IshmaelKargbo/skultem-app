<script setup lang="ts">
const props = defineProps<{
  open: boolean
  userId: string
  userName: string
  active: boolean // current school access - true when ACTIVE, so the action offered is to deactivate
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  changed: [User]
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useUserStore()
const { success: toastSuccess, error: toastError } = useNotify()
const loading = ref(false)

function close() {
  open.value = false
}

async function confirm() {
  loading.value = true
  try {
    const res = await store.setAccess(props.userId, !props.active)
    if (res) {
      toastSuccess(props.active
        ? `${props.userName} has been deactivated - they can no longer log in to this school.`
        : `${props.userName} has been reactivated.`)
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
            {{ active ? 'Deactivate User' : 'Reactivate User' }}
          </h3>
        </template>

        <UAlert
          :color="active ? 'error' : 'success'"
          variant="soft"
          :title="active ? `Deactivate ${userName}?` : `Reactivate ${userName}?`"
          :description="active
            ? `Every role they hold at this school is revoked and they're signed out immediately. Their account itself (and access at any other school) is unaffected.`
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
