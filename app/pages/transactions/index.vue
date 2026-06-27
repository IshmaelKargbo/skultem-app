<template>
    <div class="p-4 sm:p-6 lg:p-7 h-full overflow-y-auto space-y-4 sm:space-y-5">
        <UCard class="hidden md:block">
            <Heading title="Transactions" subtitle="Complete financial transaction history" />
        </UCard>
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
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
