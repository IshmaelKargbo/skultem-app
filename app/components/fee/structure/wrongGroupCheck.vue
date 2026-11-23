<script setup lang="ts">
// Finds students charged a "new students only" fee while marked as old (or the other way round) - how a student
// ends up with both the new and the old student fee - and takes off the wrong ones.
const { format } = useMoney()
const { error: toastError, success: toastSuccess } = useNotify()
const { can } = useAuth()
const emit = defineEmits<{ fixed: [] }>()

const open = ref(false)
const loading = ref(false)
const fixing = ref(false)
const result = ref<WrongGroupResult | null>(null)

// Accountants can look; removing charges is for the school's leadership (same as the backend).
const canFix = computed(() => can([Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR]))

const typeLabel: Record<string, string> = {
  NEW: 'New', TRANSFER: 'Transfer', RE_ENROLLMENT: 'Re-enrolment', EXISTING: 'Existing'
}

async function check() {
  open.value = true
  loading.value = true
  try {
    result.value = (await FeeApi().wrongGroupCharges()) ?? null
  } catch (err: any) {
    toastError(err?.message || 'Could not check the fees')
    open.value = false
  } finally {
    loading.value = false
  }
}

async function fix() {
  fixing.value = true
  try {
    const res = await FeeApi().fixWrongGroupCharges()
    if (res) {
      toastSuccess(res.message)
      result.value = (await FeeApi().wrongGroupCharges()) ?? null
      emit('fixed')
    }
  } catch (err: any) {
    toastError(err?.message || 'Could not fix the fees')
  } finally {
    fixing.value = false
  }
}
</script>

<template>
  <UButton color="neutral" variant="soft" icon="ph:user-switch" label="Check new/old fees" @click="check" />

  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-3xl' }">
    <template #content>
      <UCard :ui="{ body: 'max-h-[65vh] overflow-y-auto' }">
        <template #header>
          <h3 class="text-lg font-semibold">New and old student fees</h3>
          <p class="text-sm text-muted">
            A student is either new (New, Transfer) or old (Re-enrolment, Existing), so they should only carry one of the
            two. This finds students charged a fee for the other group in open academic years.
          </p>
        </template>

        <div v-if="loading" class="py-10 text-center text-muted">Checking...</div>

        <div v-else-if="result && !result.items.length" class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:check-circle" class="text-4xl text-success" />
          <p>Every student has only the fees for their group.</p>
        </div>

        <div v-else-if="result" class="space-y-3">
          <UAlert v-if="result.removed" color="warning" variant="soft" icon="ph:warning"
            :title="`${result.removed} charge(s) can be taken off`"
            description="Each one is a fee for the other group that has no payment or discount on it. The student keeps the fee that matches their enrollment type. If a student's type is wrong, change the type on their profile afterwards - their fees follow it." />
          <UAlert v-if="result.needsAttention" color="error" variant="soft" icon="ph:hand"
            :title="`${result.needsAttention} charge(s) need a look first`"
            description="These have a payment or a discount, so they are not removed automatically. Sort out the money first, then check again." />

          <ul class="divide-y divide-default rounded-md border border-default">
            <li v-for="item in result.items" :key="item.studentId + item.feeId"
              class="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <p class="font-medium">
                  {{ item.studentName }}
                  <span class="text-muted font-normal">· {{ item.admissionNumber }} · {{ item.className }}</span>
                </p>
                <p class="text-sm text-muted">
                  Marked {{ typeLabel[item.enrollmentType] ?? item.enrollmentType }}, charged
                  <b class="text-default">{{ item.feeName }}</b> ({{ item.termName }}, {{ item.feeFor.toLowerCase() }})
                  · {{ format(item.amount) }}
                </p>
                <p v-if="item.reason" class="text-sm text-error">{{ item.reason }}</p>
              </div>
              <UBadge :color="item.canRemove ? 'warning' : 'error'" variant="soft" class="self-start sm:self-center"
                :label="item.canRemove ? 'Will be removed' : 'Needs a look'" />
            </li>
          </ul>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Close" variant="soft" @click="open = false" />
            <UButton v-if="canFix && result?.removed" color="warning" :loading="fixing" :disabled="fixing"
              :label="`Remove ${result.removed} wrong charge(s)`" @click="fix" />
          </div>
          <p v-if="!canFix && result?.removed" class="mt-2 text-sm text-muted sm:text-right">
            Ask the principal or owner to remove them.
          </p>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
