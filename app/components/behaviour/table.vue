<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const { classId } = defineProps<{
  classId: string;
}>();
const store = useBehaviourStore();
const { records: data, meta, loading } = storeToRefs(store);
const view = ref<'table' | 'card'>('table');

const editRcord = ref<Behaviour | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const columns = [
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "kind",
    header: "Type",
    cell: ({ row }: any) => parseBehaviourKind[row.original.kind],
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "note",
    header: "Note",
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

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
}

async function fetchRecords() {
  if (classId == null) return;
  loading.value = true;
  await store.fetchAll(classId, page.value, size.value);
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

    fetchRecords();
  },
  { immediate: true }
);

watch(
  () => classId,
  () => fetchRecords(),
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

  fetchRecords();
});
</script>

<template>
  <TableViewToggle v-model="view" />

  <UCard v-if="view === 'table'" :ui="{ body: 'p-0 sm:p-0' }" class="hidden md:block" >
    <!-- Desktop -->
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

          <p class="text-gray-500">No behaviour found.</p>
        </div>
      </template>

      <template #kind-cell="{ row }">
        <UBadge
          :label="parseBehaviourKind[row.original.kind]"
          :color="parseBehaviourKindColor[row.original.kind]"
          variant="outline"
        />
      </template>
    </UTable>

      <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination
          size="sm"
          v-model:page="page"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />
      </div>
    </template>
  </UCard>

  <!-- Mobile -->
  <div class="dark:bg-neutral-950 min-h-[300px] mt-8" :class="{ 'md:hidden': view === 'table' }">
    <!-- Loading -->
    <template v-if="loading">
      <div class="space-y-4" :class="{ 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3': view === 'card' }">
        <UCard
          v-for="i in 6"
          :key="i"
          class="overflow-hidden rounded-[28px]"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="border-b border-default p-5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <USkeleton class="size-14 rounded-full" />

                  <USkeleton
                    class="absolute -bottom-1 -right-1 size-6 rounded-full ring-2 ring-white dark:ring-neutral-900"
                  />
                </div>

                <div class="space-y-2">
                  <USkeleton class="h-5 w-40 rounded-md" />

                  <div class="flex items-center gap-2">
                    <USkeleton class="size-3 rounded-full" />
                    <USkeleton class="h-3 w-20 rounded" />
                    <USkeleton class="size-1 rounded-full" />
                    <USkeleton class="h-3 w-16 rounded" />
                  </div>
                </div>
              </div>

              <USkeleton class="h-7 w-20 rounded-full" />
            </div>
          </div>

          <!-- Behaviour Note -->
          <div class="p-5">
            <div
              class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800"
            >
              <div class="mb-3 flex items-center gap-3">
                <USkeleton class="size-8 rounded-lg" />
                <USkeleton class="h-3 w-28 rounded" />
              </div>

              <div class="space-y-2">
                <USkeleton class="h-4 w-full rounded" />
                <USkeleton class="h-4 w-full rounded" />
                <USkeleton class="h-4 w-3/4 rounded" />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-default px-5 py-4"
          >
            <div class="flex items-center gap-2">
              <USkeleton class="size-4 rounded" />
              <USkeleton class="h-3 w-28 rounded" />
            </div>

            <USkeleton class="size-10 rounded-xl" />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Empty -->
    <div
      v-else-if="!data?.length"
      class="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div
        class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
      </div>

      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        No behaviour found
      </h3>

      <p class="mt-1 max-w-xs text-sm text-gray-500">
        Student behaviour records will appear here.
      </p>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-4" :class="{ 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3': view === 'card' }">
      <UCard
        v-for="row in data"
        :key="row.id"
        class="group overflow-hidden rounded-[28px] border border-default shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-l"
        :ui="{ body: 'p-0' }"
      >
        <!-- Header -->
        <div class="border-b border-default p-3 md:p-0 md:pb-3">
          <div class="flex items-start justify-between gap-4">
            <div class="flex min-w-0 items-center gap-4">
              <div class="relative">
                <UAvatar
                  size="xl"
                  :src="row.student?.photo"
                  :alt="`${row.student}`"
                  class="ring-2 ring-primary/10"
                />

                <div
                  class="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white dark:border-neutral-900"
                  :class="row.kind === 'POSITIVE' ? 'bg-emerald-500' : 'bg-red-500'"
                >
                  <UIcon
                    :name="
                      row.kind === 'POSITIVE'
                        ? 'i-lucide-thumbs-up'
                        : 'i-lucide-triangle-alert'
                    "
                    class="size-3 text-white"
                  />
                </div>
              </div>

              <div class="min-w-0">
                <h3 class="truncate text-base font-semibold">
                  {{ row.student }}
                </h3>

                <div class="mt-1 flex items-center gap-2 text-xs text-muted">
                  <UIcon name="i-lucide-tag" class="size-3.5" />

                  {{ row.category }}

                </div>
              </div>
            </div>

            <UBadge :color="row.kind === 'POSITIVE' ? 'success' : 'error'" variant="soft">
              {{ parseBehaviourKind[row.kind] }}
            </UBadge>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div
            class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800"
          >
            <div class="mb-3 flex items-center gap-2">
              <div
                class="flex size-8 items-center justify-center rounded-lg"
                :class="
                  row.kind === 'POSITIVE'
                    ? 'bg-emerald-100 dark:bg-emerald-500/15'
                    : 'bg-red-100 dark:bg-red-500/15'
                "
              >
                <UIcon
                  name="i-lucide-message-square-text"
                  class="size-4"
                  :class="row.kind === 'POSITIVE' ? 'text-emerald-600' : 'text-red-600'"
                />
              </div>

              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Behaviour Note
              </p>
            </div>

            <p class="leading-7 text-sm">
              {{ row.note || "No behaviour note recorded." }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-default p-3 md:p-0 md:pt-3">
          <div class="flex items-center gap-2 text-xs text-muted">
            <UIcon name="i-lucide-shield-check" class="size-4 text-primary" />

            Behaviour Record
          </div>
        </div>
      </UCard>

      <!-- Pagination -->
     <div v-if="!loading && data?.length" class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
      <Showing :meta="meta" />
      <UPagination
        size="sm"
        v-model:page="page"
        :page-size="meta.size"
        :items-per-page="meta.size"
        :total="meta.total"
        show-edges
      />
    </div>
    </div>
  </div>
</template>
