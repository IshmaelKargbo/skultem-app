<template>
    <div class="p-5 space-y-5">
        <!-- Header -->
        <div class="flex py-2 justify-between items-center border-gray-200">
            <div class="space-y-1">
                <p class="text-xl font-normal">Payment Recording</p>
                <p class="font-light text-muted">
                    Record and manage student fee payments
                </p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <FeePaymentNew />
            <FeePaymentList />
        </div>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Payments')
    document.title = 'Payments | Skultem'
})
</script>