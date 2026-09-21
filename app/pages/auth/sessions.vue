<template>
    <div class="space-y-4 px-4 md:px-6">
        <AuthSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                            <p>Sessions</p>
                            <p class="text-xs text-muted">Where people are signed in to your school</p>
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
                                placeholder="Search this page by user, email, IP or device" />
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
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="lucide:monitor-check" class="text-4xl text-gray-400" />

                        <p class="text-gray-500">
                            {{ hasActiveFilters ? 'No session on this page matches your filters.' : 'No user sessions found.' }}
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

            <!-- Mobile list: one clean row per session -->
            <div v-if="view === 'table'" class="md:hidden">
                <template v-if="loading">
                    <div v-for="i in 6" :key="i"
                        class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
                        <div class="space-y-2">
                            <USkeleton class="h-4 w-32" />
                            <USkeleton class="h-3 w-44" />
                            <USkeleton class="h-3 w-28" />
                        </div>
                        <USkeleton class="h-5 w-14 rounded-full" />
                    </div>
                </template>

                <template v-else-if="filtered.length">
                    <div v-for="item in filtered" :key="item.id"
                        class="flex items-start justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
                        <div class="min-w-0 space-y-1">
                            <p class="truncate text-sm font-semibold text-highlighted">
                                {{ item.userName || 'System' }}
                            </p>
                            <p class="truncate text-xs text-muted">{{ item.userEmail || '-' }}</p>

                            <p class="truncate text-xs text-muted">
                                {{ item.device || 'Unknown device' }}<template v-if="item.browser"> · {{ item.browser }}</template>
                            </p>

                            <div class="flex items-center gap-2 text-xs text-muted">
                                <span class="font-mono">{{ item.ipAddress || 'No IP' }}</span>
                                <span>·</span>
                                <span class="shrink-0">{{ formatDateTime(item.createdAt) }}</span>
                            </div>
                        </div>

                        <div class="flex shrink-0 flex-col items-end gap-1.5">
                            <UBadge size="sm" variant="soft" :color="item.active ? 'success' : 'neutral'"
                                :label="item.active ? 'Active' : 'Inactive'" />
                            <UDropdownMenu :items="getRowItems({ original: item })" :content="{ align: 'end' }">
                                <UButton icon="lucide:ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                                    aria-label="Session actions" />
                            </UDropdownMenu>
                        </div>
                    </div>
                </template>

                <div v-else class="flex flex-col items-center gap-2 py-12">
                    <UIcon name="lucide:monitor-check" class="text-4xl text-gray-400" />
                    <p class="text-sm text-gray-500">
                        {{ hasActiveFilters ? 'No session on this page matches your filters.' : 'No user sessions found.' }}
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
                                <div class="flex-1 space-y-2">
                                    <USkeleton class="h-4 w-32" />
                                    <USkeleton class="h-3 w-40" />
                                </div>
                            </div>
                            <USkeleton class="h-3 w-full" />
                            <USkeleton class="h-3 w-2/3" />
                        </div>
                    </UCard>
                </template>

                <template v-else-if="filtered.length">
                    <UCard v-for="item in filtered" :key="item.id"
                        class="overflow-hidden rounded-2xl border-t-2 transition-shadow hover:shadow-md"
                        :style="{ borderTopColor: item.active ? 'var(--ui-success)' : 'var(--ui-border-accented)' }"
                        :ui="{ body: 'p-0 sm:p-0' }">
                        <div class="space-y-4 p-5">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                    <UIcon name="lucide:monitor-smartphone" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0 flex-1">
                                    <p class="truncate font-display font-semibold text-highlighted">
                                        {{ item.userName || 'System' }}
                                    </p>
                                    <p class="truncate text-sm text-muted">{{ item.userEmail || '-' }}</p>
                                </div>

                                <UBadge size="sm" variant="soft" :color="item.active ? 'success' : 'neutral'"
                                    :label="item.active ? 'Active' : 'Inactive'" />
                            </div>

                            <dl class="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div class="min-w-0">
                                    <dt class="text-[11px] uppercase tracking-wide text-muted">Device</dt>
                                    <dd class="mt-0.5 truncate text-sm">{{ item.device || 'Unknown' }}</dd>
                                </div>
                                <div class="min-w-0">
                                    <dt class="text-[11px] uppercase tracking-wide text-muted">Browser</dt>
                                    <dd class="mt-0.5 truncate text-sm">{{ item.browser || 'Unknown' }}</dd>
                                </div>
                                <div class="min-w-0">
                                    <dt class="text-[11px] uppercase tracking-wide text-muted">IP address</dt>
                                    <dd class="mt-0.5 truncate font-mono text-sm">{{ item.ipAddress || 'N/A' }}</dd>
                                </div>
                                <div class="min-w-0">
                                    <dt class="text-[11px] uppercase tracking-wide text-muted">Logged in</dt>
                                    <dd class="mt-0.5 truncate text-sm">{{ formatDateTime(item.createdAt) }}</dd>
                                </div>
                            </dl>
                        </div>

                        <div class="flex items-center justify-end border-t border-default bg-elevated/40 px-5 py-3">
                            <UButton v-if="item.active" icon="lucide:log-out" label="Log out session" size="sm"
                                color="error" variant="soft" @click="logoutSession(item.id)" />
                            <p v-else class="text-xs text-muted">This session has ended</p>
                        </div>
                    </UCard>
                </template>

                <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
                    <UIcon name="lucide:monitor-check" class="text-4xl text-gray-400" />
                    <p class="text-sm text-gray-500">
                        {{ hasActiveFilters ? 'No session on this page matches your filters.' : 'No user sessions found.' }}
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

// --- Filters: the same row as Transactions and the Student Ledger. Sessions are paged by the server,
// so these narrow the sessions on the page that's loaded. -------------------------------------------
const search = ref('')
const status = ref('')
const filterState = ref(false) // the filter row's open/closed state on mobile

const statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
]

const hasActiveFilters = computed(() => !!search.value || !!status.value)

function resetFilters() {
    search.value = ''
    status.value = ''
}

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()

    return records.value.filter((item) => {
        if (status.value === 'ACTIVE' && !item.active) return false
        if (status.value === 'INACTIVE' && item.active) return false
        if (!term) return true

        return item.userName?.toLowerCase().includes(term) ||
            item.userEmail?.toLowerCase().includes(term) ||
            item.ipAddress?.toLowerCase().includes(term) ||
            item.device?.toLowerCase().includes(term) ||
            item.browser?.toLowerCase().includes(term)
    })
})

const page = ref(1)
const size = ref(10)

watch(
    () => page.value,
    () => store.fetchAll(page.value, size.value),
    { immediate: true }
)

async function logoutSession(sessionId: string) {
    await store.logout(sessionId)
    await store.fetchAll(page.value, size.value)
}

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
            onClick: () => logoutSession(row.original.id)
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
