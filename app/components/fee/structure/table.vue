<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const { format } = useMoney()
const store = useFeeStructureStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<Teacher | null>(null)
const editState = ref(false)

const columns = [
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell({ row }: any) {
      return format((row.original as FeeStructure).amount);
    },
  },
  {
    accessorKey: 'students',
    header: 'Students'
  },
  {
    accessorKey: 'hasSupply',
    header: 'Supply'
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date'
  },
  {
    accessorKey: 'allowInstallment',
    header: 'Installment'
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

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? 6),
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

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
})
</script>

<template>
  <UCard :ui="{
    body: 'sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No fee structures found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #allowInstallment-cell="{ row }">
        <UBadge variant="outline" :label="row.original.allowInstallment ? 'Yes' : 'No'"
          :color="row.original.allowInstallment ? 'success' : 'neutral'" />
      </template>
      <template #type-cell="{ row }">
        <div class="space-y-1">
          <p>{{ clean(row.original.type) }}</p>
          <p class="text-xs text-muted">{{ row.original.clazz?.name || '-' }}</p>
        </div>
      </template>
      <template #category-cell="{ row }">
        <div class="space-y-1">
          <p>{{ clean(row.original.category.name) }}</p>
          <p class="text-xs text-muted">{{ row.original.term.name || '-' }}</p>
        </div>
      </template>
      <template #hasSupply-cell="{ row }">
        <div class="space-y-1">
          <p><span>{{ row.original.material?.name }}</span><span>({{ row.original.totalSupply || '0' }})</span></p>
        </div>
      </template>
      <template #students-cell="{ row }">
        <FeeStructureCount :id="row.original.id">
          <template #default="{ value }">
            <div class="flex space-x-2">
              <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${value} -`" />
            </div>
          </template>
        </FeeStructureCount>
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
</template>
