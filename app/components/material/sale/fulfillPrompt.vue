<script setup lang="ts">
const props = defineProps<{
  open: boolean
  sale: MaterialSale
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useMaterialSaleStore()
const materialStore = useMaterialStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const loading = ref(false)
const note = ref('')

const hasEnoughStock = computed(() => props.sale.material.inStock >= props.sale.quantity)

function close() {
  open.value = false
  note.value = ''
}

async function fulfill() {
  try {
    loading.value = true
    await store.fulfill(props.sale.id, note.value || undefined)
    await store.fetchSummary()

    // Fulfilling a pre-sale collects its linked Supply under the hood, deducting stock the same
    // way a plain supply collection does - refresh the materials list so it isn't stale elsewhere.
    await materialStore.fetchAll()

    toastSuccess('Sale marked as fulfilled')
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to fulfill sale')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :dismissible="false" v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Fulfill Pre-sold Item</h3>
        </template>

        <div class="space-y-4">
          <UAlert v-if="!hasEnoughStock" color="warning" variant="soft" title="Not enough stock yet"
            :description="`${sale.material.name} only has ${sale.material.inStock} in stock, but ${sale.quantity} is owed on this sale. Restock it first.`" />

          <p v-else class="text-sm text-muted">
            Hand over {{ sale.quantity }} {{ unitLabelMap[sale.material.unit] ?? sale.material.unit }} of
            <strong>{{ sale.material.name }}</strong> to
            {{ sale.student ? `${sale.student.givenNames} ${sale.student.familyName}` : sale.customerName }}
            and deduct it from stock now.
          </p>

          <UFormField label="Note">
            <UTextarea v-model="note" placeholder="Optional note" :rows="2" class="w-full"
              :disabled="!hasEnoughStock" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton class="w-full flex items-center justify-center" label="Cancel" variant="soft" :disabled="loading"
              @click="close" />
            <UButton class="w-full flex items-center justify-center" label="Mark as Fulfilled" :icon="FULFILL_ICON"
              :loading="loading" :disabled="!hasEnoughStock" @click="fulfill" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
