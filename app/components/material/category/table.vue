<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useMaterialStore()

const { categories: data, loading, meta } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const columns = [
  {
    accessorKey: 'name',
    header: 'Category'
  },
  {
    accessorKey: 'description',
    header: 'Description'
  }
]

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
        page: page.value
      }
    })
  }

  await store.fetchAllCategory(page.value, size.value)
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-end">
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:folder-kanban" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.name }}
              </p>

              <p class="text-xs text-gray-500">
                Material Category
              </p>
            </div>
          </div>
        </template>

        <template #description-cell="{ row }">
          <p class="max-w-md text-sm text-gray-500 line-clamp-2">
            {{
              row.original.description ||
              'No description available.'
            }}
          </p>
        </template>

        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:folder-open" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                No categories found
              </h3>

              <p class="mt-1 text-sm text-gray-500">
                Material categories will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i"
          class="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div class="flex gap-3">
            <USkeleton class="h-14 w-14 rounded-2xl" />

            <div class="flex-1 space-y-3">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-2/3" />

              <div class="flex gap-2 pt-2">
                <USkeleton class="h-6 w-20 rounded-full" />
                <USkeleton class="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!data?.length"
        class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div
          class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10">
          <UIcon name="lucide:folder-open" class="text-5xl text-primary-500" />
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          No categories found
        </h3>

        <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
          Create categories to organize your school materials better.
        </p>

        <UButton class="mt-6 rounded-full px-5" icon="i-lucide-plus" size="sm">
          Add Category
        </UButton>
      </div>

      <!-- Cards -->
      <div v-else class="space-y-3">
        <UCard v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
          :ui="{ body: 'p-4' }">
          <div class=" gap-3">
            <div class="flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-neutral-800">
              <!-- Icon -->
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="lucide:folder-kanban" class="text-xl text-primary-500" />
              </div>
              <div>
                <h3 class="truncate text-sm font-semibold text-highlighted">
                  {{ item.name }}
                </h3>

                <p class="mt-1 text-xs text-muted">
                  Material Category
                </p>
              </div>
            </div>

            <!-- Content -->
            <div class="min-w-0  mt-4">
              <p class="mt-2 text-sm text-muted line-clamp-2">
                {{ item.description || 'No description available.' }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>