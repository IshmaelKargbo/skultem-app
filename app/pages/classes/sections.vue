<script setup lang="ts">
const view = ref<'table' | 'card'>('table');
const route = useRoute();
const store = useSectionStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);

const columns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
];

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: (val) => updateQuery({ size: val }),
})

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    useAppStore().setTitle('Sections')
    document.title = 'Sections | Classes | Skultem'

    loading.value = true;
    await store.fetchAll(page.value, size.value);
    loading.value = false;
});
</script>
<template>
    <div class="px-4 md:px-6">
        <UCard :ui="{
            body: 'sm:p-0 p-0',
        }">
            <template #header>
                <div class="flex justify-between">
                    <div class="flex space-x-3 flex-1">
                        <UInput placeholder="Search by name. . ." />
                        <ClassSectionAdd />
                    </div>
                    <TableViewToggle v-model="view" />
                </div>
            </template>

            <UTable v-if="view === 'table'" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

                        <p class="text-gray-500">No sections found.</p>
                    </div>
                </template>
                <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex size-10 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary-500/10">
                            <UIcon name="i-lucide-git-branch" class="size-5" />
                        </div>

                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                                {{ row.original.name }}
                            </p>
                        </div>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <!-- Mobile -->
            <div class="p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <UCard v-for="i in 5" :key="i" class="overflow-hidden rounded-[28px]" :ui="{ body: 'p-0' }">
                        <!-- Header -->
                        <div class="border-b border-default p-5">
                            <div class="flex items-center gap-4">
                                <USkeleton class="size-14 rounded-2xl" />

                                <div class="flex-1 space-y-2">
                                    <USkeleton class="h-5 w-36 rounded-md" />
                                    <USkeleton class="h-3 w-24 rounded" />
                                </div>

                                <USkeleton class="h-6 w-16 rounded-full" />
                            </div>
                        </div>

                        <!-- Body -->
                        <div class="p-5">
                            <div class="rounded-2xl border border-default p-4">
                                <div class="mb-3 flex items-center gap-2">
                                    <USkeleton class="size-8 rounded-lg" />
                                    <USkeleton class="h-3 w-24 rounded" />
                                </div>

                                <div class="space-y-2">
                                    <USkeleton class="h-4 w-full rounded" />
                                    <USkeleton class="h-4 w-4/5 rounded" />
                                    <USkeleton class="h-4 w-2/3 rounded" />
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex items-center justify-between border-t border-default px-5 py-4">
                            <div class="flex items-center gap-2">
                                <USkeleton class="size-8 rounded-lg" />
                                <div class="space-y-1">
                                    <USkeleton class="h-3 w-20 rounded" />
                                    <USkeleton class="h-2 w-28 rounded" />
                                </div>
                            </div>

                            <USkeleton class="size-10 rounded-xl" />
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else-if="!data?.length">
                    <UCard class="overflow-hidden rounded-[28px]" :ui="{ body: 'p-8' }">
                        <div class="flex flex-col items-center text-center">
                            <div class="mb-5 flex size-20 items-center justify-center rounded-3xl bg-primary/10">
                                <UIcon name="i-lucide-layout-template" class="size-10 text-primary" />
                            </div>

                            <h3 class="text-lg font-semibold">No Sections Yet</h3>

                            <p class="mt-2 max-w-xs text-sm text-muted">
                                Create academic sections to organize classes and improve your school
                                structure.
                            </p>
                        </div>
                    </UCard>
                </template>

                <!-- Cards -->
                <template v-else>
                    <UCard v-for="item in data" :key="item.id"
                        :ui="{ body: 'sm:p-0 p-0' }">
                        <!-- Header -->
                        <div class="border-b border-default p-3">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                        <UIcon name="i-lucide-layout-template"
                                            class="size-5 text-primary group-hover:text-white" />
                                    </div>

                                    <div>
                                        <h3 class="text-base font-bold">
                                            {{ item.name }}
                                        </h3>
                                        <div class="flex items-center text-xs-base text-muted">
                                            Academic Section
                                        </div>
                                    </div>
                                </div>

                                <UBadge label="Active" color="success" variant="soft" />
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="p-4">
                            <div class="rounded-xl border border-default bg-gray-50 p-2 dark:bg-neutral-800">
                                <p class="line-clamp-3 text-xs leading-6 text-toned">
                                    {{ item.description || "No description available." }}
                                </p>
                            </div>
                        </div>
                    </UCard>
                </template>
            </div>
            <template #footer>
                <!-- Footer -->
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Showing :meta="meta" />

                    <div class="overflow-x-auto">
                        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                            :total="meta.total" show-edges />
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
