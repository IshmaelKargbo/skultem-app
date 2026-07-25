<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { transactions: data, meta, loading, report } = storeToRefs(store)
const { format } = useMoney()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value
    }
  })

  fetchRecord()
}, { immediate: true })

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page
  ) {
    return
  }

  router.replace({ query: merged })
}

async function fetchRecord() {
  if (report.value == null) return
  loading.value = true
  await store.runReport(report.value, page.value, size.value)
  loading.value = false
}

const equalSelectOperators = (options: Option[] = []): ReportOperator[] => [
  { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
  { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options }
]

const instantOperators: ReportOperator[] = [
  { name: "Equals (=)", operator: "EQUALS", type: "instant", input: "date" },
  { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "instant", input: "date" },
  { name: "After (>)", operator: "GREATER_THAN", type: "instant", input: "date" },
  { name: "Before (<)", operator: "LESS_THAN", type: "instant", input: "date" },
  { name: "Between (↔)", operator: "BETWEEN", type: "instant", input: "date-range" },
]

const selected = ref<ReportSelectPayload>({
  entity: "transactions",
  filters: [
    { field: "createdAt", label: "Date", operators: instantOperators },
    { field: "direction", label: "Direction", operators: equalSelectOperators(directionOptions) },
    { field: "type", label: "Type", operators: equalSelectOperators(typeOptions) },
    { field: "referenceType", label: "Reference", operators: equalSelectOperators(referenceTypeOptions) }
  ]
})

onMounted(async () => {
  if (!route.query.page) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading -->
    <template v-if="loading">
      <UCard :ui="{
        body: 'sm:p-0 p-0'
      }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-24" />
            </div>

            <USkeleton class="h-7 w-20 rounded-full" />
          </div>
        </template>
        <div v-for="i in size" :key="i" class="border-b px-4 py-3 border-gray-200 last:border-0">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>

              <div class="space-y-2">
                <div class="flex justify-end">
                  <USkeleton class="h-6 w-32 rounded-full" />
                </div>
                <div class="space-x-2 flex">
                  <USkeleton class="h-3 w-14" />
                  <USkeleton class="h-3 w-14" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Records -->
    <template v-else-if="data?.length">
      <UCard :ui="{
        body: 'sm:p-0 p-0'
      }">
        <template #header>
          <p>Transactions</p>
          <p class="text-xs text-muted">Complete financial transaction history</p>
        </template>
        <div>
          <div v-for="item in data" :key="`${item.createdAt}-${item.referenceType}-${item.amount}`"
            class="overflow-hidden border-b border-gray-200 last:border-0">
            <div class="px-4 py-3">
              <div class="flex items-center justify-between">
                <div class="flex gap-3">
                  <div class="min-w-0  space-y-1">
                    <h3 class="truncate text-sm font-semibold">
                      {{ clean(item.type) }}
                    </h3>
                    <div class="flex space-x-2 items-center text-xs text-muted">
                      <p>
                        {{ clean(item.referenceType) }}
                      </p>
                      <p>·</p>
                      <p>
                        {{ formatDate(item.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="space-y-1">
                  <p class="text-sm font-bold text-info text-right">
                    {{ format(item.balance) }}
                  </p>
                  <div class="flex space-x-2">
                    <p class="text-sm font-bold" :class="item.direction === 'CREDIT'
                      ? 'text-success'
                      : 'text-error'">
                      {{ format(item.amount) }}
                    </p>
                    <UBadge size="sm" variant="soft" :icon="item.direction === 'CREDIT'
                      ? CREDIT_ICON
                      : DEBIT_ICON" :color="item.direction === 'CREDIT'
                          ? 'success'
                          : 'error'" :label="clean(item.direction)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex flex-col items-center gap-3">
            <Showing :meta="meta" />
            <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
              :total="meta.total" show-edges />
          </div>
        </template>
      </UCard>

    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center py-16">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon name="i-lucide-receipt" class="size-10 text-muted" />
        </div>

        <h3 class="mt-4 text-sm font-semibold">
          No transactions found
        </h3>

        <p class="mt-1 text-sm text-muted">
          Transaction records will appear here.
        </p>
      </div>
    </template>
  </div>
</template>
