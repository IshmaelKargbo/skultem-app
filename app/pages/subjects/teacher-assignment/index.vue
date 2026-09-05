<script setup lang="ts">
const view = ref<"table" | "card">("table");
const route = useRoute();
const router = useRouter();
const store = useTeacherSubjectStore();
const clazzStore = useClassStore();
const { records: data, meta, loading } = storeToRefs(store);
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
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

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const classId = ref(String(route.query.classId ?? ""));
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

const hasActiveFilters = computed(() => !!classId.value || !!search.value || sort.value !== DEFAULT_SORT);

function resetFilters() {
  classId.value = "";
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
  await store.fetchAll(page.value, size.value, classId.value || undefined, search.value || undefined,
    sortBy.value, sortDirection.value);
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
watch([classId, search, sort], () => {
  updateQuery({
    classId: classId.value || undefined,
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
    <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 justify-between">
            <div class="flex items-center  flex-1 space-x-2">
              <UButton to="/subjects/teacher-assignment/add" class="md:flex hidden justify-center" color="primary"
                label="Assign Subject" :icon="TEACHER_ICON" />
              <UButton to="/subjects/teacher-assignment/add" class="md:hidden" color="primary" :icon="ASSIGN_ICON" />
            </div>
            <TableViewToggle v-model="view" />
          </div>

          <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                placeholder="All Classes" clear />
              <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by teacher or subject..."
                class="col-span-2" />
            </div>
            <div>
              <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                :disabled="!hasActiveFilters" @click="resetFilters" />
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
      <div class="space-y-4 p-4" :class="view === 'table'
        ? 'md:hidden'
        : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'
        ">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i" variant="outline" class="overflow-hidden rounded-2xl" :ui="{ body: 'p-0' }">
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
                <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/30 p-3">
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
          <UCard v-for="item in data" :key="item.id" variant="outline" :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <div class="border-b border-default p-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <UIcon :name="TEACHER_ICON" class="size-5 text-primary" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-highlighted">
                    {{ item.subjectName }}
                  </h3>

                  <p class="truncate text-xs-base text-muted">
                    {{ item.className || 'No class' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-3">
              <!-- Section -->
              <div
                class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
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
                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
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
                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
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
                class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
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
          <UCard variant="outline" class="col-span-full rounded-2xl">
            <div class="flex flex-col items-center justify-center py-14 text-center">
              <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <UIcon name="ph:books-light" class="size-7 text-primary" />
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
      </div>
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
