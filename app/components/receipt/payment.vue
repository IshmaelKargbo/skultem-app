<template>
    <div :id="id" class="receipt">
        <!-- HEADER -->
        <div class="receipt-header">
            <div class="left">
                <div class="school-name">{{ tenant?.name }}</div>
                <div class="subtitle">Official School Fees Receipt</div>
            </div>

            <div class="right">
                <div>{{ receipt.referenceNo }}</div>
                <div>{{ formatDate(receipt.paidAt) }}</div>
            </div>
        </div>

        <!-- STUDENT INFO -->
        <div class="section">
            <div class="section-title">Student Information</div>

            <div class="grid">
                <div>
                    <span>Student Name</span>
                    <strong>{{ receipt.student }}</strong>
                </div>

                <div>
                    <span>Academic Term</span>
                    <strong>{{ receipt.term }}</strong>
                </div>

                <div>
                    <span>Payment Method</span>
                    <strong>
                        {{ parsePaymentMethod?.[receipt.paymentMethod] || receipt.paymentMethod }}
                    </strong>
                </div>

                <div>
                    <span>Recorded By</span>
                    <strong>Accounts Office</strong>
                </div>
            </div>
        </div>

        <!-- PAYMENT TABLE -->
        <div class="section">
            <div class="section-title">Payment Breakdown</div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th>Amount (SLE)</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(p, i) in receipt.payments" :key="p.id || i">
                        <td>{{ i + 1 }}</td>
                        <td>{{ p.fee }}</td>
                        <td>{{ format(p.amount) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- TOTAL -->
        <div class="total">
            <div>
                <span>Total Paid:</span>
                <strong class="total-amount">{{ format(receipt.total) }}</strong>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            This is an official receipt issued by {{ tenant?.name }} via skultem.com
        </div>

    </div>
</template>

<script setup lang="ts">
defineProps<{
    id: string
    receipt: any
    parsePaymentMethod?: Record<string, string>
}>()
const { format } = useMoney()
const { tenant } = storeToRefs(useAppStore())

function formatDate(value?: string) {
    if (!value) return new Date().toLocaleDateString()

    return new Date(value).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    })
}
</script>

<style scoped>
@reference "../../assets/css/main.css";

/* =======================
   PAGE BASE (A4 SIZE)
======================= */
.receipt {
    @apply box-border bg-white p-12 font-sans text-gray-900;
    width: 794px;
    min-height: 1123px;
    overflow: hidden;
}

/* =======================
   HEADER
======================= */
.receipt-header {
    @apply mb-7 flex items-center justify-between border-b-2 border-gray-900 pb-[18px];
}

.school-name {
    @apply text-2xl font-extrabold tracking-wide;
}

.subtitle {
    @apply mt-1 text-base text-muted;
}

.right {
    @apply text-right text-sm text-muted leading-relaxed;
}

/* =======================
   SECTIONS
======================= */
.section {
    @apply mb-[26px];
}

.section-title {
    @apply mb-3 text-xs uppercase tracking-wider;
}

/* =======================
   GRID
======================= */
.grid {
    @apply grid grid-cols-2 gap-x-[30px] gap-y-3.5;
}

.grid span {
    @apply block text-[11px] text-gray-500;
}

.grid strong {
    @apply text-lg;
}

/* =======================
   TABLE
======================= */
table {
    @apply w-full border-collapse;
}

thead {
    @apply border-b-2 border-gray-900;
}

th {
    @apply py-2.5 text-left text-sm;
}

td {
    @apply m-0 border-b border-gray-200 pb-[18px] text-base;
}

/* =======================
   TOTAL
======================= */
.total {
    @apply mt-[25px] flex justify-end;
}

.total div {
    @apply text-right;
}

.total span {
    @apply text-sm text-gray-500;
}

.total strong {
    @apply pl-2.5 text-[26px] font-extrabold;
}

/* =======================
   FOOTER
======================= */
.footer {
    @apply mt-[60px] text-center text-[10px] text-gray-500;
}

/* =======================
   PRINT OPTIMIZATION
======================= */
@media print {
    .receipt {
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
    }

    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>
