<script setup lang="ts">
const { format } = useMoney()
const { success, error: toastError } = useNotify()

const fee = ref<PlatformFeeOverview>()
const perTerm = ref<number | null>(null)
const loading = ref(true)
const failed = ref(false)
const saving = ref(false)
const confirmOpen = ref(false)

async function load() {
  failed.value = false
  try {
    fee.value = await PlatformApi().platformFee()
    perTerm.value = fee.value ? Number(fee.value.perTerm) : null
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

const terms = computed(() => fee.value?.termsPerYear ?? 3)
const amount = computed(() => Number(perTerm.value))
const problem = computed(() => {
  if (perTerm.value === null || perTerm.value === ('' as any) || Number.isNaN(amount.value)) return 'Enter the fee per term'
  if (amount.value <= 0) return 'The fee must be more than 0'
  if (amount.value > 1000000) return 'That is more than the fee can be set to'
  return ''
})
const perYear = computed(() => (problem.value ? 0 : Math.round(amount.value * terms.value * 100) / 100))
const unchanged = computed(() => !!fee.value && !problem.value && Math.round(amount.value * 100) === Math.round(Number(fee.value.perTerm) * 100))
const showProblem = ref(false)

// How the new amount compares with what is set now.
const change = computed(() => {
  if (!fee.value || problem.value) return null
  const diff = Math.round((amount.value - Number(fee.value.perTerm)) * 100) / 100
  return diff === 0 ? null : diff
})
const termList = computed(() => Array.from({ length: terms.value }, (_, i) => i + 1))
function reset() {
  if (fee.value) perTerm.value = Number(fee.value.perTerm)
  showProblem.value = false
}

function review() {
  showProblem.value = true
  if (problem.value) return toastError(problem.value)
  confirmOpen.value = true
}

async function save() {
  saving.value = true
  try {
    fee.value = await PlatformApi().setPlatformFee(amount.value)
    perTerm.value = Number(fee.value!.perTerm)
    confirmOpen.value = false
    showProblem.value = false
    success('Platform fee saved')
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('System Admin · Platform Settings')
  useAppStore().setBack(false)
  document.title = 'Platform Settings | System Admin | Skultem'
  load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-5 px-4 md:px-6">
    <Heading title="Platform Settings" subtitle="The platform fee every student is charged. It is the same for every school." />

    <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="The platform fee could not be loaded">
      <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
    </UAlert>

    <div v-if="loading" class="grid gap-5 lg:grid-cols-3"><USkeleton class="h-80 lg:col-span-2" /><USkeleton class="h-80" /></div>

    <div v-else-if="fee" class="grid items-start gap-5 lg:grid-cols-3">
      <div class="space-y-5 lg:col-span-2">
        <!-- Current -->
        <section class="rounded-2xl border border-default bg-default p-5">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-muted">Current platform fee</p>
              <p class="mt-1 text-4xl font-semibold text-highlighted">{{ format(Number(fee.perYear)) }}<span class="text-base font-normal text-muted"> per student, per year</span></p>
              <p class="mt-1 text-sm text-muted">{{ format(Number(fee.perTerm)) }} a term × {{ fee.termsPerYear }} terms</p>
            </div>
            <div class="flex gap-6 text-sm">
              <div><p class="text-xs text-muted">Schools</p><p class="text-lg font-semibold text-highlighted">{{ fee.schools }}</p></div>
              <div><p class="text-xs text-muted">Last changed</p><p class="text-lg font-semibold text-highlighted">{{ fee.updatedAt ? formatDate(fee.updatedAt) : '—' }}</p></div>
            </div>
          </div>
        </section>

        <!-- Change -->
        <UCard>
          <template #header>
            <div>
              <h3 class="font-semibold text-highlighted">Change the fee</h3>
              <p class="text-xs text-muted">Enter the amount for one term. The yearly amount is worked out for you.</p>
            </div>
          </template>

          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Fee per student, per term" required :error="(showProblem && problem) || undefined">
              <UInput v-model="perTerm" type="number" min="0" step="0.01" size="lg" class="w-full" icon="i-lucide-banknote"
                :color="showProblem && problem ? 'error' : undefined" @keyup.enter="review" />
            </UFormField>
            <UFormField label="Terms in a year" help="Every school has three terms.">
              <UInput :model-value="terms" disabled size="lg" class="w-full" icon="i-lucide-calendar-range" />
            </UFormField>
          </div>

          <!-- Preview -->
          <div class="mt-5 rounded-xl bg-elevated/60 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs text-muted">Each student would pay, per year</p>
                <p class="text-3xl font-semibold text-highlighted">{{ format(perYear) }}</p>
              </div>
              <UBadge v-if="change !== null" size="lg" variant="subtle" :color="change > 0 ? 'warning' : 'info'"
                :icon="change > 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                :label="`${change > 0 ? '+' : '−'}${format(Math.abs(change))} a term`" />
              <UBadge v-else-if="!problem" size="lg" variant="subtle" color="neutral" icon="i-lucide-equal" label="Same as now" />
            </div>
            <div v-if="!problem" class="mt-3 grid grid-cols-3 gap-2">
              <div v-for="t in termList" :key="t" class="rounded-lg bg-default px-3 py-2 text-center">
                <p class="text-[11px] text-muted">Term {{ t }}</p>
                <p class="text-sm font-medium text-highlighted">{{ format(amount) }}</p>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-xs text-muted">Applies to the next fee that is charged. Students already charged keep what they were charged.</p>
              <div class="flex gap-2">
                <UButton variant="ghost" color="neutral" label="Reset" :disabled="unchanged" @click="reset" />
                <UButton icon="i-lucide-save" label="Save platform fee" :loading="saving" :disabled="unchanged" @click="review" />
              </div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Side -->
      <div class="space-y-5">
        <UAlert v-if="fee.schoolsOnOtherFees" color="warning" variant="soft" icon="i-lucide-triangle-alert"
          :title="`${fee.schoolsOnOtherFees} school${fee.schoolsOnOtherFees === 1 ? ' is' : 's are'} on a different fee`"
          description="They were given their own amount from the Schools page. Saving here sets every school to the platform fee.">
          <template #actions><UButton size="xs" color="warning" variant="outline" label="View schools" to="/schools" /></template>
        </UAlert>

        <UCard>
          <template #header><h3 class="font-semibold text-highlighted">How it is charged</h3></template>
          <ol class="space-y-4 text-sm">
            <li class="flex gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-toned">1</span>
              <span class="text-muted">A new school gets the platform fee set up automatically when it is onboarded.</span>
            </li>
            <li class="flex gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-toned">2</span>
              <span class="text-muted">Each enrolled student is charged it once a year, with the first term that starts.</span>
            </li>
            <li class="flex gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-toned">3</span>
              <span class="text-muted">The school records the payments. You see what was collected, school by school.</span>
            </li>
          </ol>
          <template #footer>
            <UButton to="/fee-collection" variant="soft" color="neutral" block icon="i-lucide-hand-coins" trailing-icon="i-lucide-arrow-right" label="See what schools collected" />
          </template>
        </UCard>
      </div>
    </div>

    <UModal v-model:open="confirmOpen" title="Set the platform fee for every school?"
      :description="`Every student will be charged ${format(amount)} per term - ${format(perYear)} a year.`">
      <template #body>
        <ul class="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>It applies to all {{ fee?.schools }} school{{ fee?.schools === 1 ? '' : 's' }}.</li>
          <li>Students who have already been charged keep the amount they were charged.</li>
          <li v-if="fee?.schoolsOnOtherFees">{{ fee.schoolsOnOtherFees }} school{{ fee.schoolsOnOtherFees === 1 ? '' : 's' }} with their own amount will be changed too.</li>
          <li>The change is recorded in the audit log.</li>
        </ul>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton icon="i-lucide-check" label="Save platform fee" :loading="saving" @click="save" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="saving" @click="confirmOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
