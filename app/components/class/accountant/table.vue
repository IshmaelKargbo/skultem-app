<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useClassSessionStore()
const { records: data, meta, loading } = storeToRefs(store)
const { format } = useMoney()

const columns: TableColumn<ClassSession> = [
  {
    accessorKey: 'clazz',
    header: 'Name'
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'classLevel',
    header: 'Level'
  },
  {
    accessorKey: 'sectionName',
    header: 'Section'
  },
  {
    accessorKey: 'streamName',
    header: 'Stream'
  },
  {
    accessorKey: 'totalStudent',
    header: 'Students'
  },
  {
    accessorKey: 'teacherName',
    header: 'Class Teacher'
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

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecords()
}, { immediate: true })

async function fetchRecords() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
}

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecords()
})
</script>

<template>
  <UCard>
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No classes found.</p>
        </div>
      </template>
      <template #classLevel-cell="{ row }">
        <p>{{ parseLevel[row.original.classLevel] }}</p>
      </template>
      <template #totalStudent-cell="{ row }">
        <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.totalStudent} -`" />
      </template>
      <template #status-cell="{ row }">
        <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status"
          :color="parseFeeStatusColor[row.original.feeDetail.status]"
          :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
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
    <div v-if="!loading" class="flex justify-between border-t border-gray-200 pt-3 items-center">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </UCard>
</template>
