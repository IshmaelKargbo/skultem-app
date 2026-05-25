<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useBehaviourCategoryStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)
const editRcord = ref<Holiday | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')
const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'description',
    header: 'Description'
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

function getRowItems(row: Row<Holiday>) {
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
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }" class="hidden md:block">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No behaviour found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
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

  <!-- Mobile -->
  <div class="md:hidden bg-gray-50 dark:bg-neutral-950 min-h-[300px]">
    <!-- Loading -->
    <div v-if="loading" class="space-y-3 p-4">
      <div v-for="i in 5" :key="i"
        class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div class="flex items-start gap-3">
          <USkeleton class="h-12 w-12 rounded-2xl" />

          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.length" class="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
      </div>

      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        No behaviour found
      </h3>

      <p class="mt-1 max-w-xs text-sm text-gray-500">
        Behaviour categories will appear here once created.
      </p>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-3 p-3">
      <UCard v-for="item in data" :key="item.id"
        class="overflow-hidden rounded-3xl border border-gray-200 shadow-sm transition-all active:scale-[0.99] dark:border-neutral-800"
        :ui="{
          body: 'p-4'
        }">
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/20">
            <UIcon name="hugeicons:task-daily-01" class="text-lg text-primary-600" />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <!-- Header -->
            <div class="flex items-center gap-2">
              <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {{ item.name }}
              </h3>

              <div class="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <!-- Description -->
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {{
                item.description ||
                'No description available.'
              }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>

</template>
