<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useTeacherStore()
const { records: data, meta, loading } = storeToRefs(store)

const UButton = resolveComponent('UButton')
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const parseStaus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DELETED: 'danger'
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => `${parseTitle[row.original.title]} ${row.original.user.givenNames} ${row.original.user.familyName}`
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }: any) => parseGender[row.original.gender]
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'phone',
    header: 'Phone'
  },
  {
    accessorKey: 'city',
    header: 'City'
  },
  {
    accessorKey: 'street',
    header: 'Street'
  }
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function name(param: Teacher) {
  return `${param.title} ${param.user.givenNames} ${param.user.familyName}`
}

watch(() => page.value, () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      page: page.value
    }
  })

  fetchRecord()
}, { immediate: true })

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

async function fetchRecord() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
}

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }

  fetchRecord()
})
</script>

<template>
  <UCard class="hidden md:block" :ui="{
    body: 'p-0 sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No teachers found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #email-cell="{ row }">
        {{ row.original.user.email }}
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
    </UTable>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <template v-if="loading">
      <UCard v-for="i in 4" :key="i"
        class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900">
        <div class="space-y-5 p-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-28" />
                <USkeleton class="h-2 w-36" />
              </div>
            </div>

            <USkeleton class="h-6 w-16 rounded-full" />
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3">
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
            <USkeleton class="h-16 rounded-2xl" />
          </div>

          <!-- Footer -->
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
      <UCard v-for="item in data" :key="item.id"
        class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-gray-800 dark:bg-neutral-900"
        :ui="{
          body: 'p-0'
        }">
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar size="lg" :alt="name(item)" class="rounded-2xl" />

              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ name(item) }}
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
          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Gender
            </p>

            <UBadge :label="parseGender[item.gender]" :color="parseGenderColor[item.gender]" size="sm" variant="soft" />
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Status
            </p>

            <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" size="sm" variant="soft" />
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Phone
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.phone || 'N/A' }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              City
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.city || 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar size="sm" icon="i-lucide-map-pin" />

            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.city || 'Unknown City' }}
              </p>

              <p class="truncate text-xs text-gray-500">
                {{ item.street || 'No address provided' }}
              </p>
            </div>
          </div>

          <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" class="rounded-xl" />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

        <p class="text-sm text-gray-500">
          No teachers found.
        </p>
      </div>
    </template>
    <div class="flex justify-between items-center md:hidden">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>
