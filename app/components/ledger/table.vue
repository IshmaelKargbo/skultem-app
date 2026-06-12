<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useLedgerStore()
const loading = ref(true)
const { format } = useMoney()
const { records: data, meta, total } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<Ledger> = [
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'clazz',
    header: 'Class'
  },
  {
    accessorKey: 'debit',
    header: 'Debit',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    },
  },
  {
    accessorKey: 'credit',
    header: 'Credit',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    },
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    },
    footer: () => {
      return format(total.value.finalBalance)
    }
  }
]

const parseType: Record<string, string> = {
  "FEE_ASSINMENT": "Fee Assignment",
  "DISCOUNT": "Discount",
  "PAYMENT": "Payment",
}

const parseTypeColor: Record<string, string> = {
  "FEE_ASSINMENT": "neutral",
  "DISCOUNT": "info",
  "PAYMENT": "success",
}

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
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })

  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecord()
}, { immediate: true })

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecord()
})
</script>

<template>
  <div class="space-y-4">
    <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading" :ui="{ tfoot: 'bg-app-50/10' }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No ledger record found.</p>
          </div>
        </template>
        <template #debit-cell="{ row }">
          <p class="text-error font-semibold">{{ row.original.debit ? format(row.original.debit || 0) : '-' }}</p>
        </template>
        <template #debit-footer>
          <p class="text-error font-semibold">{{ format(total.totalDebit || 0) }}</p>
        </template>
        <template #credit-cell="{ row }">
          <p class="text-success font-semibold">{{ row.original.credit ? format(row.original.credit || 0) : '-' }}</p>
        </template>
        <template #credit-footer>
          <p class="text-success font-semibold">{{ format(total.totalCredit || 0) }}</p>
        </template>
        <template #type-cell="{ row }">
          <UBadge variant="subtle" :color="parseTypeColor[row.original.type]" :label="parseType[row.original.type]" />
        </template>
        <template #balance-cell="{ row }">
          <p class="text-info font-semibold">{{ format(row.original.balance || 0) }}</p>
        </template>
        <template #balance-footer>
          <p class="text-info font-semibold">{{ format(total.finalBalance || 0) }}</p>
        </template>
        <template #date-footer>
          <p>Total</p>
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
    <div class="space-y-3 md:hidden">

      <!-- Empty -->
      <div v-if="!loading && !data?.length" class="flex flex-col items-center justify-center py-16">
        <div class="flex size-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon name="ph:books-light" class="text-4xl text-muted" />
        </div>

        <p class="mt-4 text-sm text-muted">
          No ledger records found
        </p>
      </div>

      <!-- Transactions -->
      <template v-else>

        <UCard v-for="item in data" :key="`${item.date}-${item.student}-${item.type}`"
          class="overflow-hidden rounded-3xl border border-default shadow-sm" :ui="{ body: 'p-0' }">
          <div class="p-4 space-y-4">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">

              <div class="min-w-0 flex-1">

                <div class="flex items-center gap-2">

                  <div class="flex size-10 items-center justify-center rounded-2xl" :class="{
                    'bg-success/10': item.credit,
                    'bg-error/10': item.debit
                  }">
                    <UIcon :name="item.credit
                      ? 'i-lucide-arrow-down-left'
                      : 'i-lucide-arrow-up-right'" :class="item.credit ? 'text-success' : 'text-error'" />
                  </div>

                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-highlighted">
                      {{ item.student || 'No Student' }}
                    </h3>

                    <p class="text-xs text-muted">
                      {{ item.clazz }}
                    </p>
                  </div>

                </div>

              </div>

              <UBadge size="sm" variant="soft" :label="parseType[item.type]" :color="parseTypeColor[item.type]" />
            </div>

            <!-- Amount -->
            <div class="rounded-2xl bg-muted p-4">

              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">
                  Transaction Amount
                </span>

                <p class="text-lg font-bold" :class="item.credit ? 'text-success' : 'text-error'">
                  {{
                    item.credit
                      ? format(item.credit)
                      : format(item.debit)
                  }}
                </p>
              </div>

            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3">

              <div class="rounded-2xl bg-muted p-3">
                <p class="text-[11px] text-muted">
                  Credit
                </p>

                <p class="mt-1 font-semibold text-success">
                  {{ item.credit ? format(item.credit) : '-' }}
                </p>
              </div>

              <div class="rounded-2xl bg-muted p-3">
                <p class="text-[11px] text-muted">
                  Debit
                </p>

                <p class="mt-1 font-semibold text-error">
                  {{ item.debit ? format(item.debit) : '-' }}
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between border-t border-default pt-3">

              <div>
                <p class="text-[11px] text-muted">
                  Running Balance
                </p>

                <p class="mt-1 text-sm font-semibold text-info">
                  {{ format(item.balance || 0) }}
                </p>
              </div>

              <div class="text-right">
                <p class="text-[11px] text-muted">
                  Date
                </p>

                <p class="mt-1 text-xs text-highlighted">
                  {{ item.date }}
                </p>
              </div>

            </div>

          </div>
        </UCard>

        <!-- Summary Card -->
        <UCard class="rounded-3xl border border-primary/20 bg-primary/5">
          <div class="space-y-4">

            <h3 class="font-semibold text-highlighted">
              Ledger Summary
            </h3>

            <div class="grid grid-cols-3 gap-3">

              <div>
                <p class="text-[11px] text-muted">
                  Debit
                </p>

                <p class="mt-1 font-bold text-error">
                  {{ format(total.totalDebit || 0) }}
                </p>
              </div>

              <div>
                <p class="text-[11px] text-muted">
                  Credit
                </p>

                <p class="mt-1 font-bold text-success">
                  {{ format(total.totalCredit || 0) }}
                </p>
              </div>

              <div>
                <p class="text-[11px] text-muted">
                  Balance
                </p>

                <p class="mt-1 font-bold text-info">
                  {{ format(total.finalBalance || 0) }}
                </p>
              </div>

            </div>

          </div>
        </UCard>

      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length" class="flex flex-col items-center gap-3 pt-2">
        <Showing :meta="meta" />

        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>

    </div>
  </div>
</template>
