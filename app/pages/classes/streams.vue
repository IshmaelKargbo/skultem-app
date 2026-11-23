<script setup lang="ts">

const view = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();

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

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

// A row opens the stream's edit form; Delete is in that form.
function openStream(stream: Stream) {
  editRcord.value = stream;
  editState.value = true;
}

const deleteTarget = ref<Stream | null>(null);
const deleteOpen = ref(false);
const deleting = ref(false);
const { success: toastSuccess, error: toastError } = useNotify();

function askDelete(stream: Stream) {
  deleteTarget.value = stream;
  deleteOpen.value = true;
}

async function confirmDelete() {
  const target = deleteTarget.value;
  if (!target) return;
  deleting.value = true;
  try {
    await StreamApi().remove(target.id);
    toastSuccess(`${target.name} deleted`);
    // Taken out of the list in place, so the list doesn't jump back to the top.
    data.value = data.value.filter(s => s.id !== target.id);
    if (meta.value) meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 1) - 1) };
    deleteOpen.value = false;
  } catch (err: any) {
    // Refused while classes, students, subjects or fees still use it - the message says which.
    toastError(err?.message || "Stream could not be deleted");
  } finally {
    deleting.value = false;
  }
}

// The edited stream replaces its row in place.
function onEdited(stream: Stream) {
  data.value = data.value.map(s => (s.id === stream.id ? stream : s));
}

const hasActiveFilters = computed(() => !!search.value);

function resetFilters() {
  searchInput.value = "";
  search.value = "";
}

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

// One scrolling list: the next streams load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<Stream>((page, size) => StreamApi().getAll(page, size, search.value || undefined) as any);

// After adding a stream: load the list again from the top.
const fetchRecord = () => reload();

watch(search, () => {
  updateQuery({ search: search.value || undefined });
  reload();
});

onMounted(async () => {
  // Old links may still carry ?page= / ?size=; the list starts at the top now.
  if (route.query.page || route.query.size) {
    const { page: _page, size: _size, ...rest } = route.query;
    router.replace({ query: rest });
  }

  reload();
  useAppStore().setTitle('Streams')
  document.title = 'Streams | Classes | Skultem'
})

onBeforeUnmount(() => clearTimeout(searchTimer));

definePageMeta({
  role: [Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <div data-guide="adm-class-tabs"><ClassSectionNav /></div>
    <GuideBar topic="admin-streams" />
    <UCard data-guide="adm-list" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex p-4 justify-between items-center">
            <div class="flex space-x-3 flex-1">
              <div data-guide="stream-add"><ClassStreamAdd @saved="fetchRecord" /></div>
            </div>

            <div>
              <TableViewToggle v-model="view" />
              <UButton @click="toggleFilter" :icon="!filterState ? FILTER_ICON : CLOSE_ICON" variant="outline"
                :color="!filterState ? 'info' : 'error'" class="md:hidden" />
            </div>
          </div>

          <div class="border-t hidden p-4 border-default md:flex items-center justify-between gap-3">
            <UInput data-guide="adm-search" v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name. . ." />
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
          <div v-if="filterState"
            class="border-t md:hidden p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <UInput data-guide="adm-search" v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name. . ." class="flex-1" />
            <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
        </div>
      </template>
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading" :ui="{ tr: 'cursor-pointer' }"
                @select="(_e: Event, row: any) => openStream(row.original)">
        <template #empty>
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
          <div v-for="item in data" :key="item.id" role="button" tabindex="0" @click="openStream(item)"
            @keydown.enter="openStream(item)" class="cursor-pointer border-b md:border md:rounded-2xl border-default p-3">
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

      <div ref="sentinel">
        <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
          :total="meta?.total" noun="streams" :error="listError" @retry="loadMore" />
      </div>
    </UCard>

    <ClassStreamEdit v-model:open="editState" :record="editRcord" can-delete @saved="onEdited" @delete="askDelete" />

    <UModal v-model:open="deleteOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Delete stream</h3>
          </template>
          <p class="text-sm">
            Delete <b>{{ deleteTarget?.name }}</b>? This can't be undone. A stream that classes, students, subjects or
            fees still use can't be deleted - you'll be told what is using it.
          </p>
          <template #footer>
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <UButton label="Cancel" variant="soft" @click="deleteOpen = false" />
              <UButton label="Delete" color="error" :loading="deleting" :disabled="deleting" @click="confirmDelete" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
