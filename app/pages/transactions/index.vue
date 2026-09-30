<template>
    <div class="px-4 md:px-6 space-y-4">
        <TransactionSectionNav />
        <TransactionReport />
        <TransactionTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Transactions')
    document.title = 'Transactions | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
