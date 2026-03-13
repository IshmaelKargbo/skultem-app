<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const { format } = useMoney()
const store = useFeeDiscountStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<FeeDiscount | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const parseKind: Record<string, string> = {
  "PERCENTAGE": "Percentage",
  "AMOUNT": "Fix Amount"
}

const columns: TableColumn<FeeDiscount> = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: any) => parseKind[row.original.type]
  },
  {
    accessorKey: 'value',
    header: 'Value'
  },
  {
    accessorKey: 'applied',
    header: 'Applied'
  },
  {
    accessorKey: 'expires',
    header: 'Expiry Date'
  },
  {
    accessorKey: 'totalSaved',
    header: 'Total Saved',
    cell: ({ row }: any) => format(row.original.totalSaved)
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }: any) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },
          size: 'sm',
          items: getRowItems(row),
          'aria-label': 'Actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            size: 'sm',
            variant: 'ghost',
            'aria-label': 'Actions dropdown'
          })
      )
    }
  }
]

function getRowItems(row: Row<FeeDiscount>) {
  return [
    {
      label: 'Edit Record',
      icon: 'i-lucide-edit',
      onClick: () => {
        editState.value = true;
        editRcord.value = row.original;
      }
    },
    {
      label: 'Delete Record',
      icon: 'i-lucide-trash',
    }
  ]
}

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
  <UCard>
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No fee discounts found.</p>
        </div>
      </template>
      <template #name-cell="{ row }">
        <div class="space-y-0.5">
          <p class="font-semibold text-gray-700">{{ row.original.name }}</p>
          <p class="text-xs text-mute">{{ row.original.reason || 'Fetch' }}</p>
        </div>
      </template>
      <template #student-cell="{ row }">
        <div class="space-y-0.5">
          <p class="font-semibold text-gray-700">{{ row.original.student }}</p>
          <p class="text-xs text-mute">{{ row.original.clazz }}</p>
        </div>
      </template>
      <template #type-cell="{ row }">
        <UBadge color="neutral" :label="parseKind[row.original.type]" variant="subtle" />
      </template>
      <template #totalSaved-cell="{ row }">
        <p class="text-success font-semibold">{{ row.original.totalSaved }}</p>
      </template>
    </UTable>
    <div class="flex justify-between border-t border-gray-200 pt-3 items-center">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </UCard>
</template>
