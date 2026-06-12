<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Expense Categories" subtitle="School spending categories">
            <SettingsExpenseAdd />
        </Heading>
        <SettingsExpenseTable />    
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Expense Categories');
    document.title = 'Expense Categories | Expenses | Skultem';
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
