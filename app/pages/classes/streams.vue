<script setup lang="ts">
import type { Row } from "@tanstack/vue-table";

const view = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();
const store = useStreamStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "typing does nothing". These still seed from the URL on load and push back to it (see the
// watch below) so a direct link/refresh keeps the search, but the URL is a mirror, not the
// source of truth.
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

// Shadows the global `updateQuery` util (app/utils/common.ts) - that one only ever compares
// page/size and silently drops any other query key when neither changed, which would swallow a
// search update whenever it's set while already on page 1.
function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(page.value, size.value, search.value || undefined);
  loading.value = false;
}

watch(() => page.value, () => fetchRecord());

// Setting the search also resets the page to 1 and mirrors it into the URL (for a shareable
// link/refresh) - the fetch itself is keyed off the local ref above, not the URL.
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
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="space-y-3">
          <div class="flex justify-between">
            <div class="flex space-x-3 flex-1">
              <ClassStreamAdd />
            </div>
            <TableViewToggle v-model="view" />
          </div>

          <div class="border-t pt-3 border-default flex flex-wrap items-center justify-between gap-3">
            <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name. . ."
              class="flex-1 max-w-sm" />
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
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

      <!-- Mobile -->
      <div class="space-y-4 p-4"
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
          <UCard v-for="item in data" :key="item.id" variant="outline" :ui="{ body: 'sm:p-0 p-0' }">

            <!-- Header -->
            <div class="border-b border-default p-3">
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
                    <div class="flex items-center gap-2 text-xs-base text-muted">
                      Academic Stream
                    </div>
                  </div>
                </div>

                <UBadge label="Active" color="success" variant="soft" />
              </div>
            </div>

            <!-- Description -->
            <div class="p-3">
              <div class="rounded-xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
                <p class="line-clamp-3 text-xs leading-6 text-toned">
                  {{ item.description || "No description available." }}
                </p>
              </div>
            </div>
          </UCard>
        </template>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="flex gap-3 items-center justify-between">
          <Showing :meta="meta" />

          <div class="overflow-x-auto">
            <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
              :total="meta.total" show-edges />
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
