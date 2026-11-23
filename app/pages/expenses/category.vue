<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const { success: toastSuccess, error: toastError } = useNotify()
const { can } = useAuth()
// Same roles the backend allows to change categories.
const canManage = computed(() => can([Role.ACCOUNTANT, Role.OWNER]))

const columns = [
    {
        accessorKey: 'name',
        header: 'Name'
    },
    {
        accessorKey: 'description',
        header: 'Description'
    }
]

// One scrolling list: the next categories load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
    useInfiniteList<any>((page, size) => ExpenseApi().getAllCategories(page, size, search.value) as any)

// Search: debounced, mirrored into the URL so a refresh or a shared link keeps it, and starts the list again.
const searchInput = ref(String(route.query.search ?? ''))
const search = ref(searchInput.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = val.trim() }, 350)
})
watch(search, () => {
  router.replace({ query: { ...route.query, search: search.value || undefined } })
  reload()
})
onBeforeUnmount(() => clearTimeout(searchTimer))

// A row opens the category's edit form; Delete is in that form.
const editRecord = ref<any>(null)
const editOpen = ref(false)
function openCategory(category: any) {
    if (!canManage.value) return
    editRecord.value = category
    editOpen.value = true
}

function onEdited(category: any) {
    data.value = data.value.map(c => (c.id === category.id ? { ...c, ...category } : c))
}

const deleteTarget = ref<any>(null)
const deleteOpen = ref(false)
function askDelete(category: any) {
    deleteTarget.value = category
    deleteOpen.value = true
}

async function confirmDelete() {
    const target = deleteTarget.value
    if (!target) return
    try {
        await ExpenseApi().removeCategory(target.id)
        toastSuccess(`${target.name} deleted`)
        // Taken out of the list in place, so the list doesn't jump back to the top.
        data.value = data.value.filter(c => c.id !== target.id)
        if (meta.value) meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 1) - 1) }
    } catch (err: any) {
        // Refused while expenses are recorded under it - the message says how many.
        toastError(err?.message || 'Expense category could not be deleted')
        throw err
    }
}

onMounted(async () => {
    // Old links may still carry ?page= / ?size=; the list starts at the top now.
    if (route.query.page || route.query.size) {
        const { page: _page, size: _size, ...rest } = route.query
        router.replace({ query: rest })
    }
    reload()
    useAppStore().setTitle('Expense Categories');
    document.title = 'Expense Categories | Expenses | Skultem';
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-3">
        <ExpensesSectionNav />
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex justify-between space-x-3">
                    <div class="flex space-x-3 flex-1">
                        <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name or description"
                            class="flex-1" />
                        <ExpensesCategoryAdd @saved="reload" />
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <!-- Desktop -->
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading"
                :ui="{ tr: canManage ? 'cursor-pointer' : '' }" @select="(_e: Event, row: any) => openCategory(row.original)">
                <template #empty>
                    <div class="flex flex-col items-center gap-3 py-12">
                        <div
                            class="flex size-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon name="i-lucide-wallet-cards" class="size-5 text-gray-400" />
                        </div>

                        <div class="text-center">
                            <p class="font-medium text-gray-900 dark:text-white">
                                No expense categories found
                            </p>

                            <p class="text-sm text-gray-500">
                                Categories will appear here once created.
                            </p>
                        </div>
                    </div>
                </template>

                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>

                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex size-10 items-center justify-center rounded-xl bg-gray-50 text-primary dark:bg-gray-500/10">
                            <UIcon :name="CATEGORY_ICON" class="size-5" />
                        </div>

                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                                {{ row.original.name }}
                            </p>
                        </div>
                    </div>
                </template>

                <template #description-cell="{ row }">
                    <p class="max-w-xs truncate text-sm text-gray-500">
                        {{ row.original.description || 'No description provided' }}
                    </p>
                </template>
            </UTable>

            <!-- Mobile -->
            <div class="p-4 space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <UCard v-for="i in 4" :key="i" variant="outline">
                        <div class="space-y-4 p-4">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-3">
                                    <USkeleton class="size-12 rounded-2xl" />

                                    <div class="space-y-2">
                                        <USkeleton class="h-3 w-28" />
                                        <USkeleton class="h-2 w-40" />
                                    </div>
                                </div>

                                <USkeleton class="size-8 rounded-xl" />
                            </div>

                            <USkeleton class="h-16 rounded-2xl" />
                        </div>
                    </UCard>
                </template>

                <!-- Data -->
                <template v-else-if="data?.length">
                    <UCard v-for="item in data" :key="item.id" variant="outline" @click="openCategory(item)"
                        :class="{ 'cursor-pointer': canManage }"
                        class="overflow-hidden transition-all active:scale-[0.99]" :ui="{
                            body: 'sm:p-0 p-0'
                        }">
                        <template #header>
                            <div class="flex min-w-0 items-center gap-3">
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-primary dark:bg-gray-800 dark:text-primary">
                                    <UIcon :name="CATEGORY_ICON" class="size-5 text-primary group-hover:text-white" />
                                </div>

                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-semibold">
                                        {{ item.name }}
                                    </h3>

                                    <div class="flex items-center text-xs-base text-muted">
                                        Expense Category
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Description -->
                        <div class="p-4">
                            <div class="rounded-xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
                                <p class="text-sm leading-6 text-toned">
                                    {{ item.description || "No description available." }}
                                </p>
                            </div>
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="flex flex-col items-center justify-center py-14 col-span-full">
                        <div
                            class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800">
                            <UIcon name="i-lucide-wallet-cards" class="text-3xl text-gray-400" />
                        </div>

                        <p class="font-medium text-gray-900 dark:text-white">
                            No expense categories found
                        </p>

                        <p class="mt-1 text-sm text-gray-500">
                            Create categories to organize expenses.
                        </p>
                    </div>
                </template>

            </div>

            <div ref="sentinel">
                <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
                    :total="meta?.total" noun="categories" :error="listError" @retry="loadMore" />
            </div>
        </UCard>

        <ExpensesCategoryEdit v-model:open="editOpen" :record="editRecord" can-delete @saved="onEdited"
            @delete="askDelete" />

        <ConfirmDeleteModal v-if="deleteTarget" v-model:open="deleteOpen" title="Delete Expense Category"
            :item-name="deleteTarget.name" :on-confirm="confirmDelete"
            description="Only a category with no expenses recorded under it can be deleted. Rename it instead if the name is wrong." />
    </div>
</template>