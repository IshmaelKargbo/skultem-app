<template>

    <div class="grid grid-cols-3 gap-5">
        <Metric :record="{
            label: 'Active Discounts',
            value: report.activeDiscounts,
            icon: PARENT_ICON,
            isReady: !isLoading,
            subtle: 'Discounts currently applied',
            color: 'success'
        }" />
        <Metric :record="{
            label: 'Total Savings',
            value: report.totalSavings,
            icon: PARENT_ICON,
            isReady: !isLoading,
            subtle: 'Total amount saved from discounts',
            color: 'primary'
        }" />
        <Metric :record="{
            label: 'Expired',
            value: report.expired,
            icon: PARENT_ICON,
            isReady: !isLoading,
            subtle: 'Discounts no longer active',
            color: 'error'
        }" />
    </div>
</template>

<script setup lang="ts">
type DiscountReport = {
    activeDiscounts: number
    totalSavings: string
    expired: number
}

const isLoading = ref(true)
const store = useFeeDiscountStore()
const report = ref<DiscountReport>({
    activeDiscounts: 0,
    expired: 0,
    totalSavings: ''
})

async function fetchRecord() {
    isLoading.value = true
    const res = await store.caculateDiscountReport()
    report.value = res
    isLoading.value = false
}

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>