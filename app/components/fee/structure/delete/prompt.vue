<script setup lang="ts">
const props = defineProps<{
  open: boolean
  feeId: string
  feeName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  // After a successful delete, so a page showing that fee can leave it.
  deleted: []
}>()

const store = useFeeStructureStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

async function remove() {
  try {
    await store.remove(props.feeId)
    toastSuccess('Fee structure deleted successfully')
    emit('deleted')
  } catch (error: any) {
    toastError(error?.message || 'Failed to delete fee structure')
  }
}
</script>

<template>
  <ConfirmDeleteModal v-model:open="open" title="Delete Fee Structure" :item-name="feeName"
    description="If this fee was charged to students, it is taken off their accounts and their balances are updated. A fee that anyone has already paid towards cannot be deleted."
    :on-confirm="remove" />
</template>
