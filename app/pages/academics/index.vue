<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useAcademicYearStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const parseStaus: Record<string, string> = {
    OPENED: 'Opened',
    CLOSED: 'Closed',
    DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
    OPENED: 'success',
    CLOSED: 'warning',
    DELETED: 'error'
}

const parseStatusIcon: Record<string, string> = {
    OPENED: 'i-lucide-lock-open',
    CLOSED: 'i-lucide-lock',
    DELETED: 'i-lucide-x'
}

// Editing/deleting is only safe while a year is neither the school's current year nor already
// wrapped up - once it's active or closed, its dates are load-bearing for terms/fees/sessions.
function canManage(year: AcademicYear) {
    return !year.active && year.status !== 'CLOSED'
}

const deleteModal = ref(false)
const selected = ref<AcademicYear>()

function remove(year: AcademicYear) {
    selected.value = year
    deleteModal.value = true
}

const columns = [
    {
        accessorKey: 'name',
        header: 'Name'
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
        accessorKey: 'active',
        header: 'Active',
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        accessorKey: 'nextYearName',
        header: 'Next Year'
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

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = ref(6)

function updateQuery(newQuery: Record<string, any>) {
    const merged = { ...route.query, ...newQuery }

    if (
        merged.page === route.query.page &&
        merged.size === route.query.size
    ) {
        return
    }

    router.replace({ query: merged })
}

onMounted(async () => {
    if (!route.query.page || !route.query.size) {
        router.replace({
            query: {
                page: page.value
            }
        })
    }

    loading.value = true
    await store.fetchAll(page.value, size.value)
    loading.value = false
    useAppStore().setTitle('Academics')
    document.title = 'Academic Years | Academics | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="px-4 md:px-6">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex space-x-3">
                    <div class="flex space-x-3 flex-1">
                        <UInput placeholder="Search by name. . ." />
                        <AcademicsAdd />
                        <AcademicsConfigureNext />
                    </div>

                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-gray-400" />

                        <p class="text-sm text-gray-500">
                            No academic years found
                        </p>
                    </div>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>

                <template #active-cell="{ row }">
                    <UBadge :label="row.original.active ? 'Active' : 'Inactive'"
                        :color="row.original.active ? 'success' : 'neutral'" variant="soft" />
                </template>

                <template #status-cell="{ row }">
                    <UBadge variant="soft" :color="parseStatusColor[row.original.status]">
                        <UIcon :name="parseStatusIcon[row.original.status]" class="mr-1" />
                        {{ parseStaus[row.original.status] }}
                    </UBadge>
                </template>

                <template #nextYearName-cell="{ row }">
                    <UBadge v-if="row.original.nextYearName" variant="subtle" color="neutral"
                        :label="row.original.nextYearName" />
                    <span v-else class="text-xs text-muted">Not configured</span>
                </template>

                <template #actions-cell="{ row }">
                    <div v-if="canManage(row.original)" class="flex justify-end gap-1">
                        <AcademicsAdd :year="row.original" />

                        <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                            @click="remove(row.original)" />
                    </div>
                </template>
            </UTable>

            <!-- Mobile -->
            <div class="space-y-4 p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <UCard v-for="i in 4" :key="i" class="overflow-hidden">
                        <div class="space-y-4 p-3">
                            <div class="flex items-center gap-3">
                                <USkeleton class="size-12 rounded-2xl" />

                                <div class="space-y-2">
                                    <USkeleton class="h-3 w-32" />
                                    <USkeleton class="h-2 w-24" />
                                </div>
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


                <!-- Cards -->
                <template v-else-if="data?.length">
                    <UCard v-for="item in data" :key="item.id" :ui="{ body: 'sm:p-0 p-0' }">
                        <!-- Header -->
                        <div class="flex items-start border-default justify-between gap-3 border-b p-3">
                            <div class="flex items-center gap-3 min-w-0">
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                                    <UIcon name="i-lucide-calendar-range" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0">
                                    <h3 class="truncate text-sm font-semibold text-highlighted">
                                        {{ item.name }}
                                    </h3>

                                    <p class="mt-1 text-xs text-muted">
                                        Academic Year
                                    </p>
                                </div>

                            </div>

                            <div v-if="canManage(item)" class="flex shrink-0 gap-1">
                                <AcademicsAdd :year="item" />

                                <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                                    @click="remove(item)" />
                            </div>
                        </div>

                        <div class="p-3 space-y-3">
                            <!-- Date Range -->
                            <div class="rounded-xl bg-gray-50/50 border border-default p-3">

                                <div class="flex items-start gap-3">
                                    <div class="mt-1 space-y-1.5 flex flex-col items-center">
                                        <div class="size-2 rounded-full bg-primary" />
                                        <div class="h-8 w-px bg-gray-300" />
                                        <div class="size-2 rounded-full bg-primary" />
                                    </div>

                                    <div class="flex-1 space-y-4">
                                        <div>
                                            <p class="text-xs-base text-muted">
                                                Start Date
                                            </p>

                                            <p class="text-sm font-medium text-highlighted">
                                                {{ formatDate(item.startDate) }}
                                            </p>
                                        </div>

                                        <div>
                                            <p class="text-xs-base text-muted">
                                                End Date
                                            </p>

                                            <p class="text-sm font-medium text-highlighted">
                                                {{ formatDate(item.endDate) }}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- Status -->
                            <div class="grid grid-cols-2 gap-3">

                                <div class="rounded-xl border border-default p-3">
                                    <p class="mb-2 text-xs-base text-muted">
                                        Active
                                    </p>

                                    <UBadge size="sm" :label="item.active ? 'Active' : 'Inactive'"
                                        :color="item.active ? 'success' : 'neutral'" variant="soft" />
                                </div>

                                <div class="rounded-xl border border-default p-3">
                                    <p class="mb-2 text-xs-base text-muted">
                                        Status
                                    </p>

                                    <UBadge :color="parseStatusColor[item.status]" size="sm" variant="soft">
                                        <UIcon :name="parseStatusIcon[item.status]" class="mr-1" />
                                        {{ parseStaus[item.status] }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else>
                    <UCard class="overflow-hidden col-span-full">
                        <div class="flex flex-col items-center justify-center py-14">
                            <UIcon name="i-lucide-calendar-range" class="mb-3 size-10 text-gray-400" />

                            <p class="text-sm text-gray-500">
                                No academic years found
                            </p>
                        </div>
                    </UCard>
                </template>
            </div>

            <AcademicsDeletePrompt v-if="selected" v-model:open="deleteModal" :year-id="selected.id"
                :year-name="selected.name" />

            <template #footer>
                <div class="flex items-center justify-between">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>
    </div>
</template>
