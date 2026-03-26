<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <!-- Header -->
        <div class="flex justify-between items-center border-gray-200">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Payment Recording</p>
                <p class="text-mute">
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

definePageMeta({
    role: [Role.ACCOUNTANT]
})
</script>
