<template>
    <div class="p-4 space-y-4">
        <Heading title="Payment Recording" subtitle="Record and manage student fee payments" />
        <FeePaymentNew @complete="refresh" />
        <DashboardAccountantTable ref="paymentRef" />
    </div>
</template>

<script setup lang="ts">
const paymentRef = ref()

async function refresh() {
    await paymentRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Payments')
    document.title = 'Payments | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.OWNER]
})
</script>
