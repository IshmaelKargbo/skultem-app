<template>
    <UForm :state="state" @submit.prevent="onSubmit" :schema="schema">
        <div class="space-y-3">
            <div class="grid md:grid-cols-2 grid-cols-1 gap-4">

                <!-- LEFT: Payment Details -->
                <div>
                    <UCard class="sticky top-0">
                        <div class="space-y-3">
                            <!-- STUDENT -->
                            <UFormField required label="Student" name="studentId">
                                <USelectMenu value-key="value" :items="students" v-model="state.studentId"
                                    v-model:search-term="studentSearchTerm" :loading="studentsLoading" ignore-filter
                                    @change="onStudentSelect" placeholder="Select student" />
                                <template #help>
                                    Select the student you are recording this payment for.
                                </template>
                            </UFormField>

                            <!-- METHOD -->
                            <UFormField required label="Payment Method" name="method">
                                <USelectMenu value-key="value" v-model="state.method" :items="methodOptions"
                                    placeholder="Select payment method" />
                                <template #help>
                                    Select how the payment was made — cash, bank transfer, or mobile money.
                                </template>
                            </UFormField>

                            <!-- REFERENCE -->
                            <UFormField label="Reference ID" name="reference">
                                <UInput v-model="state.reference" placeholder="e.g. TXN-00123" />
                                <template #help>
                                    Optional. Enter a transaction or receipt number for tracking purposes.
                                </template>
                            </UFormField>

                            <!-- NOTE -->
                            <UFormField label="Note" name="note">
                                <UTextarea v-model="state.note" placeholder="Any additional payment notes…" />
                                <template #help>
                                    Optional. Add any remarks about this payment.
                                </template>
                            </UFormField>

                        </div>
                    </UCard>
                </div>

                <!-- RIGHT: Fee Allocation -->
                <div>
                    <UCard>
                        <template #header>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-medium">Fee Allocation</p>
                                    <p class="text-sm text-muted">
                                        Select which fees this payment covers and enter the amount for each.
                                    </p>
                                </div>
                                <UBadge>{{ allocations.length }}</UBadge>
                            </div>
                        </template>

                        <!-- EMPTY: no student selected -->
                        <div v-if="!state.studentId"
                            class="items-center space-y-3 justify-center min-h-73 py-5 rounded-xl border-dashed flex flex-col text-sm text-muted border-2">
                            <UIcon :name="EMPTY_ICON" class="w-12 h-12" />
                            <p>Select a student to view their outstanding fees</p>
                        </div>

                        <!-- LOADING -->
                        <div v-else-if="loadingFees" class="text-center py-10 text-sm text-muted">
                            <div class="flex items-center justify-center gap-2">
                                <UIcon name="i-lucide-loader-circle" class="animate-spin" />
                                Loading outstanding fees…
                            </div>
                        </div>

                        <!-- NO FEES -->
                        <div v-else-if="!fees.length"
                            class="items-center space-y-3 justify-center py-10 rounded-xl border-dashed flex flex-col text-sm text-muted h-56 border-2">
                            <UIcon name="i-lucide-circle-check-big" class="w-12 h-12 text-green-500" />
                            <p>This student has no outstanding fees</p>
                        </div>

                        <!-- CONTENT -->
                        <div v-else class="space-y-3">

                            <!-- AVAILABLE FEES -->
                            <p class="text-xs text-muted uppercase font-medium tracking-wide">
                                Outstanding Fees
                            </p>

                            <div v-for="fee in fees" :key="fee.feeId"
                                class="border-2 border-gray-200 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <p class="font-medium">{{ fee.feeName }}</p>
                                        <UBadge v-if="fee.allowInstallment === false" size="xs" color="warning"
                                            variant="subtle">
                                            Full payment only
                                        </UBadge>
                                    </div>
                                    <p class="text-xs text-muted">
                                        Outstanding: <span :class="[fee.outstanding > 0 ? 'text-error' : '']">{{ format(fee.outstanding) }}</span>
                                    </p>
                                </div>

                                <UButton size="xs" v-if="!isSelected(fee.feeId)" @click="addFee(fee)">
                                    Add
                                </UButton>
                                <UButton size="xs" v-else color="error" variant="ghost" @click="removeFee(fee.feeId)">
                                    Remove
                                </UButton>
                            </div>

                            <UDivider />

                            <!-- ALLOCATIONS -->
                            <template v-if="allocations.length">
                                <p class="text-xs text-muted uppercase font-medium tracking-wide">
                                    Payment Allocations
                                </p>

                                <div v-for="a in allocations" :key="a.feeId"
                                    class="border-2 border-gray-200 rounded-xl p-3 space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <p class="font-medium">{{ a.feeName }}</p>
                                        <p class="text-muted">Max {{ format(a.outstanding) }}</p>
                                    </div>

                                    <UInput type="number" v-model.number="a.amount" min="0" :max="a.outstanding"
                                        :disabled="a.allowInstallment === false"
                                        :placeholder="`0 – ${format(a.outstanding)}`" @update:modelValue="val => {
                                            a.amount = Number(val)
                                            clampAmount(a)
                                        }" />

                                    <p v-if="a.allowInstallment === false" class="text-xs text-warning">
                                        This fee doesn't allow installments - the full outstanding balance is paid at
                                        once.
                                    </p>
                                    <p v-else class="text-xs text-muted">
                                        Enter the amount being paid toward this fee. Cannot exceed the outstanding
                                        balance.
                                    </p>
                                </div>

                                <UDivider />

                                <!-- TOTALS -->
                                <div class="text-sm space-y-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
                                    <div class="flex justify-between">
                                        <span class="text-muted">Total Allocated</span>
                                        <span :class="{ 'text-red-500 font-medium': isOverAllocated }">
                                            {{ format(totalAllocated) }}
                                        </span>
                                    </div>

                                    <div class="flex justify-between">
                                        <span class="text-muted">Total Outstanding</span>
                                        <span :class="[totalOutstanding > 0 ? 'text-error' : '']">{{ format(totalOutstanding) }}</span>
                                    </div>

                                    <UDivider />

                                    <div class="flex justify-between font-semibold">
                                        <span>Remaining Balance</span>
                                        <span>{{ format(remaining) }}</span>
                                    </div>
                                </div>

                                <div v-if="isOverAllocated"
                                    class="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <UIcon name="i-lucide-triangle-alert" class="shrink-0 mt-0.5" />
                                    One or more allocations exceed the outstanding balance. Please correct the amounts
                                    before submitting.
                                </div>

                                <div v-else-if="totalAllocated === 0" class="text-xs text-muted text-center">
                                    Enter an amount for at least one fee to proceed.
                                </div>

                            </template>

                            <div v-else class="text-sm text-muted text-center py-6">
                                Add fees above to allocate this payment across them.
                            </div>

                        </div>
                        <template #footer>
                            <div class="flex space-x-3 items-center">
                                <UButton variant="outline" color="neutral" to="/fees-payment/pay">
                                    Cancel
                                </UButton>
                                <UButton :trailing-icon="SAVE_ICON" type="submit" :disabled="!canSubmit" :loading="isLoading">
                                    Record Payment
                                </UButton>
                            </div>
                        </template>
                    </UCard>
                </div>
            </div>
        </div>
    </UForm>

    <UModal v-model:open="receiptModalOpen" :dismissible="false">
        <template #content>
            <div class="p-6 space-y-5">
                <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <UIcon name="i-lucide-check" class="text-xl text-green-600" />
                    </div>
                    <div>
                        <h2 class="font-semibold">Payment Recorded</h2>
                        <p class="text-app text-muted">
                            Do you want to download a receipt for this payment?
                        </p>
                    </div>
                </div>

                <div class="flex justify-end gap-3">
                    <UButton color="neutral" variant="subtle" :disabled="isDownloadingReceipt" @click="skipReceipt">
                        No, thanks
                    </UButton>
                    <UButton icon="i-lucide-download" :loading="isDownloadingReceipt" :disabled="!receipt"
                        @click="downloadReceipt">
                        Download Receipt
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>

    <div v-if="receipt" class="pointer-events-none fixed left-0 top-0 -z-10 h-[1123px] w-[794px] overflow-hidden opacity-0">
        <ReceiptPayment id="payment-receipt" :receipt="receipt" :parse-payment-method="PAYMENT_METHOD_LABELS"
            :logo="pdfLogo || settings.logoUrl" :accent-color="settings.accentColor" :footer-note="settings.footerNote"
            :show-watermark="settings.showWatermark" :show-amount-in-words="settings.showAmountInWords" />
    </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const emit = defineEmits(['complete'])
