<script lang="ts" setup>
const feeStore = useFeeStore()
const { loading, feeDetails } = storeToRefs(feeStore)
</script>
<template>
    <div class="grid gap-3 md:grid-cols-3 grid-cols-2">
        <Metric class="col-span-2 md:col-span-1" :record="{
            label: 'Paid',
            icon: CHECK_ICON,
            value: feeDetails.summery?.paid,
            isReady: !loading,
            color: 'success',
            subtle: 'Students who paid in full'
        }" />
        <Metric :record="{
            label: 'Partial',
            icon: PARTIAL_ICON,
            value: feeDetails.summery?.pending,
            isReady: !loading,
            color: 'info',
            subtle: 'Payments still in progress'
        }" />
        <Metric :record="{
            label: 'Pending',
            icon: PENDING_ICON,
            value: feeDetails.summery?.pending,
            isReady: !loading,
            color: 'error',
            subtle: 'Requires payment attention'
        }" />
    </div>
</template>
