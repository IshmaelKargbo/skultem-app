<template>
    <div class="px-4 md:px-6 space-y-4">
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
