<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useFeeStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

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

function getRowItems(row: Row<FeeCategory>) {
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
  <div class="space-y-4">
    <!-- Desktop -->
    <UCard
      class="hidden md:block"
      :ui="{
        body: 'p-0'
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
                name="lucide:wallet-cards"
                class="text-4xl text-primary-500"
              />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                No fee categories found
              </h3>

              <p class="mt-1 text-sm text-gray-500">
                Fee categories and payment groups will appear here.
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
                name="lucide:receipt-text"
                class="text-primary-500"
              />
            </div>

            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.name }}
              </p>

              <p class="text-xs text-gray-500">
                Fee Category
              </p>
            </div>
          </div>
        </template>

        <template #description-cell="{ row }">
          <p class="max-w-md text-sm leading-6 text-gray-500 line-clamp-2">
            {{
              row.original.description ||
              'No description available.'
            }}
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
          class="overflow-hidden rounded-[30px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex gap-3">
            <USkeleton class="h-14 w-14 rounded-2xl" />

            <div class="flex-1 space-y-3">
              <USkeleton class="h-4 w-36" />
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
      <div
        v-else-if="!data?.length"
        class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10"
        >
          <UIcon
            name="lucide:wallet-cards"
            class="text-5xl text-primary-500"
          />
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          No fee categories found
        </h3>

        <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
          Organize school payments and billing using structured fee categories.
        </p>

        <UButton
          class="mt-6 rounded-full px-5"
          icon="i-lucide-plus"
          size="sm"
        >
          Add Category
        </UButton>
      </div>

      <!-- Cards -->
      <div
        v-else
        class="space-y-4"
      >
        <div
          v-for="item in data"
          :key="item.id"
          class="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="p-4">
            <div class="flex gap-3">
              <!-- Icon -->
              <div
                class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10"
              >
                <UIcon
                  name="lucide:receipt-text"
                  class="text-xl text-primary-500"
                />

                <div
                  class="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"
                />
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <!-- Header -->
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3
                      class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {{ item.name }}
                    </h3>

                    <p class="mt-1 text-xs text-gray-400">
                      Fee Category
                    </p>
                  </div>

                  <!-- Actions -->
                  <UDropdownMenu
                    :items="getRowItems({ original: item } as any)"
                    :content="{ align: 'end' }"
                  >
                    <UButton
                      icon="i-lucide-ellipsis-vertical"
                      color="neutral"
                      size="sm"
                      variant="ghost"
                      class="rounded-full"
                    />
                  </UDropdownMenu>
                </div>

                <!-- Description -->
                <div
                  class="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60"
                >
                  <p
                    class="line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300"
                  >
                    {{
                      item.description ||
                      'No description available for this fee category.'
                    }}
                  </p>
                </div>

                <!-- Footer -->
                <div class="mt-5 flex items-center justify-between">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300"
                    >
                      Finance
                    </span>

                    <span
                      class="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-medium text-primary-600 dark:bg-primary-500/10"
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>