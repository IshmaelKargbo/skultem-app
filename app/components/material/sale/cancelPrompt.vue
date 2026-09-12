<script setup lang="ts">
const props = defineProps<{
  open: boolean
  sale: MaterialSale
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useMaterialSaleStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const loading = ref(false)

function close() {
  open.value = false
}

async function cancel() {
  try {
    loading.value = true
    await store.cancel(props.sale.id)
    await store.fetchSummary()
    toastSuccess('Sale cancelled')
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to cancel sale')
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
          <h3 class="text-lg font-semibold">Cancel Sale</h3>
        </template>

        <div class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            title="This action cannot be undone"
            :description="`Cancel this pre-sale of ${sale.quantity} ${sale.material.name}? Stock was never deducted for it, so nothing needs to be reversed.`"
          />
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Keep Sale" variant="soft" :disabled="loading" @click="close" />
            <UButton label="Cancel Sale" color="error" :loading="loading" @click="cancel" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
