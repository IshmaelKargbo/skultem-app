<script setup lang="ts">
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table')
const route = useRoute();
const router = useRouter();
const store = useSubjectGroupStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

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
        size: size.value,
      },
    });

    fetchRecord();
  },
  { immediate: true }
);

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
}

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(page.value, size.value);
  loading.value = false;
}

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value,
      },
    });
  }
});
</script>

<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading">
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
          <UBadge :label="row.original.totalSelection" variant="outline" icon="mdi:select-multiple" color="neutral" />
        </template>
      </UTable>
      <template #footer>
        <div v-if="!loading" class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <div class="space-y-4"
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
        <UCard v-for="item in data" :key="item.id"
          class="group overflow-hidden rounded-3xl border border-default shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
          :ui="{ body: 'p-0' }">


          <div class="space-y-5">
            <!-- Header -->
            <div class="flex items-start justify-between gap-3 border-b border-default p-3 md:p-0 md:pb-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UIcon name="i-lucide-folder-tree" class="size-6" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-highlighted">
                    {{ item.name }}
                  </h3>

                  <div class="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <UIcon name="i-lucide-school" class="size-3.5" />

                    <span>
                      {{ item.className || "No class assigned" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 space-x-3 p-4">
              <div
                class="rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                    <UIcon name="i-lucide-git-branch" class="size-4 text-primary-600 dark:text-primary-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
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
                  <div class="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                    <UIcon name="i-lucide-git-branch" class="size-4 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    Selection
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.totalSelection || 0 }}
                </p>
              </div>


            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between border-t border-default pt-4">
              <div class="flex items-center gap-2 text-xs text-muted">
                <UIcon name="i-lucide-book-open" class="size-4" />

                Subject Group
              </div>

              <UBadge color="primary" variant="soft"> Active </UBadge>
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

      <!-- Mobile Pagination -->
      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
