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

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
const sortOptions = [
  { label: 'Name (A-Z)', value: 'givenNames:asc' },
  { label: 'Name (Z-A)', value: 'givenNames:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
]
const DEFAULT_SORT = 'createdAt:desc'

const value = ref(route.query.search as string || '')
const classId = ref(String(route.query.classId ?? ''))
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const hasActiveFilters = computed(() => !!value.value || !!classId.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
  value.value = ''
  classId.value = ''
  sort.value = DEFAULT_SORT
}

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

// Local ref, not a URL-bound computed getter/setter - `value` above already seeds/debounces into
// this the same way; keeping a plain `search` ref (rather than deriving it from route.query like
// the old computed did) means the fetch below is never gated on the URL write actually landing.
const search = ref(value.value)

const size = ref(runtimeConf().limit);

// Shadows the global `updateQuery` util (app/utils/common.ts) - that one only ever compares
// page/size and silently drops any other query key (search, classId, sort) when neither changed,
// which is exactly why none of those ever reached the URL or triggered a refetch here before.
function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecord() {
  await store.fetchAll(page.value, size.value, search.value, classId.value || undefined, sortBy.value, sortDirection.value);
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

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([search, classId, sort], () => {
  updateQuery({
    search: search.value || undefined,
    classId: classId.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    page: 1,
  })

  if (page.value === 1) fetchRecord();
});

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value,
      search: search.value || undefined
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
          <div class="flex px-4 py-3 justify-between items-center">
            <div class="flex space-x-2 flex-1 items-center">
              <UButton to="/students/add" class="md:items-center md:flex md:justify-center hidden" color="primary"
                label="Enrolled Student" :icon="ADD_ICON" />
              <UButton to="/students/add" class="md:hidden" color="primary" :icon="ADD_ICON" />
            </div>
            <TableViewToggle v-model="tableView" />
          </div>

          <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <USelectMenu v-model="classId" value-key="value" label-key="label" :items="classOptions"
                placeholder="All Classes" clear />
              <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or admission no"
                class="col-span-2" />
            </div>
            <div>
              <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                :disabled="!hasActiveFilters" @click="resetFilters" />
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
      <div class="p-4  space-y-4"
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
          <UCard v-for="item in data" :key="item.id" class="group cursor-pointer hover:ring-secondary-300"
            :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <div class="border-b border-default p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar class="size-10" :src="item.photo || '/avatar-placeholder.svg'"
                    :alt="`${item.givenNames} ${item.familyName}`" loading="lazy" />

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

                <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" variant="soft" />
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Gender -->
              <div class="min-w-0 rounded-2xl border p-3" :class="item.gender === 'MALE'
                ? 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
                : item.gender === 'FEMALE'
                  ? 'border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                ">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-lg" :class="item.gender === 'MALE'
                    ? 'bg-blue-100 dark:bg-blue-500/20'
                    : item.gender === 'FEMALE'
                      ? 'bg-pink-100 dark:bg-pink-500/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                    ">
                    <UIcon name="i-lucide-users" class="size-4" :class="item.gender === 'MALE'
                      ? 'text-blue-600 dark:text-blue-400'
                      : item.gender === 'FEMALE'
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-gray-600 dark:text-gray-400'
                      " />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide" :class="item.gender === 'MALE'
                    ? 'text-blue-700 dark:text-blue-300'
                    : item.gender === 'FEMALE'
                      ? 'text-pink-700 dark:text-pink-300'
                      : 'text-gray-600 dark:text-gray-400'
                    ">
                    Gender
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ parseGender[item.gender] || 'N/A' }}
                </p>
              </div>

              <!-- Date of Birth -->
              <div
                class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <UIcon name="i-lucide-calendar-days" class="size-4 text-amber-600 dark:text-amber-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    Date of Birth
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ formatDate(item.dateOfBirth) || 'N/A' }}
                </p>
              </div>

              <!-- Guardian -->
              <div
                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <UIcon name="i-lucide-user-round" class="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Guardian
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ item.guardian?.givenNames }}
                  {{ item.guardian?.familyName }}
                </p>
              </div>

              <!-- Class -->
              <div
                class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                    <UIcon name="i-lucide-school" class="size-4 text-violet-600 dark:text-violet-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Class
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ item.className || 'N/A' }}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-3 border-t border-default p-4">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="xl" icon="i-lucide-users" />

                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-highlighted">
                    {{ item.family?.fatherName || 'No Father Name' }}
                  </p>
                  <p class="truncate text-xs-base text-muted">
                    {{ item.family?.motherName || 'No Mother Name' }}
                  </p>
                </div>
              </div>

              <UButton icon="i-lucide-arrow-right" color="neutral" variant="soft" square
                class="rounded-xl transition-all group-hover:bg-secondary hover:bg-secondary cursor-pointer group-hover:text-white group-hover:translate-x-1"
                @click="view(item)" />
            </div>
          </UCard>
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
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
