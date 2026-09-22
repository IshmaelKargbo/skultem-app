<script setup lang="ts">
const props = defineProps<{
  classOptions: { label: string; value: string }[]
  feeCategoryOptions: { label: string; value: string }[]
  activeCount: number
}>()

const classSessionId = defineModel<string>('classSessionId', { required: true })
const status = defineModel<string>('status', { required: true })
const feeCategoryId = defineModel<string>('feeCategoryId', { required: true })
const balanceMin = defineModel<string>('balanceMin', { required: true })
const balanceMax = defineModel<string>('balanceMax', { required: true })

const statusOptions = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { label: 'No Payment', value: 'NO_PAYMENT' },
]

const open = ref(false)
const draftClassSessionId = ref(classSessionId.value)
const draftStatus = ref(status.value)
const draftFeeCategoryId = ref(feeCategoryId.value)
const draftBalanceMin = ref(balanceMin.value)
const draftBalanceMax = ref(balanceMax.value)

watch(open, (isOpen) => {
  if (!isOpen) return
  draftClassSessionId.value = classSessionId.value
  draftStatus.value = status.value
  draftFeeCategoryId.value = feeCategoryId.value
  draftBalanceMin.value = balanceMin.value
  draftBalanceMax.value = balanceMax.value
})

const draftIsDefault = computed(() =>
  !draftClassSessionId.value && !draftStatus.value && !draftFeeCategoryId.value
  && !draftBalanceMin.value && !draftBalanceMax.value)

function clearDraft() {
  draftClassSessionId.value = ''
  draftStatus.value = ''
  draftFeeCategoryId.value = ''
  draftBalanceMin.value = ''
  draftBalanceMax.value = ''
}

function apply() {
  classSessionId.value = draftClassSessionId.value
  status.value = draftStatus.value
  feeCategoryId.value = draftFeeCategoryId.value
  balanceMin.value = draftBalanceMin.value
  balanceMax.value = draftBalanceMax.value
  open.value = false
}
</script>

<template>
  <UDrawer v-model:open="open" direction="bottom" title="Filter student balances"
    description="Narrow by class, status, fee type or balance range">
    <div class="relative">
      <UButton :icon="FILTER_ICON" variant="outline" color="info" aria-label="Filters" />
      <UBadge v-if="activeCount" :label="activeCount" color="primary" size="sm"
        class="absolute -top-2 -right-2 rounded-full px-1.5" />
    </div>

    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Filters</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" aria-label="Close" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 md:flex-row md:flex-wrap">
        <UFormField label="Class" class="md:flex-1 md:min-w-40">
          <USelectMenu v-model="draftClassSessionId" value-key="value" label-key="label" :items="classOptions"
            placeholder="Every class" clear class="w-full" />
        </UFormField>
        <UFormField label="Payment Status" class="md:flex-1 md:min-w-40">
          <USelectMenu v-model="draftStatus" value-key="value" label-key="label" :items="statusOptions"
            placeholder="Every status" clear class="w-full" />
        </UFormField>
        <UFormField label="Fee Type" class="md:flex-1 md:min-w-40">
          <USelectMenu v-model="draftFeeCategoryId" value-key="value" label-key="label" :items="feeCategoryOptions"
            placeholder="Every fee type" clear class="w-full" />
        </UFormField>
        <UFormField label="Min Balance" class="md:flex-1 md:min-w-32">
          <UInput v-model="draftBalanceMin" type="number" placeholder="0" class="w-full" />
        </UFormField>
        <UFormField label="Max Balance" class="md:flex-1 md:min-w-32">
          <UInput v-model="draftBalanceMax" type="number" placeholder="Any" class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="grid grid-cols-2 gap-2 w-full md:flex md:justify-end border-t pt-3 border-default">
        <UButton :icon="DELETE_ICON" class="justify-center md:min-w-32" variant="outline" color="error" label="Clear"
          :disabled="draftIsDefault" @click="clearDraft" />
        <UButton color="primary" label="Apply" class="justify-center md:min-w-32" @click="apply" />
      </div>
    </template>
  </UDrawer>
</template>
