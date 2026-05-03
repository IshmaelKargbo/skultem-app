<template>
    <div class="md:p-7 p-4 h-full overflow-y-auto md:space-y-5 space-y-3">
        <Heading title="Users Sessions" subtitle="Monitor active logins and session activity" />
        <UCard :ui="{
            body: 'p-0 sm:p-0'
        }">
            <UTable :columns="columns" :data="records" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="lucide:monitor-check" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No user sessions found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
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
const store = useSessionStore()
const { records, meta, loading } = storeToRefs(store)

const columns = [
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
    useAppStore().setTitle('Auth Management')
    document.title = 'User Sessions | Auth | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>