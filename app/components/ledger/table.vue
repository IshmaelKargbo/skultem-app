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
  <UCard>
    <UTable :columns="columns" :data="data" :loading="loading" :ui="{
      tfoot: 'bg-app-50/10'
    }">
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
    <div v-if="data.length > 0" class="flex justify-between border-t border-gray-200 pt-3 items-center">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </UCard>
</template>
