<template>
    <div class="space-y-4 px-4 md:px-6">
        <ClassSectionNav />

        <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex px-4 py-3 items-center justify-between gap-2">
                    <div class="flex flex-1 items-center gap-2">
                        <ClassAdd />
                        <ClassAssignMaster />
                        <div class="flex-1 border-default flex items-center gap-2">
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name"
                                class="flex-1" />
                            <ClassFilterDrawer v-model:section-id="sectionId" v-model:stream-id="streamId" v-model:level="level"
                                :section-options="sectionOptions" :stream-options="streamOptions"
                                :active-count="activeFilterCount" />
                        </div>
                    </div>
                    <TableViewToggle v-model="view" />
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
                    <div>
                        <div class="flex items-center gap-1.5">
                            <p class="font-medium text-highlighted">{{ row.original.clazz }}</p>

                            <UTooltip v-if="row.original.needsAttention" :delay-duration="0" arrow
                                text="At least one student here has low attendance or is below the pass mark">
                                <UBadge size="xs" variant="subtle" color="warning" icon="i-lucide-alert-triangle"
                                    label="Needs Attention" />
                            </UTooltip>
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
                    <p class="max-w-40 truncate" :title="row.original.teacherName">{{ formatTeacherNames(row.original.teacherName) || 'No Teacher Assigned' }}</p>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton @click="viewClass(row.original)" size="sm" variant="ghost" color="success"
                        class="cursor-pointer" :icon="VIEW_ICON" />
                </template>
            </UTable>
            <div class="md:p-4 md:space-y-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
                        <div class="flex items-center gap-3">
                            <USkeleton class="size-10 shrink-0 rounded-full" />

                            <div class="min-w-0 flex-1 space-y-2">
                                <USkeleton class="h-4 w-36 rounded-md" />
                                <USkeleton class="h-3 w-28 rounded-md" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Data -->
                <template v-else-if="data?.length">
                    <div @click="viewClass(item)" v-for="item in data" :key="item.id"
                        class="cursor-pointer border-b md:border md:rounded-2xl last:border-0 border-default p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <h3 class="truncate font-bold text-highlighted">
                                            {{ item.clazz }}
                                        </h3>
                                        <p class="text-muted" v-if="item.streamId">-  {{ item.streamName }}</p>

                                        <UTooltip v-if="item.needsAttention" :delay-duration="0" arrow
                                            text="At least one student here has low attendance or is below the pass mark">
                                            <UIcon name="i-lucide-alert-triangle" class="size-4 text-warning" />
                                        </UTooltip>
                                    </div>

                                    <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                                        <span class="truncate" :title="item.teacherName">{{ formatTeacherNames(item.teacherName) || 'No Teacher Assigned' }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex shrink-0 items-center gap-2 self-center">
                                <UBadge variant="subtle" color="secondary" size="sm" :trailing-icon="STUDENT_ICON"
                                    :label="`${item.totalStudent}`" />
                                <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Empty -->
                <template v-else>
                    <div class="col-span-full flex flex-col items-center justify-center py-14">
                        <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

                        <p class="text-sm text-gray-500">No classes found</p>
                    </div>
                </template>
            </div>

            <template #footer>
                <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
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
const level = ref(String(route.query.level ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(() => [level.value, sectionId.value, streamId.value].filter(Boolean).length);

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
            streamId.value || undefined, search.value || undefined, level.value || undefined);
    } finally {
        loading.value = false;
    }
}

watch([page, size], fetchRecords, {
    immediate: true,
});

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([sectionId, streamId, level, search], () => {
    updateQuery({
        sectionId: sectionId.value || undefined,
        streamId: streamId.value || undefined,
        level: level.value || undefined,
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
