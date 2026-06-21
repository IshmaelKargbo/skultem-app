<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useMaterialStore()
const { records: data, loading, meta } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'category.name',
    header: 'Category'
  },
  {
    accessorKey: 'inStock',
    header: 'In Stock'
  },
  {
    accessorKey: 'unit',
    header: 'Unit'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Restocked At'
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    }
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

  await store.fetchAll(page.value, size.value)
})
</script>
<template>
  <div class="space-y-4">
    <!-- Desktop -->
    <UCard
      class="hidden md:block"
      :ui="{
        body: 'md:p-0'
      }"
    >
      <UTable
        :columns="columns"
        :data="data"
        :loading="loading"
      >
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10"
            >
              <UIcon
                name="ph:books-light"
                class="text-4xl text-primary-500"
              />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                No material found
              </h3>

              <p class="mt-1 text-sm text-gray-500">
                School materials and inventory will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10"
            >
              <UIcon
                name="lucide:package"
                class="text-primary-500"
              />
            </div>

            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.name }}
              </p>

              <p class="text-xs text-gray-500">
                {{ row.original.category.name }}
              </p>
            </div>
          </div>
        </template>

        <template #unit-cell="{ row }">
          <p>{{ unitLabelMap[row.original.unit] }}</p>
        </template>

        <template #inStock-cell="{ row }">
          <UBadge
            :color="row.original.inStock > 0 ? 'success' : 'error'"
            variant="soft"
          >
            {{ row.original.inStock }}
          </UBadge>
        </template>

        <template #updatedAt-cell="{ row }">
          <p class="text-sm text-gray-500">
            {{ formatDateTime(row.original.updatedAt) }}
          </p>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
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
      <div
        v-if="loading"
        class="space-y-4"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex gap-3">
            <USkeleton class="h-14 w-14 rounded-2xl" />

            <div class="flex-1 space-y-3">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-3 w-24" />
              <USkeleton class="h-3 w-full" />

              <div class="grid grid-cols-3 gap-2 pt-2">
                <USkeleton class="h-14 rounded-2xl" />
                <USkeleton class="h-14 rounded-2xl" />
                <USkeleton class="h-14 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!data?.length"
        class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10"
        >
          <UIcon
            name="lucide:package"
            class="text-5xl text-primary-500"
          />
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          No materials found
        </h3>

        <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
          Add school materials and manage inventory from one place.
        </p>

        <UButton
          class="mt-6 rounded-full px-5"
          icon="i-lucide-plus"
          size="sm"
        >
          Add Material
        </UButton>
      </div>

    <!-- Cards -->
<div
  v-else
  class="space-y-3"
>
  <UCard
    v-for="item in data"
    :key="item.id"
    class="rounded-2xl border border-default shadow-sm"
    :ui="{ body: 'p-4' }"
  >
    <div class="space-y-4">

      <!-- Header -->
      <div class="flex items-start justify-between gap-3">

        <div class="flex gap-3 min-w-0 flex-1">

          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"
          >
            <UIcon
              name="i-lucide-package"
              class="size-5 text-primary"
            />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-highlighted">
              {{ item.name }}
            </h3>

            <p class="mt-1 text-xs text-muted">
              {{ item.category.name }}
            </p>
          </div>

        </div>

        <UBadge
          :color="item.inStock > 0 ? 'success' : 'error'"
          variant="soft"
        >
          {{ item.inStock > 0 ? 'Available' : 'Out of stock' }}
        </UBadge>

      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">

        <div class="rounded-xl bg-muted p-3">
          <p class="text-[11px] text-muted">
            Stock
          </p>

          <p class="mt-2 text-lg font-semibold text-highlighted">
            {{ item.inStock }}
          </p>
        </div>

        <div class="rounded-xl bg-muted p-3">
          <p class="text-[11px] text-muted">
            Unit
          </p>

          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ unitLabelMap[item.unit] }}
          </p>
        </div>

      </div>

      <!-- Restocked -->
      <div
        class="flex items-center justify-between border-t border-default pt-3"
      >
        <div>
          <p class="text-[11px] text-muted">
            Last Restocked
          </p>

          <p class="mt-1 text-sm text-highlighted">
            {{ formatDateTime(item.lastRestockedAt) }}
          </p>
        </div>

        <UIcon
          name="i-lucide-clock-3"
          class="size-5 text-muted"
        />
      </div>

    </div>
  </UCard>
</div>
    </div>
  </div>
</template>