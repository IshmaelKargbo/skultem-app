<template>
    <div class="px-4 md:px-6 space-y-4">
        <FeeDiscountReport ref="reportRef" />
        <FeeDiscountTable @refresh="refreshReport" />
    </div>
</template>

<script setup lang="ts">
const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

onMounted(() => {
    useAppStore().setTitle('Discounts')
    document.title = 'Discounts | Fees Payment | Skultem'
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
