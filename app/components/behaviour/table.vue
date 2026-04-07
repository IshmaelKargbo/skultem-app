<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()

const { classId } = defineProps<{
  classId: string
}>()
const store = useBehaviourStore()
const { records: data, meta, loading } = storeToRefs(store)

const editRcord = ref<Behaviour | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns: TableColumn<Behaviour> = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'kind',
    header: 'Type',
    cell: ({ row }: any) => parseBehaviourKind[row.original.kind]
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'note',
    header: 'Note'
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

function getRowItems(row: Row<Behaviour>) {
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

async function fetchRecords() {
  if (classId == null) return
  loading.value = true
  await store.fetchAll(classId, page.value, size.value)
  loading.value = false
}

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecords()
}, { immediate: true })

watch(() => classId, () => fetchRecords(), { immediate: true })

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecords()
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No behaviour found.</p>
        </div>
      </template>
      <template #kind-cell="{ row }">
        <UBadge :label="parseBehaviourKind[row.original.kind]" :color="parseBehaviourKindColor[row.original.kind]"
          variant="outline" />
      </template>
    </UTable>
    <div class="md:hidden" v-for="row in data">
      <div class="p-3 flex justify-between items-center">
        <div class="flex space-x-2">
          <div>
            <UAvatar :alt="row.student" size="lg" />
          </div>
          <div>
            <p class="text-sm">{{ row.student }}</p>
            <p class="text-[11px] text-mute">{{ row.category }}</p>
          </div>
        </div>
        <div>
          <UBadge :color="parseBehaviourKindColor[row.kind]" variant="outline" :label="clean(row.kind)" />
        </div>
      </div>
      <div class="bg-gray-50 p-2 px-3 border-y border-gray-100">
        <p class="text-xs text-mute">{{ row.note }}</p>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
