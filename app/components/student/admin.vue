<script setup lang="ts">
const tableView = ref<'table' | 'card'>('table');
const route = useRoute();
const router = useRouter();
const store = useStudentStore();
const clazzStore = useClassStore();
const { records: data, meta, loading } = storeToRefs(store)

const classOptions = computed(() =>
  clazzStore.records.map((e) => ({ label: e.name, value: e.id }))
)

const sortOptions = [
  { label: 'Name (A-Z)', value: 'givenNames:asc' },
  { label: 'Name (Z-A)', value: 'givenNames:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
]
const DEFAULT_SORT = 'createdAt:desc'

const value = ref('')
const classId = ref(String(route.query.classId ?? ''))
const gender = ref(String(route.query.gender ?? ''))
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(
  () => [classId.value, gender.value, sort.value !== DEFAULT_SORT].filter(Boolean).length
)

const parseStaus: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

const parseStatusColor: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  DELETED: "danger",
};

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => {
      return `${row.original.givenNames} ${row.original.familyName}`
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "className",
    header: "Class",
  },
  {
    accessorKey: "parent",
    header: "Guardian",
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
  },
];

function view(row: Student) {
  router.push(`/students/${row.id}`);
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const search = ref(value.value)

const size = ref(runtimeConf().limit);

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecord() {
  await store.fetchAll(page.value, size.value, search.value, classId.value || undefined, sortBy.value, sortDirection.value, gender.value || undefined);
}

watch(
  () => page.value,
  () => fetchRecord(),
  { immediate: true }
);

let timeout: ReturnType<typeof setTimeout>

watch(value, (val) => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    search.value = val
  }, 500)
})

watch([search, classId, gender, sort], () => {
  updateQuery({
    classId: classId.value || undefined,
    gender: gender.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    page: 1,
  })

  if (page.value === 1) fetchRecord();
});

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value
    })
  }

  clazzStore.fetchAll(0, 0)
  fetchRecord();
});
</script>

<template>
  <div class="px-4 md:px-6">
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 gap-2 justify-between items-center">
            <div class="flex space-x-2 flex-1 items-center">
              <UButton to="/students/add" class="md:items-center md:flex md:justify-center hidden" color="primary"
                label="Enrolled Student" :icon="ADD_ICON" />
              <UButton to="/students/add" class="md:hidden" color="primary" :icon="ADD_ICON" />
              <div class="flex-1 border-default flex items-center gap-2">
                <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or admission no"
                  class="flex-1" />
                <StudentFilterDrawer v-model:class-id="classId" v-model:gender="gender" v-model:sort="sort"
                  :class-options="classOptions" :sort-options="sortOptions" :active-count="activeFilterCount"
                  :default-sort="DEFAULT_SORT" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <TableViewToggle v-model="tableView" />
            </div>
          </div>


        </div>
      </template>
      <UTable v-if="tableView === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">No students found.</p>
          </div>
        </template>
        <template #parent-cell="{ row }">
          <p>
            {{ row.original.guardian?.givenNames }} {{ row.original.guardian?.familyName }}
          </p>
        </template>
        <template #gender-cell="{ row }">
          <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
            variant="outline" />
        </template>
        <template #name-cell="{ row }">
          <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
            :photo="row.original.photo" :subtitle="`${row.original.admissionNumber || 'No Admission No'}`" />
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #actions-cell="{ row }">
          <div>
            <UButton @click="view(row.original)" size="sm" variant="ghost" color="success" class="cursor-pointer"
              :icon="VIEW_ICON" />
          </div>
        </template>
      </UTable>
      <div class="md:p-4  md:space-y-4"
        :class="tableView === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i" :ui="{ body: 'sm:p-0 p-0' }">
            <div class="animate-pulse">
              <!-- Header -->
              <div class="border-b border-default p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <!-- Avatar -->
                    <USkeleton class="size-12 shrink-0 rounded-xl" />

                    <!-- Name -->
                    <div class="min-w-0 space-y-2">
                      <USkeleton class="h-4 w-36 rounded-md" />
                      <USkeleton class="h-3 w-28 rounded-md" />
                    </div>
                  </div>

                  <!-- Status -->
                  <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-3 p-4">
                <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                  <div class="mb-3 flex items-center gap-2">
                    <USkeleton class="size-7 shrink-0 rounded-lg" />
                    <USkeleton class="h-3 w-16 rounded-md" />
                  </div>

                  <USkeleton class="h-4 w-24 rounded-md" />
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between gap-3 border-t border-default p-4">
                <div class="flex min-w-0 items-center gap-3">
                  <USkeleton class="size-10 shrink-0 rounded-full" />

                  <div class="min-w-0 space-y-2">
                    <USkeleton class="h-4 w-28 rounded-md" />
                    <USkeleton class="h-3 w-24 rounded-md" />
                  </div>
                </div>

                <USkeleton class="h-9 w-20 shrink-0 rounded-xl" />
              </div>
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <div @click="view(item)" v-for="item in data" :key="item.id" class="cursor-pointer">
            <!-- Header -->
            <div class="border-b md:border md:rounded-2xl border-default p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar class="size-10" :src="item.photo" :alt="`${item.givenNames} ${item.familyName}`"
                    loading="lazy" />

                  <div class="min-w-0">
                    <h3 class="truncate text-base font-bold text-highlighted">
                      {{ item.givenNames }} {{ item.familyName }}
                    </h3>

                    <div class="flex items-center gap-1 text-xs-base text-muted">
                      <span>
                        {{ item.admissionNumber || 'No Admission No' }}
                      </span>

                      <span>•</span>

                      <span>
                        {{ item.className || 'No Class' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-2 self-center">
                  <UBadge :label="parseStaus[item.status]"
                    :color="item.status === 'ACTIVE' ? 'success' : item.status === 'INACTIVE' ? 'warning' : 'error'"
                    variant="subtle" size="sm" />
                  <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <UCard class="col-span-full">
            <div class="flex flex-col items-center justify-center py-14">
              <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

              <p class="text-sm text-gray-500 dark:text-gray-400">No students found.</p>
            </div>
          </UCard>
        </template>
      </div>
      <template #footer>
        <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
