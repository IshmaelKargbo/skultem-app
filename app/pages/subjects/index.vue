<template>
    <div class="space-y-4 px-4 md:px-6">
        <UCard :ui="{ body: 'sm:p-0 p-0' }">
            <template #header>
                <div class="flex justify-between items-center">
                    <div class="flex space-x-3 flex-1">
                        <UInput placeholder="Search by name or code" />
                        <SubjectAdd />
                    </div>

                    <TableViewToggle v-model="view" />
                </div>
            </template>
            <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No stream subject found.</p>
                    </div>
                </template>
                <template #loading>
                    <TableLoading :size="columns.length" />
                </template>
            </UTable>
            <!-- Mobile -->
            <div
                :class="view === 'table' ? 'md:hidden' : 'p-4 grid grid-cols-1 space-y-4 gap-x-4 md:grid-cols-2 lg:grid-cols-3'">
                <UCard v-for="value in data" :key="value.id" :ui="{ body: 'sm:p-0 p-0' }">
                    <!-- Header -->
                    <div class="border-b border-default p-3">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex min-w-0 items-center gap-4">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <UIcon :name="SUBJECT_ICON" class="size-5 text-primary" />
                                </div>

                                <div class="min-w-0">
                                    <h3 class="truncate text-base font-semibold text-highlighted">
                                        {{ value.name }}
                                    </h3>
                                    <p class="text-xs-base text-muted">{{ value.code }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-3">
                        <div class="rounded-xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
                            <p class="line-clamp-3 text-sm leading-6 text-highlighted">
                                {{ value.description || "No description available for this subject." }}
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>
            <template v-if="data.length == 0">
                <UCard>
                    <div class="flex flex-col items-center justify-center py-16">
                        <UIcon name="i-lucide-book-open" class="mb-4 size-12 text-muted" />

                        <h3 class="font-semibold">No subjects found</h3>

                        <p class="mt-1 text-sm text-muted">No records are available.</p>
                    </div>
                </UCard>
            </template>

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
import { nextTick } from "vue";

const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();

const columns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
];

const store = useSubjectStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");
const page = computed<number>({
    get: () => Number(route.query.page ?? 1),

    set: (value) => {
        updateQuery({
            page: value,
        });
    },
});

const size = computed<number>({
    get: () => Number(route.query.size ?? 9),

    set: (value) => {
        updateQuery({
            size: value,
        });
    },
});

function updateQuery(query: Record<string, any>) {
    router.replace({
        query: {
            ...route.query,
            ...query,
        },
    });
}

async function fetchRecords() {
    try {
        loading.value = true;

        await store.fetchAll(page.value, size.value);
    } finally {
        loading.value = false;
    }
}

watch(
    [page, size],
    async () => {
        nextTick(() => {
            scrollContainer?.value?.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });

        await fetchRecords();
    },
    {
        immediate: true,
    }
)

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        updateQuery({
            page: page.value,
        })
    }

    useAppStore().setTitle("Subjects");
    document.title = "Subjects | Skultem";
});

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER],
})
</script>
