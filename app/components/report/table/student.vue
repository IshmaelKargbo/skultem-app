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
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of Birth'
  },
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
  {
    accessorKey: 'guardian',
    header: 'Guardian Email',
    cell: ({ row }: any) => row.original.guardian.email
  },
  {
    accessorKey: 'guardian',
    header: 'Father',
    cell: ({ row }: any) => row.original.guardian.fatherName
  },
  {
    accessorKey: 'guardian',
    header: 'Mother',
    cell: ({ row }: any) => row.original.guardian.motherName
  },
  {
    accessorKey: 'nationality',
    header: 'Nationality',
    cell: ({ row }: any) => clean(row.original.nationality)
  },
  {
    accessorKey: 'religion',
    header: 'Religion',
    cell: ({ row }: any) => clean(row.original.religion)
  },
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
  <UCard :ui="{
    body: 'sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
          <p class="text-gray-500 dark:text-gray-400">No students found.</p>
        </div>
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="parseStaus[row.original.status]" :color="parseStatusColor[row.original.status]"
          variant="outline" />
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
      <template #name-cell="{ row }">
        <StudentIdentityCell
          :given-names="row.original.givenNames"
          :family-name="row.original.familyName"
          :photo="row.original.photo"
          :subtitle="`${row.original.className || 'No Class'} · ${row.original.admissionNumber || 'No Admission No'}`"
        />
      </template>
    </UTable>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size"
          :total="meta?.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
