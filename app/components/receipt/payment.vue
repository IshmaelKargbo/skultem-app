<template>
    <div :id="id" class="payment-receipt" aria-hidden="true">
        <div class="receipt-header">
            <div class="receipt-logo">S</div>
            <div>
                <h1>SKULTEM SCHOOL</h1>
                <p>Official School Fees Receipt</p>
            </div>
        </div>

        <div class="receipt-meta-grid">
            <div>
                <span>Receipt No</span>
                <strong>{{ receipt.referenceNo }}</strong>
            </div>
            <div>
                <span>Date</span>
                <strong>{{ formatDate(receipt.paidAt) }}</strong>
            </div>
            <div>
                <span>Status</span>
                <strong>PAID</strong>
            </div>
        </div>

        <div class="receipt-section">
            <h2>Student Information</h2>
            <div class="receipt-info-grid">
                <div>
                    <span>Student Name</span>
                    <strong>{{ receipt.student }}</strong>
                </div>
                <div>
                    <span>Payment Method</span>
                    <strong>{{ parsePaymentMethod[receipt.paymentMethod] || receipt.paymentMethod }}</strong>
                </div>
                <div>
                    <span>Academic Term</span>
                    <strong>{{ receipt.term }}</strong>
                </div>
                <div>
                    <span>Recorded By</span>
                    <strong>Accounts Office</strong>
                </div>
            </div>
        </div>

        <div class="receipt-section">
            <h2>Payment Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th>Amount (SLE)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(payment, index) in receipt.payments" :key="payment.id || index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ payment.fee }}</td>
                        <td>{{ format(payment.amount) }}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="2">TOTAL PAID</th>
                        <th>{{ format(receipt.total) }} SLE</th>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="receipt-summary">
            <div>
                <span>Total Paid</span>
                <strong>{{ format(receipt.total) }} SLE</strong>
            </div>
            <div>
                <span>Reference</span>
                <strong>{{ receipt.referenceNo }}</strong>
            </div>
        </div>

        <div class="receipt-signatures">
            <div>
                <span></span>
                <p>Bursar Signature</p>
            </div>
            <div>
                <span></span>
                <p>Principal Signature</p>
            </div>
        </div>

        <div class="receipt-footer">
            <p>This is an official computer-generated receipt from SKULTEM SCHOOL.</p>
            <small>Powered by Skultem School Management System</small>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    id: string
    receipt: any
}>()

function format(v: number) {
    return new Intl.NumberFormat().format(v || 0)
}

function formatDate(value?: string) {
    if (!value) return new Date().toLocaleDateString()
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<style scoped>
.payment-receipt {
    position: fixed;
    left: -10000px;
    top: 0;
    z-index: -1;
    width: 794px;
    min-height: 1123px;
    padding: 30px;
    box-sizing: border-box;
    background: #ffffff;
    color: #111827;
    font-family: Arial, sans-serif;
}

.receipt-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
}

.receipt-logo {
    display: flex;
    width: 70px;
    height: 70px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 16px;
    background: #111827;
    color: #ffffff;
    font-size: 30px;
    font-weight: 700;
}

.receipt-header h1 {
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
}

.receipt-header p {
    margin: 6px 0 0;
    font-size: 16px;
    font-weight: 600;
}

.receipt-meta-grid,
.receipt-info-grid,
.receipt-summary {
    display: grid;
    gap: 16px;
}

.receipt-meta-grid {
    grid-template-columns: repeat(3, 1fr);
    margin-top: 28px;
}

.receipt-info-grid,
.receipt-summary {
    grid-template-columns: repeat(2, 1fr);
}

.receipt-meta-grid > div,
.receipt-info-grid > div {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
}

.payment-receipt span {
    display: block;
    margin-bottom: 6px;
    color: #6b7280;
    font-size: 12px;
}

.payment-receipt strong {
    font-size: 15px;
}

.receipt-section {
    margin-top: 35px;
}

.receipt-section h2 {
    margin: 0 0 16px;
    font-size: 17px;
}

.payment-receipt table {
    width: 100%;
    margin-top: 10px;
    border-collapse: collapse;
}

.payment-receipt thead {
    background: #111827;
    color: #ffffff;
}

.payment-receipt th,
.payment-receipt td {
    padding: 14px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    font-size: 14px;
}

.payment-receipt tfoot th {
    background: #f3f4f6;
    font-size: 15px;
}

.receipt-summary {
    margin-top: 35px;
}

.receipt-summary > div {
    padding: 22px;
    border-radius: 16px;
    background: #111827;
    color: #ffffff;
}

.receipt-summary span {
    color: #d1d5db;
}

.receipt-summary strong {
    font-size: 24px;
}

.receipt-signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 70px;
}

.receipt-signatures > div {
    width: 240px;
    text-align: center;
}

.receipt-signatures span {
    height: 1px;
    margin-bottom: 8px;
    border-top: 1px solid #111827;
}

.receipt-signatures p,
.receipt-footer p {
    margin: 0;
    font-size: 13px;
}

.receipt-footer {
    margin-top: 60px;
    text-align: center;
    color: #6b7280;
    font-size: 13px;
}
</style>
