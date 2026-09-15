<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useTeacherStore()

const { records: data, meta, loading } = storeToRefs(store)

const view = ref<'table' | 'card'>('table')
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const searchInput = ref((route.query.search as string) || '')
let searchTimeout: ReturnType<typeof setTimeout>

const sortOptions = [
  { label: 'Name (A-Z)', value: 'user.givenName:asc' },
  { label: 'Name (Z-A)', value: 'user.givenName:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
]
const DEFAULT_SORT = 'createdAt:desc'
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const parseStatus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted',
}

const addItems = [[
  { label: 'Add Teacher', icon: ADD_ICON, to: '/teachers/add' },
  { label: 'Add Staff', icon: 'i-lucide-briefcase', to: '/teachers/add-staff' }
]]

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }: any) => parseGender[row.original.gender],
  },
  {
    accessorKey: 'email',
    header: 'Contact',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'action',
    header: '',
  },
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (value) => updateQuery({ page: value }),
})

const search = computed<string>({
  get: () => String(route.query.search ?? ''),
  set: (value) => updateQuery({ search: value || undefined, page: 1 }),
})

const size = ref(runtimeConf().limit)
const filterState = ref(false)

function toggleFilter() {
  filterState.value = !filterState.value
}

function teacherName(teacher: Teacher) {
  return `${clean(teacher.title)} ${teacher.user.givenNames} ${teacher.user.familyName}`
}

function teacherFullName(teacher: Teacher) {
  return `${teacher.user.givenNames} ${teacher.user.familyName}`
}

function openTeacher(teacher: Teacher) {
  router.push(`/teachers/${teacher.id}`)
}

function updateQuery(newQuery: Record<string, any>) {
  const query = {
    ...route.query,
    ...newQuery,
  }

  if (!query.search) {
    delete query.search
  }

  router.replace({ query })
}

const hasActiveFilters = computed(() => !!search.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
  searchInput.value = ''
  sort.value = DEFAULT_SORT
  updateQuery({ search: undefined, sort: undefined, page: 1 })
}

async function fetchRecords() {
  loading.value = true

  try {
    await store.fetchAll(
      page.value,
      size.value,
      search.value,
      sortBy.value,
      sortDirection.value,
    )
  } finally {
    loading.value = false
  }
}

watch(
  () => page.value,
  async () => {
    await nextTick()

    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    await fetchRecords()
  },
)

watch(
  () => search.value,
  async () => {
    await fetchRecords()
  },
)

watch(sort, async () => {
  updateQuery({ sort: sort.value === DEFAULT_SORT ? undefined : sort.value, page: 1 })
  await fetchRecords()
})

watch(searchInput, (value) => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    if (value !== search.value) {
      updateQuery({
        search: value || undefined,
        page: 1,
      })
    }
  }, 500)
})

onMounted(async () => {
  const query: Record<string, any> = {
    page: route.query.page ?? 1,
    size: route.query.size ?? runtimeConf().limit,
  }

  if (route.query.search) {
    query.search = route.query.search
  }

  const hasMissingQuery =
    !route.query.page ||
    !route.query.size

  if (hasMissingQuery) {
    await router.replace({ query })
  }

  await fetchRecords()
  useAppStore().setTitle('All Teachers')
  useAppStore().setBack(false)
  document.title = 'Teachers | Skultem'
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>

<template>
  <div class="px-4 sm:px-6">
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex p-4 justify-between items-center">
            <div class="flex space-x-2 flex-1 items-center">
              <UButton to="/teachers/add" label="Add Teacher" class="hidden md:flex" color="primary" :icon="ADD_ICON" />

              <UButton to="/teachers/add-staff" label="Add Staff" variant="outline" color="neutral"
                class="hidden md:flex" icon="i-lucide-briefcase" />

              <UDropdownMenu :items="addItems" arrow :content="{ align: 'end' }" class="md:hidden">
                <UButton color="primary" :icon="ADD_ICON" />
              </UDropdownMenu>
            </div>

            <div>
              <TableViewToggle v-model="view" />
              <UButton @click="toggleFilter" :icon="!filterState ? FILTER_ICON : CLOSE_ICON" variant="outline"
                :color="!filterState ? 'info' : 'error'" class="md:hidden" />
            </div>
          </div>

          <div class="border-t hidden p-4 border-default md:flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3">
              <USelectMenu class="w-full" v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <div class="flex space-x-1 md:col-span-2">
                <UInput v-model="searchInput" :icon="SEARCH_ICON"
                  placeholder="Search by name, staff ID, email or phone" class="flex-1" />
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
            <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <USelectMenu class="w-full" v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <div class="flex space-x-1 sm:col-span-2">
                <UInput v-model="searchInput" :icon="SEARCH_ICON"
                  placeholder="Search by name, staff ID, email or phone" class="flex-1" />
                <UButton class="md:hidden" :trailing-icon="DELETE_ICON" variant="ghost" color="error"
                  :disabled="!hasActiveFilters" @click="resetFilters" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Desktop Table -->
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">
              No teachers found.
            </p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center space-x-5">
            <UAvatar :src="row.original.user?.photo || undefined" :alt="teacherFullName(row.original)" loading="lazy" />

            <div>
              <p>{{ teacherName(row.original) }}</p>

              <p class="text-xs text-muted">
                {{ row.original.staffId }}<template v-if="row.original.designation"> &middot; {{ row.original.designation }}</template>
              </p>
            </div>
          </div>
        </template>

        <template #gender-cell="{ row }">
          <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
            variant="outline" />
        </template>

        <template #email-cell="{ row }">
          <div>
            <p>{{ row.original.user.email }}</p>

            <p class="text-xs text-muted">
              {{ row.original.phone }}
            </p>
          </div>
        </template>

        <template #address-cell="{ row }">
          <div>
            <p>{{ row.original.city }}</p>

            <p class="text-xs text-muted">
              {{ row.original.street }}
            </p>
          </div>
        </template>

        <template #action-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton variant="ghost" color="success" :icon="VIEW_ICON" size="sm" class="cursor-pointer"
              @click="openTeacher(row.original)" />

            <UButton :to="`/teachers/edit/${row.original.id}`" variant="ghost" color="warning" :icon="EDIT_ICON"
              size="sm" />
          </div>
        </template>
      </UTable>
      <div class="md:p-4 md:space-y-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
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
          <div @click="openTeacher(item)" v-for="item in data" :key="item.id" class="cursor-pointer">
            <div class="border-b md:border md:rounded-2xl border-default p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar class="size-10" :src="item.user?.photo || undefined" :alt="teacherName(item)"
                    loading="lazy" />

                  <div class="min-w-0">
                    <h3 class="truncate text-base font-bold text-highlighted">
                      {{ teacherName(item) }}
                    </h3>

                    <div class="flex items-center gap-1 text-xs-base text-muted">
                      <span>
                        {{ item.staffId || 'No Staff ID' }}
                      </span>

                      <span v-if="item.designation">•</span>

                      <span v-if="item.designation">
                        {{ item.designation }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-2 self-center">
                  <UBadge :label="parseStatus[item.status]" :color="item.status === 'ACTIVE' ? 'success' : item.status === 'INACTIVE' ? 'error' : 'warning'"
                    variant="subtle" size="sm" />
                  <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="col-span-full flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

            <p class="text-sm text-gray-500">
              No teachers found.
            </p>
          </div>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>