<template>
  <div class="mx-auto max-w-4xl space-y-6">

    <!-- Header (page chrome — not part of the printable document) -->
    <div class="flex flex-col gap-4 print:hidden md:flex-row md:items-center md:justify-between">

      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          square
          :to="`/payroll/employees/${payslip.employee.id}`"
        />

        <div>
          <h1 class="text-2xl font-bold">
            Payslip
          </h1>

          <p class="text-sm text-muted">
            {{ payslip.period }} · {{ payslip.employee.name }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">

        <UButton
          icon="i-lucide-send"
          variant="soft"
          :loading="sending"
          @click="sendPayslip"
        >
          Email Payslip
        </UButton>

        <UButton
          icon="i-lucide-printer"
          variant="soft"
          @click="printPayslip"
        >
          Print
        </UButton>

        <UButton
          icon="i-lucide-download"
          @click="downloadPayslip"
        >
          Download PDF
        </UButton>

      </div>

    </div>

    <UAlert
      v-if="sent"
      color="success"
      variant="soft"
      icon="i-lucide-check-circle-2"
      title="Payslip sent"
      :description="`Emailed to ${payslip.employee.email}`"
      class="print:hidden"
      closable
      @close="sent = false"
    />

    <!-- The document itself -->
    <div
      id="payslip-document"
      class="rounded-2xl border border-default bg-default p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-10"
    >

      <!-- Letterhead -->
      <div class="flex flex-col gap-4 border-b border-default pb-6 sm:flex-row sm:items-start sm:justify-between">

        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-primary-500 text-lg font-bold text-white">
            {{ company.initials }}
          </div>

          <div>
            <p class="font-bold leading-tight">{{ company.name }}</p>
            <p class="text-xs text-muted">{{ company.address }}</p>
          </div>
        </div>

        <div class="text-left sm:text-right">
          <p class="text-xs uppercase tracking-wide text-muted">Payslip</p>
          <p class="font-semibold">{{ payslip.period }}</p>
          <p class="text-xs text-muted">Ref: {{ payslip.reference }}</p>
        </div>

      </div>

      <!-- Employee + payment summary -->
      <div class="grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">

        <div>
          <p class="text-xs text-muted">Employee</p>
          <p class="font-medium">{{ payslip.employee.name }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Position</p>
          <p class="font-medium">{{ payslip.employee.position }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Department</p>
          <p class="font-medium">{{ payslip.employee.department }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Pay Date</p>
          <p class="font-medium">{{ payslip.payDate }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Employee ID</p>
          <p class="font-medium">{{ payslip.employee.employeeId }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Bank</p>
          <p class="font-medium">{{ payslip.payment.bank }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Account Number</p>
          <p class="font-medium">{{ payslip.payment.accountNumber }}</p>
        </div>

        <div>
          <p class="text-xs text-muted">Payment Method</p>
          <p class="font-medium">{{ payslip.payment.method }}</p>
        </div>

      </div>

      <!-- Earnings / Deductions table -->
      <div class="grid gap-6 border-y border-default py-6 sm:grid-cols-2">

        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Earnings</p>

          <div class="space-y-2.5">
            <div class="flex justify-between text-sm">
              <span>Basic Salary</span>
              <span class="font-medium">{{ formatCurrency(payslip.basic) }}</span>
            </div>

            <div
              v-for="item in payslip.allowances"
              :key="item.name"
              class="flex justify-between text-sm"
            >
              <span class="text-muted">{{ item.name }}</span>
              <span class="font-medium">{{ formatCurrency(item.amount) }}</span>
            </div>
          </div>

          <div class="mt-3 flex justify-between border-t border-default pt-3 text-sm font-semibold">
            <span>Gross Earnings</span>
            <span>{{ formatCurrency(grossPay) }}</span>
          </div>
        </div>

        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Deductions</p>

          <div class="space-y-2.5">
            <div
              v-for="item in payslip.deductions"
              :key="item.name"
              class="flex justify-between text-sm"
            >
              <span class="text-muted">{{ item.name }}</span>
              <span class="font-medium text-red-500">- {{ formatCurrency(item.amount) }}</span>
            </div>

            <div
              v-if="payslip.deductions.length === 0"
              class="text-sm text-muted"
            >
              No deductions this period
            </div>
          </div>

          <div class="mt-3 flex justify-between border-t border-default pt-3 text-sm font-semibold">
            <span>Total Deductions</span>
            <span class="text-red-500">- {{ formatCurrency(totalDeductions) }}</span>
          </div>
        </div>

      </div>

      <!-- Net pay -->
      <div class="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">

        <div>
          <p class="text-xs text-muted">Net Pay</p>
          <p class="text-3xl font-bold text-primary">{{ formatCurrency(netPay) }}</p>
        </div>

        <p class="max-w-xs text-center text-xs text-muted sm:text-right">
          {{ amountInWords }}
        </p>

      </div>

      <!-- Footer -->
      <div class="border-t border-default pt-6 text-center text-xs text-muted">
        <p>This is a system-generated payslip and does not require a signature.</p>
        <p class="mt-1">{{ company.name }} · {{ company.address }}</p>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const company = {
  name: "Skultem Schools Group",
  initials: "SS",
  address: "12 Wilberforce Street, Freetown, Sierra Leone"
}

const payslip = reactive({
  reference: "PS-2026-06-0001",
  period: "June 2026",
  payDate: "30 June 2026",

  employee: {
    id: 1,
    employeeId: "EMP-0042",
    name: "Mary Kamara",
    position: "Senior Teacher",
    department: "Teaching",
    email: "mary.kamara@skultem.edu.sl"
  },

  payment: {
    bank: "Rokel Commercial Bank",
    accountNumber: "****4567",
    method: "Bank Transfer"
  },

  basic: 7000,

  allowances: [
    { name: "Housing Allowance", amount: 800 },
    { name: "Transport Allowance", amount: 500 },
    { name: "Medical Allowance", amount: 200 }
  ],

  deductions: [
    { name: "Income Tax", amount: 200 },
    { name: "Pension Contribution", amount: 100 }
  ]
})

const totalAllowances = computed(() =>
  payslip.allowances.reduce((sum, item) => sum + item.amount, 0)
)

const totalDeductions = computed(() =>
  payslip.deductions.reduce((sum, item) => sum + item.amount, 0)
)

const grossPay = computed(() => payslip.basic + totalAllowances.value)

const netPay = computed(() => grossPay.value - totalDeductions.value)

function formatCurrency(value: number) {
  return `Le ${value.toLocaleString()}`
}

// Simple integer-to-words for the "amount in words" line common on formal payslips.
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function chunkToWords(n: number): string {
  if (n === 0) return ""
  if (n < 10) return ones[n]
  if (n < 20) return teens[n - 10]
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
  return `Leones ${numberToWords(Math.floor(netPay.value))} only`
})

const sending = ref(false)
const sent = ref(false)

async function sendPayslip() {
  sending.value = true
  try {
    // Replace with a real API call, e.g.:
    // await $fetch(`/api/payslips/${payslip.reference}/send`, { method: 'POST' })
    await new Promise((resolve) => setTimeout(resolve, 700))
    sent.value = true
  } finally {
    sending.value = false
  }
}

function printPayslip() {
  window.print()
}

function downloadPayslip() {
  // Replace with a real PDF export, e.g. a server route that renders
  // #payslip-document to PDF, or a client-side lib like html2pdf.js
  window.print()
}
</script>

<style scoped>
@media print {
  :deep(body) {
    background: white;
  }
}
</style>