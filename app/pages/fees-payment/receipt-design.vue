<template>
  <div class="space-y-4 px-4 md:px-6">

    <!-- Header -->
    <Heading title="Receipt Design" subtitle="Configure the payment receipt used across your school.">
      <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/fees-payment/pay" class="justify-center">
        Back
      </UButton>

      <UButton icon="i-lucide-save" color="primary" :loading="saving" class="justify-center" @click="save">
        Save Settings
      </UButton>
    </Heading>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="lg:col-span-2 space-y-6">

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-list" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Sections
              </h3>
            </div>
          </template>

          <p class="text-sm text-muted -mt-1 mb-4">
            Choose what appears on generated receipts.
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

        <UCard>
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
                Used for the header bar, table headings and the total banner.
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
                placeholder="e.g. This is a system-generated receipt and does not require a signature."
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

        <UCard :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Live Preview
              </h3>
            </div>
          </template>

          <div class="preview-viewport">
            <div class="preview-scale">
              <ReceiptPayment id="receipt-settings-preview" :receipt="mockReceipt"
                :parse-payment-method="PAYMENT_METHOD_LABELS" :logo="settings.logoUrl"
                :accent-color="settings.accentColor" :footer-note="settings.footerNote"
                :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
            </div>
          </div>
        </UCard>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const { success, error: notifyError } = useNotify()
const store = useReceiptSettingStore()
const { settings } = storeToRefs(store)

const saving = ref(false)

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
    hint: 'Faint school logo behind the receipt',
    icon: 'i-lucide-image'
  },
  {
    key: 'showAmountInWords',
    label: 'Amount in Words',
    hint: 'Spells out the total paid, e.g. "Four Hundred Thousand Leones only"',
    icon: 'i-lucide-text'
  }
]

const mockReceipt = {
  referenceNo: 'SKL-2026-00021',
  externalReference: 'TXN-88213',
  paidAt: new Date().toISOString(),
  student: 'Alieu Kamara',
  term: 'Second Term 2025/2026',
  paymentMethod: 'BANK',
  total: 450000,
  payments: [
    { id: 1, fee: 'Tuition Fee', amount: 300000 },
    { id: 2, fee: 'Library Fee', amount: 50000 },
    { id: 3, fee: 'Exams Fee', amount: 100000 }
  ]
}

async function save() {
  saving.value = true
  try {
    await store.save()
    success('Receipt settings saved')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save receipt settings')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Receipt Design')
  await store.fetch()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<style scoped>
/* The real receipt component renders at A4 size (794x1123) - scale it down to fit the
   preview card rather than building a second, lower-fidelity mockup of the design. */
.preview-viewport {
  overflow: hidden;
  height: 424px;
}

.preview-scale {
  transform: scale(0.4);
  transform-origin: top left;
  width: 794px;
}
</style>
