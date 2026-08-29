<template>
    <div class="px-4 md:px-6 space-y-4">
        <TransactionReport />
        <TransactionTable class="hidden md:block" />
        <TransactionTableMobile class="md:hidden" />
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
