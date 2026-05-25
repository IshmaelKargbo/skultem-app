<template>
    <div class="md:p-5 p-4 py-3 md:py-4 overflow-y-auto h-full space-y-5">
        <Heading title="Fee Structure Management" subtitle="Create and manage fee structures">
            <div class="space-x-3 lg:w-1/3 flex">
                <USelectMenu class="w-full" placeholder="Select Term" />
                <UButton color="primary" label="Add Fee Structure" icon="prime:plus" to="/fees-payment/structure/add" />
            </div>
        </Heading>
        <FeeStructureTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Fees Structures');
    document.title = 'Fees Structures | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
