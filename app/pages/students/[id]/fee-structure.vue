<template>
    <StudentView>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-lg">
                            Fee Structure
                        </h3>
                        <p class="text-sm text-muted">
                            Breakdown of student fees, payments, and outstanding balances.
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <UButton v-if="can('ACCOUNTANT')" to="/payments" icon="i-lucide-credit-card"
                            label="Record Payment" color="primary" size="sm" />
                    </div>
                </div>
            </template>

            <!-- Fee Summary -->
            <StudentViewFeeSummary />

            <!-- Fee Groups -->
            <div v-if="loading" class="space-y-3">
                <div v-for="i in 3" :key="i" class="rounded-xl border-2 border-gray-100 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <USkeleton class="h-5 w-5 rounded-full" />
                            <USkeleton class="h-5 w-48" />
                            <USkeleton class="h-6 w-20 rounded-full" />
                        </div>

                        <USkeleton class="h-5 w-24" />
                    </div>
                </div>
            </div>

            <div v-else-if="groups.length" class="space-y-3">
                <div v-for="group in groups" :key="group.key"
                    class="overflow-hidden rounded-xl border border-default border-l-4"
                    :class="group.fullyPaid ? 'border-l-success-500' : 'border-l-error-500'"
                >
                    <!-- Group header -->
                    <button type="button"
                        class="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-elevated/40"
                        @click="toggle(group.key)"
                    >
                        <div class="flex min-w-0 items-center gap-2.5">
                            <UIcon :name="expandedKeys.has(group.key) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                                class="size-4 shrink-0 text-muted" />

                            <UIcon :name="group.fullyPaid ? 'i-lucide-check-circle-2' : 'i-lucide-folder'"
                                class="size-4 shrink-0"
                                :class="group.fullyPaid ? 'text-success-500' : 'text-warning-500'" />

                            <h4 class="truncate font-semibold">
                                {{ group.title }}
                            </h4>

                            <UBadge :color="group.fullyPaid ? 'success' : 'error'" variant="solid" size="sm"
                                class="shrink-0 rounded-full"
                            >
                                {{ group.fullyPaid ? 'Fully Paid' : `${group.unpaidCount} Unpaid` }}
                            </UBadge>
                        </div>

                        <div class="flex shrink-0 items-center gap-4 text-sm">
                            <span class="text-muted">
                                Total: <span class="font-semibold text-highlighted">{{ format(group.total) }}</span>
                            </span>

                            <span v-if="group.due > 0" class="text-error-600 dark:text-error-400">
                                Due: <span class="font-semibold">{{ format(group.due) }}</span>
                            </span>
                        </div>
                    </button>

                    <!-- Group items -->
                    <div v-if="expandedKeys.has(group.key)" class="overflow-x-auto border-t border-default">
                        <table class="w-full min-w-max text-sm">
                            <thead>
                                <tr class="text-[11px] uppercase tracking-wide text-muted">
                                    <th class="px-4 py-2 text-left font-semibold">Fee Type</th>
                                    <th class="px-4 py-2 text-left font-semibold">Due Date</th>
                                    <th class="px-4 py-2 text-right font-semibold">Amount</th>
                                    <th class="px-4 py-2 text-right font-semibold">Paid</th>
                                    <th class="px-4 py-2 text-right font-semibold">Due</th>
                                    <th class="px-4 py-2 text-right font-semibold">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="fee in group.items" :key="fee.id" class="border-t border-default">
                                    <td class="px-4 py-2.5">{{ fee.fee }}</td>
                                    <td class="px-4 py-2.5 text-muted">{{ formatDateString(fee.dueDate) }}</td>
                                    <td class="px-4 py-2.5 text-right">{{ format(fee.amount) }}</td>
                                    <td class="px-4 py-2.5 text-right text-success-600 dark:text-success-400">{{ format(fee.amountPaid) }}</td>
                                    <td class="px-4 py-2.5 text-right"
                                        :class="fee.outstanding > 0 ? 'text-error-600 dark:text-error-400' : 'text-muted'"
                                    >
                                        {{ format(fee.outstanding) }}
                                    </td>
                                    <td class="px-4 py-2.5 text-right">
                                        <UBadge :color="(parseFeeStatusColor[fee.status] as any)"
                                            :icon="parseFeeStatusIcon[fee.status]" variant="solid" size="sm"
                                            class="rounded-full"
                                        >
                                            {{ fee.status }}
                                        </UBadge>
                                    </td>
                                </tr>
                            </tbody>

                            <tfoot>
                                <tr class="font-semibold"
                                    :class="group.fullyPaid ? 'bg-success-50 dark:bg-success-950/60' : 'bg-warning-50 dark:bg-warning-950/60'"
                                >
                                    <td class="px-4 py-2.5" colspan="2">Sub-Total ({{ group.items.length }} items)</td>
                                    <td class="px-4 py-2.5 text-right">{{ format(group.total) }}</td>
                                    <td class="px-4 py-2.5 text-right text-success-600 dark:text-success-400">{{ format(group.paid) }}</td>
                                    <td class="px-4 py-2.5 text-right" :class="group.due > 0 ? 'text-error-600 dark:text-error-400' : ''">
                                        {{ format(group.due) }}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200  dark:border-gray-700 py-10">
                <UIcon name="i-lucide-wallet" class="mb-2 text-4xl text-muted" />

                <p class="font-medium">
                    No fee records found
                </p>

                <p class="text-sm text-muted">
                    Fee records will appear here.
                </p>
            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
const { can } = useAuth()
const store = useStudentStore()
const reportStore = useReportStore()
const { fees } = storeToRefs(reportStore)
const loading = ref(true)
const { record } = storeToRefs(store)
const { format } = useMoney()

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})

type FeeGroup = {
    key: string
    title: string
    items: Fee[]
    total: number
    paid: number
    due: number
    unpaidCount: number
    fullyPaid: boolean
}

const groups = computed<FeeGroup[]>(() => {
    const map = new Map<string, Fee[]>()

    for (const fee of fees.value) {
        const key = fee.term || 'Other'
        const items = map.get(key) ?? []
        items.push(fee)
        map.set(key, items)
    }

    return Array.from(map.entries()).map(([term, items]) => {
        const total = items.reduce((sum, fee) => sum + fee.amount, 0)
        const paid = items.reduce((sum, fee) => sum + fee.amountPaid, 0)
        const due = items.reduce((sum, fee) => sum + fee.outstanding, 0)
        const unpaidCount = items.filter(fee => fee.status !== 'Paid').length

        return {
            key: term,
            title: term,
            items,
            total,
            paid,
            due,
            unpaidCount,
            fullyPaid: unpaidCount === 0
        }
    })
})

const expandedKeys = ref(new Set<string>())

watch(groups, newGroups => {
    for (const group of newGroups) {
        if (!expandedKeys.value.has(group.key)) expandedKeys.value.add(group.key)
    }
}, { immediate: true })

function toggle(key: string) {
    if (expandedKeys.value.has(key)) expandedKeys.value.delete(key)
    else expandedKeys.value.add(key)
}

async function fetchFeeStructure() {
    loading.value = true
    if (!record.value?.id) return

    await reportStore.runReport(
        {
            entity: 'fees',
            filters: [
                {
                    field: 'enrollment.student.id',
                    value: record.value.id,
                    operator: 'EQUALS',
                    type: 'select'
                }
            ]
        },
        1,
        100
    )
    loading.value = false
}

watch(
    () => record.value,
    async value => {
        if (!value) return

        await fetchFeeStructure()
    },
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack(true)

    document.title = 'Fee Structure | View Student | Students | Skultem'
})
</script>
