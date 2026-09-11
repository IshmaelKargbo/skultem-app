<script setup lang="ts">
const props = defineProps<{
  open: boolean
  userId: string
  userName: string
  role: string
  lastRole: boolean // true when this is the only role the user holds at this school
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  removed: [User]
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
    const res = await store.removeRole(props.userId, props.role)
    if (res) {
      toastSuccess(`Removed ${parseRole[props.role] || props.role} from ${props.userName}`)
      emit('removed', res)
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
            Remove Role
          </h3>
        </template>

        <UAlert
          color="error"
          variant="soft"
          :title="`Remove ${parseRole[role] || role} from ${userName}?`"
          :description="lastRole
            ? `This is their only role at this school - removing it will remove them from this school entirely and sign them out.`
            : `They'll immediately lose access tied to this role. Their other roles are unaffected.`"
        />

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="close" />
            <UButton label="Remove Role" color="error" icon="lucide:shield-x" :loading="loading" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
