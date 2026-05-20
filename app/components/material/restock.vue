<template>
  <USlideover :dismissible="false" :open="open" @update:open="open = $event">
    <UButton color="info" label="Add Material" :icon="RESTOCK_ICON" @click="open = true" />
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <p class="text-lg font-semibold">Restock Material</p>

        <UButton :icon="CLOSE_ICON" variant="ghost" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

        <UFormField label="Material" name="materialId" required>
          <USelectMenu v-model="state.materialId" :items="materials" value-key="value" placeholder="Select material"
            class="w-full" />
        </UFormField>

        <!-- Quantity -->
        <UFormField label="Quantity" name="quantity" required>
          <UInput v-model.number="state.quantity" type="number" min="1" placeholder="Enter quantity" class="w-full" />
        </UFormField>

        <!-- Note -->
        <UFormField label="Note" name="note">
          <UTextarea v-model="state.note" placeholder="Optional reason for restock" :rows="3" />
        </UFormField>

      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton label="Restock" icon="lucide:package-plus" :loading="isLoading" @click="formRef?.submit()" />

        <UButton label="Cancel" variant="outline" :disabled="isLoading" @click="close" />
      </div>
    </template>

  </USlideover>
</template>
<script setup lang="ts">
import * as yup from 'yup'
const emit = defineEmits<{
  (e: 'success'): void
}>()

const { success: toastSuccess, error: toastError } = useNotify()

const store = useMaterialStore()
const { records } = storeToRefs(store)

const formRef = ref()
const isLoading = ref(false)

const open = ref(false)

const state = reactive({
  materialId: '',
  quantity: 1,
  note: ''
})

const materials = computed(() =>
  records.value.map((m) => ({
    label: m.name,
    value: m.id
  }))
)

const schema = yup.object({
  materialId: yup.string().required('Material is required'),
  quantity: yup.number().min(1).required(),
  note: yup.string().optional()
})

function close() {
  open.value = false

  Object.assign(state, {
    materialId: '',
    quantity: 1,
    note: ''
  })
}

async function onSubmit() {
  try {
    isLoading.value = true

    await store.restock({
      id: state.materialId,
      inStock: state.quantity,
      note: state.note
    })

    await store.fetchAll()
    toastSuccess('Material restocked successfully')

    close()
  } catch (error: any) {
    toastError(error?.message || 'Failed to restock material')
  } finally {
    isLoading.value = false
  }
}

async function fetchMaterials() {
  await store.fetchAll()
}

onMounted(fetchMaterials)
</script>