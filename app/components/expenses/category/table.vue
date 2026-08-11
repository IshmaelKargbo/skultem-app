<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const view = ref<'table' | 'card'>('table')
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
  <TableViewToggle v-model="view" />

  <!-- Desktop -->
  <UCard
    v-if="view === 'table'"
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
  <div class="space-y-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
    <!-- Loading -->
    <template v-if="loading">
      <UCard
        v-for="i in 4"
        :key="i"
        variant="outline"
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
        variant="outline"
        class="overflow-hidden transition-all active:scale-[0.99]"
        :ui="{
          body: 'p-0'
        }"
      >
          <div class="border-b border-default p-3 md:p-0 md:pb-3 ">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-4">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-primary dark:bg-gray-800 dark:text-primary">
                  <UIcon name="i-lucide-book-open-text" class="size-5 text-primary group-hover:text-white" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold">
                    {{ item.name }}
                  </h3>

                  <div class="mt-1 flex items-center gap-2 text-xs text-muted">
                    Expense Category
                  </div>
                </div>
              </div>

              <!-- <UButton
              icon="i-lucide-ellipsis"
              color="neutral"
              variant="ghost"
              square
              class="rounded-xl"
            /> -->
            </div>
          </div>

          <!-- Description -->
          <div class="p-5">
            <div class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
              <div class="mb-3 flex items-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
                </div>

                <span class="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Description
                </span>
              </div>

              <p class="text-sm leading-6 text-toned">
                {{ item.description || "No description available." }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between border-t border-default p-3 md:p-0 md:pt-3 ">
            <div class="flex items-center gap-2">
              <div class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p class="text-xs font-medium">Active Category</p>

                <p class="text-[11px] text-muted">Available for expense records</p>
              </div>
            </div>

            <!-- <UButton
            icon="i-lucide-pencil"
            color="primary"
            variant="soft"
            size="sm"
            class="rounded-xl"
          >
            Edit
          </UButton> -->
          </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14 col-span-full">
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
    <div class="flex justify-between items-center mt-3 col-span-full">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>