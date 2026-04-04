<template>
    <UCard class="hidden md:block" :ui="{
        body: 'sm:p-0'
    }">
        <template #header>
            <div>
                <p>Fee Schedule</p>
            </div>
        </template>
        <UTable :columns="columns" :data="data" :loading="loading">
            <template #empty-state>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No fee found.</p>
                </div>
            </template>
            <template #total-cell="{ row }">
                <p class="text-info">{{ format(row.original.total as number || 0) }}</p>
            </template>
            <template #paid-cell="{ row }">
                <p class="text-success">{{ format(row.original.paid as number || 0) }}</p>
            </template>
            <template #outstanding-cell="{ row }">
                <p class="text-error">{{ format(row.original.outstanding as number || 0) }}</p>
            </template>
            <template #status-cell="{ row }">
                <UBadge :label="row.original.status" variant="outline"
                    :color="parseFeeStatusColor[row.original.status]" />
            </template>
        </UTable>
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
const parseFeeStatusColor = {
    Unpaid: 'error',
    Paid: 'success',
    Partial: 'info'
}

const columns: TableColumn<any> = [
    {
        accessorKey: 'feeName',
        header: 'Name'
    },
    {
        accessorKey: 'term',
        header: 'Term'
    },
    {
        accessorKey: 'total',
        header: 'Amount'
    },
    {
        accessorKey: 'paid',
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
    loading.value = true
    data.value = []
    const res = await store.getAllStudentFeesById(student)
    if (res == null) return

    data.value = res.records
    loading.value = false
}

watch(() => student, () => {
    fetchRecord()
})
</script>