<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useTeacherStore()

const { records: data, meta, loading } = storeToRefs(store)

const view = ref<'table' | 'card'>('table')
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const searchInput = ref((route.query.search as string) || '')
let searchTimeout: ReturnType<typeof setTimeout>

const parseStatus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted',
}

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

async function fetchRecords() {
  loading.value = true

  try {
    await store.fetchAll(
      page.value,
      size.value,
      search.value,
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
</script>

<template>
  <div class="px-4 sm:px-6">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div class="flex flex-1 gap-3">
            <UInput v-model="searchInput" icon="i-lucide-search"
              placeholder="Search by name, staff ID, email or phone" />

            <UButton to="/teachers/add" label="Add Teacher" class="hidden md:flex" :icon="ADD_ICON" />

            <UButton to="/teachers/add" class="md:hidden" color="primary" :icon="ADD_ICON" />
          </div>

          <TableViewToggle v-model="view" />
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
            <UAvatar :alt="teacherFullName(row.original)" />

            <div>
              <p>{{ teacherName(row.original) }}</p>

              <p class="text-xs text-muted">
                {{ row.original.staffId }}
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
      <div class="space-y-4 p-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="item in 4" :key="item" variant="outline">
            <div class="space-y-5 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <USkeleton class="size-12 rounded-2xl" />

                  <div class="space-y-2">
                    <USkeleton class="h-3 w-28" />
                    <USkeleton class="h-2 w-36" />
                  </div>
                </div>

                <USkeleton class="h-6 w-16 rounded-full" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <USkeleton class="h-16 rounded-2xl" />
                <USkeleton class="h-16 rounded-2xl" />
                <USkeleton class="h-16 rounded-2xl" />
                <USkeleton class="h-16 rounded-2xl" />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <USkeleton class="h-9 w-9 rounded-full" />

                  <div class="space-y-2">
                    <USkeleton class="h-3 w-24" />
                    <USkeleton class="h-2 w-20" />
                  </div>
                </div>

                <USkeleton class="size-6 rounded-xl" />
              </div>
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <UCard v-for="item in data" :key="item.id"  class="group cursor-pointer hover:ring-secondary-300" :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <div class="border-b border-gray-200 p-3 dark:border-gray-800">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar size="xl" :alt="teacherName(item)" />

                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {{ teacherName(item) }}
                    </h3>

                    <p class="truncate text-xs text-gray-500">
                      {{ item.user.email }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Gender -->
              <div class="rounded-2xl border p-3" :class="item.gender === 'MALE'
                ? 'border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10'
                : item.gender === 'FEMALE'
                  ? 'border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                ">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg" :class="item.gender === 'MALE'
                    ? 'bg-sky-100 dark:bg-sky-500/20'
                    : item.gender === 'FEMALE'
                      ? 'bg-pink-100 dark:bg-pink-500/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                    ">
                    <UIcon name="i-lucide-users" class="size-4" :class="item.gender === 'MALE'
                      ? 'text-sky-600 dark:text-sky-400'
                      : item.gender === 'FEMALE'
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-gray-600 dark:text-gray-400'
                      " />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide" :class="item.gender === 'MALE'
                    ? 'text-sky-700 dark:text-sky-300'
                    : item.gender === 'FEMALE'
                      ? 'text-pink-700 dark:text-pink-300'
                      : 'text-gray-600 dark:text-gray-400'
                    ">
                    Gender
                  </p>
                </div>

                <p class="text-sm font-semibold" :class="item.gender === 'MALE'
                  ? 'text-sky-700 dark:text-sky-300'
                  : item.gender === 'FEMALE'
                    ? 'text-pink-700 dark:text-pink-300'
                    : 'text-gray-900 dark:text-white'
                  ">
                  {{ parseGender[item.gender] }}
                </p>
              </div>

              <!-- Status -->
              <div class="rounded-2xl border p-3" :class="item.status === 'ACTIVE'
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                : item.status === 'INACTIVE'
                  ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
                ">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg" :class="item.status === 'ACTIVE'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20'
                    : item.status === 'INACTIVE'
                      ? 'bg-red-100 dark:bg-red-500/20'
                      : 'bg-amber-100 dark:bg-amber-500/20'
                    ">
                    <UIcon name="i-lucide-badge-check" class="size-4" :class="item.status === 'ACTIVE'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.status === 'INACTIVE'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                      " />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide" :class="item.status === 'ACTIVE'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : item.status === 'INACTIVE'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-amber-700 dark:text-amber-300'
                    ">
                    Status
                  </p>
                </div>

                <p class="text-sm font-semibold" :class="item.status === 'ACTIVE'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : item.status === 'INACTIVE'
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-amber-700 dark:text-amber-300'
                  ">
                  {{ parseStatus[item.status] }}
                </p>
              </div>

              <!-- Phone -->
              <div
                class="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                    <UIcon name="i-lucide-phone" class="size-4 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    Phone
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.phone || 'N/A' }}
                </p>
              </div>

              <!-- City -->
              <div
                class="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <UIcon name="i-lucide-map-pinned" class="size-4 text-amber-600 dark:text-amber-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    City
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.city || 'N/A' }}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between border-t border-gray-100 p-3 dark:border-gray-800">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="xl" icon="i-lucide-map-pin" />

                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.city || 'Unknown City' }}
                  </p>

                  <p class="truncate text-xs text-gray-500">
                    {{ item.street || 'No address provided' }}
                  </p>
                </div>
              </div>

              <UButton icon="i-lucide-arrow-right" color="neutral" variant="soft" square
                class="rounded-xl transition-all group-hover:bg-secondary hover:bg-secondary cursor-pointer group-hover:text-white group-hover:translate-x-1"
                @click="openTeacher(item)" />
            </div>
          </UCard>
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
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>