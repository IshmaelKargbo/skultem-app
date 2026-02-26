<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const { format } = useMoney()
const store = useFeeStructureStore()
const loading = ref(true)
const { records: data } = storeToRefs(store)

const editRcord = ref<Teacher | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const columns: TableColumn<Teacher> = [
  {
    accessorKey: 'clazz',
    header: 'Class',
    cell({ row }: any) {
      return (row.original as FeeStructure).clazz?.name || "All Clases"
    },
  },
  {
    accessorKey: 'term',
    header: 'Term',
    cell({ row }: any) {
      return (row.original as FeeStructure).term.name
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell({ row }: any) {
      return (row.original as FeeStructure).category.name
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell({ row }: any) {
      return format((row.original as FeeStructure).amount);
    },
  },
  {
    accessorKey: 'students',
    header: 'Students'
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date'
  },
  {
    accessorKey: 'allowInstallment',
    header: 'Installment'
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

function getRowItems(row: Row<Teacher>) {
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
  <UTable :columns="columns" :data="data" :loading="loading">
    <template #empty-state>
      <div class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        <p class="text-gray-500">No fee structures found.</p>
      </div>
    </template>
    <template #allowInstallment-cell="{ row }">
      <USwitch v-model="row.original.allowInstallment" />
    </template>
    <template #students-cell="{ row }">
      <FeeStructureCount :id="row.original.id">
        <template #default="{ value }">
          <div class="flex space-x-2">
            <UBadge variant="outline" trailing-icon="ph:student-light" :label="`${value} -`" />
          </div>
        </template>
      </FeeStructureCount>
    </template>
  </UTable>
</template>