const { $generatePdf } = useNuxtApp()
const notify = useNotify()
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const settingStore = useReceiptSettingStore()
const { settings } = storeToRefs(settingStore)

const state = reactive({
    studentId: '',
    method: '',
    reference: '',
    note: '',
})

const fees = ref<any[]>([])
const allocations = ref<any[]>([])
const loadingFees = ref(false)
const isLoading = ref(false)
const receipt = ref<any | null>(null)
const receiptModalOpen = ref(false)
const isDownloadingReceipt = ref(false)
// The receipt setting's logoUrl is the school's raw R2 URL (see GetReceiptSettingUseCase) - fine
// for on-screen display, but R2's public bucket sends no CORS headers, which taints the canvas
// html2canvas draws it into and silently drops the image from the exported PDF. This resolves it
// to a same-origin data: URI first, same fix already used for ID cards/report cards.
const pdfLogo = ref<string | null>(null)

async function onStudentSelect() {
    allocations.value = []
    fees.value = []
    loadingFees.value = true

    try {
        const result = await useStudentStore()
            .getAllStudentOutstandingFeesById(state.studentId)

        fees.value = result || []
    } finally {
        loadingFees.value = false
    }
}

function addFee(fee: any) {
    if (isSelected(fee.feeId)) return

    allocations.value.push({
        feeId: fee.feeId,
        feeName: fee.feeName,
        outstanding: Number(fee.outstanding),
        allowInstallment: fee.allowInstallment !== false,
        // No installments allowed - there's only one valid amount, so fill it in and lock the field
        // rather than let the accountant type a partial figure that the backend will just reject.
        amount: fee.allowInstallment === false ? Number(fee.outstanding) : 0,
    })
}

