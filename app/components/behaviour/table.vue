<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const classSession = useClassSessionStore()
const store = useBehaviourStore()
const { records: data, meta, loading } = storeToRefs(store)

const reportRef = ref()

function refreshReport() {
    reportRef.value?.fetchRecord()
}

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

const classes = computed(() => classSession.records.map(e => ({ label: parseClassSession(e), value: e.clazzId })))

const state = reactive({
  clazz: ''
})

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

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecords()
}, { immediate: true })

watch(() => state.clazz, () => fetchRecords(), { immediate: true })

async function fetchRecords() {
  loading.value = true
  await store.fetchAll(state.clazz, page.value, size.value)
  loading.value = false
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

  classSession.fetchAll(0, 0)
  fetchRecords()
})
</script>

<template>
  <div class="p-5 space-y-5">
    <BehaviourReport ref="reportRef" :clazz="state.clazz" />
    <UCard>
      <div class="flex justify-between items-center pb-3 border-b border-gray-300">
        <div>
          <p class="text-xl font-semibold">Behaviour Notes</p>
        </div>
        <div class="flex space-x-3 w-1/3">
          <USelectMenu :items="classes" placeholder="Select class" value-key="value" v-model="state.clazz" />
          <BehaviourAdd @refresh="refreshReport" :clazz="state.clazz" />
        </div>
      </div>
      <UTable :columns="columns" :data="data" :loading="loading">
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
      <div v-if="!loading" class="flex justify-between border-t border-gray-200 pt-3 items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </UCard>
  </div>
</template>
