<script setup lang="ts">
const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();
const store = useTeacherSubjectStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const columns = [
  {
    accessorKey: "className",
    header: "Class",
  },
  {
    accessorKey: "sectionName",
    header: "Section",
  },
  {
    accessorKey: "streamName",
    header: "Stream",
  },
  {
    accessorKey: "subjectName",
    header: "Subject",
  },
  {
    accessorKey: "teacherName",
    header: "Teacher",
  },
  {
    accessorKey: "assignedAt",
    header: "Assign On",
    cell: ({ row }: any) => {
      return formatDate(row.original.assignedAt);
    },
  },
];

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val }),
});

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(page.value, size.value);
  loading.value = false;
}

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
}

watch(
  () => page.value,
  () => {
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
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
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
      },
    });
  }

  fetchRecord();
});
</script>
<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <!-- Desktop -->
    <UCard
      v-if="view === 'table'"
      class="hidden md:block"
      :ui="{
        body: 'sm:p-0',
      }"
    >
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">No teacher assignments found.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination
            v-model:page="page"
            size="sm"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
          />
        </div>
      </template>
    </UCard>

    <!-- Mobile -->
  <div
  class="space-y-4"
  :class="
    view === 'table'
      ? 'md:hidden'
      : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'
  "
>
  <!-- Loading -->
  <template v-if="loading">
    <UCard
      v-for="i in 6"
      :key="i"
      variant="outline"
      class="overflow-hidden rounded-2xl"
      :ui="{ body: 'p-0' }"
    >
      <div class="animate-pulse">
        <!-- Header -->
        <div class="border-b border-default p-4">
          <div class="flex items-center gap-3">
            <USkeleton class="size-12 shrink-0 rounded-2xl" />

            <div class="min-w-0 space-y-2">
              <USkeleton class="h-4 w-32 rounded-md" />
              <USkeleton class="h-3 w-24 rounded-md" />
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <div
            v-for="j in 4"
            :key="j"
            class="rounded-2xl border border-default bg-muted/30 p-3"
          >
            <div class="mb-3 flex items-center gap-2">
              <USkeleton class="size-7 rounded-lg" />
              <USkeleton class="h-3 w-14 rounded" />
            </div>

            <USkeleton class="h-4 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </UCard>
  </template>

  <!-- Data -->
  <template v-else-if="data?.length">
    <UCard
      v-for="item in data"
      :key="item.id"
      variant="outline"
      class="overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      :ui="{ body: 'p-0' }"
    >
      <!-- Header -->
      <div class="border-b border-default p-4">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
          >
            <UIcon name="i-lucide-book-open" class="size-6 text-primary" />
          </div>

          <div class="min-w-0">
            <h3 class="truncate text-sm font-semibold text-highlighted">
              {{ item.subjectName }}
            </h3>

            <p class="mt-1 truncate text-xs text-muted">
              {{ item.className || 'No class' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 p-4">
        <!-- Section -->
        <div
          class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10"
        >
          <div class="mb-2 flex items-center gap-2">
            <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <UIcon name="i-lucide-layout-grid" class="size-4 text-blue-600 dark:text-blue-400" />
            </div>

            <p class="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Section
            </p>
          </div>

          <p class="truncate text-sm font-medium text-highlighted">
            {{ item.sectionName || 'N/A' }}
          </p>
        </div>

        <!-- Stream -->
        <div
          class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10"
        >
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20"
            >
              <UIcon name="i-lucide-git-branch" class="size-4 text-violet-600 dark:text-violet-400" />
            </div>

            <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
              Stream
            </p>
          </div>

          <p class="truncate text-sm font-medium text-highlighted">
            {{ item.streamName || 'N/A' }}
          </p>
        </div>

        <!-- Teacher -->
        <div
          class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10"
        >
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20"
            >
              <UIcon name="i-lucide-user-round" class="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Teacher
            </p>
          </div>

          <p class="truncate text-sm font-medium text-highlighted">
            {{ item.teacherName || 'N/A' }}
          </p>
        </div>

        <!-- Assigned On -->
        <div
          class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
        >
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20"
            >
              <UIcon name="i-lucide-calendar-days" class="size-4 text-amber-600 dark:text-amber-400" />
            </div>

            <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Assigned On
            </p>
          </div>

          <p class="truncate text-sm font-medium text-highlighted">
            {{ formatDate(item.assignedAt) }}
          </p>
        </div>
      </div>
    </UCard>
  </template>

  <!-- Empty -->
  <template v-else>
    <UCard
      variant="outline"
      class="col-span-full rounded-2xl"
    >
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <div
          class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10"
        >
          <UIcon
            name="ph:books-light"
            class="size-7 text-primary"
          />
        </div>

        <h3 class="text-sm font-semibold text-highlighted">
          No teacher assignments found
        </h3>

        <p class="mt-1 max-w-sm text-xs text-muted">
          There are no teacher-subject assignments matching your current filters.
        </p>
      </div>
    </UCard>
  </template>

  <!-- Pagination -->
  <div
    v-if="!loading && data?.length"
    class="col-span-full flex flex-col items-center gap-3 pt-2 md:flex-row md:justify-between"
  >
    <Showing :meta="meta" />

    <UPagination
      v-model:page="page"
      size="sm"
      :page-size="meta.size"
      :items-per-page="meta.size"
      :total="meta.total"
      show-edges
    />
  </div>
</div>
  </div>
</template>
