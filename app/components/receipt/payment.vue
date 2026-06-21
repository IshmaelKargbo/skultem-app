<template>
    <div :id="id" class="receipt">
        <!-- HEADER -->
        <div class="receipt-header">
            <div class="left">
                <div class="school-name">{{ receipt.name }}</div>
                <div class="subtitle">Official School Fees Receipt</div>
            </div>

            <div class="right">
                <div><strong>Receipt:</strong> {{ receipt.referenceNo }}</div>
                <div><strong>Date:</strong> {{ formatDate(receipt.paidAt) }}</div>
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
        <!-- OUTSTANDING BALANCE -->
        <div class="balance">
            <div>
                <span>Outstanding Balance:</span>
                <strong :class="{ danger: receipt.outstandingBalance > 0 }">
                    {{ format(receipt.outstandingBalance) }}
                </strong>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            This is an official receipt issued by {{ receipt.name }} via skultem.com
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
/* =======================
   PAGE BASE (A4 SIZE)
======================= */
.receipt {
    width: 794px;
    min-height: 1123px;
    padding: 48px;
    box-sizing: border-box;
    background: #ffffff;
    color: #111827;
    font-family: Arial, sans-serif;
}

/* =======================
   HEADER
======================= */
.receipt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #111827;
    padding-bottom: 18px;
    margin-bottom: 28px;
}

.school-name {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
}

.right {
    text-align: right;
    font-size: 13px;
    line-height: 1.6;
}

/* =======================
   SECTIONS
======================= */
.section {
    margin-bottom: 26px;
}

.section-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 12px;
}

/* =======================
   GRID
======================= */
.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px 30px;
}

.grid span {
    display: block;
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 4px;
}

.grid strong {
    font-size: 14px;
}

/* =======================
   TABLE
======================= */
table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    border-bottom: 2px solid #111827;
}

th {
    text-align: left;
    font-size: 12px;
    padding: 10px 0;
}

td {
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
    font-size: 13px;
}

/* =======================
   TOTAL
======================= */
.total {
    display: flex;
    justify-content: flex-end;
    margin-top: 25px;
}

.total div {
    text-align: right;
}

.total span {
    font-size: 12px;
    color: #6b7280;
}

.total strong {
    padding-left: 10px;
    font-size: 26px;
    font-weight: 800;
}


.balance {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.balance div {
    text-align: right;
}

.balance span {
    font-size: 12px;
    color: #6b7280;
}

.balance strong {
    padding-left: 10px;
    font-size: 18px;
    font-weight: 700;
}

.balance strong.danger {
    color: #b91c1c;
    /* red tone for unpaid balance */
}
/* =======================
   SIGNATURES
======================= */
.signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 90px;
    padding: 0 40px;
}

.line {
    width: 220px;
    border-top: 1px solid #111827;
    margin-bottom: 6px;
}

.signatures p {
    font-size: 12px;
    text-align: center;
}

/* =======================
   FOOTER
======================= */
.footer {
    margin-top: 60px;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
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