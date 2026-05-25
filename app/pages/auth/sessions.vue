<template>
    <div class="space-y-3 p-4 md:space-y-5 md:p-7 h-full overflow-y-auto">
        <Heading title="Users Sessions" subtitle="Monitor active logins and session activity" />

        <!-- Desktop -->
        <UCard class="hidden md:block" :ui="{
            body: 'p-0'
        }">
            <UTable :columns="columns" :data="records" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="lucide:monitor-check" class="text-4xl text-gray-400" />

                        <p class="text-gray-500">
                            No user sessions found.
                        </p>
                    </div>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>

                <template #userName-cell="{ row }">
                    <div>
                        <p class="text-sm font-medium text-highlighted">
                            {{ row.original.userName || 'System' }}
                        </p>

                        <p class="text-xs text-muted">
                            {{ row.original.userEmail || '-' }}
                        </p>
                    </div>
                </template>

                <template #active-cell="{ row }">
                    <UBadge :label="row.original.active ? 'Active' : 'Inactive'"
                        :color="row.original.active ? 'success' : 'neutral'" variant="soft" />
                </template>

                <template #createdAt-cell="{ row }">
                    <p class="text-sm">
                        {{ formatDateTime(row.original.createdAt) }}
                    </p>
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex justify-end">
                        <UDropdownMenu :items="getRowItems(row)" :content="{ align: 'end' }">
                            <UButton icon="lucide:ellipsis-vertical" color="neutral" size="sm" variant="ghost" />
                        </UDropdownMenu>
                    </div>
                </template>
            </UTable>

            <template #footer>
                <div class="flex items-center justify-between">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>

        <!-- Mobile -->
        <div class="space-y-4 md:hidden">
            <!-- Loading -->
            <template v-if="loading">
                <UCard v-for="i in 4" :key="i"
                    class="overflow-hidden">
                    <div class="space-y-4 p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <USkeleton class="size-12 rounded-2xl" />

                                <div class="space-y-2">
                                    <USkeleton class="h-3 w-28" />
                                    <USkeleton class="h-2 w-40" />
                                </div>
                            </div>

                            <USkeleton class="size-8 rounded-xl" />
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <USkeleton class="h-16 rounded-2xl" />
                            <USkeleton class="h-16 rounded-2xl" />
                            <USkeleton class="h-16 rounded-2xl" />
                            <USkeleton class="h-16 rounded-2xl" />
                        </div>
                    </div>
                </UCard>
            </template>

            <!-- Data -->
            <template v-else-if="records?.length">
                <UCard v-for="item in records" :key="item.id"
                    class="overflow-hidden  transition-all active:scale-[0.99]"
                    :ui="{
                        body: 'p-0'
                    }">
                    <!-- Header -->
                    <div class="border-b border-default p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <div
                                    class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <UIcon name="lucide:monitor-smartphone" class="size-6" />
                                </div>

                                <div class="min-w-0">
                                    <p class="truncate text-sm font-semibold text-highlighted">
                                        {{ item.userName || 'System' }}
                                    </p>

                                    <p class="truncate text-xs text-muted">
                                        {{ item.userEmail || '-' }}
                                    </p>
                                </div>
                            </div>

                            <UDropdownMenu :items="getRowItems({ original: item })" :content="{ align: 'end' }">
                                <UButton icon="lucide:ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                                    class="rounded-xl" />
                            </UDropdownMenu>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="grid grid-cols-2 gap-3 p-4">
                        <div class="rounded-2xl bg-muted p-3">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                                Status
                            </p>

                            <UBadge :label="item.active ? 'Active' : 'Inactive'"
                                :color="item.active ? 'success' : 'neutral'" variant="soft" size="sm" />
                        </div>

                        <div class="rounded-2xl bg-muted p-3">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                                Browser
                            </p>

                            <p class="truncate text-sm font-medium text-highlighted">
                                {{ item.browser || 'Unknown' }}
                            </p>
                        </div>

                        <div class="rounded-2xl bg-muted p-3">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                                IP Address
                            </p>

                            <p class="truncate text-sm font-medium text-highlighted">
                                {{ item.ipAddress || '-' }}
                            </p>
                        </div>

                        <div class="rounded-2xl bg-muted p-3">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                                Device
                            </p>

                            <p class="truncate text-sm font-medium text-highlighted">
                                {{ item.device || 'Unknown' }}
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="border-t border-default px-4 py-3">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0">
                                <p class="text-xs font-medium text-muted">
                                    Logged In
                                </p>

                                <p class="truncate text-sm text-highlighted">
                                    {{ formatDateTime(item.createdAt) }}
                                </p>
                            </div>

                            <UButton v-if="item.active" icon="lucide:log-out" label="Logout" size="xs" color="error"
                                variant="soft" @click="async () => {
                                    await store.logout(item.id)
                                    await store.fetchAll(page, size)
                                }" />
                        </div>
                    </div>
                </UCard>
            </template>

            <!-- Empty -->
            <template v-else>
                <div class="flex flex-col items-center justify-center py-14">
                    <UIcon name="lucide:monitor-check" class="mb-3 text-4xl text-gray-400" />

                    <p class="text-sm text-gray-500">
                        No user sessions found.
                    </p>
                </div>
            </template>

            <!-- Pagination -->
            <div class="flex flex-col space-y-3 justify-between items-center mt-3 md:hidden">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </div>
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>