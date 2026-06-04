<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => `${row.original.givenNames} ${row.original.familyName}`
  },
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'total',
    header: 'Total'
  },
  {
    accessorKey: 'paid',
    header: 'Paid'
  },
  {
    accessorKey: 'balance',
    header: 'Outstanding'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

const columnPinning = ref({
  left: ['name'],
  right: ['status']
})

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
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
}

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecord()
}, { immediate: true })

onMounted(() => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }
})
</script>

<template>
  <div class="space-y-4">
    <UCard class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable
        :column-pinning="columnPinning"
        :columns="columns"
        :data="data"
        :loading="loading"
        class="w-full"
      >
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No students found.</p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #status-cell="{ row }">
          <UBadge
            v-if="row.original.feeDetail"
            :label="row.original.feeDetail.status"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]"
            variant="outline"
          />
        </template>

        <template #gender-cell="{ row }">
          <UBadge
            :label="parseGender[row.original.gender]"
            :color="parseGenderColor[row.original.gender]"
            variant="outline"
          />
        </template>

        <template #total-cell="{ row }">
          <p class="text-error">{{ format(row.original.feeDetail?.total) }}</p>
        </template>

        <template #paid-cell="{ row }">
          <p class="text-success">{{ format(row.original.feeDetail?.paid) }}</p>
        </template>

        <template #balance-cell="{ row }">
          <p class="text-info">{{ format(row.original.feeDetail?.balance) }}</p>
        </template>
      </UTable>

      <template #footer>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Showing :meta="meta" />
          <UPagination
            size="sm"
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
            class="justify-center lg:justify-end"
          />
        </div>
      </template>
    </UCard>

    <div class="space-y-3 md:hidden">
      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800"
        :ui="{ body: 'p-4 sm:p-5' }"
      >
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {{ item.givenNames }} {{ item.familyName }}
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ item.className || 'No Class' }}
              </p>
            </div>

            <UBadge
              v-if="item.feeDetail"
              :label="item.feeDetail.status"
              :color="parseFeeStatusColor[item.feeDetail.status]"
              :icon="parseFeeStatusIcon[item.feeDetail.status]"
              variant="outline"
              size="sm"
              class="shrink-0"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</p>
              <p class="mt-2 truncate text-sm font-semibold text-error">
                {{ format(item.feeDetail?.total) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Paid</p>
              <p class="mt-2 truncate text-sm font-semibold text-success">
                {{ format(item.feeDetail?.paid) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Outstanding</p>
              <p class="mt-2 truncate text-sm font-semibold text-info">
                {{ format(item.feeDetail?.balance) }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Gender</p>
              <UBadge
                class="mt-2 w-fit"
                :label="parseGender[item.gender]"
                :color="parseGenderColor[item.gender]"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </UCard>

      <div v-if="!loading && !data?.length" class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-gray-500 dark:text-gray-400">No students found.</p>
      </div>

      <UCard :ui="{ body: 'p-4 sm:p-5' }">
        <div class="space-y-3">
          <Showing :meta="meta" />
          <UPagination
            size="sm"
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
            class="justify-center"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
