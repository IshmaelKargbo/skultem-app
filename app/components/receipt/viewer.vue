<template>
    <div>
        <!-- VIEW MODAL -->
        <UModal v-model:open="open" :ui="{ content: 'max-w-4xl' }">
            <template #content>
                <div class="flex items-center justify-between border-b border-default p-4">
                    <div>
                        <h3 class="font-semibold">Receipt Preview</h3>
                        <p class="text-xs text-muted">{{ receipt?.referenceNo }}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <UButton icon="i-lucide-download" size="sm" :loading="downloading" :disabled="!receipt"
                            @click="downloadCurrent">
                            Download
                        </UButton>
                        <UButton icon="i-lucide-x" size="sm" color="neutral" variant="ghost" @click="open = false" />
                    </div>
                </div>

                <div class="max-h-[75vh] overflow-auto bg-muted/30 p-6">
                    <div v-if="loading" class="flex justify-center py-24">
                        <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl text-muted" />
                    </div>

                    <div v-else-if="receipt" class="mx-auto w-fit shadow-lg">
                        <ReceiptPayment id="receipt-view-instance" :receipt="receipt"
                            :parse-payment-method="PAYMENT_METHOD_LABELS" :logo="settings.logoUrl"
                            :accent-color="settings.accentColor" :footer-note="settings.footerNote"
                            :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
                    </div>

                    <div v-else class="flex flex-col items-center gap-2 py-24 text-center text-sm text-muted">
                        <UIcon name="i-lucide-file-x" class="text-3xl" />
                        Receipt not found.
                    </div>
                </div>
            </template>
        </UModal>

        <!-- Hidden full-size render used for PDF export -->
        <div v-if="receipt"
            class="pointer-events-none fixed left-0 top-0 -z-10 h-[1123px] w-[794px] overflow-hidden opacity-0">
            <ReceiptPayment id="receipt-download-instance" :receipt="receipt"
                :parse-payment-method="PAYMENT_METHOD_LABELS" :logo="pdfLogo || settings.logoUrl"
                :accent-color="settings.accentColor" :footer-note="settings.footerNote"
                :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { $generatePdf } = useNuxtApp()
const notify = useNotify()

const settingStore = useReceiptSettingStore()
const { settings } = storeToRefs(settingStore)

const open = ref(false)
const loading = ref(false)
const downloading = ref(false)
const receipt = ref<any | null>(null)
// The receipt setting's logoUrl is the school's raw R2 URL (see GetReceiptSettingUseCase) - fine
// for the on-screen preview above, but R2's public bucket sends no CORS headers, which taints the
// canvas html2canvas draws it into and silently drops the image from the exported PDF. This
// resolves it to a same-origin data: URI first for the hidden download instance below, same fix
// already used for ID cards/report cards.
const pdfLogo = ref<string | null>(null)

// Best-effort - the receipt's design settings (accent color, logo, footer note) are a decorative
// touch, and previously a failure loading them (a transient network blip, anything) rejected the
// whole Promise.all() this feeds into in loadReceipt() below, discarding the actual receipt data
// even when that part had already succeeded. Neither task here is allowed to throw now.
async function ensureSettingsLoaded() {
    const tasks: Promise<any>[] = []

    if (!settingStore.loaded) tasks.push(settingStore.fetch().catch(() => { }))
    if (pdfLogo.value === null) tasks.push(loadPdfLogo())

    await Promise.all(tasks)
}

async function loadPdfLogo() {
    try {
        const assets = await SchoolApi().getBrandingAssets()
        pdfLogo.value = assets?.logo || ''
    } catch {
        pdfLogo.value = ''
    }
}

async function loadReceipt(referenceNo: string) {
    const [payments] = await Promise.all([
        useFeePaymentStore().getReceipt(referenceNo) as Promise<any>,
        ensureSettingsLoaded(),
    ])

    receipt.value = payments?.length ? buildPaymentReceipt(payments) : null
    return receipt.value
}

async function view(referenceNo: string) {
    open.value = true
    loading.value = true
    receipt.value = null

    try {
        await loadReceipt(referenceNo)
    } catch (error: any) {
        notify.error(error?.message || 'Unable to load receipt.')
    } finally {
        loading.value = false
    }
}

async function download(referenceNo: string) {
    downloading.value = true

    try {
        if (receipt.value?.referenceNo !== referenceNo) {
            await loadReceipt(referenceNo)
        }

        if (!receipt.value) {
            notify.error('Receipt not found.')
            return
        }

        await nextTick()
        await $generatePdf('#receipt-download-instance', `receipt-${sanitizeFilename(receipt.value.referenceNo)}`)
    } catch (error: any) {
        notify.error(error?.message || 'Unable to download receipt.')
    } finally {
        downloading.value = false
    }
}

async function downloadCurrent() {
    if (!receipt.value) return
    await download(receipt.value.referenceNo)
}

function sanitizeFilename(value: string) {
    return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

defineExpose({ view, download, loading, downloading })
</script>
