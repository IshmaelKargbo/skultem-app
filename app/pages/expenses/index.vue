<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Expenses Management" subtitle="Manage student discounts and scholarships">
            <ExpensesAdd @refresh-report="refreshReport" />
        </Heading>
        <ExpensesReport ref="reportRef" />
        <ExpensesTable />
        <UCard>
            <WidgetExpenseCategory ref="categoryRef" />
        </UCard>
    </div>
</template>

<script setup lang="ts">
const reportRef = ref()
const categoryRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
    categoryRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Expenses')
    document.title = 'Expenses | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
