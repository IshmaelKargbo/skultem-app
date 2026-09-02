<template>
    <div :id="id" class="payslip">
        <!-- Top accent bar -->
        <div class="accent-bar" :style="{ background: accentColor }" />

        <!-- Watermark - the school's own logo, faint and centered, like the receipt template -->
        <img v-if="showWatermark && logo" :src="logo" alt="" class="watermark">

        <div class="payslip-body">
            <!-- HEADER -->
            <div class="payslip-header">
                <div class="brand">
                    <img v-if="logo" :src="logo" alt="" class="brand-logo">
                    <div v-else class="brand-logo brand-logo--fallback" :style="{ background: accentColor }">{{ initials }}</div>

                    <div>
                        <div class="school-name">{{ tenant?.name }}</div>
                        <div class="subtitle">Official Payslip</div>
                    </div>
                </div>

                <div class="header-meta">
                    <span class="status-badge" :class="payslip?.included ? 'status-badge--included' : 'status-badge--excluded'">
                        <svg v-if="payslip?.included" viewBox="0 0 20 20" fill="currentColor" class="status-badge-icon">
                            <path fill-rule="evenodd"
                                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                clip-rule="evenodd" />
                        </svg>
                        {{ payslip?.included ? 'Included' : 'Excluded' }}
                    </span>
                    <div class="meta-line"><span>Period</span><strong>{{ payslip?.payrollRunPeriod || '—' }}</strong></div>
                    <div class="meta-line"><span>Generated</span><strong>{{ formatDate(payslip?.createdAt) }}</strong></div>
                </div>
            </div>

            <!-- EMPLOYEE INFO -->
            <div class="section">
                <div class="section-title">Employee Information</div>

                <div class="info-card">
                    <div class="info-field">
                        <span>Employee Name</span>
                        <strong>{{ employeeName }}</strong>
                    </div>

                    <div class="info-field">
                        <span>Staff ID</span>
                        <strong>{{ payslip?.teacher?.staffId || '—' }}</strong>
                    </div>
                </div>
            </div>

            <!-- EARNINGS / DEDUCTIONS -->
            <div class="section">
                <div class="section-title">Earnings &amp; Deductions</div>

                <div class="breakdown-grid">
                    <div class="breakdown-card">
                        <div class="breakdown-card-title">Earnings</div>
                        <div class="breakdown-row">
                            <span>Basic Salary</span>
                            <strong>{{ format(payslip?.basicSalary) }}</strong>
                        </div>
                        <div class="breakdown-row">
                            <span>Allowances</span>
                            <strong class="text-positive">+ {{ format(payslip?.allowances) }}</strong>
                        </div>
                        <div class="breakdown-total">
                            <span>Gross Earnings</span>
                            <strong>{{ format(payslip?.grossSalary) }}</strong>
                        </div>
                    </div>

                    <div class="breakdown-card">
                        <div class="breakdown-card-title">Deductions</div>
                        <div class="breakdown-row">
                            <span>Total Deductions</span>
                            <strong class="text-negative">- {{ format(payslip?.deductions) }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- NET PAY -->
            <div class="total-band" :style="{ background: accentColor }">
                <div>
                    <div class="total-label">Net Pay</div>
                    <div v-if="showAmountInWords" class="total-words">{{ amountInWords }}</div>
                </div>

                <div class="total-amount">{{ format(payslip?.netSalary) }}</div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
                <p>{{ footerNote || 'This is a system-generated payslip and does not require a signature.' }}</p>
                <p class="footer-brand">Powered by Skultem</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    id: string
    payslip?: Payslip | null
    logo?: string | null
    accentColor?: string
    footerNote?: string
    showWatermark?: boolean
    showAmountInWords?: boolean
}>(), {
    accentColor: '#4338ca',
    showWatermark: true,
    showAmountInWords: true,
})
const { format } = useMoney()
const { tenant } = storeToRefs(useAppStore())

const initials = computed(() => {
    const name = tenant.value?.name || 'S'
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join('') || 'S'
})

const employeeName = computed(() => {
    const t = props.payslip?.teacher
    if (!t) return '—'
    return `${t.user?.givenNames || ''} ${t.user?.familyName || ''}`.trim() || '—'
})

function formatDate(value?: string) {
    if (!value) return new Date().toLocaleDateString()

    return new Date(value).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    })
}

// Simple integer-to-words conversion for the "amount in words" line common on formal payslips.
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function chunkToWords(n: number): string {
    if (n === 0) return ""
    if (n < 10) return ones[n]!
    if (n < 20) return teens[n - 10]!
    if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`
    return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? " " + chunkToWords(n % 100) : ""}`
}

