<template>
    <div class="group relative overflow-hidden md:p-5 p-3 transition-all duration-200" :class="active
        ? 'bg-primary-50 dark:bg-primary-500/10'
        : 'bg-default hover:bg-primary-50 dark:bg-primary-500/10'">

        <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2.5">
                <UAvatar size="md" :src="student.photo" :alt="`${student.givenNames} ${student.familyName}`"
                    loading="lazy" class="shrink-0 ring-2 ring-default" />
                <div class="min-w-0 space-y-0.5">
                    <p class="truncate text-sm font-semibold text-highlighted">
                        {{ student.givenNames }} {{ student.familyName }}
                    </p>
                    <p class="truncate text-[10px] text-muted">
                        {{ student.admissionNumber || 'No Admission No' }} &middot; {{ student.className }}
                    </p>
                </div>
            </div>

            <UBadge size="sm" :color="statusStyle.color" variant="subtle" class="shrink-0">
                {{ statusStyle.label }}
            </UBadge>
        </div>

        <div class="mt-2 space-y-1.5">
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div class="h-full rounded-full transition-all duration-300" :class="progressColor"
                    :style="{ width: `${progressPct}%` }" />
            </div>
            <div class="flex items-center justify-between text-[11px]">
                <span class="text-muted">Paid <span class="font-medium text-highlighted">{{
                    format(student.feeDetail.paid) }}</span>
                    <span v-if="discount > 0" class="text-purple-500"> · Discount {{ format(discount) }}</span>
                </span>
                <span :class="student.feeDetail.balance > 0 ? 'font-medium text-error' : 'font-medium text-success'">
                    {{ student.feeDetail.balance > 0 ? `${format(student.feeDetail.balance)} due` : 'Settled' }}
                </span>
            </div>
        </div>

        <UButton v-if="can([Role.ACCOUNTANT, Role.OWNER]) && student.feeDetail.balance > 0" block size="xs"
            color="primary" variant="soft" icon="streamline-ultimate:cash-payment-bills" class="mt-3 justify-center"
            :to="`/fees-payment/pay?studentId=${student.id}`" @click.stop>
            Pay Fees
        </UButton>
    </div>
</template>

<script setup lang="ts">
const { student, active } = defineProps<{
    student: Student,
    active?: boolean
}>()
const { format } = useMoney()
const { can } = useAuth()

// Matches GetFeeDetailUsecase's actual overallStatus values exactly ("Paid"/"Partial"/"Pending",
// title case, plus "N/A" from its term-scoped overload) - not an UPPERCASE enum, which never
// matched anything here and silently showed every student as "Unpaid" regardless of their real
// status.
const statusStyles: Record<string, { label: string, color: 'success' | 'warning' | 'error' | 'neutral' }> = {
    Paid: { label: 'Paid', color: 'success' },
    Partial: { label: 'Partial', color: 'warning' },
    Pending: { label: 'Pending', color: 'neutral' },
    'N/A': { label: 'N/A', color: 'neutral' }
}

const statusStyle = computed(() => statusStyles[student.feeDetail.status] ?? statusStyles.Pending)

const discount = computed(() => Number(student.feeDetail.discount || 0))

// Progress is measured against what is actually owed - the total less any discount - so a student who
// has paid everything they owe reads 100%, not the fraction of the undiscounted total.
const progressPct = computed(() => {
    const payable = student.feeDetail.total - discount.value
    if (payable <= 0) return student.feeDetail.total > 0 ? 100 : 0
    return Math.min(100, Math.round((student.feeDetail.paid / payable) * 100))
})

const progressColor = computed(() => {
    if (student.feeDetail.balance <= 0) return 'bg-success-500'
    return 'bg-primary-500'
})
</script>
