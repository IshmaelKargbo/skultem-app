<template>
  <div class="space-y-3 px-4 md:px-6">

    <!-- Header -->
    <Heading title="Payslip Design" subtitle="Configure the payslip used across your school.">
      <!-- Disabled until the real settings load - saving the defaults would overwrite them. -->
      <UButton data-guide="pay-design-save" icon="i-lucide-save" color="primary" :loading="saving" :disabled="fetching || !!loadError"
        class="justify-center" @click="save">
        Save Settings
      </UButton>
    </Heading>

    <PayrollSectionNav />
    <GuideBar topic="payroll-payslip-design" />

    <DesignSkeleton v-if="fetching" />
    <UCard v-else-if="loadError">
      <div class="flex flex-col items-center gap-3 py-12 text-center">
        <UIcon name="i-lucide-circle-alert" class="size-8 text-error" />
        <p class="font-semibold text-highlighted">Couldn't load payslip settings</p>
        <p class="max-w-sm text-sm text-muted">{{ loadError }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="load" />
      </div>
    </UCard>
    <div v-show="!fetching && !loadError" class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="lg:col-span-2 space-y-6">

        <UCard data-guide="pay-design-sections">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-list" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Sections
              </h3>
            </div>
          </template>

          <p class="text-sm text-muted -mt-1 mb-4">
            Choose what appears on generated payslips.
          </p>

          <div class="grid gap-3 sm:grid-cols-2">
            <label v-for="section in sections" :key="section.key"
              class="flex items-start gap-3 rounded-xl border border-default p-3.5 cursor-pointer transition-colors hover:bg-muted/40">
              <UCheckbox :model-value="settings[section.key]" class="mt-0.5"
                @update:model-value="(value) => (settings[section.key] = !!value)" />

              <div class="flex items-start gap-2.5">
                <UIcon :name="section.icon" class="size-4 mt-0.5 shrink-0 text-muted" />
                <div>
                  <p class="text-sm font-medium">{{ section.label }}</p>
                  <p class="text-xs text-muted">{{ section.hint }}</p>
                </div>
              </div>
            </label>
          </div>
        </UCard>

        <UCard data-guide="pay-design-theme">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Theme
              </h3>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Accent Color">
              <div class="flex items-center gap-3">
                <UInput v-model="settings.accentColor" type="color" class="h-10 w-14 shrink-0 p-1" />
                <UInput v-model="settings.accentColor" placeholder="#4338ca" class="w-full font-mono text-sm" />
              </div>
              <template #help>
                Used for the header bar, brand mark and net pay banner.
              </template>
            </UFormField>

            <UFormField label="Logo URL">
              <UInput v-model="settings.logoUrl" placeholder="https://..." icon="i-lucide-image" class="w-full" />
              <template #help>
                Defaults to your school's branding logo. Also used as the background watermark.
              </template>
            </UFormField>

            <UFormField label="Footer Note" class="sm:col-span-2">
              <UInput v-model="settings.footerNote"
                placeholder="e.g. This is a system-generated payslip and does not require a signature."
                class="w-full" />
              <template #help>
                Leave blank to use the default note.
              </template>
            </UFormField>
          </div>
        </UCard>

      </div>

      <!-- Right -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard data-guide="pay-design-preview" :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Live Preview
              </h3>
            </div>
          </template>

          <div ref="previewViewportRef" class="preview-viewport">
            <div class="preview-frame"
              :style="{ width: `${previewFrameWidth}px`, height: `${previewFrameHeight}px`, margin: '0 auto' }">
              <div class="preview-scale" :style="{ transform: `scale(${previewScale})` }">
                <PayrollPayslipDocument id="payslip-settings-preview" :payslip="mockPayslip" :logo="settings.logoUrl"
                  :accent-color="settings.accentColor" :footer-note="settings.footerNote"
                  :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
              </div>
            </div>
          </div>
        </UCard>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const { success, error: notifyError } = useNotify()
const store = usePayslipSettingStore()
const { settings } = storeToRefs(store)

const saving = ref(false)
const fetching = ref(true)
const loadError = ref<string | null>(null)

async function load() {
  fetching.value = true
  loadError.value = null
  try {
    await store.fetch()
  } catch (err: any) {
    loadError.value = err?.message || 'Something went wrong. Please try again.'
  } finally {
    fetching.value = false
  }
  await nextTick()
  schedulePreviewMeasure()
}

const MAX_PREVIEW_SCALE = 0.4
const DOC_WIDTH = 794

const previewViewportRef = ref<HTMLElement | null>(null)
const previewScale = ref(MAX_PREVIEW_SCALE)
const previewDocHeight = ref(1123)

const previewFrameWidth = computed(() => Math.round(DOC_WIDTH * previewScale.value))
const previewFrameHeight = computed(() => Math.round(previewDocHeight.value * previewScale.value))

let previewResizeObserver: ResizeObserver | undefined
let previewMeasureRaf = 0

function measurePreview() {
  const doc = document.getElementById('payslip-settings-preview')
  if (doc) previewDocHeight.value = Math.max(1123, doc.scrollHeight)

  const available = previewViewportRef.value?.clientWidth || DOC_WIDTH
  previewScale.value = Math.min(MAX_PREVIEW_SCALE, available / DOC_WIDTH)
}

function schedulePreviewMeasure() {
  cancelAnimationFrame(previewMeasureRaf)
  previewMeasureRaf = requestAnimationFrame(measurePreview)
}

onBeforeUnmount(() => {
  // Leaving without saving drops the edits, so payslips keep showing the saved design.
  store.discardChanges()
  previewResizeObserver?.disconnect()
  cancelAnimationFrame(previewMeasureRaf)
})

watch(settings, () => nextTick().then(schedulePreviewMeasure), { deep: true })

interface SectionConfig {
  key: 'showWatermark' | 'showAmountInWords'
  label: string
  hint: string
  icon: string
}

const sections: SectionConfig[] = [
  {
    key: 'showWatermark',
    label: 'Logo Watermark',
    hint: 'Faint school logo behind the payslip',
    icon: 'i-lucide-image'
  },
  {
    key: 'showAmountInWords',
    label: 'Amount in Words',
    hint: 'Spells out the net pay, e.g. "Four Hundred Thousand Leones only"',
    icon: 'i-lucide-text'
  }
]

const mockPayslip: Payslip = {
  id: 'preview',
  schoolId: 'preview',
  payrollRunId: 'preview',
  payrollRunPeriod: 'June 2026',
  payDate: '2026-06-28',
  teacher: {
    id: 'preview',
    title: 'MR',
    user: { id: 'preview', givenNames: 'Alieu', familyName: 'Kamara', email: '', roles: [], status: 'ACTIVE', photo: null, schoolStatus: null, createdAt: '', updatedAt: '' },
    gender: 'MALE',
    staffId: 'THR-2026-0001',
    designation: 'Senior Teacher',
    teaching: true,
    street: '',
    city: '',
    phone: '',
    classes: [],
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  basicSalary: 3000000,
  allowances: 500000,
  deductions: 250000,
  grossSalary: 3500000,
  netSalary: 3250000,
  included: true,
  allowanceLines: [{ name: 'Housing Allowance', amount: 300000 }, { name: 'Transport Allowance', amount: 200000 }],
  deductionLines: [{ name: 'Income Tax (PAYE)', amount: 150000 }, { name: 'NASSIT', amount: 100000 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

async function save() {
  saving.value = true
  try {
    await store.save()
    success('Payslip settings saved')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save payslip settings')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Payslip Design')

  previewResizeObserver = new ResizeObserver(schedulePreviewMeasure)
  if (previewViewportRef.value) previewResizeObserver.observe(previewViewportRef.value)
  measurePreview()

  await load()
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<style scoped>
.preview-viewport {
  overflow: hidden;
  padding: 1rem;
}

.preview-frame {
  overflow: hidden;
}

.preview-scale {
  width: 794px;
  transform-origin: top left;
}
</style>
