<template>
    <div class="p-4 sm:p-6 lg:p-7 h-full overflow-y-auto space-y-4 sm:space-y-5">
        <div>
            <div class="flex flex-col gap-2 md:flex-row md:justify-between md:items-center border-gray-200">
                <div class="space-y-1">
                    <p class="text-2xl font-semibold">Transactions</p>
                    <p class="text-mute">Complete financial transaction history</p>
                </div>
            </div>
        </div>
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
