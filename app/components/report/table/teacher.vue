<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { teachers: data, report, meta, loading } = storeToRefs(store)

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

const parseStatusIcon: Record<string, string> = {
  ACTIVE: 'i-lucide-check-circle',
  INACTIVE: 'i-lucide-x-circle',
  DELETED: 'i-lucide-trash'
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

function fetchReport() {
  if (report.value == null) return
  store.runReport(report.value, page.value, size.value)
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
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No teachers found.</p>
        </div>
      </template>
      <template #email-cell="{ row }">
        {{ row.original.user.email }}
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="parseStaus[row.original.status]" :color="parseStatusColor[row.original.status]"
          variant="outline" />
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
