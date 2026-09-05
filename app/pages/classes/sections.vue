<script setup lang="ts">
const view = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();
const store = useSectionStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "typing does nothing". These still seed from the URL on load and push back to it (see the
// watch below) so a direct link/refresh keeps the search, but the URL is a mirror, not the
// source of truth.
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        search.value = val;
    }, 350);
});

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

const hasActiveFilters = computed(() => !!search.value);

function resetFilters() {
    searchInput.value = "";
    search.value = "";
}

// Shadows the global `updateQuery` util (app/utils/common.ts) - that one only ever compares
// page/size and silently drops any other query key when neither changed, which would swallow a
// search update whenever it's set while already on page 1.
function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } });
}

async function fetchRecord() {
    loading.value = true;
    await store.fetchAll(page.value, size.value, search.value || undefined);
    loading.value = false;
}

watch(() => page.value, () => fetchRecord());

// Setting the search also resets the page to 1 and mirrors it into the URL (for a shareable
// link/refresh) - the fetch itself is keyed off the local ref above, not the URL.
watch(search, () => {
    updateQuery({ search: search.value || undefined, page: 1 });

    if (page.value === 1) fetchRecord();
});

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    useAppStore().setTitle('Sections')
    document.title = 'Sections | Classes | Skultem'

    await fetchRecord();
});
</script>
<template>
    <div class="px-4 md:px-6">
        <UCard :ui="{
            body: 'sm:p-0 p-0',
        }">
            <template #header>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <div class="flex space-x-3 flex-1">
                            <ClassSectionAdd />
                        </div>
                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="border-t pt-3 border-default flex flex-wrap items-center justify-between gap-3">
                        <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name. . ."
                            class="flex-1 max-w-sm" />
                        <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                            :disabled="!hasActiveFilters" @click="resetFilters" />
                    </div>
                </div>
            </template>

            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
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
            <div class="p-4 space-y-4"
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
                    <UCard v-for="item in data" :key="item.id" :ui="{ body: 'sm:p-0 p-0' }">
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
                <div class="flex items-center gap-3 justify-between">
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
