<template>
    <div class="px-4 md:px-6 space-y-4">
        <ExpensesReport ref="reportRef" />
        <ExpensesTable @refresh="refreshReport" />
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
    document.title = 'Expenses | Expenses | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
