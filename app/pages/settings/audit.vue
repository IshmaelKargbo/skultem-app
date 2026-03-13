<template>
    <div class="p-5 space-y-5">
        <SettingsHeader />

        <UCard>
            <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <UInput v-model="search" placeholder="Search action, user, or details" class="md:w-80" />
                <div class="text-xs text-muted">
                    Showing {{ meta?.showingFrom || 0 }} - {{ meta?.showingTo || 0 }} of {{ meta?.total || 0 }}
                </div>
            </div>
        </UCard>

        <UCard>
            <UTable :columns="columns" :data="filtered" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="lucide:shield-check" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No audit logs found.</p>
                    </div>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :color="row.original.status === 'SUCCESS' ? 'success' : 'error'" variant="outline"
                        :label="row.original.status" />
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

            <div v-if="!loading" class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const store = useAuditStore()
const { records, meta, loading } = storeToRefs(store)

const search = ref('')

const columns: TableColumn<AuditLog>[] = [
    { accessorKey: 'action', header: 'Action' },
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
    useAppStore().setTitle('Audit Logs')
    document.title = 'Audit Logs | Settings | Skultem'
})
</script>
