<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useMaterialStore()
const { records: data, loading, meta } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')
const { format } = useMoney()

const value = ref(route.query.search as string || '')
const search = ref(value.value)

const deleteModal = ref(false)
const selected = ref<Material>()

function remove(material: Material) {
    selected.value = material
    deleteModal.value = true
}

const columns = [
    {
        accessorKey: 'name',
        header: 'Name'
    },
    {
        accessorKey: 'category.name',
        header: 'Category'
    },
    {
        accessorKey: 'inStock',
        header: 'In Stock'
    },
    {
        accessorKey: 'price',
        header: 'Price'
    },
    {
        accessorKey: 'unit',
        header: 'Unit'
    },
    {
        accessorKey: 'updatedAt',
        header: 'Last Restocked At'
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

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecord() {
    await store.fetchAll(page.value, size.value, search.value)
}

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        search.value = val
    }, 500)
})

watch(search, () => {
    updateQuery({ search: search.value || undefined, page: 1 })

    if (page.value === 1) fetchRecord()
})

watch(page, () => fetchRecord())

onMounted(async () => {
    if (!route.query.page || !route.query.size) {
        router.replace({
            query: {
                page: page.value,
                search: search.value || undefined
            }
        })
    }

    await fetchRecord()
    useAppStore().setTitle('All Materials')
    document.title = 'Materials | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
<template>
    <div class="px-4 md:px-6 space-y-4">
        <MaterialSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex-1 flex space-x-3">
                        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or category"
                            class="w-full" />
                        <div class="flex space-x-3">
                            <MaterialAdd />
                            <MaterialRestock />
                        </div>
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-3 py-16">
                        <div
                            class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
                            <UIcon name="ph:books-light" class="text-4xl text-primary-500" />
                        </div>

                        <div class="text-center">
                            <h3 class="font-semibold text-gray-900 dark:text-white">
                                No material found
                            </h3>

                            <p class="mt-1 text-sm text-gray-500">
                                School materials and inventory will appear here.
                            </p>
                        </div>
                    </div>
                </template>

                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                            <UIcon name="lucide:package" class="text-primary-500" />
                        </div>

                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                                {{ row.original.name }}
                            </p>

                            <p class="text-xs text-gray-500">
                                {{ row.original.category.name }}
                            </p>
                        </div>
                    </div>
                </template>

                <template #unit-cell="{ row }">
                    <p>{{ unitLabelMap[row.original.unit] }}</p>
                </template>

                <template #inStock-cell="{ row }">
                    <UBadge :color="row.original.inStock > 0 ? 'success' : 'error'" variant="soft">
                        {{ row.original.inStock }}
                    </UBadge>
                </template>

                <template #price-cell="{ row }">
                    <p class="font-medium">{{ format(row.original.price) }}</p>
                </template>

                <template #updatedAt-cell="{ row }">
                    <p class="text-sm text-gray-500">
                        {{ formatDateTime(row.original.updatedAt) }}
                    </p>
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex justify-end gap-1">
                        <MaterialAdd :material="row.original" />

                        <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                            @click="remove(row.original)" />
                    </div>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <!-- Mobile -->
            <div class="p-4" :class="view === 'table' ? 'md:hidden' : ''">
                <!-- Loading -->
                <div v-if="loading" class="space-y-4">
                    <div v-for="i in 5" :key="i"
                        class="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div class="flex gap-3">
                            <USkeleton class="h-14 w-14 rounded-2xl" />

                            <div class="flex-1 space-y-3">
                                <USkeleton class="h-4 w-36" />
                                <USkeleton class="h-3 w-24" />
                                <USkeleton class="h-3 w-full" />

                                <div class="grid grid-cols-3 gap-2 pt-2">
                                    <USkeleton class="h-14 rounded-2xl" />
                                    <USkeleton class="h-14 rounded-2xl" />
                                    <USkeleton class="h-14 rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty -->
                <div v-else-if="!data?.length"
                    class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
                    <div
                        class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10">
                        <UIcon name="lucide:package" class="text-5xl text-primary-500" />
                    </div>

                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                        No materials found
                    </h3>

                    <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                        Add school materials and manage inventory from one place.
                    </p>

                    <UButton class="mt-6 rounded-full px-5" icon="i-lucide-plus" size="sm">
                        Add Material
                    </UButton>
                </div>

                <!-- Cards -->
                <div v-else class="grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3">
                    <UCard v-for="item in data" :key="item.id" :ui="{ body: 'p-0 sm:p-0' }">
                        <div>

                            <!-- Header -->
                            <div
                                class="flex items-start justify-between gap-4 border-b border-gray-200 p-3  dark:border-gray-800">
                                <div class="flex min-w-0 items-center gap-3 ">
                                    <div
                                        class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                                        <UIcon name="i-lucide-package" class="size-5 text-primary" />
                                    </div>

                                    <div class="min-w-0">
                                        <h3 class="truncate text-sm font-semibold text-highlighted">
                                            {{ item.name }}
                                        </h3>

                                        <div class="mt-1 flex items-center gap-1.5">
                                            <UIcon name="i-lucide-layers-2" class="size-3.5 text-muted" />

                                            <p class="truncate text-xs text-muted">
                                                {{ item.category.name }}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex shrink-0 flex-col items-end gap-2">
                                    <UBadge :color="item.inStock > 0 ? 'success' : 'error'" variant="soft" size="sm" :icon="item.inStock > 0
                                        ? 'i-lucide-check-circle'
                                        : 'i-lucide-circle-alert'
                                        ">
                                        {{ item.inStock > 0 ? 'Available' : 'Out of stock' }}
                                    </UBadge>

                                    <div class="flex gap-1">
                                        <MaterialAdd :material="item" />

                                        <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                                            @click="remove(item)" />
                                    </div>
                                </div>
                            </div>

                            <div class="p-4">
                                <!-- Stock Overview -->
                                <div
                                    class=" flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
                                    <div>
                                        <p class="text-xs text-muted">
                                            Current Stock
                                        </p>

                                        <div class="mt-1 flex items-baseline gap-2">
                                            <span class="text-3xl font-bold tracking-tight text-highlighted">
                                                {{ item.inStock }}
                                            </span>

                                            <span class="text-sm text-muted">
                                                {{ unitLabelMap[item.unit] }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="text-right">
                                        <p class="text-xs text-muted">Price</p>
                                        <p class="mt-1 text-lg font-semibold text-highlighted">{{ format(item.price) }}</p>
                                    </div>
                                </div>

                                <!-- Details -->
                                <div class="mt-3 grid grid-cols-2 gap-3">
                                    <!-- Unit -->
                                    <div
                                        class="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                                        <div class="mb-2 flex items-center gap-2">
                                            <div
                                                class="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                                                <UIcon name="i-lucide-ruler"
                                                    class="size-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>

                                            <p
                                                class="text-[10px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                                                Unit
                                            </p>
                                        </div>

                                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                            {{ unitLabelMap[item.unit] }}
                                        </p>
                                    </div>

                                    <!-- Status -->
                                    <div class="rounded-2xl border p-3" :class="item.inStock > 0
                                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                                        : 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10'
                                        ">
                                        <div class="mb-2 flex items-center gap-2">
                                            <div class="flex size-7 items-center justify-center rounded-lg" :class="item.inStock > 0
                                                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                                : 'bg-red-100 dark:bg-red-500/20'
                                                ">
                                                <UIcon :name="item.inStock > 0
                                                    ? 'i-lucide-package-check'
                                                    : 'i-lucide-package-x'
                                                    " class="size-4" :class="item.inStock > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                            " />
                                            </div>

                                            <p class="text-[10px] font-medium uppercase tracking-wide" :class="item.inStock > 0
                                                ? 'text-emerald-700 dark:text-emerald-300'
                                                : 'text-red-700 dark:text-red-300'
                                                ">
                                                Status
                                            </p>
                                        </div>

                                        <p class="truncate text-sm font-medium" :class="item.inStock > 0
                                            ? 'text-emerald-700 dark:text-emerald-300'
                                            : 'text-red-700 dark:text-red-300'
                                            ">
                                            {{ item.inStock > 0 ? 'In stock' : 'Out of stock' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Last Restocked -->
                            <div class="flex items-center justify-between border-t border-default p-3">
                                <div class="flex items-center gap-3">
                                    <div class="flex size-9 items-center justify-center rounded-xl bg-muted">
                                        <UIcon name="i-lucide-clock-3" class="size-4 text-muted" />
                                    </div>

                                    <div>
                                        <p class="text-[11px] text-muted">
                                            Last Restocked
                                        </p>

                                        <p class="mt-0.5 text-sm font-medium text-highlighted">
                                            {{ formatDateTime(item.lastRestockedAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </UCard>
                </div>
            </div>

            <MaterialDeletePrompt
                v-if="selected"
                v-model:open="deleteModal"
                :material-id="selected.id"
                :material-name="selected.name"
            />

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
