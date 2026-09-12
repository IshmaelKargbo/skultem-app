<script setup lang="ts">
const props = defineProps<{
  open: boolean
  sale: MaterialSale
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const { format } = useMoney()
const store = useMaterialSaleStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const amount = ref(props.sale.balance)
const method = ref(props.sale.paymentMethod || 'CASH')
const loading = ref(false)

const methodOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank Transfer', value: 'BANK' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' }
]

watch(() => props.open, (val) => {
  if (val) {
    amount.value = props.sale.balance
    method.value = props.sale.paymentMethod || 'CASH'
  }
})

function close() {
  open.value = false
}

async function submit() {
  if (!amount.value || amount.value <= 0) {
    toastError('Enter a valid amount')
    return
  }

  if (amount.value > props.sale.balance) {
    toastError(`Amount cannot exceed the outstanding balance of ${format(props.sale.balance)}`)
    return
  }

  try {
    loading.value = true
    await store.recordPayment(props.sale.id, { amount: amount.value, paymentMethod: method.value })
    await store.fetchSummary()
    toastSuccess('Payment recorded successfully')
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to record payment')
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
          <h3 class="text-lg font-semibold">Record Payment</h3>
        </template>

        <div class="space-y-4">
          <div class="rounded-xl bg-gray-50 dark:bg-gray-900 p-3 text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-muted">Total Amount</span>
              <span>{{ format(sale.totalAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Already Paid</span>
              <span>{{ format(sale.amountPaid) }}</span>
            </div>
            <div class="flex justify-between font-semibold">
              <span>Outstanding Balance</span>
              <span>{{ format(sale.balance) }}</span>
            </div>
          </div>

          <UFormField label="Amount" required>
            <UInput v-model.number="amount" type="number" min="0" :max="sale.balance" step="0.01" class="w-full" />
          </UFormField>

          <UFormField label="Payment Method" required>
            <USelectMenu v-model="method" :items="methodOptions" value-key="value" class="w-full" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" :disabled="loading" @click="close" />
            <UButton label="Record Payment" :loading="loading" @click="submit" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
