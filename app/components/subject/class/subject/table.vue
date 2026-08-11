<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const store = useClassSubjectStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const columns = [
  {
    accessorKey: "className",
    header: "Class",
  },
  {
    accessorKey: "subjectName",
    header: "Subject",
  },
  {
    accessorKey: "mandatory",
    header: "Type",
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
    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{
      body: 'sm:p-0',
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">No class subject found.</p>
          </div>
        </template>

        <template #mandatory-cell="{ row }">
          <div class="flex items-center gap-2">
            <UBadge variant="soft" :color="row.original.mandatory ? 'success' : 'info'"
              :label="row.original.mandatory ? 'Core' : 'Optional'" />

            <UBadge v-if="row.original.locked" variant="soft" color="error" label="Locked" />
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <!-- Mobile -->
    <div class="space-y-4" :class="view === 'table'
        ? 'md:hidden'
        : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'
      ">
      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-0' }">
          <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-3">
              <USkeleton class="size-11 shrink-0 rounded-xl" />

              <div class="min-w-0 flex-1 space-y-2">
                <USkeleton class="h-4 w-2/3 rounded-md" />

                <USkeleton class="h-3 w-1/3 rounded-md" />
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 space-x-3 p-4">
              <div class="rounded-2xl border border-default bg-muted/40 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-8 rounded-lg" />

                  <USkeleton class="h-3 w-12 rounded-md" />
                </div>

                <USkeleton class="h-6 w-20 rounded-lg" />
              </div>

              <div class="rounded-2xl border border-default bg-muted/40 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-8 rounded-lg" />

                  <USkeleton class="h-3 w-14 rounded-md" />
                </div>

                <USkeleton class="h-4 w-24 rounded-md" />
              </div>
            </div>

            <!-- Status -->
            <div class="flex items-center justify-between rounded-xl border border-default px-3 py-2">
              <div class="flex items-center gap-2">
                <USkeleton class="size-2 rounded-full" />

                <USkeleton class="h-4 w-16 rounded-md" />
              </div>

              <USkeleton class="h-6 w-16 rounded-full" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id"
          class="rounded-2xl border border-default shadow transition-shadow hover:shadow-sm" :ui="{ body: 'p-0' }">
          <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-start gap-3  border-b border-default p-3 md:p-0 md:pb-3">
              <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <UIcon name="i-lucide-book-open" class="size-5 text-primary" />
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-semibold text-highlighted">
                  {{ item.subjectName }}
                </h3>

                <p class="mt-1 truncate text-xs text-muted">
                  {{ item.className }}
                </p>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 space-x-3 p-4">
              <!-- Type -->
              <div
                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="mb-3 flex items-center gap-2">
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <UIcon name="i-lucide-book-open-check" class="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <span class="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Type
                  </span>
                </div>

                <UBadge :label="item.mandatory ? 'Core' : 'Optional'" :color="item.mandatory ? 'success' : 'info'"
                  variant="soft" size="sm" />
              </div>

              <!-- Group -->
              <div
                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div class="mb-3 flex items-center gap-2">
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                    <UIcon name="i-lucide-layers-3" class="size-4 text-violet-600 dark:text-violet-400" />
                  </div>

                  <span class="text-[11px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Group
                  </span>
                </div>

                <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ item.groupName || 'N/A' }}
                </p>
              </div>
            </div>

            <!-- Status -->
            <div class="flex items-center justify-between rounded-xl border border-default px-3 py-2.5">
              <div class="flex items-center gap-2">
                <span class="size-2 shrink-0 rounded-full" :class="item.locked
                    ? 'bg-error'
                    : 'bg-success'
                  " />

                <span class="text-sm font-medium text-highlighted">
                  {{ item.locked ? 'Locked' : 'Active' }}
                </span>
              </div>

              <UBadge v-if="item.mandatory" variant="soft" color="success" label="Required" size="sm" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full rounded-2xl border border-default">
          <div class="flex flex-col items-center px-4 py-14 text-center">
            <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <UIcon name="i-lucide-book-open" class="size-7 text-muted" />
            </div>

            <h3 class="text-sm font-semibold text-highlighted">
              No subjects found
            </h3>

            <p class="mt-1 max-w-sm text-xs leading-5 text-muted">
              It looks like you haven't added any subjects yet.
            </p>
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length"
        class="col-span-full flex w-full flex-col items-center gap-3 pt-2 md:flex-row md:justify-between">
        <Showing :meta="meta" />

        <UPagination v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
          size="sm" show-edges />
      </div>
    </div>
  </div>
</template>
