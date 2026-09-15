<script setup lang="ts">
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();
const store = useStreamStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);

const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = val;
  }, 350);
});

const filterState = ref(false);

function toggleFilter() {
  filterState.value = !filterState.value;
}

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

const size = ref(runtimeConf().limit);

const hasActiveFilters = computed(() => !!search.value);

function resetFilters() {
  searchInput.value = "";
  search.value = "";
}

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(page.value, size.value, search.value || undefined);
  loading.value = false;
}

watch(() => page.value, () => fetchRecord());

watch(search, () => {
  updateQuery({ search: search.value || undefined, page: 1 });

  if (page.value === 1) fetchRecord();
});

onMounted(async () => {
  updateQuery({
    page: page.value
  })

  await fetchRecord();
  useAppStore().setTitle('Streams')
  document.title = 'Streams | Classes | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <ClassSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex p-4 justify-between items-center">
            <div class="flex space-x-3 flex-1">
              <ClassStreamAdd />
            </div>

            <div>
              <TableViewToggle v-model="view" />
              <UButton @click="toggleFilter" :icon="!filterState ? FILTER_ICON : CLOSE_ICON" variant="outline"
                :color="!filterState ? 'info' : 'error'" class="md:hidden" />
            </div>
          </div>

          <div class="border-t hidden p-4 border-default md:flex items-center justify-between gap-3">
            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name. . ." />
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
          <div v-if="filterState"
            class="border-t md:hidden p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name. . ." class="flex-1" />
            <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
        </div>
      </template>
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">No sections found.</p>
          </div>
        </template>
        <template #name-cell="{ row }">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ row.original.name }}
            </p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="md:p-4 md:space-y-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
            <div class="flex items-center gap-3">
              <USkeleton class="size-10 shrink-0 rounded-xl" />

              <div class="min-w-0 flex-1 space-y-2">
                <USkeleton class="h-4 w-36 rounded-md" />
                <USkeleton class="h-3 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else-if="!data?.length">
          <div class="col-span-full flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

            <p class="text-sm text-gray-500">No streams found.</p>
          </div>
        </template>

        <!-- Data -->
        <template v-else>
          <div v-for="item in data" :key="item.id" class="border-b md:border md:rounded-2xl border-default p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.name }}
                  </h3>

                  <p class="truncate text-xs-base text-muted">
                    {{ item.description || "Academic Stream" }}
                  </p>
                </div>
              </div>

              <UBadge label="Active" color="success" variant="subtle" size="sm" class="shrink-0" />
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
