<template>
    <div class="h-full overflow-y-auto bg-gray-50/60 dark:bg-neutral-950">
    <div class="space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-7">
            <!-- Header -->
            <div
                class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow dark:border-gray-800 dark:bg-neutral-900 md:flex-row md:items-center md:justify-between">
                <Heading title="Audit Logs" subtitle="Track system activity and user actions" />

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <UInput v-model="search" icon="i-lucide-search" placeholder="Search logs..." size="lg"
                        class="w-full sm:w-72" />

                    <div class="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 dark:bg-neutral-800">
                        <div class="size-2 rounded-full bg-success-500" />

                        <p class="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {{ meta.total }} Logs
                        </p>
                    </div>
                </div>
            </div>

            <!-- Desktop -->
            <UCard
                class="hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900 md:block"
                :ui="{
                    body: 'p-0 sm:p-0'
                }">
                <UTable :columns="columns" :data="filtered" :loading="loading">
                    <template #empty-state>
                        <div class="flex flex-col items-center gap-3 py-14">
                            <div
                                class="flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800">
                                <UIcon name="lucide:shield-check" class="size-8 text-gray-400" />
                            </div>

                            <div class="text-center">
                                <p class="font-medium text-gray-900 dark:text-white">
                                    No audit logs found
                                </p>

                                <p class="text-sm text-gray-500">
                                    System activities will appear here.
                                </p>
                            </div>
                        </div>
                    </template>

                    <template #loading>
                        <TableLoading :size="columns.length" />
                    </template>

                    <template #status-cell="{ row }">
                        <UBadge :color="row.original.status === 'SUCCESS' ? 'success' : 'error'" variant="soft"
                            :label="clean(row.original.status)" />
                    </template>

                    <template #userName-cell="{ row }">
                        <div class="flex items-center gap-3">
                            <UAvatar size="md" :alt="row.original.userName || 'System'" />

                            <div>
                                <p class="text-sm font-medium">
                                    {{ row.original.userName || 'System' }}
                                </p>

                                <p class="text-xs text-gray-500">
                                    {{ row.original.userEmail || '-' }}
                                </p>
                            </div>
                        </div>
                    </template>

                    <template #createdAt-cell="{ row }">
                        <div>
                            <p class="text-sm font-medium">
                                {{ formatDateTime(row.original.createdAt) }}
                            </p>

                            <p class="text-xs text-gray-500">
                                {{ formatDate(row.original.createdAt) }}
                            </p>
                        </div>
                    </template>
                </UTable>

                <template #footer>
                    <div class="flex items-center justify-between px-4 py-3">
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
                    <UCard v-for="i in 5" :key="i"
                        class="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                        <div class="space-y-4 p-4">
                            <div class="flex items-center gap-3">
                                <USkeleton class="size-12 rounded-2xl" />

                                <div class="flex-1 space-y-2">
                                    <USkeleton class="h-3 w-32" />
                                    <USkeleton class="h-2 w-24" />
                                </div>

                                <USkeleton class="h-6 w-16 rounded-full" />
                            </div>

                            <USkeleton class="h-14 rounded-2xl" />

                            <div class="grid grid-cols-2 gap-3">
                                <USkeleton class="h-14 rounded-2xl" />
                                <USkeleton class="h-14 rounded-2xl" />
                            </div>
                        </div>
                    </UCard>
                </template>

                <!-- Data -->
                <template v-else-if="filtered?.length">
                    <UCard v-for="item in filtered" :key="item.id"
                        class="overflow-hidden  transition-all "
                        :ui="{
                            body: 'p-0'
                        }">
                        <!-- Header -->
                        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <div
                                        class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                                        <UIcon name="i-lucide-shield-check" class="size-6" />
                                    </div>

                                    <div class="min-w-0">
                                        <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                            {{ clean(item.action) }}
                                        </h3>

                                        <p class="truncate text-xs text-gray-500">
                                            {{ item.userName || 'System' }}
                                        </p>
                                    </div>
                                </div>

                                <UBadge :color="item.status === 'SUCCESS' ? 'success' : 'error'" variant="soft"
                                    size="sm">
                                    {{ clean(item.status) }}
                                </UBadge>
                            </div>
                        </div>

                        <!-- Body -->
                        <div class="space-y-3 p-4">
                            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
                                <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                    User
                                </p>

                                <p class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ item.userName || 'System' }}
                                </p>

                                <p class="text-xs text-gray-500">
                                    {{ item.userEmail || '-' }}
                                </p>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
                                    <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                        IP Address
                                    </p>

                                    <p class="truncate text-sm font-medium">
                                        {{ item.ipAddress || '-' }}
                                    </p>
                                </div>

                                <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
                                    <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                        Device
                                    </p>

                                    <p class="truncate text-sm font-medium">
                                        {{ item.device || 'Unknown' }}
                                    </p>
                                </div>
                            </div>

                            <div v-if="item.details"
                                class="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-neutral-800">
                                <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                    Details
                                </p>

                                <p class="text-sm text-gray-600 dark:text-gray-300">
                                    {{ item.details }}
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div
                            class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
                            <div>
                                <p class="text-xs text-gray-500">
                                    Logged At
                                </p>

                                <p class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ formatDateTime(item.createdAt) }}
                                </p>
                            </div>

                            <UAvatar size="sm" :alt="item.userName || 'System'" />
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="flex flex-col items-center justify-center py-16">
                        <div
                            class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon name="lucide:shield-check" class="size-8 text-gray-400" />
                        </div>

                        <p class="font-medium text-gray-900 dark:text-white">
                            No audit logs found
                        </p>

                        <p class="mt-1 text-sm text-gray-500">
                            System activities will appear here.
                        </p>
                    </div>
                </template>

                <!-- Pagination -->
                <div class="flex flex-col justify-between items-center mt-3 space-y-3 md:hidden">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>

            </div>
        </div>
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
