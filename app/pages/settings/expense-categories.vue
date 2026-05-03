<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Expense Categories" subtitle="School spending categories">
            <SettingsExpenseAdd />
        </Heading>
        <SettingsExpenseTable />    
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Settings');
    document.title = 'Expense Categories | Settings | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})
</script>
