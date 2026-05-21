<template>
  <USlideover :dismissible="false" :open="open" @update:open="open = $event">
    <UButton
      color="info"
      label="Supply Material"
      :icon="SUPPLY_ICON"
      @click="open = true"
    />

    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Supply Material</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- Supply -->
        <UFormField label="Supply" name="supplyId" required>
          <USelectMenu
            v-model="state.supplyId"
            :items="suppliesOptions"
            value-key="value"
            placeholder="Select supply"
            class="w-full"
          />
        </UFormField>

        <!-- Info -->
        <div
          v-if="selectedSupply"
          class="p-3 rounded-lg bg-gray-50 text-sm space-y-1"
        >
          <p><strong>Total:</strong> {{ selectedSupply.qty }}</p>
          <p><strong>Collected:</strong> {{ selectedSupply.collectedQty }}</p>
          <p>
            <strong>Remaining:</strong>
            {{ remainingQty }}
          </p>
        </div>

        <!-- Quantity -->
        <UFormField label="Quantity to Collect" name="qty" required>
          <UInput
            v-model.number="state.qty"
            type="number"
            min="1"
            :max="remainingQty"
            placeholder="Enter quantity"
            class="w-full"
          />
        </UFormField>

        <!-- Note -->
        <UFormField label="Note" name="note">
          <UTextarea
            v-model="state.note"
            placeholder="Optional note"
            :rows="3"
          />
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton
          label="Confirm"
          icon="lucide:package-check"
          :loading="isLoading"
          @click="formRef?.submit()"
        />

        <UButton
          label="Cancel"
          variant="outline"
          :disabled="isLoading"
          @click="close"
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const emit = defineEmits<{ (e: 'success'): void }>()

const { success: toastSuccess, error: toastError } = useNotify()

const materialStore = useMaterialStore()
const studentStore = useStudentStore()

const { supplies } = storeToRefs(materialStore)

const formRef = ref()
const isLoading = ref(false)
const open = ref(false)

const state = reactive({
  supplyId: '',
  qty: 1,
  note: ''
})

const selectedSupply = computed(() =>
  supplies.value.find(s => s.id === state.supplyId)
)

const remainingQty = computed(() => {
  if (!selectedSupply.value) return 0
  return selectedSupply.value.qty - selectedSupply.value.collectedQty
})

const suppliesOptions = computed(() =>
  supplies.value.map(s => ({
    label: `${s.student.givenNames} ${s.student.familyName} - ${s.material.name}`,
    value: s.id
  }))
)

const schema = yup.object({
  supplyId: yup.string().required('Supply is required'),

  qty: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Must be at least 1')
    .test('max-check', 'Exceeds available quantity', function (value) {
      const supply = supplies.value.find(s => s.id === this.parent.supplyId)

      if (!supply || !value) return true

      const remaining = supply.qty - supply.collectedQty

      return value <= remaining
    }),

  note: yup.string().optional()
})

function close() {
  open.value = false

  Object.assign(state, {
    supplyId: '',
    qty: 1,
    note: ''
  })
}

async function onSubmit() {
  try {
    isLoading.value = true

    const supply = supplies.value.find(s => s.id === state.supplyId)

    if (!supply) throw new Error('Supply not found')

    const remaining = supply.qty - supply.collectedQty

    if (state.qty > remaining) {
      throw new Error(`Cannot exceed remaining quantity (${remaining})`)
    }

    const newCollected = supply.collectedQty + state.qty

    await materialStore.supply({
      id: state.supplyId,
      qty: newCollected,
      note: state.note
    })

    await materialStore.fetchAllSupply()

    toastSuccess('Supply updated successfully')

    emit('success')
    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to update supply')
  } finally {
    isLoading.value = false
  }
}

async function fetchData() {
  await Promise.all([
    materialStore.fetchAllSupply(),
    studentStore.fetchAll()
  ])
}

onMounted(fetchData)
</script>