<template>
    <div class="p-4 sm:p-6 lg:p-7 h-full overflow-y-auto space-y-4 sm:space-y-5">
        <!-- Header -->
        <section class="rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-5 lg:p-6">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div class="space-y-1">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                        Payments
                    </p>
                    <p class="text-2xl font-display font-semibold text-gray-900 dark:text-white sm:text-3xl">
                        Payment Recording
                    </p>
                    <p class="text-sm text-mute">
                        Record and manage student fee payments
                    </p>
                </div>
            </div>
        </section>
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
