<script lang="ts" setup>
const { student } = defineProps<{
    student: string
}>()

const studentStore = useStudentStore()
const { format } = useMoney()

// A local flag, not studentStore.loading - that's shared across every fetch this store makes
// (overview/history included), so reusing it here made every stat tile flip "ready" the moment
// any one of them finished, briefly showing stale/zero values in the others.
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

        // Derived from the exact same records the Fee Schedule table below shows, rather than a
        // separate set of analytics queries - so the summary and the table can never disagree,
        // and "Pending" vs "Due Amount" split on the same real per-fee status the table uses
        // (Overdue = past its due date and not yet settled) instead of a date-only cutoff that
        // missed partially-paid-but-overdue fees.
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
