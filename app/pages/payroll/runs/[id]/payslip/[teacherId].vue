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

    <!-- The document itself - fixed at A4 size (794x1123), so on a phone-width viewport it's
         scaled down to fit (payslip-viewport measures the available width, payslip-frame/
         payslip-scale below apply the scale) rather than forcing horizontal scroll/pinch-zoom.
         Printing and "Download PDF" both bypass this: print gets the !important override below,
         and $generatePdf clones #payslip-document and forces its own width/transform regardless
         of what's applied here (see plugins/pdf.client.ts). -->
    <div v-else ref="viewportRef" class="payslip-viewport">
      <div class="payslip-frame overflow-hidden rounded-2xl shadow-sm print:overflow-visible print:rounded-none print:shadow-none"
        :style="{ width: `${frameWidth}px`, height: `${frameHeight}px`, margin: '0 auto' }">
        <div class="payslip-scale" :style="{ transform: `scale(${scale})` }">
          <PayrollPayslipDocument id="payslip-document" :payslip="payslip" :logo="pdfLogo || settings.logoUrl"
            :accent-color="settings.accentColor" :footer-note="settings.footerNote"
            :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const DOC_WIDTH = 794

const viewportRef = ref<HTMLElement | null>(null)
const scale = ref(1)
const docHeight = ref(1123)

const frameWidth = computed(() => Math.round(DOC_WIDTH * scale.value))
const frameHeight = computed(() => Math.round(docHeight.value * scale.value))

let resizeObserver: ResizeObserver | undefined
let measureRaf = 0

function measure() {
  const doc = document.getElementById('payslip-document')
  if (doc) docHeight.value = Math.max(1123, doc.scrollHeight)

  const available = viewportRef.value?.clientWidth || DOC_WIDTH
  // Shrink to fit narrow viewports - never scale a document up past its real size on desktop.
  scale.value = Math.min(1, available / DOC_WIDTH)
}

function scheduleMeasure() {
  cancelAnimationFrame(measureRaf)
  measureRaf = requestAnimationFrame(measure)
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  cancelAnimationFrame(measureRaf)
})

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

// The logo of the section this staff member belongs to (the school's when they belong to none or several).
async function loadPdfLogo() {
  try {
    const assets = await useBrandingAssets().get({ teacherId: teacherId.value })
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
    loadPdfLogo()
  ])

  useAppStore().setTitle('Payslip')
  useAppStore().setBack(`/payroll/runs/${r}`)
  document.title = `Payslip | ${teacherName.value || 'Payroll'} | Skultem`

  // The frame this measures only exists once `payslip` is loaded (v-else above), so the
  // observer is (re)attached here rather than in onMounted, which can run before that.
  await nextTick()
  resizeObserver?.disconnect()
  resizeObserver = resizeObserver || new ResizeObserver(scheduleMeasure)
  if (viewportRef.value) resizeObserver.observe(viewportRef.value)
  measure()
}, { immediate: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>

<style scoped>
.payslip-viewport {
  width: 100%;
}

/* payslip-frame is centered with margin:0 auto (set inline, above) rather than flex
   justify-content - a flex item's implicit min-width:auto floors it at its UNSCALED content
   width (794px, since transform doesn't count for layout sizing, only paint), overriding the
   smaller width set on it and pushing the actually-visible scaled content off-center to the
   left. A block box has no such floor. */

.payslip-scale {
  width: 794px;
  transform-origin: top left;
}

@media print {
  :deep(body) {
    background: white;
  }

  /* Printing uses the real page size, not the screen's viewport - undo the on-screen scale
     (applied as an inline style, which needs !important here to be overridden) so the printed
     payslip comes out full size instead of shrunk to whatever width it happened to render at. */
  .payslip-frame {
    width: auto !important;
    height: auto !important;
  }

  .payslip-scale {
    width: auto !important;
    transform: none !important;
  }
}
</style>
