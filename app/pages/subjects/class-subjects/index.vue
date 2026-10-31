<script setup lang="ts">
import type { FilterField } from "~/components/filter/Drawer.vue";
const view = ref<'table' | 'card'>('table')
const showDuplicate = ref(false);
const route = useRoute();
const router = useRouter();
const store = useClassSubjectStore();
const { can } = useAuth();
// Teachers can view class subjects but the backend only lets admins/leadership change them.
const canManage = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]));
const clazzStore = useClassStore();
const streamStore = useStreamStore();
const sectionStore = useSectionStore();
const { records: data, meta, loading } = storeToRefs(store);

const UButton = resolveComponent("UButton");

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const streamOptions = computed(() =>
  streamStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const sectionOptions = computed(() =>
  sectionStore.records.map((e) => ({ label: e.name, value: e.id }))
);

const mandatoryOptions = [
  { label: "Core", value: "true" },
  { label: "Optional", value: "false" },
];
const columns = [
  {
    accessorKey: "className",
    header: "Class",
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

const size = ref(runtimeConf().limit);
const classId = ref(String(route.query.classId ?? ""));
const mandatory = ref(String(route.query.mandatory ?? ""));
const streamId = ref(String(route.query.streamId ?? ""));
const sectionId = ref(String(route.query.sectionId ?? ""));
const searchInput = ref(String(route.query.search ?? ""));
const search = ref(searchInput.value);

const sortOptions = [
  { label: "Class Level", value: "clazz.levelOrder:asc" },
  { label: "Subject (A-Z)", value: "subject.name:asc" },
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
];
const DEFAULT_SORT = "clazz.levelOrder:asc";
const sort = ref(String(route.query.sort ?? DEFAULT_SORT));
const sortBy = computed(() => sort.value.split(":")[0]);
const sortDirection = computed(() => sort.value.split(":")[1]);


function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } });
}

// Class, type and sort live in the shared filter drawer (same as the class list).
const filters = computed<Record<string, string>>({
  get: () => ({ classId: classId.value, sectionId: sectionId.value, streamId: streamId.value, mandatory: mandatory.value, sort: sort.value }),
  set: (v) => {
    classId.value = v.classId ?? "";
    mandatory.value = v.mandatory ?? "";
    sectionId.value = v.sectionId ?? "";
    streamId.value = v.streamId ?? "";
    sort.value = v.sort || DEFAULT_SORT;
  },
});
const filterFields = computed<FilterField[]>(() => [
  { key: "classId", label: "Class", type: "select", options: classOptions.value, placeholder: "All Classes" },
  { key: "sectionId", label: "Section", type: "select", options: sectionOptions.value, placeholder: "All Sections" },
  { key: "streamId", label: "Stream", type: "select", options: streamOptions.value, placeholder: "All Streams" },
  { key: "mandatory", label: "Type", type: "select", options: mandatoryOptions, placeholder: "All Types" },
  { key: "sort", label: "Sort by", type: "select", options: sortOptions, default: DEFAULT_SORT, required: true },
]);

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = val;
  }, 350);
});

async function fetchRecord() {
  await store.fetchAll(
    page.value,
    size.value,
    classId.value || undefined,
    mandatory.value === "" ? undefined : mandatory.value === "true",
    search.value || undefined,
    sortBy.value,
    sortDirection.value,
    streamId.value || undefined,
    sectionId.value || undefined
  );
}

watch(
  () => page.value,
  () => {
    fetchRecord();
  },
  { immediate: true }
);

watch([classId, mandatory, streamId, sectionId, search, sort], () => {
  updateQuery({
    classId: classId.value || undefined,
    mandatory: mandatory.value || undefined,
    streamId: streamId.value || undefined,
    sectionId: sectionId.value || undefined,
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
  sectionStore.fetchAll(0, 0);
  useAppStore().setTitle('Class Subjects')
  document.title = 'Class Subjects | Subject | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
<template>
  <div class="space-y-3 px-4 md:px-6">
    <SubjectSectionNav />
    <UCard :ui="{ body: 'sm:p-0 p-0', header: 'p-0 sm:p-0' }">
      <template #header>
          <div class="flex px-4 py-3 items-center justify-between gap-2">
              <div class="flex flex-1 items-center gap-2">
                  <template v-if="canManage">
                    <UButton to="/subjects/class-subjects/add" color="primary" class="md:flex hidden" label="Assign Subject" :icon="ASSIGN_ICON" />
                    <UButton to="/subjects/class-subjects/add" color="primary" class="md:hidden" :icon="ASSIGN_ICON" />
                    <UButton color="neutral" variant="outline" class="md:flex hidden" label="Duplicate to..." icon="lucide:copy" @click="showDuplicate = true" />
                    <UButton color="neutral" variant="outline" class="md:hidden" icon="lucide:copy" @click="showDuplicate = true" />
                  </template>
                  <div class="flex flex-1 items-center gap-2">
                      <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by class, subject, or stream..." class="flex-1" />
                      <FilterDrawer v-model="filters" :fields="filterFields" title="Filter class subjects" description="Narrow the list by class or type, or change the sort" />
                  </div>
              </div>
              <TableViewToggle v-model="view" />
          </div>
      </template>
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty>
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

        <template #streamName-cell="{ row }">
          <p>{{ row.original.streamName || '' }}</p>
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
                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.subjectName }}
                  </h3>

                  <div class="flex min-w-0 items-center gap-1 text-xs-base text-muted">
                    <span class="shrink-0">{{ item.className }}</span>

                    <template v-if="item.streamName">
                      <span class="shrink-0">•</span>
                      <span class="shrink-0">{{ item.streamName }}</span>
                    </template>

                    <span class="shrink-0">•</span>
                    <span class="truncate">{{ item.groupName || 'No Group' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-1">
                <UBadge :label="item.mandatory ? 'Core' : 'Optional'" :color="item.mandatory ? 'success' : 'info'"
                  variant="subtle" size="sm" />
                <UBadge v-if="item.locked" variant="subtle" color="error" size="sm" label="Locked" />
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="col-span-full flex flex-col items-center justify-center py-14">
            <UIcon name="i-lucide-book-open" class="mb-3 size-10 text-gray-400" />

            <h3 class="font-semibold">No subjects found</h3>

            <p class="text-sm text-gray-500">It looks like you haven't added any subjects yet.</p>
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

    <SubjectClassSubjectDuplicate v-model:open="showDuplicate" @duplicated="fetchRecord" />
  </div>
</template>