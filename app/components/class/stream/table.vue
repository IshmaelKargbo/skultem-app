<script setup lang="ts">
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();
const store = useStreamStore();
const loading = ref(true);
const { records: data } = storeToRefs(store);

const editRcord = ref<Stream | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }: any) => {
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

function getRowItems(row: Row<Stream>) {
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
  get: () => Number(route.query.size ?? 6),
  set: (val) => updateQuery({ size: val }),
});

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
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

  loading.value = true;
  await store.fetchAll(page.value, size.value);
  loading.value = false;
});
</script>

<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
      <!-- Desktop Table -->
      <div>
        <UTable :columns="columns" :data="data" :loading="loading">
          <template #empty-state>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

              <p class="text-gray-500">No sections found.</p>
            </div>
          </template>
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary-500/10">
                <UIcon name="i-lucide-git-branch" class="size-5" />
              </div>

              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ row.original.name }}
                </p>
              </div>
            </div>
          </template>
          <template #loading>
            <TableLoading :size="columns.length" />
          </template>
        </UTable>
      </div>

      <template #footer>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Showing :meta="store.meta" />

          <UPagination v-model:page="page" size="sm" :page-size="store.meta.size" :items-per-page="store.meta.size"
            :total="store.meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <!-- Mobile -->
    <div class="space-y-4"
      :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 5" :key="i" variant="outline" class="overflow-hidden" :ui="{ body: 'p-0' }">
          <div class="p-5 space-y-5">
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-36" />
                <USkeleton class="h-3 w-24" />
              </div>

              <USkeleton class="size-8 rounded-xl" />
            </div>

            <USkeleton class="h-20 rounded-2xl" />

            <div class="flex items-center justify-between pt-2">
              <USkeleton class="h-6 w-16 rounded-full" />
              <USkeleton class="h-8 w-8 rounded-xl" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else-if="!data?.length">
        <UCard class="rounded-3xl" :ui="{ body: 'p-10' }">
          <div class="flex flex-col items-center text-center">
            <div class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary/10">
              <UIcon name="i-lucide-git-branch" class="size-8 text-primary" />
            </div>

            <h3 class="font-semibold">No streams found</h3>

            <p class="mt-2 text-sm text-muted">
              Create a stream to organize classes and students.
            </p>
          </div>
        </UCard>
      </template>

      <!-- Cards -->
      <template v-else>
        <UCard v-for="item in data" :key="item.id" variant="outline"
          class="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg" :ui="{ body: 'p-0' }">

          <!-- Header -->
          <div class="border-b border-default p-3 md:p-0 md:pb-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <UIcon name="i-lucide-git-branch" class="size-5 text-primary group-hover:text-white" />
                </div>

                <div>
                  <h3 class="text-base font-bold">
                    {{ item.name }}
                  </h3>
                  <div class="mt-1 flex items-center gap-2 text-xs text-muted">
                    Academic Stream
                  </div>
                </div>
              </div>

              <UBadge label="Active" color="success" variant="soft" />
            </div>
          </div>

          <!-- Description -->
          <div class="p-4 md:p-0 md:py-4">
            <div class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
              <div class="mb-3 flex items-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
                </div>

                <span class="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Description
                </span>
              </div>

              <p class="line-clamp-3 text-sm leading-6 text-toned">
                {{ item.description || "No description available." }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between border-t border-default p-3 md:p-0 md:pt-3">
            <div class="flex items-center gap-2">
              <div class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p class="text-xs font-medium">Academic Structure</p>

                <p class="text-[11px] text-muted">Used in class organization</p>
              </div>
            </div>

            <!-- <UButton
          square
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-right"
          class="rounded-xl transition-all group-hover:translate-x-1"
        /> -->
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="store.meta" />

        <UPagination v-model:page="page" size="sm" :page-size="store.meta.size" :items-per-page="store.meta.size"
          :total="store.meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
