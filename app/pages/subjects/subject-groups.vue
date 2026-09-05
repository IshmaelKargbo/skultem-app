<script setup lang="ts">
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const store = useSubjectGroupStore();
const clazzStore = useClassStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const editRcord = ref<SubjectGroup | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const columns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "className",
        header: "Class",
    },
    {
        accessorKey: "streamName",
        header: "Stream",
    },
    {
        accessorKey: "totalSelection",
        header: "Select",
    },
    {
        id: "actions",
        meta: {
            class: {
                td: "text-right",
            },
        },
        cell: ({ row }) => {
            return h(
                UDropdownMenu,
                {
                    content: {
                        align: "end",
                    },
                    size: "sm",
                    items: getRowItems(row),
                    "aria-label": "Actions dropdown",
                },
                () =>
                    h(UButton, {
                        icon: "i-lucide-ellipsis-vertical",
                        color: "neutral",
                        size: "sm",
                        variant: "ghost",
                        "aria-label": "Actions dropdown",
                    })
            );
        },
    },
];

function getRowItems(row: Row<SubjectGroup>) {
    return [
        {
            label: "Edit Record",
            icon: "i-lucide-edit",
            onClick: () => {
                editState.value = true;
                editRcord.value = row.original;
            },
        },
        {
            label: "Delete Record",
            icon: "i-lucide-trash",
        },
    ];
}

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
    get: () => Number(route.query.size ?? runtimeConf().limit),
    set: (val) => updateQuery({ size: val }),
});

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const classId = ref(String(route.query.classId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
const sortOptions = [
    { label: "Name (A-Z)", value: "name:asc" },
    { label: "Name (Z-A)", value: "name:desc" },
    { label: "Newest First", value: "createdAt:desc" },
    { label: "Oldest First", value: "createdAt:asc" },
];
const DEFAULT_SORT = "name:asc";
const sort = ref(String(route.query.sort ?? DEFAULT_SORT));
const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);

const hasActiveFilters = computed(() => !!classId.value || !!search.value || sort.value !== DEFAULT_SORT);

function resetFilters() {
    classId.value = "";
    searchInput.value = "";
    search.value = "";
    sort.value = DEFAULT_SORT;
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        search.value = val;
    }, 350);
});

watch(
    () => page.value,
    () => {
        nextTick(() => {
            scrollContainer?.value?.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });

        fetchRecord();
    },
    { immediate: true }
);

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([classId, search, sort], () => {
    updateQuery({
        classId: classId.value || undefined,
        search: search.value || undefined,
        sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
        page: 1,
    })

    if (page.value === 1) fetchRecord();
});

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } });
}

async function fetchRecord() {
    loading.value = true;
    await store.fetchAll(page.value, size.value, classId.value || undefined, search.value || undefined,
        sortBy.value, sortDirection.value);
    loading.value = false;
}

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    clazzStore.fetchAll(0, 0);
    useAppStore().setTitle('Subject Groups');
    document.title = 'Subject Groups | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<template>
    <div class="space-y-4 px-4 md:px-6">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <div class="space-x-2 flex flex-1 items-center">
                            <SubjectGroupAdd />
                        </div>
                        <TableViewToggle v-model="view" />
                    </div>

                    <div class="border-t pt-3 border-default flex flex-wrap items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                                placeholder="All Classes" clear />
                            <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                                placeholder="Sort by" />
                            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name..."
                                class="col-span-2" />
                        </div>
                        <div>
                            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                                :disabled="!hasActiveFilters" @click="resetFilters" />
                        </div>
                    </div>
                </div>
            </template>
            <UTable v-if="view === 'table'" class="md:block hidden" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No sections found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
                <template #totalSelection-cell="{ row }">
                    <UBadge :label="row.original.totalSelection" variant="outline" icon="mdi:select-multiple"
                        color="neutral" />
                </template>
            </UTable>

            <div class="space-y-4 p-4"
                :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
                <!-- Loading -->
                <template v-if="loading">
                    <UCard v-for="i in 5" :key="i" class="overflow-hidden rounded-3xl border border-default shadow-sm"
                        :ui="{ body: 'p-5' }">
                        <div class="space-y-4">
                            <div class="flex items-center gap-3">
                                <USkeleton class="size-12 rounded-2xl" />

                                <div class="flex-1 space-y-2">
                                    <USkeleton class="h-4 w-36" />
                                    <USkeleton class="h-3 w-24" />
                                </div>

                                <USkeleton class="size-8 rounded-xl" />
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <USkeleton class="h-16 rounded-2xl" />
                                <USkeleton class="h-16 rounded-2xl" />
                            </div>
                        </div>
                    </UCard>
                </template>

                <!-- Data -->
                <template v-else-if="data?.length">
                    <UCard v-for="item in data" :key="item.id" :ui="{ body: 'sm:p-0 p-0' }">
                        <div>
                            <!-- Header -->
                            <div class="flex items-start justify-between gap-3 border-b border-default p-3">
                                <div class="flex min-w-0 items-center gap-3">
                                    <div
                                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <UIcon name="i-lucide-folder-tree" class="size-5" />
                                    </div>

                                    <div class="min-w-0">
                                        <h3 class="truncate text-base font-semibold text-highlighted">
                                            {{ item.name }}
                                        </h3>
                                        <p class="text-xs-base text-muted">
                                            {{ item.className || "No class assigned" }}
                                        </p>

                                    </div>
                                </div>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-2 space-x-3 p-3">
                                <div
                                    class="rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
                                    <div class="mb-2 flex items-center gap-2">
                                        <div
                                            class="flex size-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                                            <UIcon name="i-lucide-git-branch"
                                                class="size-4 text-primary-600 dark:text-primary-400" />
                                        </div>

                                        <p
                                            class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
                                            Stream
                                        </p>
                                    </div>

                                    <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                        {{ item.streamName || "None" }}
                                    </p>
                                </div>

                                <div
                                    class="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                                    <div class="mb-2 flex items-center gap-2">
                                        <div
                                            class="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                                            <UIcon name="i-lucide-git-branch"
                                                class="size-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>

                                        <p
                                            class="text-[10px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                                            Selection
                                        </p>
                                    </div>

                                    <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                                        {{ item.totalSelection || 0 }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </template>

                <!-- Empty -->
                <template v-else>
                    <UCard class="rounded-3xl border border-default shadow-sm col-span-full">
                        <div class="flex flex-col items-center justify-center py-16">
                            <div class="mb-5 flex size-20 items-center justify-center rounded-3xl bg-primary/10">
                                <UIcon name="i-lucide-folder-tree" class="size-10 text-primary" />
                            </div>

                            <h3 class="text-base font-semibold">No subject groups</h3>

                            <p class="mt-2 text-center text-sm text-muted">
                                Create your first subject group to organize subjects by stream or class.
                            </p>
                        </div>
                    </UCard>
                </template>
            </div>

            <template #footer>
                <div v-if="!loading" class="flex justify-between items-center">
                    <Showing :meta="meta" />
                    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                        :total="meta.total" show-edges />
                </div>
            </template>
        </UCard>
    </div>
</template>