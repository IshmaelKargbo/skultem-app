<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useSubjectGroupStore()
const { records: data, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const editRcord = ref<SubjectGroup | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'streamName',
    header: 'Stream'
  },
  {
    accessorKey: 'totalSelection',
    header: 'Select'
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

function getRowItems(row: Row<SubjectGroup>) {
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

onMounted(async () => {
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
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No sections found.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #totalSelection-cell="{ row }">
          <UBadge :label="row.original.totalSelection" variant="outline" icon="mdi:select-multiple" color="neutral" />
        </template>
      </UTable>
      <template #footer>
        <div v-if="!loading" class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
    <div class="space-y-3 md:hidden">
      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 5" :key="i" class="rounded-2xl border border-gray-200 dark:border-gray-800"
          :ui="{ body: 'p-4' }">
          <div class="space-y-3">
            <USkeleton class="h-4 w-36" />
            <USkeleton class="h-3 w-24" />
            <USkeleton class="h-8 w-full rounded-xl" />
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800"
          :ui="{ body: 'p-0' }">
          <div class="p-4 space-y-4">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ item.name }}
                </h3>

                <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <UIcon name="i-lucide-school" class="size-3.5" />
                  <span>{{ item.className || 'No class' }}</span>
                </div>
              </div>

              <UDropdownMenu :items="getRowItems({ original: item } as any)" :content="{ align: 'end' }">
                <UButton icon="i-lucide-more-vertical" color="neutral" variant="ghost" size="sm" class="rounded-full" />
              </UDropdownMenu>
            </div>

            <!-- Stream + Selection -->
            <div class="grid grid-cols-2 gap-3">

              <div class="rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-900">
                <p class="text-[11px] text-gray-500">
                  Stream
                </p>

                <p class="mt-1 text-sm font-medium">
                  {{ item.streamName || 'None' }}
                </p>
              </div>

              <div class="rounded-xl bg-primary-50 px-3 py-3 dark:bg-primary-950/30">
                <p class="text-[11px] text-gray-500">
                  Selections
                </p>

                <div class="mt-1">
                  <UBadge color="primary" variant="soft" :label="item.totalSelection || 0" icon="mdi:select-multiple" />
                </div>
              </div>

            </div>

          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="flex flex-col items-center justify-center py-14">
          <div class="flex flex-col items-center py-16">
            <UIcon name="ph:books-light" class="mb-3 text-5xl text-gray-300" />

            <h3 class="text-sm font-medium">
              No subject groups found
            </h3>

            <p class="mt-1 text-xs text-gray-500">
              Subject groups will appear here.
            </p>
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length" class="flex flex-col items-center justify-center mt-5 space-y-3 md:hidden">
        <Showing :meta="meta" />

        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