function numberToWords(n: number): string {
    if (n === 0) return "Zero"

    const million = Math.floor(n / 1000000)
    const thousand = Math.floor((n % 1000000) / 1000)
    const rest = n % 1000

    let words = ""
    if (million) words += `${chunkToWords(million)} Million `
    if (thousand) words += `${chunkToWords(thousand)} Thousand `
    if (rest) words += chunkToWords(rest)

    return words.trim()
}

const amountInWords = computed(() => {
    const total = Number(props.payslip?.netSalary || 0)
    return `${numberToWords(Math.floor(total))} Leones only`
})
</script>

<style scoped>
@reference "../../assets/css/main.css";

/* =======================
   PAGE BASE (A4 SIZE)
======================= */
.payslip {
    @apply relative box-border overflow-hidden bg-white font-sans text-gray-900;
    width: 794px;
    min-height: 1123px;
}

.payslip-body {
    @apply relative p-12;
}

/* =======================
   ACCENT BAR + WATERMARK
======================= */
.accent-bar {
    @apply h-3 w-full;
}

.watermark {
    @apply pointer-events-none absolute select-none object-contain opacity-[0.07] grayscale;
    top: 50%;
    left: 50%;
    height: 420px;
    width: 420px;
    transform: translate(-50%, -50%);
}

/* =======================
   HEADER
======================= */
.payslip-header {
    @apply relative mb-8 flex items-start justify-between border-b-2 border-gray-900 pb-6;
}

.brand {
    @apply flex items-center gap-4;
}

.brand-logo {
    @apply h-14 w-14 shrink-0 rounded-2xl object-contain;
}

.brand-logo--fallback {
    @apply flex items-center justify-center text-lg font-bold text-white;
}

.school-name {
    @apply text-2xl font-extrabold tracking-wide;
}

.subtitle {
    @apply mt-1 text-sm text-gray-500;
}

.header-meta {
    @apply flex flex-col items-end gap-2 text-right;
}

.status-badge {
    @apply mb-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider;
}

.status-badge--included {
    @apply bg-green-100 text-green-700;
}

.status-badge--excluded {
    @apply bg-gray-100 text-gray-500;
}

.status-badge-icon {
    @apply h-3.5 w-3.5;
}

.meta-line {
    @apply text-sm leading-relaxed text-gray-500;
}

.meta-line strong {
    @apply ml-1.5 text-gray-900;
}

/* =======================
   SECTIONS
======================= */
.section {
    @apply relative mb-7;
}

.section-title {
    @apply mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500;
}

/* =======================
   EMPLOYEE INFO CARD
======================= */
.info-card {
    @apply grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5;
}

.info-field span {
    @apply block text-[11px] uppercase tracking-wide text-gray-500;
}

.info-field strong {
    @apply mt-0.5 block text-base font-semibold text-gray-900;
}

/* =======================
   EARNINGS / DEDUCTIONS
======================= */
.breakdown-grid {
    @apply grid grid-cols-2 gap-5;
}

.breakdown-card {
    @apply rounded-2xl border border-gray-200 p-5;
}

.breakdown-card-title {
    @apply mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500;
}

.breakdown-row {
    @apply flex items-center justify-between py-1.5 text-sm text-gray-700;
}

.breakdown-total {
    @apply mt-2 flex items-center justify-between border-t border-gray-200 pt-2.5 text-sm font-semibold text-gray-900;
}

.text-positive {
    @apply text-green-600;
}

.text-negative {
    @apply text-red-500;
}

/* =======================
   NET PAY
======================= */
.total-band {
    @apply relative mt-6 mb-8 flex items-center justify-between rounded-2xl px-6 py-5 text-white;
}

.total-label {
    @apply text-xs font-semibold uppercase tracking-wider text-white/80;
}

.total-words {
    @apply mt-1 text-xs italic text-white/80;
}

.total-amount {
    @apply text-3xl font-extrabold;
}

/* =======================
   FOOTER
======================= */
.footer {
    @apply relative mt-10 border-t border-gray-200 pt-5 text-center text-[11px] text-gray-500;
}

.footer p+p {
    @apply mt-1;
}

.footer-brand {
    @apply mt-3 text-[9px] uppercase tracking-widest text-gray-300;
}

/* =======================
   PRINT OPTIMIZATION
======================= */
@media print {
    .payslip {
        width: 210mm;
        min-height: 297mm;
    }

    .payslip-body {
        padding: 20mm;
    }

    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>
