<template>
    <div class="p-7 overflow-y-auto h-full space-y-5">
        <Heading title="Discounts & Scholarships" subtitle="Manage student discounts and scholarships">
            <FeeDiscountAdd :refresh-report="refreshReport" />
        </Heading>
        <FeeDiscountReport ref="reportRef" />
        <FeeDiscountTable />
    </div>
</template>

<script setup lang="ts">
const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Expenses')
    document.title = 'Expenses | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.ADMIN]
})
</script>