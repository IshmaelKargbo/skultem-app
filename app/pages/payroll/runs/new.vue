<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Start Payroll Run"
      subtitle="Every teacher with a salary structure set up will be included automatically — you can exclude anyone before generating." />

    <GuideBar topic="payroll-run-new" />

    <UForm ref="formRef" :state="state" :schema="schema" class="space-y-4" @submit="onSubmit">
      <UCard>
        <template #header>
          <UAlert v-if="summary && summary.teacherCount === 0" color="warning" variant="soft"
            icon="i-lucide-triangle-alert" title="No active staff with a salary yet"
            description="Add a salary for at least one active staff member before starting a payroll run." />

          <UAlert v-else-if="summary" color="neutral" variant="soft" icon="i-lucide-info"
            :title="`${summary.teacherCount} employee${summary.teacherCount === 1 ? '' : 's'} will be included`"
            description="You can exclude specific employees from the run detail page before generating." />
        </template>
        <div class="grid gap-5 md:grid-cols-2">
          <UFormField data-guide="pay-run-period" label="Period" name="period" required hint="e.g. June 2026">
            <UInput v-model="state.period" placeholder="June 2026" class="w-full" />
          </UFormField>

          <UFormField data-guide="pay-run-paydate" label="Pay Date" name="payDate" required>
            <UInput v-model="state.payDate" type="date" class="w-full" />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex gap-3">
            <UButton variant="outline" color="neutral" to="/payroll/runs" label="Cancel" />
            <UButton data-guide="pay-run-create" type="submit" icon="i-lucide-play" :loading="saving" :disabled="!summary?.teacherCount"
              label="Create Run" />
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const router = useRouter()
const notify = useNotify()
const store = usePayrollStore()
const { summary } = storeToRefs(store)

const formRef = ref()
const saving = ref(false)

const state = reactive({
  period: '',
  payDate: ''
})

const schema = yup.object({
  period: yup.string().trim().required('Period is required'),
  payDate: yup.string().required('Pay date is required'),
})

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  saving.value = true
  try {
    const run = await store.createRun({ period: state.period, payDate: state.payDate })
    notify.success('Payroll run created.')
    await router.push(`/payroll/runs/${run.id}`)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to create payroll run.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Start Payroll Run')
  useAppStore().setBack('/payroll/runs')
  document.title = 'Start Payroll Run | Payroll | Skultem'

  // Always refresh - a cached count could be out of date after salaries changed.
  store.fetchSummary()
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
