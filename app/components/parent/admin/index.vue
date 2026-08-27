<script setup lang="ts">
const route = useRoute()

const view = ref<"table" | "card">("table")

const search = computed<string>({
    get: () => String(route.query.search ?? ''),
    set: (value) => updateQuery({ search: value || undefined, page: 1 }),
})

const store = useParentStore();
const { records: data, meta, loading } = storeToRefs(store);

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted",
}

const STATUS_COLORS: Record<string, any> = {
    ACTIVE: "success",
    INACTIVE: "warning",
    DELETED: "error",
}

const columns = [
    {
        accessorKey: "name",
        header: "Guardian",
    },
    {
        accessorKey: "students",
        header: "Students",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "street",
        header: "Street",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
]

const page = computed<number>({
    get: () => Number(route.query.page || 1),
    set: (value) => {
        updateQuery({
            page: value,
        });
    },
})

const size = ref(runtimeConf().limit);

async function fetchRecords() {
    try {
        loading.value = true;

        await store.fetchAll(page.value, size.value);
    } catch (error) {
        console.error("Failed to fetch parents:", error);
    } finally {
        loading.value = false;
    }
}

watch(
    [page, size],
    async () => {
        await fetchRecords();
    },
    {
        immediate: true,
    }
);

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        updateQuery({
            page: page.value,
        });
    }

    useAppStore().setTitle('All Parents')
    document.title = 'Parents | Skultem'
});

watch(
    () => search.value,
    async () => {
        await fetchRecords()
    },
)
</script>
<template>
    <div class="px-4 sm:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0' }">
            <template #header>
                <div class="flex justify-between space-x-3">
                    <div class="flex flex-1 gap-3">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search by name, email or phone" />
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" :columns="columns" :data="data" :loading="loading" class="min-w-full">
                <template #empty-state>
                    <div class="flex flex-col items-center justify-center py-14">
                        <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                        <p class="text-sm text-gray-500">No parents found</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <div>
                        <p>{{ row.original.name }}</p>
                        <p class="text-xs text-muted">{{ row.original.email }}</p>
                    </div>
                </template>
                <template #students-cell="{ row }">
                    <UBadge :label="`${row.original.students} Students`" variant="outline" />
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="STATUS_LABELS[row.original.status]" :color="STATUS_COLORS[row.original.status]"
                        variant="soft" />
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>
            <div class="p-5"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <UCard v-for="i in 4" :key="i">
                        <div class="space-y-5 p-4">
                            <div class="flex items-center justify-between">
                                <div class="flex min-w-0 items-center gap-3">
                                    <USkeleton class="size-12 rounded-2xl" />

                                    <div class="space-y-2">
                                        <USkeleton class="h-3 w-28" />
                                        <USkeleton class="h-2 w-20" />
                                    </div>
                                </div>

                                <USkeleton class="h-6 w-16 rounded-full" />
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <USkeleton class="h-16 rounded-2xl" />
                                <USkeleton class="h-16 rounded-2xl" />
                                <USkeleton class="h-16 rounded-2xl" />
                                <USkeleton class="h-16 rounded-2xl" />
                            </div>

                            <div class="flex items-center justify-between">
                                <div class="flex min-w-0 items-center gap-3">
                                    <USkeleton class="size-9 rounded-full" />

                                    <div class="space-y-2">
                                        <USkeleton class="h-3 w-24" />
                                        <USkeleton class="h-2 w-16" />
                                    </div>
                                </div>

                                <USkeleton class="size-6 rounded-xl" />
                            </div>
                        </div>
                    </UCard>
                </template>

                <template v-else-if="data?.length">
                    <UCard v-for="parent in data" :key="parent.id" :ui="{
                        body: 'sm:p-0 p-0'
                    }">
                        <!-- Hero -->
                        <div class="relative overflow-hidden   p-3  border-b border-gray-200 dark:border-gray-800">
                            <div class="relative flex items-start justify-between">
                                <div class="flex space-x-3">
                                    <UAvatar icon="i-lucide-user" size="xl" />
                                    <div class="relative">
                                        <h3 class="ttruncate text-sm font-semibold text-gray-900 dark:text-white">
                                            {{ parent.name }}
                                        </h3>
                                        <p class="text-muted text-xs">{{ parent.email }}</p>
                                    </div>
                                </div>

                                <UBadge :label="STATUS_LABELS[parent.status]" :color="STATUS_COLORS[parent.status]"
                                    variant="subtle" class="rounded-full" />
                            </div>
                        </div>

                        <!-- Information -->
                        <div class="grid grid-cols-2 gap-3 p-4">
                            <!-- Students -->
                            <div
                                class="min-w-0 rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                                        <UIcon name="i-lucide-users-round"
                                            class="size-4 text-primary-600 dark:text-primary-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
                                        Students
                                    </p>
                                </div>

                                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ parent.students }}
                                </p>
                            </div>

                            <!-- Phone -->
                            <div
                                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                        <UIcon name="i-lucide-phone"
                                            class="size-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                        Phone
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                    {{ parent.phone || 'N/A' }}
                                </p>
                            </div>

                            <!-- City -->
                            <div
                                class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                        <UIcon name="i-lucide-map-pinned"
                                            class="size-4 text-amber-600 dark:text-amber-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                        City
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                    {{ parent.city || 'N/A' }}
                                </p>
                            </div>

                            <!-- Street -->
                            <div
                                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                                <div class="mb-2 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                        <UIcon name="i-lucide-map"
                                            class="size-4 text-violet-600 dark:text-violet-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                                        Street
                                    </p>
                                </div>

                                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                    {{ parent.street || 'N/A' }}
                                </p>
                            </div>
                        </div>
                        <!-- Footer -->
                        <div class="flex items-center border-t border-gray-100  p-3 dark:border-gray-800">
                            <div class="flex min-w-0 items-center gap-3">
                                <div
                                    class="flex size-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/15">
                                    <UIcon name="i-lucide-users" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0">
                                    <p class="truncate text-sm font-medium">
                                        {{ parent.students }} Student{{ parent.students === 1 ? "" : "s" }}
                                    </p>

                                    <p class="truncate text-xs text-gray-500">Linked to this guardian</p>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else>
                    <UCard class="col-span-full overflow-hidden">
                        <div class="flex flex-col items-center justify-center py-14">
                            <UIcon name="i-lucide-users" class="mb-3 size-10 text-gray-400" />

                            <h3 class="font-semibold">No Parents Found</h3>

                            <p class="text-sm text-gray-500">There are no parents to show yet.</p>
                        </div>
                    </UCard>
                </template>
            </div>
            <!-- Footer -->
            <template #footer>
                <div class="flex items-center justify-between">
                    <Showing :meta="meta" />

                    <UPagination v-model:page="page" size="sm" :page-size="meta?.size || 10"
                        :items-per-page="meta?.size || 10" :total="meta?.total || 0" show-edges />
                </div>
            </template>
        </UCard>


        <!-- Mobile / Card -->

    </div>
</template>
