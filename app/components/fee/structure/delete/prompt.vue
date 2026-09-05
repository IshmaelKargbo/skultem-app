<script setup lang="ts">
const props = defineProps<{
  open: boolean
  feeId: string
  feeName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
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
  } catch (error: any) {
    toastError(error?.message || 'Failed to delete fee structure')
  }
}
</script>

<template>
  <ConfirmDeleteModal v-model:open="open" title="Delete Fee Structure" :item-name="feeName"
    description="Fee structures already charged to a student cannot be deleted - unassign them first."
    :on-confirm="remove" />
</template>
