<template>
    <div class="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3">
        <Metric :record="{
            label: 'Expected',
            value: format(report?.expected || 0),
            icon: 'i-lucide-file-text',
            color: 'neutral',
            subtle: 'Charged to students',
            isReady: !loadingReport
        }" />
        <Metric :record="{
            label: 'Collected',
            value: format(report?.collected || 0),
            icon: 'i-lucide-circle-check',
            color: 'success',
            subtle: 'Paid by students',
            isReady: !loadingReport
        }" />
        <Metric class="col-span-2 md:col-span-1" :record="{
            label: 'Outstanding',
            value: format(report?.outstanding || 0),
            icon: 'i-lucide-clock',
            color: 'warning',
            subtle: 'Still to collect',
            isReady: !loadingReport
        }" />
    </div>
</template>

<script setup lang="ts">
const store = usePlatformFeeStore()
const { report, loadingReport } = storeToRefs(store)
const { format } = useMoney()

onMounted(() => store.fetchReport())
</script>
