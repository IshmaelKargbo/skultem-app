<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useMaterialStore()

const { categories: data, loading, meta } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const value = ref(route.query.search as string || '')
const search = ref(value.value)

const deleteModal = ref(false)
const selected = ref<MaterialCategory>()

function remove(category: MaterialCategory) {
    selected.value = category
    deleteModal.value = true
}

const columns = [
    {
        accessorKey: 'name',
        header: 'Category'
    },
    {
        accessorKey: 'description',
        header: 'Description'
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
    await store.fetchAllCategory(page.value, size.value, search.value)
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
    useAppStore().setTitle('Material Categories')
    document.title = 'Categories | Materials | Skultem'
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
                    <div class="flex flex-1 space-x-3">
                        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or description" />
                        <MaterialCategoryAdd />
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                            <UIcon name="lucide:folder-kanban" class="text-primary-500" />
                        </div>

                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                                {{ row.original.name }}
                            </p>

                            <p class="text-xs text-gray-500">
                                Material Category
                            </p>
                        </div>
                    </div>
                </template>

                <template #description-cell="{ row }">
                    <p class="max-w-md text-sm text-gray-500 line-clamp-2">
                        {{
                            row.original.description ||
                            'No description available.'
                        }}
                    </p>
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex justify-end gap-1">
                        <MaterialCategoryAdd :category="row.original" />

                        <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                            @click="remove(row.original)" />
                    </div>
                </template>

                <template #empty-state>
                    <div class="flex flex-col items-center gap-3 py-16">
                        <div
                            class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
                            <UIcon name="lucide:folder-open" class="text-4xl text-primary-500" />
                        </div>

                        <div class="text-center">
                            <h3 class="font-semibold text-gray-900 dark:text-white">
                                No categories found
                            </h3>

                            <p class="mt-1 text-sm text-gray-500">
                                Material categories will appear here.
                            </p>
                        </div>
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
                                <USkeleton class="h-4 w-32" />
                                <USkeleton class="h-3 w-full" />
                                <USkeleton class="h-3 w-2/3" />

                                <div class="flex gap-2 pt-2">
                                    <USkeleton class="h-6 w-20 rounded-full" />
                                    <USkeleton class="h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty -->
                <div v-else-if="!data?.length"
                    class="flex min-h-[60vh] flex-col items-center justify-center rounded-4xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
                    <div
                        class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10">
                        <UIcon name="lucide:folder-open" class="text-5xl text-primary-500" />
                    </div>

                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                        No categories found
                    </h3>

                    <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                        Create categories to organize your school materials better.
                    </p>

                    <UButton class="mt-6 rounded-full px-5" icon="i-lucide-plus" size="sm">
                        Add Category
                    </UButton>
                </div>

                <!-- Cards -->
                <div v-else class="grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3">
                    <UCard v-for="item in data" :key="item.id" :ui="{ body: 'sm:p-0 p-0' }">
                        <div class=" gap-3">
                            <div class="flex items-center gap-3 border-b border-gray-200 p-3 dark:border-neutral-800">
                                <!-- Icon -->
                                <div
                                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                                    <UIcon name="lucide:folder-kanban" class="text-xl text-primary-500" />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <h3 class="truncate text-sm font-semibold text-highlighted">
                                        {{ item.name }}
                                    </h3>

                                    <p class="mt-1 text-xs text-muted">
                                        Material Category
                                    </p>
                                </div>

                                <div class="flex shrink-0 gap-1">
                                    <MaterialCategoryAdd :category="item" />

                                    <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost"
                                        @click="remove(item)" />
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="min-w-0 p-3">
                                <p class="text-sm text-muted line-clamp-2">
                                    {{ item.description || 'No description available.' }}
                                </p>
                            </div>
                        </div>
                    </UCard>
                </div>
            </div>

            <MaterialCategoryDeletePrompt
                v-if="selected"
                v-model:open="deleteModal"
                :category-id="selected.id"
                :category-name="selected.name"
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