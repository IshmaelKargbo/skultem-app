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
    accessorKey: 'gender',
    header: 'Gender'
  },
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'guardian.givenNames',
    header: 'Guardian',
    cell: ({ row }: any) => `${row.original.guardian.givenNames} ${row.original.guardian.familyName}`
  },
  {
    accessorKey: 'family.fatherName',
    header: 'Father'
  },
  {
    accessorKey: 'family.motherName',
    header: 'Mother'
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
      page: page.value
    }
  })

  fetchRecord()
}, { immediate: true })

onMounted(() => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }
})
</script>

<template>
  <UCard class=" hidden md:block" :ui="{
    body: 'sm:p-0'
  }">
    <div class="flex flex-col gap-3">
      <UTable :column-pinning="columnPinning" :columns="columns" :data="data" :loading="loading" class="w-full">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">No students found.</p>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
        </template>
        <template #gender-cell="{ row }">
          <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
            variant="outline" />
        </template>
        <template #name-cell="{ row }">
          <StudentIdentityCell :given-names="row.original.givenNames" :family-name="row.original.familyName"
            :photo="row.original.photo" :subtitle="row.original.className || 'No Class'" />
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
    </div>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
  <!-- Mobile -->
<div class="space-y-4 md:hidden">
  <!-- Loading -->
  <template v-if="loading">
    <UCard
      v-for="i in 4"
      :key="i"
    >
      <div class="space-y-3 p-4">
        <USkeleton class="h-12 w-full rounded-xl" />
        <USkeleton class="h-20 w-full rounded-2xl" />
        <USkeleton class="h-10 w-full rounded-xl" />
      </div>
    </UCard>
  </template>

  <!-- Records -->
  <template v-else-if="data?.length">
    <UCard
      v-for="item in data"
      :key="item.id"
      class="overflow-hidden"
      :ui="{ body: 'p-0' }"
    >
      <!-- Header -->
      <div class="border-b border-gray-100 p-4 dark:border-gray-800">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <UAvatar
              :src="item.photo"
              :alt="`${item.givenNames} ${item.familyName}`"
              size="lg"
            />

            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold">
                {{ item.givenNames }} {{ item.familyName }}
              </h3>

              <p class="text-xs text-gray-500">
                {{ item.className || 'No Class' }}
              </p>
            </div>
          </div>

          <UBadge
            v-if="item.feeDetail"
            :label="item.feeDetail.status"
            :color="parseFeeStatusColor[item.feeDetail.status]"
            variant="soft"
          />
        </div>
      </div>

      <!-- Amounts -->
      <div class="grid grid-cols-3 gap-3 p-4">
        <div class="rounded-2xl bg-error-50 p-3 dark:bg-error-950/20">
          <p class="text-[10px] uppercase text-gray-500">
            Total
          </p>

          <p class="mt-1 text-sm font-semibold text-error">
            {{ format(item.feeDetail?.total || 0) }}
          </p>
        </div>

        <div class="rounded-2xl bg-success-50 p-3 dark:bg-success-950/20">
          <p class="text-[10px] uppercase text-gray-500">
            Paid
          </p>

          <p class="mt-1 text-sm font-semibold text-success">
            {{ format(item.feeDetail?.paid || 0) }}
          </p>
        </div>

        <div class="rounded-2xl bg-info-50 p-3 dark:bg-info-950/20">
          <p class="text-[10px] uppercase text-gray-500">
            Balance
          </p>

          <p class="mt-1 text-sm font-semibold text-info">
            {{ format(item.feeDetail?.balance || 0) }}
          </p>
        </div>
      </div>

      <!-- Details -->
      <div class="space-y-3 px-4 pb-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            Gender
          </span>

          <UBadge
            :label="parseGender[item.gender]"
            :color="parseGenderColor[item.gender]"
            variant="soft"
            size="sm"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            Guardian
          </span>

          <span class="text-sm font-medium">
            {{ item.guardian?.givenNames }}
            {{ item.guardian?.familyName }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            Father
          </span>

          <span class="text-sm font-medium truncate">
            {{ item.family?.fatherName || 'N/A' }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            Mother
          </span>

          <span class="text-sm font-medium truncate">
            {{ item.family?.motherName || 'N/A' }}
          </span>
        </div>
      </div>
    </UCard>
  </template>

  <!-- Empty -->
  <template v-else>
    <div class="flex flex-col items-center py-12">
      <UIcon
        name="ph:books-light"
        class="text-4xl text-gray-400"
      />

      <p class="mt-3 text-sm text-gray-500">
        No students found.
      </p>
    </div>
  </template>

  <!-- Pagination -->
  <div class="flex items-center justify-between">
    <Showing :meta="meta" />

    <UPagination
      v-model:page="page"
      size="sm"
      :page-size="meta.size"
      :items-per-page="meta.size"
      :total="meta.total"
      show-edges
    />
  </div>
</div>
</template>