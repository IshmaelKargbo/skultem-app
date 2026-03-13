<template>
    <div class="p-5 space-y-5">
        <SettingsHeader />

        <UCard>
            <UTable :columns="columns" :data="records" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="lucide:monitor-check" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No user sessions found.</p>
                    </div>
                </template>
                <template #userName-cell="{ row }">
                    <div>
                        <p class="text-sm font-medium">{{ row.original.userName || 'System' }}</p>
                        <p class="text-xs text-mute">{{ row.original.userEmail || '-' }}</p>
                    </div>
                </template>
                <template #active-cell="{ row }">
                    <UBadge :label="row.original.active ? 'Active' : 'Inactive'"
                        :color="row.original.active ? 'success' : 'neutral'" variant="outline" />
                </template>
                <template #createdAt-cell="{ row }">
                    <p class="text-sm">{{ formatDateTime(row.original.createdAt) }}</p>
                </template>
                <template #actions-cell="{ row }">
                    <UDropdownMenu :items="getRowItems(row)" :content="{ align: 'end' }">
                        <UButton icon="lucide:ellipsis-vertical" color="neutral" size="sm" variant="ghost" />
                    </UDropdownMenu>
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

const store = useSessionStore()
const { records, meta, loading } = storeToRefs(store)

const columns: TableColumn<UserSession>[] = [
    { accessorKey: 'userName', header: 'User' },
    { accessorKey: 'ipAddress', header: 'IP Address' },
    { accessorKey: 'device', header: 'Device' },
    { accessorKey: 'browser', header: 'Browser' },
    { accessorKey: 'active', header: 'Status' },
    { accessorKey: 'createdAt', header: 'Logged In' },
    { id: 'actions', header: '', meta: { class: { td: 'text-right' } } }
]

const page = ref(1)
const size = ref(10)

watch(
    () => page.value,
    () => store.fetchAll(page.value, size.value),
    { immediate: true }
)

function getRowItems(row: any) {
    if (!row.original.active) {
        return [
            {
                label: 'Inactive',
                icon: 'lucide:lock',
                disabled: true
            }
        ]
    }

    return [
        {
            label: 'Logout Session',
            icon: 'lucide:log-out',
            onClick: async () => {
                await store.logout(row.original.id)
                await store.fetchAll(page.value, size.value)
            }
        }
    ]
}

onMounted(() => {
    useAppStore().setTitle('User Sessions')
    document.title = 'User Sessions | Settings | Skultem'
})
</script>
