<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()

const store = useExpenseStore()

const loading = ref(true)

const { categories: data, meta } = storeToRefs(store)

const editRcord = ref<FeeCategory | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

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
            variant: 'ghost'
          })
      )
    }
  }
]

function getRowItems(row: Row<FeeCategory>) {
  return [
    {
      label: 'Edit Record',
      icon: 'i-lucide-edit',
      onClick: () => {
        editState.value = true
        editRcord.value = row.original
      }
    },
    {
      label: 'Delete Record',
      icon: 'i-lucide-trash'
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
  const merged = {
    ...route.query,
    ...newQuery
  }

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
  await store.fetchAllCategories(page.value, size.value)
  loading.value = false
}

watch(
  () => [page.value],
  () => {
    fetchRecord()
  }
)

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }

  fetchRecord()
})
</script>

<template>
  <!-- Desktop -->
  <UCard
    class="hidden md:block"
    :ui="{
      body: 'p-0 sm:p-0'
    }"
  >
    <UTable
      :columns="columns"
      :data="data"
      :loading="loading"
    >
      <template #empty-state>
        <div class="flex flex-col items-center gap-3 py-12">
          <div
            class="flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800"
          >
            <UIcon
              name="i-lucide-wallet-cards"
              class="text-2xl text-gray-400"
            />
          </div>

          <div class="text-center">
            <p class="font-medium text-gray-900 dark:text-white">
              No expense categories found
            </p>

            <p class="text-sm text-gray-500">
              Categories will appear here once created.
            </p>
          </div>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary-500/10"
          >
            <UIcon
              name="i-lucide-folder"
              class="size-5"
            />
          </div>

          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ row.original.name }}
            </p>
          </div>
        </div>
      </template>

      <template #description-cell="{ row }">
        <p class="max-w-xs truncate text-sm text-gray-500">
          {{ row.original.description || 'No description provided' }}
        </p>
      </template>
    </UTable>

    <template #footer>
      <div class="flex items-center justify-between">
        <Showing :meta="meta" />

        <UPagination
          v-model:page="page"
          size="sm"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />
      </div>
    </template>
  </UCard>

  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard
        v-for="i in 4"
        :key="i"
        class="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900"
      >
        <div class="space-y-4 p-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-28" />
                <USkeleton class="h-2 w-40" />
              </div>
            </div>

            <USkeleton class="size-8 rounded-xl" />
          </div>

          <USkeleton class="h-16 rounded-2xl" />
        </div>
      </UCard>
    </template>

    <!-- Data -->
    <template v-else-if="data?.length">
      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all active:scale-[0.99] dark:border-gray-800 dark:bg-neutral-900"
        :ui="{
          body: 'p-0'
        }"
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between border-b border-gray-100 p-4 dark:border-gray-800"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary-500/10"
            >
              <UIcon
                name="i-lucide-folder"
                class="size-5"
              />
            </div>

            <div class="min-w-0">
              <h3
                class="truncate text-sm font-semibold text-gray-900 dark:text-white"
              >
                {{ item.name }}
              </h3>

              <p class="text-xs text-gray-500">
                Expense Category
              </p>
            </div>
          </div>

          <UDropdownMenu
            :items="getRowItems({ original: item } as any)"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="sm"
              class="rounded-xl"
            />
          </UDropdownMenu>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="rounded-2xl bg-gray-50 p-4 dark:bg-neutral-800">
            <p
              class="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-500"
            >
              Description
            </p>

            <p class="text-sm leading-6 text-gray-700 dark:text-gray-300">
              {{ item.description || 'No description provided.' }}
            </p>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <div
          class="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-neutral-800"
        >
          <UIcon
            name="i-lucide-wallet-cards"
            class="text-3xl text-gray-400"
          />
        </div>

        <p class="font-medium text-gray-900 dark:text-white">
          No expense categories found
        </p>

        <p class="mt-1 text-sm text-gray-500">
          Create categories to organize expenses.
        </p>
      </div>
    </template>

   <!-- Pagination -->
    <div class="flex justify-between items-center mt-3 md:hidden">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>