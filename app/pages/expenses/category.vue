<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()

const store = useExpenseStore()

const loading = ref(true)

const { categories: data, meta } = storeToRefs(store)

const editRcord = ref<FeeCategory | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const columns = [
    {
        accessorKey: 'name',
        header: 'Name'
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
        },
        cell: ({ row }: any) => {
            return h(
                UDropdownMenu,
                {
                    content: {
                        align: 'end'
                    },
                    size: 'sm',
                    items: getRowItems(row),
                    'aria-label': 'Actions dropdown'
                },
                () =>
                    h(UButton, {
                        icon: 'i-lucide-ellipsis-vertical',
                        color: 'neutral',
                        size: 'sm',
                        variant: 'ghost'
                    })
            )
        }
    }
]

function getRowItems(row: Row<FeeCategory>) {
    return [
        {
            label: 'Edit Record',
            icon: 'i-lucide-edit',
            onClick: () => {
                editState.value = true
                editRcord.value = row.original
            }
        },
        {
            label: 'Delete Record',
            icon: 'i-lucide-trash'
        }
    ]
}

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

async function fetchRecord() {
    loading.value = true
    await store.fetchAllCategories(page.value, size.value)
    loading.value = false
}

watch(
    () => [page.value],
    () => {
        fetchRecord()
    }
)

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    fetchRecord()
    useAppStore().setTitle('Expense Categories');
    document.title = 'Expense Categories | Expenses | Skultem';
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-4">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex justify-between space-x-3">
                    <div class="flex space-x-3 flex-1">
                        <UInput placeholder="Search by name . . ." />
                        <ExpensesAdd />
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <!-- Desktop -->
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
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
                    <UCard v-for="item in data" :key="item.id" variant="outline"
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