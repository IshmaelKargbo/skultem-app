<template>
    <div class="p-4 space-y-4">
        <Heading class="hidden lg:block" title="Transactions" subtitle="Complete financial transaction history" />
        <TransactionReport />
        <TransactionTable />
        <TransactionTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Transactions')
    document.title = 'Transactions | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
