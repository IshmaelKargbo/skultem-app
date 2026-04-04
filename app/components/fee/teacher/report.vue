<script lang="ts" setup>
const reportStore = useReportStore()
const { loading, fees } = storeToRefs(reportStore)

const report = ref<{
    paid: string
    pending: string
    overdue: string
}>({
    paid: "0",
    pending: "0",
    overdue: "0"
})

async function fetchRecord() {
    const paids = fees.value.filter(e => (e.status == 'Paid'))
    const partials = fees.value.filter(e => (e.status == 'Partial'))
    const overdue = fees.value.filter(e => (e.status == 'Pending'))

    report.value = {
        paid: paids.length.toString(),
        pending: partials.length.toString(),
        overdue: overdue.length.toString()
    }
}

watch(() => fees.value, fetchRecord, { immediate: true })
</script>
<template>
    <div class="grid gap-3 md:grid-cols-3 grid-cols-2">
        <Metric class="col-span-2 md:col-span-1" :record="{
            label: 'Paid',
            icon: CHECK_ICON,
            value: report?.paid,
            isReady: !loading,
            color: 'success',
            subtle: 'Students who paid in full'
        }" />
        <Metric :record="{
            label: 'Partial',
            icon: PARTIAL_ICON,
            value: report?.pending,
            isReady: !loading,
            color: 'info',
            subtle: 'Payments still in progress'
        }" />
        <Metric :record="{
            label: 'Pending',
            icon: PENDING_ICON,
            value: report?.overdue,
            isReady: !loading,
            color: 'error',
            subtle: 'Requires payment attention'
        }" />
    </div>
</template>