function removeFee(id: string) {
    allocations.value = allocations.value.filter(a => a.feeId !== id)
}

function isSelected(id: string) {
    return allocations.value.some(a => a.feeId === id)
}

function clampAmount(a: any) {
    const max = Number(a.outstanding)
    let v = Number(a.amount)

    if (isNaN(v) || v < 0) v = 0
    if (v > max) v = max

    a.amount = v
}

watch(allocations, () => {
    allocations.value.forEach(clampAmount)
}, { deep: true })

const totalAllocated = computed(() =>
    allocations.value.reduce((s, a) => s + Number(a.amount || 0), 0)
)

const totalOutstanding = computed(() =>
    fees.value.reduce((s, f) => s + Number(f.outstanding || 0), 0)
)

const remaining = computed(() =>
    Math.max(0, totalOutstanding.value - totalAllocated.value)
)

const isOverAllocated = computed(() =>
    totalAllocated.value > totalOutstanding.value
)

const schema = yup.object({
    studentId: yup.string().required('Please select a student'),
    method: yup.string().required('Please select a payment method'),
})

const canSubmit = computed(() =>
    state.studentId &&
    state.method &&
    allocations.value.length > 0 &&
    totalAllocated.value > 0 &&
    !isOverAllocated.value
)

async function onSubmit() {
    isLoading.value = true

    try {
        const response = await useFeePaymentStore().recordPayment({
            studentId: state.studentId,
            method: state.method,
            referenceNo: state.reference,
            note: state.note,
            allocations: allocations.value.map(a => ({
                feeId: a.feeId,
                amount: a.amount
            }))
        }) as any

        const payments = response?.data || []
        if (payments.length) {
            receipt.value = buildPaymentReceipt(payments, { method: state.method, studentName: selectedStudentName.value })
            await loadReceiptSettings()
            receiptModalOpen.value = true
        }

        emit('complete')
        reset()
        scrollToTop()
        notify.success('Payment recorded successfully')
    } catch (error: any) {
        notify.error(error.errors?.[0] || error.message)
    } finally {
        isLoading.value = false
    }
}

async function downloadReceipt() {
    if (!receipt.value) return

    isDownloadingReceipt.value = true
    await nextTick()

    try {
        await $generatePdf('#payment-receipt', `receipt-${sanitizeFilename(receipt.value.referenceNo)}`)
        receiptModalOpen.value = false
        receipt.value = null
    } catch (error) {
        console.error('Receipt download failed:', error)
        notify.warning('Receipt download failed. Please try again.')
    } finally {
        isDownloadingReceipt.value = false
    }
}

async function loadReceiptSettings() {
    const tasks: Promise<any>[] = []

    if (!settingStore.loaded) tasks.push(settingStore.fetch())
    if (pdfLogo.value === null) tasks.push(loadPdfLogo())

    try {
        await Promise.all(tasks)
    } catch {
        // The receipt design is a decorative touch - failing to load it shouldn't
        // block the payment flow, so the receipt just falls back to the defaults.
    }
}

async function loadPdfLogo() {
    try {
        const assets = await SchoolApi().getBrandingAssets()
        pdfLogo.value = assets?.logo || ''
    } catch {
        pdfLogo.value = ''
    }
}

function skipReceipt() {
    receiptModalOpen.value = false
    receipt.value = null
}

function reset() {
    state.studentId = ''
    state.method = ''
    state.reference = ''
    state.note = ''
    fees.value = []
    allocations.value = []
}

function format(v: number) {
    return new Intl.NumberFormat().format(v || 0)
}

function sanitizeFilename(value: string) {
    return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

function scrollToTop() {
    nextTick(() => {
        scrollContainer?.value?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    })
}

const methodOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' }
]

const { searchTerm: studentSearchTerm, students, loading: studentsLoading } = useStudentSearch()

const selectedStudentName = computed(() =>
    students.value.find(s => s.value === state.studentId)?.label
)
</script>

<style scoped>
/* Scales the full-size receipt down to fit the confirmation modal - same trick used by the
   receipt design settings page's Live Preview, so what's shown here matches what gets printed. */
.preview-card {
    overflow: hidden;
}

.preview-viewport {
    overflow: hidden;
    height: 320px;
}

.preview-scale {
    transform: scale(0.4);
    transform-origin: top left;
    width: 794px;
}
</style>
