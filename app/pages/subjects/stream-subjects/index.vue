<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const store = useStreamSubjectStore();
const streamStore = useStreamStore();
const { records: data, meta, loading } = storeToRefs(store);

const streamOptions = computed(() =>
  streamStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const columns = [
    {
        accessorKey: "streamName",
        header: "Stream",
    },
    {
        accessorKey: "subjectName",
        header: "Subject",
    },
    {
        accessorKey: "groupName",
        header: "Group",
    },
];

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
});

const size = ref(runtimeConf().limit);

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const streamId = ref(String(route.query.streamId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
const sortOptions = [
    { label: "Oldest First", value: "createdAt:asc" },
    { label: "Newest First", value: "createdAt:desc" },
    { label: "Stream (A-Z)", value: "stream.name:asc" },
    { label: "Subject (A-Z)", value: "subject.name:asc" },
];
const DEFAULT_SORT = "createdAt:asc";
const sort = ref(String(route.query.sort ?? DEFAULT_SORT));
const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);

const hasActiveFilters = computed(() => !!streamId.value || !!search.value || sort.value !== DEFAULT_SORT);

function resetFilters() {
    streamId.value = "";
    searchInput.value = "";
    search.value = "";
    sort.value = DEFAULT_SORT;
}

// Shadows the global `updateQuery` util (app/utils/common.ts) - that one only ever compares
// page/size and silently drops any other query key when neither changed, which would swallow
// these filter updates whenever a filter is set while already on page 1.
function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } });
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        search.value = val;
    }, 350);
});

async function fetchRecord() {
    loading.value = true;
    await store.fetchAll(page.value, size.value, streamId.value || undefined, search.value || undefined,
        sortBy.value, sortDirection.value);
    loading.value = false;
}

watch(
    () => page.value,
    () => {
        fetchRecord();
    },
    { immediate: true }
);

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([streamId, search, sort], () => {
    updateQuery({
        streamId: streamId.value || undefined,
        search: search.value || undefined,
        sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
        page: 1,
    })

    if (page.value === 1) fetchRecord();
});

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    streamStore.fetchAll(0, 0);
    useAppStore().setTitle('Stream Subjects')
    document.title = 'Stream Subjects | Subject | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
<template>
    <div class="space-y-4 px-4 md:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex px-4 py-3 items-center">
                        <div class="flex items-center space-x-2 flex-1">
                            <UButton to="/subjects/stream-subjects/add" class="md:flex hidden" color="primary"
                                label="Assign Subject" :icon="TEACHER_ICON" />
                            <UButton to="/subjects/stream-subjects/add" color="primary" class="md:hidden"
                                :icon="ASSIGN_ICON" />
                        </div>

                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <USelectMenu v-model="streamId" value-key="value" label-key="label" :items="streamOptions"
                                placeholder="All Streams" clear />
                            <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                                placeholder="Sort by" />
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by stream or subject..."
                                class="col-span-2" />
                        </div>
                        <div>
                            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                                :disabled="!hasActiveFilters" @click="resetFilters" />
                        </div>
                    </div>
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-muted" aria-hidden="true" />
                        <p class="text-muted">No stream subject found.</p>
                    </div>
                </template>
                <template #mandatory-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <USwitch v-model="row.original.mandatory" disabled />
                        <UBadge v-if="row.original.locked" variant="outline" color="error" label="Locked" />
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>

            <div class="space-y-4 p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <template v-if="loading">
                    <UCard v-for="i in 4" :key="i">
                        <div class="space-y-4 p-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <USkeleton class="size-12 rounded-2xl" />
                                    <div class="space-y-2">
                                        <USkeleton class="h-3 w-28" />
                                        <USkeleton class="h-2 w-20" />
                                    </div>
                                </div>
                                <USkeleton class="size-8 rounded-xl" />
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

                <template v-else-if="data?.length">
                    <UCard v-for="item in data" :key="item.id" :ui="{
                        body: 'sm:p-0 p-0',
                    }">
                        <div class="border-b border-default p-4">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <div
                                        class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <UIcon :name="SUBJECT_ICON" class="size-5" aria-hidden="true" />
                                    </div>

                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-highlighted">
                                            {{ item.subjectName }}
                                        </p>

                                        <p class="truncate text-xs-base text-muted">
                                            {{ item.streamName || "No stream" }}
                                        </p>
                                    </div>
                                </div>

                                <UIcon :name="item.locked ? 'i-lucide-lock' : 'i-lucide-lock-open'"
                                    :class="['size-5 shrink-0', item.locked ? 'text-error' : 'text-success']"
                                    :aria-label="item.locked ? 'Locked' : 'Active'" />
                            </div>
                        </div>

                        <!-- Group -->
                        <div class="p-3">
                            <div
                                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10 space-y-1">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                        <UIcon name="i-lucide-layers-3"
                                            class="size-4 text-violet-600 dark:text-violet-400" />
                                    </div>

                                    <p
                                        class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                                        Group
                                    </p>
                                </div>

                                <p class="truncate text-sm font-semibold text-violet-900 dark:text-violet-100">
                                    {{ item.groupName || "N/A" }}
                                </p>
                            </div>
                        </div>
                    </UCard>
                </template>

                <template v-else>
                    <UCard class="rounded-3xl col-span-full">
                        <div class="flex flex-col items-center justify-center py-14">
                            <UIcon name="ph:books-light" class="mb-3 text-4xl text-muted" aria-hidden="true" />
                            <p class="text-sm text-muted">No stream subject found.</p>
                        </div>
                    </UCard>
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