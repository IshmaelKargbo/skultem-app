<template>
  <div class="mx-auto max-w-4xl space-y-4 px-4 md:px-6">

    <!-- Header (page chrome - not part of the printable document) -->
    <div class="flex flex-col gap-4 print:hidden md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" square to="/payroll/history" />

        <div>
          <h1 class="text-2xl font-bold">Payslip</h1>
          <p v-if="payslip" class="text-sm text-muted">{{ payslip.payrollRunPeriod }}</p>
        </div>
      </div>

      <div v-if="payslip" class="flex flex-wrap gap-2">
        <UButton icon="i-lucide-printer" variant="soft" @click="window.print()">
          Print
        </UButton>

        <UButton icon="i-lucide-download" :loading="downloading" @click="downloadPdf">
          Download PDF
        </UButton>
      </div>
    </div>

    <div v-if="loading" class="py-16 text-center text-sm text-muted">
      Loading payslip…
    </div>

    <UCard v-else-if="!payslip" class="py-16">
      <div class="text-center">
        <UIcon name="i-lucide-file-question" class="mx-auto text-5xl text-muted" />
        <h3 class="mt-4 text-lg font-semibold">Payslip not found</h3>
        <p class="mt-1 text-sm text-muted">It may not be published yet, or doesn't belong to you.</p>
      </div>
    </UCard>

    <!-- The document itself -->
    <div v-else class="mx-auto w-fit overflow-hidden rounded-2xl shadow-sm print:overflow-visible print:rounded-none print:shadow-none">
      <PayrollPayslipDocument id="payslip-document" :payslip="payslip" :logo="pdfLogo || settings.logoUrl"
        :accent-color="settings.accentColor" :footer-note="settings.footerNote"
        :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const store = usePayrollStore()
const { currentPayslip: payslip } = storeToRefs(store)
const notify = useNotify()
const { $generatePdf } = useNuxtApp()

const settingStore = usePayslipSettingStore()
const { settings } = storeToRefs(settingStore)

// Same CORS-safe logo fetch as the admin payslip page - see that file for why.
const pdfLogo = ref<string | null>(null)
const downloading = ref(false)
const loading = ref(true)

const runId = computed(() => route.params.id as string)

async function loadPdfLogo() {
  try {
    const assets = await SchoolApi().getBrandingAssets()
    pdfLogo.value = assets?.logo || ''
  } catch {
    pdfLogo.value = ''
  }
}

async function downloadPdf() {
  if (!payslip.value) return

  downloading.value = true
  try {
    await nextTick()
    await $generatePdf('#payslip-document', `payslip-${sanitizeFilename(payslip.value.payrollRunPeriod || '')}`)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to download payslip.')
  } finally {
    downloading.value = false
  }
}

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

watch(runId, async (id) => {
  if (!id) return

  loading.value = true
  try {
    await Promise.all([
      store.fetchMyPayslip(id),
      settingStore.loaded ? Promise.resolve() : settingStore.fetch().catch(() => {}),
      pdfLogo.value === null ? loadPdfLogo() : Promise.resolve()
    ])
  } finally {
    loading.value = false
  }

  useAppStore().setTitle('Payslip')
  useAppStore().setBack('/payroll/history')
  document.title = 'Payslip | Skultem'
}, { immediate: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER]
})
</script>

<style scoped>
@media print {
  :deep(body) {
    background: white;
  }
}
</style>
