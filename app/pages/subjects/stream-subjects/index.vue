<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const store = useStreamSubjectStore();
const { records: data, meta, loading } = storeToRefs(store);

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

async function fetchRecord() {
    loading.value = true;
    await store.fetchAll(page.value, size.value);
    loading.value = false;
}

watch(
    () => page.value,
    () => {
        router.replace({
            query: {
                page: page.value,
            },
        });

        fetchRecord();
    },
    { immediate: true }
);

onMounted(async () => {
    updateQuery({
        page: page.value
    })

    fetchRecord();
    useAppStore().setTitle('Stream Subjects')
    document.title = 'Stream Subjects | Subject | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>
<template>
    <div class="space-y-4 px-4 md:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0' }">
            <template #header>
                <div class="flex items-center">
                    <div class="flex items-center space-x-2 flex-1">
                        <UInput placeholder="Search by stream. . ." />
                        <UButton to="/subjects/stream-subjects/add" class="md:flex hidden" color="primary"
                            label="Assign Subject" :icon="TEACHER_ICON" />
                        <UButton to="/subjects/stream-subjects/add" color="primary" class="md:hidden"
                            :icon="ASSIGN_ICON" />
                    </div>

                    <TableViewToggle v-model="view" />
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