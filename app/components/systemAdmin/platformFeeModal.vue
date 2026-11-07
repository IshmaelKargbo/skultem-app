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
const state = reactive({
  amount: null as number | null,
  installmentMode: 'BY_TERM' as 'BY_TERM' | 'FULL',
  // Off = equal parts; on = the percent for each term below.
  customSplit: false,
  shares: [34, 33, 33] as number[],
})

const sharesTotal = computed(() => state.shares.reduce((n, v) => n + (Number(v) || 0), 0))

// What each part comes to for the amount typed, as a preview.
const preview = computed(() => {
  const amount = Number(state.amount) || 0
  if (state.installmentMode === 'FULL' || !amount) return []
  // Always three parts; equal thirds unless split by hand.
  const shares = state.customSplit ? state.shares : [100 / 3, 100 / 3, 100 / 3]
  let allocated = 0
  return shares.map((share, i) => {
    const part = i === shares.length - 1 ? amount - allocated : Math.floor((amount * share) / 100 * 100) / 100
    allocated += part
    return { label: `Part ${i + 1}`, amount: Math.round(part * 100) / 100 }
  })
})

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
    state.installmentMode = current.value.installmentMode ?? 'BY_TERM'
    state.customSplit = (current.value.termShares?.length ?? 0) > 0
    state.shares = current.value.termShares?.length ? [...current.value.termShares] : [34, 33, 33]
  }
})

function close() {
  open.value = false
}

async function onSubmit() {
  try {
    loading.value = true

    await schema.validate(state, { abortEarly: false })

    if (state.installmentMode === 'BY_TERM' && state.customSplit) {
      if (state.shares.some(v => !v || v < 1)) throw new Error('Give every term a share of at least 1%')
      if (sharesTotal.value !== 100) throw new Error(`The term shares add up to ${sharesTotal.value}% - they need to make 100%`)
    }

    await store.updateFeeSetting(props.schoolId, state.amount || 0, {
      installmentMode: state.installmentMode,
      termShares: state.installmentMode === 'BY_TERM' && state.customSplit ? state.shares.map(Number) : [],
    })

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
                Charged per student per academic year, for this school only.
              </p>
            </template>
          </UFormField>

          <UFormField label="How students pay it" name="installmentMode">
            <URadioGroup v-model="state.installmentMode" variant="card" :disabled="loading" :items="[
              { label: '3 installments', description: 'The total split into 3 parts - one per term, due at the end of each term.', value: 'BY_TERM' },
              { label: 'Full payment', description: 'All of it at once, due at the end of the first term.', value: 'FULL' },
            ]" />
          </UFormField>

          <div v-if="state.installmentMode === 'BY_TERM'" class="space-y-2 rounded-lg border border-default p-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium">Split the 3 parts unevenly</p>
                <p class="text-xs text-muted">Off: equal thirds. On: set each part's share (they must add up to 100%).</p>
              </div>
              <USwitch v-model="state.customSplit" :disabled="loading" />
            </div>
            <div v-if="state.customSplit" class="grid grid-cols-3 gap-2">
              <UFormField v-for="(_, i) in state.shares" :key="i" :label="`Part ${i + 1}`">
                <UInput v-model.number="state.shares[i]" type="number" min="1" max="100" :disabled="loading">
                  <template #trailing><span class="text-xs text-muted">%</span></template>
                </UInput>
              </UFormField>
            </div>
            <p v-if="state.customSplit" class="text-xs" :class="sharesTotal === 100 ? 'text-success' : 'text-warning'">
              Total {{ sharesTotal }}%
            </p>
            <p v-if="preview.length" class="text-xs text-muted">
              Per student: {{ preview.map(p => `${p.label} ${format(p.amount)}`).join(' · ') }}
            </p>
            <p class="text-xs text-muted">
              Applied to this year's platform fee straight away - only when each part is due changes, not what students owe.
            </p>
          </div>

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
