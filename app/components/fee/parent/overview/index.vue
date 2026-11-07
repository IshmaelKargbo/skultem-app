<template>
    <UCard :ui="{
        body: 'sm:p-0'
    }">
        <template #header>
            <div>
                <p>Fee Schedule</p>
            </div>
        </template>
        <UTable :columns="columns" :data="data" :loading="loading">
            <template #empty>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="ph:wallet-light" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No fee records found.</p>
                </div>
            </template>
            <template #loading>
                <TableLoading :size="columns.length" />
            </template>
            <template #amount-cell="{ row }">
                <p class="text-info">{{ format(row.original.amount as number || 0) }}</p>
            </template>
            <template #amountPaid-cell="{ row }">
                <p class="text-success">{{ format(row.original.amountPaid as number || 0) }}</p>
            </template>
            <template #outstanding-cell="{ row }">
                <p class="text-error">{{ format(row.original.outstanding as number || 0) }}</p>
            </template>
            <template #status-cell="{ row }">
                <UBadge :label="row.original.status" variant="outline"
                    :color="parseFeeStatusColor[row.original.status]"
                    :icon="parseFeeStatusIcon[row.original.status]" />
            </template>
        </UTable>

        <!-- Fees paid on an installment plan: each part and where the child stands on it. -->
        <div v-if="withPlans.length" class="space-y-4 border-t border-default p-4">
            <p class="text-sm font-medium">Payment plans</p>
            <div class="grid gap-4 md:grid-cols-2">
                <div v-for="(fee, i) in withPlans" :key="fee.fee + i" class="rounded-xl border border-default p-3">
                    <p class="mb-2 text-sm font-semibold">{{ fee.fee }} <span class="font-normal text-muted">· {{ fee.term }}</span></p>
                    <FeeInstallmentSchedule :parts="fee.installments" />
                </div>
            </div>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';
const { format } = useMoney()
const { student } = defineProps<{
    student: string
}>()

const store = useStudentStore()
const loading = ref(true)

const data = ref<any>([])
const withPlans = computed(() => (data.value as any[]).filter(f => f.installments?.length))

const columns: TableColumn<any> = [
    {
        accessorKey: 'fee',
        header: 'Name'
    },
    {
        accessorKey: 'term',
        header: 'Term'
    },
    {
        accessorKey: 'amount',
        header: 'Amount'
    },
    {
        accessorKey: 'amountPaid',
        header: 'Paid'
    },
    {
        accessorKey: 'outstanding',
        header: 'Outstanding'
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }: any) => formatDate(row.original.dueDate)
    }
]

async function fetchRecord() {
    if (!student) return
    loading.value = true
    data.value = []
    try {
        const res = await store.getAllStudentFeesById(student)
        data.value = res?.records ?? []
    } finally {
        loading.value = false
    }
}

watch(() => student, fetchRecord, { immediate: true })
</script>