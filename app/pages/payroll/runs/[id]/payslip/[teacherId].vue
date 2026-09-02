<template>
  <div class="mx-auto max-w-4xl space-y-4 px-4 md:px-6">

    <!-- Header (page chrome - not part of the printable document) -->
    <div class="flex flex-col gap-4 print:hidden md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" square :to="`/payroll/runs/${runId}`" />

        <div>
          <h1 class="text-2xl font-bold">Payslip</h1>
          <p v-if="payslip" class="text-sm text-muted">{{ payslip.payrollRunPeriod }} · {{ teacherName }}</p>
        </div>
      </div>

      <div v-if="payslip" class="flex flex-wrap gap-2">
        <UButton icon="i-lucide-palette" variant="outline" color="neutral" to="/payroll/payslip-design">
          Design
        </UButton>

        <UButton icon="i-lucide-printer" variant="soft" @click="window.print()">
          Print
        </UButton>

        <UButton icon="i-lucide-download" :loading="downloading" @click="downloadPdf">
          Download PDF
        </UButton>
      </div>
    </div>

    <div v-if="!payslip" class="py-16 text-center text-sm text-muted">
      Loading payslip…
    </div>

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

// The setting's logoUrl is the school's raw R2 URL, fine to display but R2's public bucket sends
// no CORS headers - that taints the canvas html2canvas draws it into and can throw partway through
// (silently killing the whole PDF, not just dropping the logo). Resolve it to a same-origin data:
// URI up front and use that everywhere, same fix already used for receipts/ID cards/report cards.
const pdfLogo = ref<string | null>(null)
const downloading = ref(false)

const runId = computed(() => route.params.id as string)
const teacherId = computed(() => route.params.teacherId as string)

const teacherName = computed(() => {
  const t = payslip.value?.teacher
  if (!t) return ''
  return `${t.user?.givenNames || ''} ${t.user?.familyName || ''}`.trim()
})

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
    await $generatePdf('#payslip-document', `payslip-${sanitizeFilename(payslip.value.payrollRunPeriod)}-${sanitizeFilename(teacherName.value)}`)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to download payslip.')
  } finally {
    downloading.value = false
  }
}

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

watch([runId, teacherId], async ([r, t]) => {
  if (!r || !t) return

  // The design settings and the CORS-safe logo are both decorative/supporting - a failure loading
  // either shouldn't block the payslip data that already succeeded (see receipt/viewer.vue for the
  // same reasoning).
  await Promise.all([
    store.fetchPayslip(r, t),
    settingStore.loaded ? Promise.resolve() : settingStore.fetch().catch(() => {}),
    pdfLogo.value === null ? loadPdfLogo() : Promise.resolve()
  ])

  useAppStore().setTitle('Payslip')
  useAppStore().setBack(`/payroll/runs/${r}`)
  document.title = `Payslip | ${teacherName.value || 'Payroll'} | Skultem`
}, { immediate: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>

<style scoped>
@media print {
  :deep(body) {
    background: white;
  }
}
</style>
