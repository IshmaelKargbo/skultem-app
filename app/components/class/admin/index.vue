<template>
    <div class="space-y-4 px-4 md:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div>
                    <div class="flex px-4 py-3 justify-between space-x-3">
                        <div class="flex space-x-3 flex-1">
                            <ClassAssignMaster />
                            <ClassAdd />
                        </div>
                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <USelectMenu v-model="sectionId" value-key="value" label-key="label" :items="sectionOptions"
                                placeholder="All Sections" clear />
                            <USelectMenu v-model="streamId" value-key="value" label-key="label" :items="streamOptions"
                                placeholder="All Streams" clear />
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name"
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
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
                        <p class="text-gray-500 dark:text-gray-400">No classes found.</p>
                    </div>
                </template>
                <template #clazz-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                            <UIcon :name="CLASS_ICON" class="size-4 text-primary" />
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5">
                                <p class="font-medium text-highlighted">{{ row.original.clazz }}</p>

                                <UTooltip v-if="row.original.needsAttention" :delay-duration="0" arrow
                                    text="At least one student here has low attendance or is below the pass mark">
                                    <UBadge size="xs" variant="subtle" color="warning" icon="i-lucide-alert-triangle"
                                        label="Needs Attention" />
                                </UTooltip>
                            </div>
                            <p class="text-xs text-muted">{{ row.original.grade }}</p>
                        </div>
                    </div>
                </template>
                <template #classLevel-cell="{ row }">
                    <p>{{ parseLevel[row.original.classLevel] }}</p>
                </template>
                <template #totalStudent-cell="{ row }">
                    <UBadge variant="subtle" color="secondary" size="lg" :trailing-icon="STUDENT_ICON"
                        :label="`${row.original.totalStudent} -`" />
                </template>
                <template #teacherName-cell="{ row }">
                    <p>{{ row.original.teacherName || 'No Teacher Assigned' }}</p>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton @click="viewClass(row.original)" size="sm" variant="ghost" color="success"
                        class="cursor-pointer" :icon="VIEW_ICON" />
                </template>
            </UTable>
            <div class="space-y-4 p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <UCard v-for="i in 6" :key="i" variant="outline" class="overflow-hidden"
                        :ui="{ body: 'sm:p-0 p-0' }">
                        <!-- Header -->
                        <div class="border-b border-default p-5">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-4">
                                    <USkeleton class="size-14 rounded-2xl" />

                                    <div class="space-y-2">
                                        <USkeleton class="h-5 w-32 rounded-lg" />
                                        <USkeleton class="h-3 w-24 rounded-lg" />
                                    </div>
                                </div>

                                <div class="space-y-2 text-right">
                                    <USkeleton class="ml-auto h-7 w-10 rounded-lg" />
                                    <USkeleton class="ml-auto h-3 w-16 rounded-lg" />
                                </div>
                            </div>
                        </div>

                        <!-- Information -->
                        <div class="grid grid-cols-2 gap-3 p-5">
                            <div v-for="j in 4" :key="j"
                                class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
                                <div class="mb-3 flex items-center gap-2">
                                    <USkeleton class="size-8 rounded-lg" />
                                    <USkeleton class="h-3 w-16 rounded" />
                                </div>

                                <USkeleton class="h-5 w-24 rounded" />
                            </div>
                        </div>

                        <!-- Teacher -->
                        <div class="flex items-center justify-between border-t border-default px-5 py-4">
                            <div class="flex items-center gap-3">
                                <USkeleton class="size-12 rounded-full" />

                                <div class="space-y-2">
                                    <USkeleton class="h-4 w-32 rounded" />
                                    <USkeleton class="h-3 w-20 rounded" />
                                </div>
                            </div>

                            <USkeleton class="size-10 rounded-xl" />
                        </div>
                    </UCard>
                </template>

                <!-- Data -->
                <template v-else-if="data?.length">
                    <UCard v-for="item in data" :key="item.id" variant="outline"
                        class="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
                        :ui="{ body: 'sm:p-0 p-0' }">
                        <!-- Header -->
                        <div class="relative overflow-hidden border-b border-default p-3">
                            <div class="flex items-start justify-between ">
                                <div class="flex items-center justify-center space-x-4 p-1">
                                    <div
                                        class="flex size-10  items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                        <UIcon :name="CLASS_ICON" class="size-5 text-primary" />
                                    </div>

                                    <div>
                                        <div class="flex items-center gap-1.5">
                                            <h3 class="text-base font-bold">
                                                {{ item.clazz }}
                                            </h3>

                                            <UTooltip v-if="item.needsAttention" :delay-duration="0" arrow
                                                text="At least one student here has low attendance or is below the pass mark">
                                                <UIcon name="i-lucide-alert-triangle" class="size-4 text-warning" />
                                            </UTooltip>
                                        </div>

                                        <div class=" flex items-center gap-2 text-xs-base text-muted">
                                            <span>{{ item.grade }}</span>

                                            <span>•</span>

                                            <span>{{ parseLevel[item.classLevel] }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="text-right">
                                    <p class="text-xl font-bold text-primary">
                                        {{ item.totalStudent }}
                                    </p>

                                    <p class="text-xs-base uppercase tracking-wide text-muted">Students</p>
                                </div>
                            </div>
                        </div>

                        <!-- Information -->
                        <div class="grid grid-cols-2 gap-3 p-4">
                            <!-- Section -->
                            <div
                                class="rounded-2xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
                                <div class="mb-3 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                                        <UIcon name="i-lucide-layout-grid" class="size-4 text-primary" />
                                    </div>

                                    <span class="text-[11px] font-medium uppercase tracking-wide text-primary">
                                        Section
                                    </span>
                                </div>

                                <p class="truncate font-semibold text-gray-900 dark:text-white">
                                    {{ item.sectionName || "N/A" }}
                                </p>
                            </div>

                            <!-- Stream -->
                            <div
                                class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <div class="mb-3 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                        <UIcon name="i-lucide-git-branch"
                                            class="size-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>

                                    <span
                                        class="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                        Stream
                                    </span>
                                </div>

                                <p class="truncate font-semibold text-gray-900 dark:text-white">
                                    {{ item.streamName || "N/A" }}
                                </p>
                            </div>

                            <!-- Level -->
                            <div
                                class="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                                <div class="mb-3 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                        <UIcon name="i-lucide-layers-3"
                                            class="size-4 text-amber-600 dark:text-amber-400" />
                                    </div>

                                    <span
                                        class="text-[11px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                        Level
                                    </span>
                                </div>

                                <p class="truncate font-semibold text-gray-900 dark:text-white">
                                    {{ parseLevel[item.classLevel] }}
                                </p>
                            </div>

                            <!-- Capacity -->
                            <div
                                class="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                                <div class="mb-3 flex items-center gap-2">
                                    <div
                                        class="flex size-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                        <UIcon name="i-lucide-users"
                                            class="size-4 text-violet-600 dark:text-violet-400" />
                                    </div>

                                    <span
                                        class="text-[11px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                                        Capacity
                                    </span>
                                </div>

                                <p class="text-lg font-bold text-violet-600 dark:text-violet-400">
                                    {{ item.totalStudent }}
                                </p>
                            </div>
                        </div>

                        <!-- Teacher -->
                        <div class="flex items-center justify-between border-t border-default p-3">
                            <div class="flex items-center gap-3">
                                <UAvatar size="lg" :alt="item.teacherName" />

                                <div>
                                    <p class="font-semibold">
                                        {{ item.teacherName || "No Teacher Assigned" }}
                                    </p>

                                    <p class="text-xs text-muted">Class Teacher</p>
                                </div>
                            </div>
                            <UButton icon="i-lucide-arrow-right" color="neutral" variant="soft" square
                                class="rounded-xl transition-all group-hover:bg-secondary hover:bg-secondary cursor-pointer group-hover:text-white group-hover:translate-x-1"
                                @click="viewClass(item)" />
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else>
                    <UCard class="col-span-full rounded-3xl border border-default shadow-sm">
                        <div class="flex flex-col items-center justify-center py-14">
                            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

                            <p class="text-sm text-gray-500">No classes found</p>
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
<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const store = useClassSessionStore();
const sectionStore = useSectionStore();
const streamStore = useStreamStore();
const { records: data, meta, loading } = storeToRefs(store);

const view = ref<'table' | 'card'>('table');

const sectionOptions = computed(() =>
  sectionStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const streamOptions = computed(() =>
  streamStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const columns = [
    { accessorKey: 'clazz', header: 'Name' },
    { accessorKey: 'grade', header: 'Grade' },
    { accessorKey: 'classLevel', header: 'Level' },
    { accessorKey: 'sectionName', header: 'Section' },
    { accessorKey: 'streamName', header: 'Stream' },
    { accessorKey: 'totalStudent', header: 'Students' },
    { accessorKey: 'teacherName', header: 'Class Teacher' },
    { id: 'actions', meta: { class: { td: 'text-right' } } }
];

function viewClass(row: ClassSession) {
    router.push(`/classes/${row.clazzId}?stream=${row.streamId}`);
}

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (value) => updateQuery({ page: value }),
});

const size = ref(runtimeConf().limit);

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const sectionId = ref(String(route.query.sectionId ?? ""));
const streamId = ref(String(route.query.streamId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

const hasActiveFilters = computed(() => !!sectionId.value || !!streamId.value || !!search.value);

function resetFilters() {
    sectionId.value = "";
    streamId.value = "";
    searchInput.value = "";
    search.value = "";
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

async function fetchRecords() {
    try {
        loading.value = true;

        await store.fetchAll(page.value, size.value, undefined, sectionId.value || undefined,
            streamId.value || undefined, search.value || undefined);
    } finally {
        loading.value = false;
    }
}

watch([page, size], fetchRecords, {
    immediate: true,
});

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([sectionId, streamId, search], () => {
    updateQuery({
        sectionId: sectionId.value || undefined,
        streamId: streamId.value || undefined,
        search: search.value || undefined,
        page: 1,
    });

    if (page.value === 1) fetchRecords();
});

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        updateQuery({
            page: page.value,
        });
    }

    sectionStore.fetchAll(0, 0);
    streamStore.fetchAll(0, 0);
});
</script>
