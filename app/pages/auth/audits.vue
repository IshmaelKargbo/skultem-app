<template>
    <div class="px-4 md:px-6 space-y-4">
        <AuthSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                            <p>Audit Logs</p>
                            <p class="text-xs text-muted">Who did what, and when</p>
                        </div>

                        <div class="flex items-center gap-2">
                            <TableViewToggle v-model="view" />
                            <UButton @click="filterState = !filterState"
                                :icon="!filterState ? FILTER_ICON : CLOSE_ICON" variant="outline"
                                :color="!filterState ? 'info' : 'error'" class="md:hidden" />
                        </div>
                    </div>

                    <!-- Always shown from md up; on mobile it opens with the filter button -->
                    <div :class="filterState ? 'flex' : 'hidden'"
                        class="md:flex flex-wrap items-center justify-between gap-3 border-t border-default p-4">
                        <div class="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3">
                            <USelectMenu class="w-full" v-model="status" value-key="value" label-key="label"
                                :items="statusOptions" placeholder="All Statuses" clear />
                            <UInput v-model="search" :icon="SEARCH_ICON" class="md:col-span-2"
                                placeholder="Search this page by action, user, email or IP" />
                        </div>
                        <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                            :disabled="!hasActiveFilters" @click="resetFilters" />
                    </div>
                </div>
            </template>

            <!-- Desktop table -->
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="filtered"
                :loading="loading">
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
                                {{ hasActiveFilters ? 'No log on this page matches your filters.' : 'System activities will appear here.' }}
                            </p>
                        </div>
                    </div>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>

                <template #status-cell="{ row }">
                    <UBadge :color="statusColor(row.original.status)" variant="soft"
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

            <!-- Mobile list: one clean row per log -->
            <div v-if="view === 'table'" class="md:hidden">
                <template v-if="loading">
                    <div v-for="i in 6" :key="i" class="border-b border-default px-4 py-3 last:border-0">
                        <div class="flex items-start justify-between gap-3">
                            <div class="space-y-2">
                                <USkeleton class="h-4 w-36" />
                                <USkeleton class="h-3 w-44" />
                                <USkeleton class="h-3 w-28" />
                            </div>
                            <USkeleton class="h-5 w-16 rounded-full" />
                        </div>
                    </div>
                </template>

                <template v-else-if="filtered.length">
                    <div v-for="item in filtered" :key="item.id"
                        class="flex items-start justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
                        <div class="min-w-0 space-y-1">
                            <p class="truncate text-sm font-semibold text-highlighted">{{ clean(item.action) }}</p>

                            <div class="flex items-center gap-2 text-xs text-muted">
                                <p class="truncate">{{ item.userName || 'System' }}</p>
                                <p>·</p>
                                <p class="shrink-0">{{ formatDateTime(item.createdAt) }}</p>
                            </div>

                            <p class="truncate text-xs text-muted">
                                <span class="font-mono">{{ item.ipAddress || 'No IP' }}</span>
                                <template v-if="item.device"> · {{ item.device }}</template>
                            </p>
                        </div>

                        <UBadge size="sm" variant="soft" :color="statusColor(item.status)"
                            :label="clean(item.status)" />
                    </div>
                </template>

                <div v-else class="flex flex-col items-center gap-2 py-12">
                    <UIcon name="lucide:shield-check" class="text-4xl text-gray-400" />
                    <p class="text-sm text-gray-500">
                        {{ hasActiveFilters ? 'No log on this page matches your filters.' : 'No audit logs found.' }}
                    </p>
                </div>
            </div>

            <!-- Card view -->
            <div v-if="view === 'card'" class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                <template v-if="loading">
                    <UCard v-for="i in 6" :key="i">
                        <div class="animate-pulse space-y-4">
                            <div class="flex items-center gap-3">
                                <USkeleton class="size-10 rounded-xl" />
                                <USkeleton class="h-4 w-36" />
                            </div>
                            <USkeleton class="h-3 w-full" />
                            <USkeleton class="h-3 w-2/3" />
                        </div>
                    </UCard>
                </template>

                <template v-else-if="filtered.length">
                    <UCard v-for="item in filtered" :key="item.id"
                        class="overflow-hidden rounded-2xl border-t-2 transition-shadow hover:shadow-md"
                        :style="{ borderTopColor: item.status === 'SUCCESS' ? 'var(--ui-success)' : 'var(--ui-error)' }"
                        :ui="{ body: 'p-0 sm:p-0' }">
                        <div class="space-y-4 p-5">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                    <UIcon name="i-lucide-shield-check" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0 flex-1">
                                    <p class="truncate font-display font-semibold text-highlighted">
                                        {{ clean(item.action) }}
                                    </p>
                                    <p class="text-xs text-muted">{{ formatDateTime(item.createdAt) }}</p>
                                </div>

                                <UBadge size="sm" variant="soft" :color="statusColor(item.status)"
                                    :label="clean(item.status)" />
                            </div>

                            <div class="flex items-center gap-3 rounded-xl bg-elevated/50 p-3">
                                <UAvatar size="md" :alt="item.userName || 'System'" />

                                <div class="min-w-0">
                                    <p class="truncate text-sm font-medium text-highlighted">
                                        {{ item.userName || 'System' }}
                                    </p>
                                    <p class="truncate text-xs text-muted">{{ item.userEmail || 'No email' }}</p>
                                </div>
                            </div>
                        </div>

                        <dl class="grid grid-cols-2 divide-x divide-default border-t border-default">
                            <div class="min-w-0 px-5 py-3">
                                <dt class="text-[11px] uppercase tracking-wide text-muted">IP address</dt>
                                <dd class="mt-0.5 truncate font-mono text-sm">{{ item.ipAddress || 'Not available' }}</dd>
                            </div>
                            <div class="min-w-0 px-5 py-3">
                                <dt class="text-[11px] uppercase tracking-wide text-muted">Device</dt>
                                <dd class="mt-0.5 truncate text-sm">{{ item.device || 'Unknown' }}</dd>
                            </div>
                        </dl>
                    </UCard>
                </template>

                <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
                    <UIcon name="lucide:shield-check" class="text-4xl text-gray-400" />
                    <p class="text-sm text-gray-500">
                        {{ hasActiveFilters ? 'No log on this page matches your filters.' : 'No audit logs found.' }}
                    </p>
                </div>
            </div>

            <template #footer>
                <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const store = useAuditStore()
