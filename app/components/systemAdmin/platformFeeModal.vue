<script setup lang="ts">
import * as yup from "yup";

const props = defineProps<{
  open: boolean
  schoolId: string
  schoolName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = usePlatformStore()
const { format } = useMoney()
const { error: toastError, success: toastSuccess } = useNotify()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const loading = ref(false)
const state = reactive({ amount: null as number | null })

const schema = yup.object({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0"),
})

const current = computed(() => store.feeSettingFor(props.schoolId))

// Re-seed the form with this school's current amount every time the modal opens - each school's
// setting is independent, so the previous school's value must never leak into this one.
watch(() => props.open, (value) => {
  if (value) {
    state.amount = current.value.amount
  }
})

function close() {
  open.value = false
}

async function onSubmit() {
  try {
    loading.value = true

    await schema.validate(state, { abortEarly: false })

    await store.updateFeeSetting(props.schoolId, state.amount || 0)

    toastSuccess(`Platform fee updated for ${clean(props.schoolName)}`)
    close()
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong")
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
          <h3 class="text-lg font-semibold">Platform Fee · {{ clean(schoolName) }}</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Amount" name="amount" required>
            <UInput
              v-model.number="state.amount"
              type="number"
              min="0"
              placeholder="Enter amount"
              :disabled="loading"
            />

            <template #help>
              <p class="text-xs text-muted">
                Charged once per student per academic year, for this school only.
              </p>
            </template>
          </UFormField>

          <p v-if="current.updatedAt" class="text-xs text-muted">
            Current amount: {{ current.amount != null ? format(current.amount) : "Not set" }}
            · Last updated {{ formatDate(current.updatedAt) }}
          </p>
          <p v-else class="text-xs text-muted">
            No amount set yet - no platform fee will be seeded for this school until one is.
          </p>
        </UForm>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="close" />
            <UButton label="Save" :trailing-icon="SAVE_ICON" :loading="loading" @click="onSubmit" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
