<template>
    <div class="md:p-7 p-4 h-full overflow-y-auto md:space-y-5 space-y-3">
        <Heading title="Audit Logs" subtitle="Track system activity and user actions" />
        <UCard :ui="{
            body: 'p-0 sm:p-0'
        }">
            <UTable :columns="columns" :data="filtered" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="lucide:shield-check" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No audit logs found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #status-cell="{ row }">
                    <UBadge :color="row.original.status === 'SUCCESS' ? 'success' : 'error'" variant="outline"
                        :label="clean(row.original.status)" />
                </template>
                <template #userName-cell="{ row }">
                    <div>
                        <p class="text-sm font-medium">{{ row.original.userName || 'System' }}</p>
                        <p class="text-xs text-mute">{{ row.original.userEmail || '-' }}</p>
                    </div>
                </template>
                <template #createdAt-cell="{ row }">
                    <p class="text-sm">{{ formatDateTime(row.original.createdAt) }}</p>
                </template>
            </UTable>
            <template #footer>
                <div class="flex justify-between items-center">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useAuditStore()
const { records, meta, loading } = storeToRefs(store)

const search = ref('')

const columns = [
    { accessorKey: 'action', header: 'Action', cell: ({ row }: any) => clean(row.original.action) },
    { accessorKey: 'userName', header: 'User' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'ipAddress', header: 'IP Address' },
    { accessorKey: 'device', header: 'Device' },
    { accessorKey: 'createdAt', header: 'Time' }
]

const filtered = computed(() => {
    if (!search.value) return records.value
    const term = search.value.toLowerCase()
    return records.value.filter((item) =>
        item.action?.toLowerCase().includes(term) ||
        item.userName?.toLowerCase().includes(term) ||
        item.userEmail?.toLowerCase().includes(term) ||
        item.details?.toLowerCase().includes(term) ||
        item.ipAddress?.toLowerCase().includes(term)
    )
})

const page = ref(1)
const size = ref(10)

watch(
    () => page.value,
    () => store.fetchAll(page.value, size.value),
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('Auth Management')
    document.title = 'Audit Logs | Auth | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
