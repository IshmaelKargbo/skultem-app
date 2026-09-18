<script setup lang="ts">
const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();
const store = useTeacherSubjectStore();
const clazzStore = useClassStore();
const streamStore = useStreamStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const streamOptions = computed(() =>
  streamStore.records.map((e) => ({ label: e.name, value: e.id }))
);

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

const size = ref(runtimeConf().limit);
const filterState = ref(false);

function toggleFilter() {
  filterState.value = !filterState.value;
}

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const classId = ref(String(route.query.classId ?? ""));
const streamId = ref(String(route.query.streamId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
const sortOptions = [
  { label: "Newest First", value: "assignedAt:desc" },
  { label: "Oldest First", value: "assignedAt:asc" },
  { label: "Teacher (A-Z)", value: "teacher.user.givenName:asc" },
  { label: "Subject (A-Z)", value: "subject.name:asc" },
];
const DEFAULT_SORT = "assignedAt:desc";
const sort = ref(String(route.query.sort ?? DEFAULT_SORT));
const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);

const hasActiveFilters = computed(
  () => !!classId.value || !!streamId.value || !!search.value || sort.value !== DEFAULT_SORT
);

function resetFilters() {
  classId.value = "";
  streamId.value = "";
  searchInput.value = "";
  search.value = "";
  sort.value = DEFAULT_SORT;
}

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = val;
  }, 350);
});

async function fetchRecord() {
  loading.value = true;
  await store.fetchAll(page.value, size.value, classId.value || undefined, streamId.value || undefined,
    search.value || undefined, sortBy.value, sortDirection.value);
  loading.value = false;
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

    fetchRecord();
  },
  { immediate: true }
)

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([classId, streamId, search, sort], () => {
  updateQuery({
    classId: classId.value || undefined,
    streamId: streamId.value || undefined,
    search: search.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    page: 1,
  })

  if (page.value === 1) fetchRecord();
});

onMounted(async () => {
  updateQuery({
    page: page.value
  })

  clazzStore.fetchAll(0, 0);
  streamStore.fetchAll(0, 0);
  fetchRecord();
  useAppStore().setTitle('Teacher Assignment')
  document.title = 'Teacher Assignment | Subjects | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
<template>
  <div class="space-y-4 px-4 md:px-6">
    <SubjectSectionNav />
    <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 items-center justify-between gap-3">
            <div class="flex items-center flex-1 space-x-2">
              <UButton to="/subjects/teacher-assignment/add" class="md:flex hidden justify-center" color="primary"
                label="Assign Subject" :icon="TEACHER_ICON" />
              <UButton to="/subjects/teacher-assignment/add" class="md:hidden" color="primary" :icon="ASSIGN_ICON" />
            </div>

            <div>
              <TableViewToggle v-model="view" />
              <UButton @click="toggleFilter" :icon="!filterState ? FILTER_ICON : CLOSE_ICON" variant="outline"
                :color="!filterState ? 'info' : 'error'" class="md:hidden" />
            </div>
          </div>

          <div class="border-t hidden p-4 border-default md:flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-5">
              <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                placeholder="All Classes" clear />
              <USelectMenu v-model="streamId" value-key="value" label-key="label" :items="streamOptions"
                placeholder="All Streams" clear />
              <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <div class="flex space-x-1 sm:col-span-2">
                <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by teacher or subject..."
                  class="flex-1" />
                <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
                  :disabled="!hasActiveFilters" @click="resetFilters" />
              </div>
            </div>
            <div class="hidden md:block">
              <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                :disabled="!hasActiveFilters" @click="resetFilters" />
            </div>
          </div>
          <div v-if="filterState"
            class="border-t md:hidden p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-5">
              <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                placeholder="All Classes" clear />
              <USelectMenu v-model="streamId" value-key="value" label-key="label" :items="streamOptions"
                placeholder="All Streams" clear />
              <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <div class="flex space-x-1 sm:col-span-2">
                <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by teacher or subject..."
                  class="flex-1" />
                <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
                  :disabled="!hasActiveFilters" @click="resetFilters" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <UTable v-if="view === 'table'" class="md:block hidden" :columns="columns" :data="data" :loading="loading">
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

      <!-- Mobile -->
      <div class="md:p-4 md:space-y-4" :class="view === 'table'
        ? 'md:hidden'
        : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'
        ">
        <!-- Loading -->
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="border-b md:border md:rounded-2xl border-default p-3">
            <div class="flex items-center gap-3">
              <USkeleton class="size-10 shrink-0 rounded-full" />

              <div class="min-w-0 flex-1 space-y-2">
                <USkeleton class="h-4 w-36 rounded-md" />
                <USkeleton class="h-3 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <div v-for="item in data" :key="item.id" class="border-b md:border md:rounded-2xl border-default p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar :icon="TEACHER_ICON" />

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.subjectName }}
                  </h3>

                  <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                    <span class="shrink-0">{{ item.className || 'No class' }}</span>

                    <template v-if="item.streamName && item.streamName !== 'N/A'">
                      <span class="shrink-0">•</span>
                      <span class="shrink-0">{{ item.streamName }}</span>
                    </template>

                    <span class="shrink-0">•</span>
                    <span class="truncate">{{ item.teacherName || 'No Teacher Assigned' }}</span>
                  </div>
                </div>
              </div>

              <UBadge variant="subtle" color="neutral" size="sm" class="shrink-0 self-center"
                :label="formatDate(item.assignedAt)" />
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="col-span-full flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 size-10 text-gray-400" />

            <h3 class="font-semibold">No teacher assignments found</h3>

            <p class="text-sm text-gray-500">There are no teacher-subject assignments matching your current filters.</p>
          </div>
        </template>
      </div>
      <template #footer>
        <div class="flex items-center justify-between flex-col md:flex-row space-y-2 md:space-y-0">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
