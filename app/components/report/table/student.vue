<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { students: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const parseStaus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DELETED: 'error'
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => {
      return `${row.original.givenNames} ${row.original.familyName}`
    }
  },
  // {
  //   accessorKey: 'dateOfBirth',
  //   header: 'Date of Birth'
  // },
  {
    accessorKey: 'age',
    header: 'Age',
    cell: ({ row }: any) => `${row.original.age} Years`
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
    accessorKey: 'guardian',
    header: 'Guardian',
    cell: ({ row }: any) => `${row.original.guardian.givenNames} ${row.original.guardian.familyName}`
  },
  {
    accessorKey: 'guardian',
    header: 'Guardian Phone',
    cell: ({ row }: any) => row.original.guardian.phone
  },
  // {
  //   accessorKey: 'guardian',
  //   header: 'Guardian Email',
  //   cell: ({ row }: any) => row.original.guardian.email
  // },
  // {
  //   accessorKey: 'guardian',
  //   header: 'Father',
  //   cell: ({ row }: any) => row.original.family.fatherName
  // },
  // {
  //   accessorKey: 'guardian',
  //   header: 'Mother',
  //   cell: ({ row }: any) => row.original.family.motherName
  // },
  // {
  //   accessorKey: 'nationality',
  //   header: 'Nationality',
  //   cell: ({ row }: any) => clean(row.original.nationality)
  // },
  // {
  //   accessorKey: 'religion',
  //   header: 'Religion',
  //   cell: ({ row }: any) => clean(row.original.religion)
  // },
  {
    accessorKey: 'city',
    header: 'City'
  },
  {
    accessorKey: 'street',
    header: 'Street'
  },
  {
    accessorKey: 'status',
    header: 'Status'
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

function fetchReport() {
  if (report.value == null) return
  store.runReport(report.value, page.value, size.value)
}

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

watch(() => page.value, async () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      ...route.query,
      page: page.value
    }
  })

  await fetchReport()
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-end">
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading" :ui="{
        thead: 'bg-neutral-50/80 dark:bg-neutral-900/80',
        th: 'py-3 text-[11px] font-semibold uppercase tracking-wide text-muted',
        td: 'py-3 align-top',
        tr: 'hover:bg-primary-50/60 dark:hover:bg-primary-500/10 transition-colors'
      }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">No students found.</p>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge :label="parseStaus[row.original.status]" :color="parseStatusColor[row.original.status]" variant="soft" />
        </template>
        <template #gender-cell="{ row }">
          <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]" variant="soft" />
        </template>
        <template #name-cell="{ row }">
          <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
            :photo="row.original.photo"
            :subtitle="`${row.original.className || 'No Class'} · ${row.original.admissionNumber || 'No Admission No'}`" />
        </template>
        <template #dateOfBirth-cell="{ row }">
          <p class="text-sm text-highlighted">{{ formatDateString(row.original.dateOfBirth) }}</p>
        </template>
        <template #age-cell="{ row }">
          <UBadge color="neutral" variant="outline" :label="`${row.original.age} Years`" />
        </template>
      </UTable>

      <div class="p-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-0' }">
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
            <div class="border-t border-default p-4">
              <USkeleton class="h-3 w-40 rounded-md" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
          :ui="{ body: 'p-0' }">
          <!-- Header -->
          <div class="border-b border-default p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="2xl" :src="item.photo || '/avatar-placeholder.svg'"
                  :alt="`${item.givenNames} ${item.familyName}`" loading="lazy" />

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ item.givenNames }} {{ item.familyName }}
                  </h3>

                  <div class="mt-1 flex items-center gap-1 text-xs text-muted">
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

            <!-- Age -->
            <div
              class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <UIcon name="i-lucide-calendar-days" class="size-4 text-amber-600 dark:text-amber-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Age
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.age != null ? `${item.age} Years` : 'N/A' }}
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
                {{ item.guardian?.givenNames }} {{ item.guardian?.familyName }}
              </p>
            </div>

            <!-- Guardian Phone -->
            <div
              class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-phone" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Guardian Phone
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.guardian?.phone || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 border-t border-default p-4 text-xs text-muted">
            <span>Address</span>
            <span class="truncate font-medium text-highlighted">
              {{ [item.street, item.city].filter(Boolean).join(', ') || 'N/A' }}
            </span>
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
        <div class="flex items-center justify-between gap-3">
          <Showing :meta="meta" />
          <div class="overflow-x-auto pb-1">
            <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size" :total="meta?.total"
              show-edges />
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
