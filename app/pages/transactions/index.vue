<template>
    <div class="p-4 space-y-4">
        <Heading class="hidden lg:block" title="Transactions" subtitle="Complete financial transaction history" />
        <TransactionReport />
        <TransactionFilters :selected="selected" />
        <TransactionTable class="hidden md:block" />
        <TransactionTableMobile class="md:hidden" />
    </div>
</template>

<script setup lang="ts">

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

const selected = ref<ReportSelectPayload>({
    entity: "transactions",
    filters: [
        { field: "createdAt", label: "Date", operators: instantOperators },
        { field: "direction", label: "Direction", operators: equalSelectOperators(directionOptions) },
        { field: "type", label: "Type", operators: equalSelectOperators(typeOptions) },
        { field: "referenceType", label: "Reference", operators: equalSelectOperators(referenceTypeOptions) }
    ]
})

onMounted(() => {
    useAppStore().setTitle('Transactions')
    document.title = 'Transactions | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
