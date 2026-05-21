<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useMaterialStore()
const { records: data, loading, meta } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'category.name',
    header: 'Category'
  },
  {
    accessorKey: 'inStock',
    header: 'In Stock'
  },
  {
    accessorKey: 'unit',
    header: 'Unit'
  },
  {
    accessorKey: 'lastRestockedAt',
    header: 'Last Restocked At'
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
        page: page.value
      }
    })
  }

  await store.fetchAll(page.value, size.value)
})
</script>

<template>
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No material found.</p>
        </div>
      </template>
      <template #unit-cell="{ row }">
        <p>{{ unitLabelMap[row.original.unit] }}</p>
      </template>
      <template #lastRestockedAt-cell="{ row }">
        <p>{{ formatDateTime(row.original.lastRestockedAt) }}</p>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
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
