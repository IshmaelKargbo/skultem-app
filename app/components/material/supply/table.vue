<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useMaterialStore()
const { supplies: data, loading, meta } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'student',
    header: 'Name'
  },
  {
    accessorKey: 'material',
    header: 'Material'
  },
  {
    accessorKey: 'qty',
    header: 'Qty'
  },
  {
    accessorKey: 'collectedQty',
    header: 'Collected'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'collectedOn',
    header: 'Date'
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

  await store.fetchAllSupply(page.value, size.value)
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
          <p class="text-gray-500">No supply found.</p>
        </div>
      </template>
      <template #student-cell="{row}">
        <div class="flex space-x-3 items-center">
          <UAvatar size="lg" :src="row.original.student.photo" />
            <div class="space-y-0.5">
              <p><span>{{ row.original.student.givenNames }}</span><span>{{ row.original.student.familyName }}</span></p>
              <p class="text-xs text-muted">{{ row.original.student.admissionNumber }}</p>
            </div>
        </div>
      </template>
      <template #material-cell="{row}">
        <div class="space-y-0.5">
          <p>{{ row.original.material.name }}</p>
          <p class="text-xs text-muted">{{ row.original.material.category.name }}</p>
        </div>
      </template>
      <template #status-cell="{row}">
        <p>{{ clean(row.original.status) }}</p>
      </template>
      <template #collectedOn-cell="{row}">
        <p>{{ row.original.collectedOn ? formatDateTime(row.original.collectedOn) : '-'}}</p>
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
