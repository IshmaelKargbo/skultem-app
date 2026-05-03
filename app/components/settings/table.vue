<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useAcademicYearStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<AcademicYear | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const parseStaus: Record<string, string> = {
  OPENED: 'Opened',
  LOCKED: 'Closed',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
  OPENED: 'success',
  LOCKED: 'warning',
  DELETED: 'danger'
}

const parseStatusIcon: Record<string, string> = {
  OPENED: 'i-lucide-lock-open',
  LOCKED: 'i-lucide-lock',
  DELETED: 'i-lucide-x'
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }: any) => formatDate(row.original.startDate)
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }: any) => formatDate(row.original.endDate)
  },
  {
    accessorKey: 'active',
    header: 'Active',
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
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

function getRowItems(row: Row<AcademicYear>) {
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
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No academic years found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #active-cell="{ row }">
        <UBadge :label="row.original.active ? 'Yes' : 'No'" variant="outline" />
      </template>
      <template #status-cell="{ row }">
        <UBadge variant="subtle" :color="parseStatusColor[row.original.status]">
          <UIcon :name="parseStatusIcon[row.original.status]" class="mr-1" />
          {{ parseStaus[row.original.status] }}
        </UBadge>
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
