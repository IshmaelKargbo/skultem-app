<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const store = useTermStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

function canManage(term: Term) {
    return term.status === 'UPCOMING'
}

const deleteModal = ref(false)
const selected = ref<Term>()

function remove(term: Term) {
    selected.value = term
    deleteModal.value = true
}

const parseStaus: Record<string, string> = {
    UPCOMING: 'Upcoming',
    ACTIVE: 'Active',
    CLOSED: 'Closed',
}

const parseStatusColor: Record<string, 'warning' | 'success' | 'error'> = {
    UPCOMING: 'warning',
    ACTIVE: 'success',
    CLOSED: 'error'
}

const parseStatusIcon: Record<string, string> = {
    UPCOMING: 'i-lucide-clock',
    ACTIVE: 'i-lucide-check-circle',
    CLOSED: 'i-lucide-lock'
}

const columns = [
    {
        accessorKey: 'name',
        header: 'Name'
    },
    {
        accessorKey: 'academicYear',
        header: 'Academic Year',
        cell: ({ row }: any) => row.original.academicYear?.name
    },
    {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }: any) => formatDate(row.original.startDate)
    },
    {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }: any) => formatDate(row.original.endDate)
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        id: 'actions',
        meta: {
            class: {
                td: 'text-right'
            }
        }
    }
]

// --- Filters: the same row as the Auth pages, Transactions and the Student Ledger. Terms are paged by
// the server, so these narrow the terms on the page that's loaded. -----------------------------------
const search = ref('')
const status = ref('')
const filterState = ref(false) // the filter row's open/closed state on mobile

const statusOptions = [
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Closed', value: 'CLOSED' },
]

const hasActiveFilters = computed(() => !!search.value || !!status.value)

function resetFilters() {
    search.value = ''
    status.value = ''
}

const filtered = computed(() => {
    const text = search.value.trim().toLowerCase()

    return (data.value ?? []).filter((term) => {
        if (status.value && term.status !== status.value) return false
        return !text || term.name?.toLowerCase().includes(text) || term.academicYear?.name?.toLowerCase().includes(text)
    })
})

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

async function fetchRecord() {
    loading.value = true
    await store.fetchAll(page.value, size.value)
    loading.value = false
}

// The page number is in the URL, so paging (and the browser's back button) reloads the list.
watch(page, () => fetchRecord())

