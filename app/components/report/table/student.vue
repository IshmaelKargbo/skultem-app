<script setup lang="ts">
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
    <UCard class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading" :ui="{
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

    <div class="space-y-3 md:hidden">
      <UCard v-for="item in data" :key="item.id" class="rounded-2xl" :ui="{ body: 'p-4' }">
        <div class="space-y-2">
          <p class="font-semibold text-sm">{{ item.givenNames }} {{ item.familyName }}</p>
          <p class="text-xs text-muted">{{ item.className || 'No Class' }} · {{ item.admissionNumber || 'No Admission No' }}</p>
          <div class="flex gap-2">
            <UBadge :label="parseGender[item.gender]" :color="parseGenderColor[item.gender]" variant="outline" size="sm" />
            <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" variant="outline" size="sm" />
          </div>
          <p class="text-xs">{{ item.guardian?.phone || 'No guardian phone' }}</p>
        </div>
      </UCard>

      <div v-if="!loading && !data?.length" class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-gray-500 dark:text-gray-400">No students found.</p>
      </div>

      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size" :total="meta?.total" show-edges />
      </div>
    </div>
  </div>
</template>
