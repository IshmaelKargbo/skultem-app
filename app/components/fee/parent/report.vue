<script lang="ts" setup>
const { student } = defineProps<{
    student: string
}>()

const studentStore = useStudentStore()
const { format } = useMoney()

const loading = ref(true)

const report = ref({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
})

async function fetchRecord() {
    if (!student) return

    loading.value = true
    try {
        const res = await studentStore.getAllStudentFeesById(student)
        const fees: any[] = res?.records ?? []

        let total = 0, paid = 0, pending = 0, overdue = 0
        for (const fee of fees) {
            total += Number(fee.amount ?? 0)
            paid += Number(fee.amountPaid ?? 0)
            if (fee.status === 'Overdue') {
                overdue += Number(fee.outstanding ?? 0)
            } else if (fee.status === 'Pending' || fee.status === 'Partial') {
                pending += Number(fee.outstanding ?? 0)
            }
        }

        report.value = { total, paid, pending, overdue }
    } finally {
        loading.value = false
    }
}

watch(() => student, fetchRecord, { immediate: true })
</script>
<template>
    <div class="grid gap-3 md:grid-cols-4 grid-cols-2">
        <Metric :record="{
            label: 'Total Fees',
            icon: DEBIT_ICON,
            value: format(report.total),
            isReady: !loading,
            color: 'neutral',
            subtle: 'This academic year'
        }" />
        <Metric :record="{
            label: 'Total Paid',
            icon: PAYMENT_ICON,
            value: format(report.paid),
            isReady: !loading,
            color: 'success',
            subtle: 'Amount received'
        }" />
        <Metric :record="{
            label: 'Pending',
            icon: PENDING_ICON,
            value: format(report.pending),
            isReady: !loading,
            color: 'info',
            subtle: 'Upcoming payments'
        }" />
        <Metric :record="{
            label: 'Due Amount',
            icon: OVERDUE_ICON,
            value: format(report.overdue),
            isReady: !loading,
            color: 'error',
            subtle: 'Requires attention'
        }" />
    </div>

</template>