onMounted(async () => {
    updateQuery({ page: page.value })
    await fetchRecord()

    useAppStore().setTitle('Academics')
    document.title = 'Terms | Academics | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="space-y-4 px-4 md:px-6">
        <AcademicsSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                            <p class="font-semibold">Terms</p>
                            <p class="text-xs-base text-muted">The terms of each academic year</p>
                        </div>

                        <div class="flex items-center gap-2">
                            <TableViewToggle v-model="view" />
                            <UButton @click="filterState = !filterState"
                                :icon="!filterState ? FILTER_ICON : CLOSE_ICON" variant="outline"
                                :color="!filterState ? 'info' : 'error'" class="md:hidden" />
                            <AcademicsTermAdd />
                        </div>
                    </div>

                    <!-- Always shown from md up; on mobile it opens with the filter button -->
                    <div :class="filterState ? 'flex' : 'hidden'"
                        class="md:flex flex-wrap items-center justify-between gap-3 border-t border-default p-4">
                        <div class="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3">
                            <USelectMenu class="w-full" v-model="status" value-key="value" label-key="label"
                                :items="statusOptions" placeholder="All Statuses" clear />
                            <UInput v-model="search" :icon="SEARCH_ICON" class="md:col-span-2"
                                placeholder="Search this page by term or academic year" />
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
                    <div class="flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-gray-400" />

                        <p class="text-sm text-gray-500">
                            {{ hasActiveFilters ? 'No term on this page matches your filters.' : 'No terms found' }}
                        </p>
                    </div>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>

                <template #status-cell="{ row }">
                    <UBadge variant="soft" :color="parseStatusColor[row.original.status]">
                        <UIcon :name="parseStatusIcon[row.original.status]" class="mr-1" />

                        {{ parseStaus[row.original.status] }}
                    </UBadge>
                </template>

                <template #actions-cell="{ row }">
                    <div v-if="canManage(row.original)" class="flex justify-end gap-1">
                        <AcademicsTermAdd :term="row.original" />

                        <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                            @click="remove(row.original)" />
                    </div>
                </template>
            </UTable>

            <!-- Mobile list: one clean row per term -->
            <div v-if="view === 'table'" class="md:hidden">
                <template v-if="loading">
                    <div v-for="i in 5" :key="i"
                        class="flex items-start justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
                        <div class="space-y-2">
                            <USkeleton class="h-4 w-28" />
                            <USkeleton class="h-3 w-36" />
                            <USkeleton class="h-3 w-44" />
                        </div>
                        <USkeleton class="h-5 w-16 rounded-full" />
                    </div>
                </template>

                <template v-else-if="filtered.length">
                    <div v-for="item in filtered" :key="item.id"
                        class="flex items-start justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
                        <div class="min-w-0 space-y-1">
                            <p class="truncate text-sm font-semibold text-highlighted">{{ item.name }}</p>
                            <p class="truncate text-xs text-muted">{{ item.academicYear?.name }}</p>
                            <p class="text-xs text-muted">{{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}</p>
                        </div>

                        <div class="flex shrink-0 flex-col items-end gap-1.5">
                            <UBadge size="sm" variant="soft" :color="parseStatusColor[item.status]"
                                :icon="parseStatusIcon[item.status]" :label="parseStaus[item.status]" />

                            <div v-if="canManage(item)" class="flex items-center gap-1">
                                <AcademicsTermAdd :term="item" />
                                <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                                    aria-label="Delete term" @click="remove(item)" />
                            </div>
                        </div>
                    </div>
                </template>

                <div v-else class="flex flex-col items-center gap-2 py-12">
                    <UIcon name="i-lucide-calendar-range" class="text-4xl text-gray-400" />
                    <p class="text-sm text-gray-500">
                        {{ hasActiveFilters ? 'No term on this page matches your filters.' : 'No terms found.' }}
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
                                <USkeleton class="h-4 w-32" />
                            </div>
                            <USkeleton class="h-14 w-full rounded-xl" />
                        </div>
                    </UCard>
                </template>

                <template v-else-if="filtered.length">
                    <UCard v-for="item in filtered" :key="item.id"
                        class="overflow-hidden rounded-2xl border-t-2 transition-shadow hover:shadow-md"
                        :style="{ borderTopColor: item.status === 'ACTIVE' ? 'var(--ui-success)' : 'var(--ui-border-accented)' }"
                        :ui="{ body: 'p-0 sm:p-0' }">
                        <div class="space-y-4 p-5">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                    <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0 flex-1">
                                    <p class="truncate font-display font-semibold text-highlighted">{{ item.name }}</p>
                                    <p class="truncate text-xs text-muted">{{ item.academicYear?.name }}</p>
                                </div>

                                <UBadge size="sm" variant="soft" :color="parseStatusColor[item.status]"
                                    :icon="parseStatusIcon[item.status]" :label="parseStaus[item.status]" />
                            </div>

                            <!-- The span of the term -->
                            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-elevated/50 p-3">
                                <div>
                                    <p class="text-[11px] uppercase tracking-wide text-muted">Starts</p>
                                    <p class="text-sm font-semibold text-highlighted">{{ formatDate(item.startDate) }}</p>
                                </div>
                                <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
                                <div class="text-right">
                                    <p class="text-[11px] uppercase tracking-wide text-muted">Ends</p>
                                    <p class="text-sm font-semibold text-highlighted">{{ formatDate(item.endDate) }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between gap-2 border-t border-default bg-elevated/40 px-5 py-3">
                            <span class="text-xs text-muted">Term {{ item.termNumber }}</span>

                            <div v-if="canManage(item)" class="flex items-center gap-1">
                                <AcademicsTermAdd :term="item" />
                                <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                                    aria-label="Delete term" @click="remove(item)" />
                            </div>
                            <span v-else class="flex items-center gap-1 text-xs text-muted">
                                <UIcon name="i-lucide-lock" class="size-3.5" /> Locked
                            </span>
                        </div>
                    </UCard>
                </template>

                <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
                    <UIcon name="i-lucide-calendar-range" class="text-4xl text-gray-400" />
                    <p class="text-sm text-gray-500">
                        {{ hasActiveFilters ? 'No term on this page matches your filters.' : 'No terms found.' }}
                    </p>
                </div>
            </div>

            <AcademicsTermDeletePrompt v-if="selected" v-model:open="deleteModal" :term-id="selected.id"
                :term-name="selected.name" />

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
