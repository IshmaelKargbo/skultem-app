<template>
    <div class="px-4 sm:px-6 space-y-4">
        <LedgerReport />
        <TransactionFilters :selected="selected" />
        <LedgerTable />
    </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const { termList } = storeToRefs(academicYearStore)

onMounted(() => {
    useAppStore().setTitle('Student Ledger')
    document.title = 'Ledger | Skultem'

    if (!termList.value.length) academicYearStore.getTerms()
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

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

const selected = computed<ReportSelectPayload>(() => ({
    entity: "ledger",
    filters: [
        { field: "paidAt", label: "Date", operators: instantOperators },
        { field: "transactionType", label: "Type", operators: equalSelectOperators(ledgerTypeOptions) },
        { field: "direction", label: "Direction", operators: equalSelectOperators(directionOptions) },
        { field: "termId", label: "Term", operators: equalSelectOperators(termList.value) }
    ]
}))
</script>
