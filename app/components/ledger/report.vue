<template>

    <div class="grid gap-5 grid-cols-3">
        <Metric :record="{
            label: 'Total Debit',
            value: format(report?.totalDebit || 0),
            icon: DEBIT_ICON,
            color: 'error',
            subtle: 'Fees charged',
            isReady: !isLoading
        }" />
        <Metric :record="{
            label: 'Total Credit',
            value: format(report?.totalCredit || 0),
            icon: CREDIT_ICON,
            color: 'success',
            subtle: 'Payments made',
            isReady: !isLoading
        }" />
        <Metric :record="{
            label: 'Net Balance',
            value: format(report?.netBalance || 0),
            icon: NET_ICON,
            color: 'info',
            subtle: 'Balance due',
            isReady: !isLoading
        }" />
    </div>
</template>

<script setup lang="ts">
const isLoading = ref(true)
const store = useLedgerStore()
const { format } = useMoney()

type LedgerReportDTO = {
    totalDebit: number
    totalCredit: number
    netBalance: number
}

const report = ref<LedgerReportDTO>()

async function fetchRecord() {
    isLoading.value = true
    const res = await store.caculateLedgerReport()
    report.value = res
    isLoading.value = false
}

defineExpose({
    fetchRecord
})

onMounted(() => fetchRecord())
</script>