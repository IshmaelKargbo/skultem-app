<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const { records: data, meta, loading } = storeToRefs(store)

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
    cell: ({ row }: any) => {
      return `${row.original.givenNames} ${row.original.familyName}`
    }
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of Birth'
  },
  {
    accessorKey: 'gender',
    header: 'Gender'
  },
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'parent',
    header: 'Guardian'
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    }
  }
]

function view(row: Student) {
  router.push(`/students/${row.id}`)
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

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
  await store.fetchAll(page.value, size.value)
}

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value
    }
  })

  fetchRecord()
}, { immediate: true })

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
  <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
          <p class="text-gray-500 dark:text-gray-400">No students found.</p>
        </div>
      </template>
      <template #parent-cell="{ row }">
        <p>{{ row.original.guardian?.givenNames }} {{ row.original.guardian?.familyName }}</p>
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
      <template #name-cell="{ row }">
        <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
          :photo="row.original.photo"
          :subtitle="`${row.original.admissionNumber || 'No Admission No'} · ${row.original.className || 'No Class'}`" />
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #actions-cell="{ row }">
        <div>
          <UButton @click="view(row.original)" size="sm" variant="ghost" color="success" :icon="VIEW_ICON" />
        </div>
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
    <!-- Loading -->
    <template v-if="loading">
      <UCard v-for="i in 4" :key="i" class="overflow-hidden">
        <div class="space-y-5 p-4 mt-5">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-28" />
                <USkeleton class="h-2 w-20" />
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
              <USkeleton class="size-9 rounded-full" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-24" />
                <USkeleton class="h-2 w-16" />
              </div>
            </div>

            <USkeleton class="size-6 rounded-xl" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Data -->
    <template v-else-if="data?.length">
      <UCard v-for="item in data" :key="item.id" class="overflow-hidden  transition-all active:scale-[0.99] "
        :ui="{
          body: 'p-0'
        }">
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar size="lg" :src="item.photo || '/avatar-placeholder.svg'"
                :alt="`${item.givenNames} ${item.familyName}`"
                class="rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700" />

              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ item.givenNames }} {{ item.familyName }}
                </h3>

                <div class="mt-1 flex items-center gap-1 text-xs text-gray-500">
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
          <div class="min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Gender
            </p>

            <UBadge :label="parseGender[item.gender]" :color="parseGenderColor[item.gender]" size="sm" variant="soft" />
          </div>

          <div class="min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Date of Birth
            </p>

            <p class="truncate text-sm font-medium">
              {{ formatDate(item.dateOfBirth) }}
            </p>
          </div>

          <div class="min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Guardian
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.guardian?.givenNames }}
              {{ item.guardian?.familyName }}
            </p>
          </div>

          <div class="min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Class
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.className || 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar size="sm" icon="i-lucide-users" />

            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.family?.fatherName || 'No Father Name' }}
              </p>

              <p class="truncate text-xs text-gray-500">
                {{ item.family?.motherName || 'No Mother Name' }}
              </p>
            </div>
          </div>

          <UButton @click="view(item)" label="View" trailing-icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm"
            class="rounded-xl" />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

        <p class="text-sm text-gray-500 dark:text-gray-400">
          No students found.
        </p>
      </div>
    </template>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-3 md:hidden">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>
