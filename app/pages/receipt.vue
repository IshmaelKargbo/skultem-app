<template>
  <div class="page-wrapper">
    <ReceiptPayment
      id="receipt-001"
      :receipt="receipt"
      :parsePaymentMethod="parsePaymentMethod"
    />
  </div>
</template>

<script setup lang="ts">
// MOCK DATA
const receipt = {
  name: 'King\'s Way International School',
  referenceNo: "SKL-2026-00021",
  paidAt: "2026-06-18T10:30:00Z",
  student: "Alieu Kamara",
  term: "Second Term 2025/2026",
  paymentMethod: "cash",
  total: 450000,
  outstandingBalance: 0,
  payments: [
    { id: 1, fee: "Tuition Fee", amount: 300000 },
    { id: 2, fee: "Library Fee", amount: 50000 },
    { id: 3, fee: "Exams Fee", amount: 100000 }
  ]
}

const parsePaymentMethod = {
  cash: "Cash",
  bank: "Bank Transfer",
  mobile: "Mobile Money"
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
}
</style>