const { records, meta, loading } = storeToRefs(store)

const columns = [
    { accessorKey: 'action', header: 'Action', cell: ({ row }: any) => clean(row.original.action) },
    { accessorKey: 'userName', header: 'User' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'ipAddress', header: 'IP Address' },
    { accessorKey: 'device', header: 'Device' },
    { accessorKey: 'createdAt', header: 'Time' }
]

// --- Filters: the same row as Transactions and the Student Ledger. Logs are paged by the server, so
// these narrow the logs on the page that's loaded. -------------------------------------------------
const search = ref('')
const status = ref('')
const filterState = ref(false) // the filter row's open/closed state on mobile

const statusOptions = [
    { label: 'Success', value: 'SUCCESS' },
    { label: 'Failure', value: 'FAILURE' },
]

const hasActiveFilters = computed(() => !!search.value || !!status.value)

function resetFilters() {
    search.value = ''
    status.value = ''
}

function statusColor(value: string): 'success' | 'error' {
    return value === 'SUCCESS' ? 'success' : 'error'
}

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()

    return records.value.filter((item) => {
        if (status.value && item.status !== status.value) return false
        if (!term) return true

        return item.action?.toLowerCase().includes(term) ||
            item.userName?.toLowerCase().includes(term) ||
            item.userEmail?.toLowerCase().includes(term) ||
            item.details?.toLowerCase().includes(term) ||
            item.ipAddress?.toLowerCase().includes(term)
    })
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
