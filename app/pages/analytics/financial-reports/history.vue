<template>
  <div class="px-4 md:px-6 space-y-4">
    <ReportHeader :selected="selected" :emit-only="false" />
    <ReportPaymentHistory />
  </div>
</template>

<script lang="ts" setup>
const equalSelectOperators = (options: Option[] = []): ReportOperator[] => [
  { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
  { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options }
]

const instantOperators: ReportOperator[] = [
  { name: "Equals (=)", operator: "EQUALS", type: "instant", input: "date" },
  { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "instant", input: "date" },
  { name: "After (>)", operator: "GREATER_THAN", type: "instant", input: "date" },
  { name: "Before (<)", operator: "LESS_THAN", type: "instant", input: "date" },
  { name: "Between (↔)", operator: "BETWEEN", type: "instant", input: "date-range" },
]

const methodOptions: Option[] = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank Transfer', value: 'BANK' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' }
]

// Payment History lists payments, not transactions - its own fields (Date paid, Method), not the
// transactions-shaped default (Direction/Type/Reference don't exist on a payment).
const selected = ref<ReportSelectPayload>({
  entity: "payments",
  filters: [
    { field: "paidAt", label: "Date", operators: instantOperators },
    { field: "method", label: "Method", operators: equalSelectOperators(methodOptions) },
  ]
})

onMounted(() => {
  useAppStore().setTitle('Reports')
  document.title = 'Reports | Skultem'
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
