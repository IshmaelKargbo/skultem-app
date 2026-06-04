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
  <div class="space-y-4">
    <UCard class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading" class="w-full">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No parents found.</p>
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

        <template #students-cell="{ row }">
          <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.students}`" />
        </template>

        <template #total-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-error">
            {{ format(row.original.feeDetail.total) }}
          </p>
        </template>

        <template #paid-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-success">
            {{ format(row.original.feeDetail.paid) }}
          </p>
        </template>

        <template #balance-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-info">
            {{ format(row.original.feeDetail.balance) }}
          </p>
        </template>
      </UTable>

      <template #footer>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Showing :meta="meta" />
          <UPagination
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            size="sm"
            show-edges
            class="justify-center lg:justify-end"
          />
        </div>
      </template>
    </UCard>

    <div class="md:hidden space-y-3">
      <template v-if="loading">
        <div
          v-for="i in 5"
          :key="i"
          class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="space-y-4 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-48" />
                <USkeleton class="h-3 w-24" />
              </div>
              <USkeleton class="h-6 w-16 rounded-full" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-18 rounded-2xl" />
              <USkeleton class="h-18 rounded-2xl" />
              <USkeleton class="h-18 rounded-2xl" />
              <USkeleton class="h-18 rounded-2xl" />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="data?.length">
        <UCard
          v-for="parent in data"
          :key="parent.id"
          class="overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800"
          :ui="{ body: 'p-4 sm:p-5' }"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-start gap-3">
                  <UAvatar :alt="parent.name" size="sm" />

                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {{ parent.name }}
                    </h3>
                    <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ parent.email }}
                    </p>
                    <div class="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <UIcon name="i-lucide-phone" class="size-3.5" />
                      <span class="truncate">{{ parent.phone }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <UBadge
                v-if="parent.feeDetail"
                :label="parent.feeDetail.status"
                :color="parseFeeStatusColor[parent.feeDetail.status]"
                :icon="parseFeeStatusIcon[parent.feeDetail.status]"
                variant="outline"
                size="sm"
                class="shrink-0"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <div class="flex items-center justify-between">
                  <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Children</p>
                  <UIcon :name="STUDENT_ICON" class="size-3.5 text-primary" />
                </div>
                <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {{ parent.students }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Outstanding</p>
                <p class="mt-2 truncate text-sm font-semibold text-info">
                  {{ parent.feeDetail ? format(parent.feeDetail.balance) : '-' }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</p>
                <p class="mt-2 truncate text-sm font-semibold text-error">
                  {{ parent.feeDetail ? format(parent.feeDetail.total) : '-' }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Paid</p>
                <p class="mt-2 truncate text-sm font-semibold text-success">
                  {{ parent.feeDetail ? format(parent.feeDetail.paid) : '-' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <template v-else>
        <div class="flex flex-col items-center gap-2 px-4 py-12">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
          <p class="text-gray-500 dark:text-gray-400">No parents found.</p>
        </div>
      </template>

      <UCard :ui="{ body: 'p-4 sm:p-5' }">
        <div class="space-y-3">
          <Showing :meta="meta" />
          <UPagination
            v-model:page="page"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            size="xs"
            show-edges
            class="justify-center"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
