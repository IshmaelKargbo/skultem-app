<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const columns: TableColumn<Student>[] = [
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
    <UCard>
      <div class="flex flex-col gap-3">
        <UTable :column-pinning="columnPinning" :columns="columns" :data="data" :loading="loading" class="w-full">
          <template #empty-state>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
              <p class="text-gray-500">No students found.</p>
            </div>
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
        <div class="flex justify-between items-center border-t border-gray-200 pt-3">
          <Showing :meta="meta" />
          <UPagination
            size="sm"
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
          />
        </div>
      </div>
    </UCard>
</template>