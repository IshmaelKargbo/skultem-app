<script setup lang="ts">

const route = useRoute()
const router = useRouter()
const { format } = useMoney()
const store = useExpenseStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }: any) => formatDateString(row.original.createdAt)
  },
  {
    accessorKey: 'title',
    header: 'Name'
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: any) => format(row.original.amount)
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
          <p class="text-gray-500">No fee discounts found.</p>
        </div>
      </template>
      <template #amount-cell="{ row }">
        <p class="font-semibold text-error">- {{ format(row.original.amount || 0) }}</p>
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
