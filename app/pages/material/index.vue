<script setup lang="ts">
const route = useRoute()
const router = useRouter()
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
    }
]

// One scrolling list: the next materials load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
    useInfiniteList<Material>((page, size) => MaterialApi().getAll(page, size, search.value) as any)

// A row opens the material's edit form; Delete is in that form.
const editing = ref<Material>()
const editOpen = ref(false)
function openMaterial(material: Material) {
    editing.value = material
    editOpen.value = true
}

// Saved or restocked: the list again from the top (stock and prices change).
const refresh = () => reload()

function onDeleted(id: string) {
    data.value = data.value.filter(m => m.id !== id)
    if (meta.value) meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 1) - 1) }
}

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        search.value = val
    }, 500)
})

watch(search, () => {
    router.replace({ query: { ...route.query, search: search.value || undefined } })
    reload()
})

onMounted(async () => {
    // Old links may still carry ?page= / ?size=; the list starts at the top now.
    if (route.query.page || route.query.size) {
        const { page: _page, size: _size, ...rest } = route.query
        router.replace({ query: rest })
    }

    reload()
    useAppStore().setTitle('All Materials')
    document.title = 'Materials | Skultem'
})

onBeforeUnmount(() => clearTimeout(timeout))

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="mat-tabs"><MaterialSectionNav /></div>
        <GuideBar topic="admin-materials" />
        <UCard data-guide="adm-list" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex-1 flex items-center space-x-3">
                        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or category"
                            class="w-full" />
                        <div class="flex space-x-2">
                            <div data-guide="mat-add"><MaterialAdd @saved="refresh" /></div>
                            <div data-guide="mat-restock"><MaterialRestock @success="refresh" /></div>
                        </div>
                    </div>
                </div>
            </template>

            <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading"
                :ui="{ tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => openMaterial(row.original)">
                <template #empty>
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


                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <!-- Mobile -->
            <div class="md:hidden">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i"
                        class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="space-y-2">
                                <USkeleton class="h-4 w-32" />
                                <USkeleton class="h-3 w-24" />
                            </div>

                            <div class="space-y-2">
                                <div class="flex justify-end">
                                    <USkeleton class="h-4 w-16" />
                                </div>
                                <div class="flex justify-end">
                                    <USkeleton class="h-6 w-24 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Records -->
                <template v-else-if="data?.length">
                    <div v-for="item in data" :key="item.id" role="button" tabindex="0" @click="openMaterial(item)"
                        @keydown.enter="openMaterial(item)"
                        class="cursor-pointer border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                                <h3 class="truncate text-sm font-semibold">
                                    {{ item.name }}
                                </h3>
                                <div class="flex items-center gap-2 text-xs text-muted">
                                    <p class="truncate">{{ item.category.name }}</p>
                                    <p>·</p>
                                    <p>{{ unitLabelMap[item.unit] }}</p>
                                </div>
                            </div>

                            <div class="shrink-0 space-y-1 text-right">
                                <p class="text-sm font-bold">{{ format(item.price) }}</p>
                                <UBadge size="sm" variant="soft" :color="item.inStock > 0 ? 'success' : 'error'"
                                    :label="`${item.inStock} in stock`" />
                            </div>
                        </div>

                        <div class="mt-2 flex items-center justify-between">
                            <p class="text-xs text-muted">
                                {{ item.lastRestockedAt ? `Restocked ${formatDateTime(item.lastRestockedAt)}` : 'Never restocked' }}
                            </p>

                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="flex flex-col items-center py-16">
                        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                            <UIcon name="lucide:package" class="size-10 text-muted" />
                        </div>

                        <h3 class="mt-4 text-sm font-semibold">
                            No materials found
                        </h3>

                        <p class="mt-1 text-sm text-muted">
                            Add school materials and manage inventory from one place.
                        </p>

                        <UButton class="mt-6 rounded-full px-5" icon="i-lucide-plus" size="sm">
                            Add Material
                        </UButton>
                    </div>
                </template>
            </div>

            <!-- Card view -->

            <MaterialDeletePrompt
                v-if="selected"
                v-model:open="deleteModal"
                :material-id="selected.id"
                :material-name="selected.name"
                @deleted="onDeleted"
            />

            <!-- One edit form, opened by whichever row was clicked -->
            <MaterialAdd v-if="editing" :key="editing.id" v-model:open="editOpen" :material="editing" hide-trigger
                can-delete @saved="refresh" @delete="remove" />

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="materials" :error="listError" @retry="loadMore" />
            </div>
        </UCard>
    </div>
</template>
