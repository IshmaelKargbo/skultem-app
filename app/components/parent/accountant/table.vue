<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useParentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  { accessorKey: 'name', header: 'Guardian', pin: 'left' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'students', header: 'Children' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'paid', header: 'Paid' },
  { accessorKey: 'balance', header: 'Outstanding' },
  { accessorKey: 'status', header: 'Status' }
]

// PAGE (URL synced)
const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        page: val,
        size: size.value
      }
    })
  }
})

// SIZE (URL synced)
const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        page: page.value,
        size: val
      }
    })
  }
})

// FETCH whenever query changes
watch(
  () => [page.value, size.value],
  async () => {
    await fetchRecord()

    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })
  },
  { immediate: true }
)

async function fetchRecord() {
  loading.value = true
  try {
    await store.fetchAll(page.value, size.value)
  } finally {
    loading.value = false
  }
}

// Ensure initial query exists
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
  <UCard :ui="{ body: 'sm:p-0' }">
    <div class="flex flex-col gap-3">

      <UTable :columns="columns" :data="data" :loading="loading" class="w-full">
        <!-- Empty state -->
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No parents found.</p>
          </div>
        </template>

        <!-- Status -->
        <template #status-cell="{ row }">
          <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
        </template>

        <!-- Students -->
        <template #students-cell="{ row }">
          <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.students} - `"  />
        </template>

        <!-- Total -->
        <template #total-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-error">
            {{ format(row.original.feeDetail.total) }}
          </p>
        </template>

        <!-- Paid -->
        <template #paid-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-success">
            {{ format(row.original.feeDetail.paid) }}
          </p>
        </template>

        <!-- Balance -->
        <template #balance-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-info">
            {{ format(row.original.feeDetail.balance) }}
          </p>
        </template>
      </UTable>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />

        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>

  </UCard>
</template>