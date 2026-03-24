<template>
    <UCard>
        <div class="space-y-5">
            <div class="flex justify-between items-center">
                <p class="text-base text-mute">Fee History</p>
                <div class="w-72">
                    <USelectMenu v-model="state.student" value-key="value" :loading="loading" :items="children"
                        placeholder="Select Student" />
                </div>
            </div>
            <div>
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
            </div>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';
const store = useParentStore()
const { format } = useMoney()
const state = reactive({
    student: ''
})

const studentStore = useStudentStore()
const { students } = storeToRefs(store)
const loading = ref(true)
const emit = defineEmits(['change'])
const children = computed(() =>
    students.value.map(e => ({
        label: `${e.givenNames} ${e.familyName} - ${e.className}`,
        value: e.id
    }))
)

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
    const res = await studentStore.getAllStudentFeesById(state.student)
    if (res == null) return

    data.value = res.records
    loading.value = false
}

watch(() => state.student, () => {
    fetchRecord()
    emit('change', state.student)
})

watch(() => children.value, () => {
    state.student = children.value[0]?.value || ''
})

onMounted(async () => await store.fetchAllStudents(0, 0))
</script>