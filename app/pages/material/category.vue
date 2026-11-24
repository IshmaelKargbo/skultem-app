<script setup lang="ts">
const route = useRoute()
const router = useRouter()



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
    }
]

// One scrolling list: the next categories load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
    useInfiniteList<MaterialCategory>((page, size) => MaterialApi().getAllCategories(page, size, search.value) as any)

// A row opens the category's edit form; Delete is in that form.
const editing = ref<MaterialCategory>()
const editOpen = ref(false)
function openCategory(category: MaterialCategory) {
    editing.value = category
    editOpen.value = true
}

const refresh = () => reload()

function onDeleted(id: string) {
    data.value = data.value.filter(c => c.id !== id)
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
    useAppStore().setTitle('Material Categories')
    document.title = 'Categories | Materials | Skultem'
})

onBeforeUnmount(() => clearTimeout(timeout))

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <div data-guide="mat-tabs"><MaterialSectionNav /></div>
        <GuideBar topic="admin-material-categories" />
        <UCard data-guide="adm-list" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex flex-1 space-x-3 items-center">
                        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or description" />
                        <div data-guide="mat-cat-add"><MaterialCategoryAdd @saved="refresh" /></div>
                    </div>
                </div>
            </template>

            <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading"
                :ui="{ tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => openCategory(row.original)">
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


                <template #empty>
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
            <div class="md:hidden">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i"
                        class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0 space-y-2">
                                <USkeleton class="h-4 w-32" />
                                <USkeleton class="h-3 w-40" />
                            </div>

                            <div class="flex gap-1">
                                <USkeleton class="h-7 w-7 rounded-full" />
                                <USkeleton class="h-7 w-7 rounded-full" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Records -->
                <template v-else-if="data?.length">
                    <div v-for="item in data" :key="item.id" role="button" tabindex="0" @click="openCategory(item)"
                        @keydown.enter="openCategory(item)"
                        class="cursor-pointer border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
                        <div class="flex items-center justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                                <h3 class="truncate text-sm font-semibold">
                                    {{ item.name }}
                                </h3>
                                <p class="truncate text-xs text-muted">
                                    {{ item.description || 'No description available.' }}
                                </p>
                            </div>

                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="flex flex-col items-center py-16">
                        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                            <UIcon name="lucide:folder-open" class="size-10 text-muted" />
                        </div>

                        <h3 class="mt-4 text-sm font-semibold">
                            No categories found
                        </h3>

                        <p class="mt-1 text-sm text-muted">
                            Create categories to organize your school materials better.
                        </p>

                        <UButton class="mt-6 rounded-full px-5" icon="i-lucide-plus" size="sm">
                            Add Category
                        </UButton>
                    </div>
                </template>
            </div>

            <!-- Card view -->

            <MaterialCategoryDeletePrompt v-if="selected" v-model:open="deleteModal" :category-id="selected.id"
                :category-name="selected.name" @deleted="onDeleted" />

            <!-- One edit form, opened by whichever row was clicked -->
            <MaterialCategoryAdd v-if="editing" :key="editing.id" v-model:open="editOpen" :category="editing"
                hide-trigger can-delete @saved="refresh" @delete="remove" />

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="categories" :error="listError" @retry="loadMore" />
            </div>
        </UCard>
    </div>
</template>