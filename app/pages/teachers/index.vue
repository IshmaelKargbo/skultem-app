<script setup lang="ts">
const route = useRoute()
const router = useRouter()

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
const gender = ref(String(route.query.gender ?? ''))
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
]

const search = computed<string>({
  get: () => String(route.query.search ?? ''),
  set: (value) => updateQuery({ search: value || undefined }),
})

// One scrolling list: the next teachers load as the end comes into view.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } = useInfiniteList<Teacher>(
  (page, size) => TeacherApi().getAll(search.value, page, size, sortBy.value, sortDirection.value,
    gender.value || undefined) as any
)

// What the filter drawer holds (search sits outside it).
const activeFilterCount = computed(
  () => [gender.value, sort.value !== DEFAULT_SORT].filter(Boolean).length
)

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

watch(() => search.value, () => reload())

watch([sort, gender], () => {
  updateQuery({
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    gender: gender.value || undefined,
  })
  reload()
})

watch(searchInput, (value) => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    if (value !== search.value) {
      updateQuery({
        search: value || undefined,
      })
    }
  }, 500)
})

onMounted(async () => {
  // Old links may still carry ?page= / ?size=; the list starts at the top now.
  if (route.query.page || route.query.size) {
    const { page: _page, size: _size, ...rest } = route.query
    await router.replace({ query: rest })
  }

  reload()
  useAppStore().setTitle('All Teachers')
  useAppStore().setBack(false)
  document.title = 'Teachers | Skultem'
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR]
})
</script>

<template>
  <div class="px-4 sm:px-6">
    <GuideBar class="mb-3" topic="admin-teachers" />
    <UCard data-guide="adm-list" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex px-4 py-3 gap-2 justify-between items-center">
          <div class="flex space-x-2 flex-1 items-center">
            <UButton data-guide="adm-tch-add" to="/teachers/add" label="Add Teacher" class="hidden md:flex" color="primary" :icon="ADD_ICON" />

            <UButton data-guide="adm-tch-staff" to="/teachers/add-staff" label="Add Staff" variant="outline" color="neutral" class="hidden md:flex"
              icon="i-lucide-briefcase" />

            <UDropdownMenu data-guide="adm-tch-add" :items="addItems" arrow :content="{ align: 'end' }" class="md:hidden">
              <UButton color="primary" :icon="ADD_ICON" />
            </UDropdownMenu>

            <div data-guide="adm-search" class="flex-1 border-default flex items-center gap-2">
              <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name, staff ID, email or phone"
                class="flex-1" />
              <TeacherFilterDrawer v-model:gender="gender" v-model:sort="sort" :sort-options="sortOptions"
                :active-count="activeFilterCount" :default-sort="DEFAULT_SORT" />
            </div>
          </div>

        </div>
      </template>

      <!-- Desktop Table -->
      <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading" :ui="{ tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => openTeacher(row.original)">
        <template #empty>
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
                {{ row.original.staffId }}<template v-if="row.original.designation"> &middot; {{
                  row.original.designation }}</template>
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

      </UTable>
      <div class="md:p-4 md:space-y-4 md:hidden">
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
                  <UBadge :label="parseStatus[item.status]"
                    :color="item.status === 'ACTIVE' ? 'success' : item.status === 'INACTIVE' ? 'error' : 'warning'"
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

      <div ref="sentinel">
        <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
          :total="meta?.total" noun="staff" :error="listError" @retry="loadMore" />
      </div>
    </UCard>
  </div>
</template>