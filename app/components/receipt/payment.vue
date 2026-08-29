<template>
    <div :id="id" class="receipt">
        <!-- Top accent bar -->
        <div class="accent-bar" :style="{ background: accentColor }" />

        <!-- Watermark - the school's own logo, faint and centered, like the report card template -->
        <img v-if="showWatermark && logo" :src="logo" alt="" class="watermark">

        <div class="receipt-body">
            <!-- HEADER -->
            <div class="receipt-header">
                <div class="brand">
                    <img v-if="logo" :src="logo" alt="" class="brand-logo">
                    <div v-else class="brand-logo brand-logo--fallback" :style="{ background: accentColor }">{{ initials }}</div>

                    <div>
                        <div class="school-name">{{ tenant?.name }}</div>
                        <div class="subtitle">Official School Fees Receipt</div>
                    </div>
                </div>

                <div class="header-meta">
                    <span class="paid-badge">
                        <svg viewBox="0 0 20 20" fill="currentColor" class="paid-badge-icon">
                            <path fill-rule="evenodd"
                                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                clip-rule="evenodd" />
                        </svg>
                        Paid
                    </span>
                    <div class="meta-line"><span>Receipt No.</span><strong>{{ receipt.referenceNo }}</strong></div>
                    <div class="meta-line"><span>Date</span><strong>{{ formatDate(receipt.paidAt) }}</strong></div>
                </div>
            </div>

            <!-- STUDENT INFO -->
            <div class="section">
                <div class="section-title">Student Information</div>

                <div class="info-card">
                    <div class="info-field">
                        <span>Student Name</span>
                        <strong>{{ receipt.student }}</strong>
                    </div>

                    <div class="info-field">
                        <span>Academic Term</span>
                        <strong>{{ receipt.term }}</strong>
                    </div>

                    <div class="info-field">
                        <span>Payment Method</span>
                        <strong>{{ parsePaymentMethod?.[receipt.paymentMethod] || receipt.paymentMethod }}</strong>
                    </div>

                    <div class="info-field">
                        <span>{{ receipt.externalReference ? 'Transaction Ref.' : 'Recorded By' }}</span>
                        <strong>{{ receipt.externalReference || 'Accounts Office' }}</strong>
                    </div>
                </div>
            </div>

            <!-- PAYMENT TABLE -->
            <div class="section">
                <div class="section-title">Payment Breakdown</div>

                <div class="table-card">
                    <table>
                        <thead>
                            <tr :style="{ background: accentColor }">
                                <th class="col-index">#</th>
                                <th>Description</th>
                                <th class="col-amount">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(p, i) in receipt.payments" :key="p.id || i">
                                <td class="col-index">{{ i + 1 }}</td>
                                <td>{{ p.fee }}</td>
                                <td class="col-amount">{{ format(p.amount) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TOTAL -->
            <div class="total-band" :style="{ background: accentColor }">
                <div>
                    <div class="total-label">Total Amount Paid</div>
                    <div v-if="showAmountInWords" class="total-words">{{ amountInWords }}</div>
                </div>

                <div class="total-amount">{{ format(receipt.total) }}</div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
                <p class="footer-thanks">Thank you for your prompt payment.</p>
                <p>{{ footerNote || 'This is a system-generated receipt and does not require a signature.' }}</p>
                <p class="footer-brand">Powered by Skultem</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    id: string
    receipt: any
    parsePaymentMethod?: Record<string, string>
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

function formatDate(value?: string) {
    if (!value) return new Date().toLocaleDateString()

    return new Date(value).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    })
}

// Simple integer-to-words conversion for the "amount in words" line common on formal receipts.
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
    const total = Number(props.receipt?.total || 0)
    return `${numberToWords(Math.floor(total))} Leones only`
})
</script>

<style scoped>
@reference "../../assets/css/main.css";

/* =======================
   PAGE BASE (A4 SIZE)
======================= */
.receipt {
    @apply relative box-border overflow-hidden bg-white font-sans text-gray-900;
    width: 794px;
    min-height: 1123px;
}

.receipt-body {
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
.receipt-header {
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

.paid-badge {
    @apply mb-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700;
}

.paid-badge-icon {
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
   STUDENT INFO CARD
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
   TABLE
======================= */
.table-card {
    @apply overflow-hidden rounded-2xl border border-gray-200;
}

table {
    @apply w-full border-collapse;
}

th {
    @apply px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white;
}

td {
    @apply border-t border-gray-200 px-4 py-3.5 text-[15px];
}

tbody tr:nth-child(even) {
    @apply bg-gray-50;
}

.col-index {
    @apply w-10 text-gray-400;
}

.col-amount {
    @apply text-right font-medium;
}

/* =======================
   TOTAL
======================= */
.total-band {
    @apply relative mb-8 flex items-center justify-between rounded-2xl px-6 py-5 text-white;
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

.footer-thanks {
    @apply text-sm font-medium text-gray-700;
}

.footer-brand {
    @apply mt-3 text-[9px] uppercase tracking-widest text-gray-300;
}

/* =======================
   PRINT OPTIMIZATION
======================= */
@media print {
    .receipt {
        width: 210mm;
        min-height: 297mm;
    }

    .receipt-body {
        padding: 20mm;
    }

    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>
