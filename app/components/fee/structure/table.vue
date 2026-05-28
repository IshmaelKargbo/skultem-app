<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { format } = useMoney()
const store = useFeeStructureStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const columns = [
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell({ row }: any) {
      return format((row.original as FeeStructure).amount);
    },
  },
  {
    accessorKey: 'students',
    header: 'Students'
  },
  {
    accessorKey: 'hasSupply',
    header: 'Supply'
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date'
  },
  {
    accessorKey: 'allowInstallment',
    header: 'Installment'
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
  <!-- Desktop -->
  <UCard
    class="hidden md:block"
    :ui="{
      body: 'sm:p-0'
    }"
  >
    <UTable
      :columns="columns"
      :data="data"
      :loading="loading"
    >
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon
            name="ph:books-light"
            class="text-4xl text-gray-400"
          />

          <p class="text-gray-500">
            No fee structures found.
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #allowInstallment-cell="{ row }">
        <UBadge
          variant="outline"
          :label="row.original.allowInstallment ? 'Yes' : 'No'"
          :color="row.original.allowInstallment ? 'success' : 'neutral'"
        />
      </template>

      <template #type-cell="{ row }">
        <div class="space-y-1">
          <p>{{ clean(row.original.type) }}</p>

          <p class="text-xs text-muted">
            {{ row.original.clazz?.name || '-' }}
          </p>
        </div>
      </template>

      <template #category-cell="{ row }">
        <div class="space-y-1">
          <p>{{ clean(row.original.category.name) }}</p>

          <p class="text-xs text-muted">
            {{ row.original.term.name || '-' }}
          </p>
        </div>
      </template>

      <template #hasSupply-cell="{ row }">
        <div class="space-y-1">
          <p v-if="row.original.hasSupply">
            <span>{{ row.original.material?.name }}</span>

            <span>
              ({{ row.original.totalSupply || '0' }})
            </span>
          </p>

          <p
            v-else
            class="text-muted"
          >
            -
          </p>
        </div>
      </template>

      <template #students-cell="{ row }">
        <FeeStructureCount :id="row.original.id">
          <template #default="{ value }">
            <div class="flex space-x-2">
              <UBadge
                variant="outline"
                :trailing-icon="STUDENT_ICON"
                :label="`${value} -`"
              />
            </div>
          </template>
        </FeeStructureCount>
      </template>
    </UTable>

    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />

        <UPagination
          size="sm"
          v-model:page="page"
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
        v-for="i in 4"
        :key="i"
        class="rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex gap-3">
          <USkeleton class="h-14 w-14 rounded-2xl" />

          <div class="flex-1 space-y-3">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-full" />

            <div class="grid grid-cols-2 gap-2">
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
          name="lucide:wallet-cards"
          class="text-5xl text-primary-500"
        />
      </div>

      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        No fee structures found
      </h3>

      <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
        Fee structures, installments, and payment configurations will appear here.
      </p>
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
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10"
            >
              <UIcon
                name="lucide:wallet"
                class="text-xl text-primary-500"
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
                    {{ clean(item.category.name) }}
                  </h3>

                  <p class="mt-1 text-xs text-gray-400">
                    {{ clean(item.type) }}
                  </p>
                </div>

                <UBadge
                  :color="item.allowInstallment ? 'success' : 'neutral'"
                  variant="soft"
                >
                  {{ item.allowInstallment ? 'Installment' : 'Full Payment' }}
                </UBadge>
              </div>

              <!-- Class / Term -->
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div
                  class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60"
                >
                  <p class="text-[11px] text-gray-500">
                    Class
                  </p>

                  <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.clazz?.name || '-' }}
                  </p>
                </div>

                <div
                  class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60"
                >
                  <p class="text-[11px] text-gray-500">
                    Term
                  </p>

                  <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.term.name || '-' }}
                  </p>
                </div>
              </div>

              <!-- Supply -->
              <div
                class="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-[11px] text-gray-500">
                      Material Supply
                    </p>

                    <p
                      v-if="item.hasSupply"
                      class="mt-1 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {{ item.material?.name }}
                    </p>

                    <p
                      v-else
                      class="mt-1 text-sm text-gray-400"
                    >
                      No supply attached
                    </p>
                  </div>

                  <div
                    v-if="item.hasSupply"
                    class="rounded-xl bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-600 dark:bg-primary-500/10"
                  >
                    {{ item.totalSupply || 0 }}
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-4 flex items-center justify-between">
                <FeeStructureCount :id="item.id">
                  <template #default="{ value }">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10"
                      >
                        <UIcon
                          :name="STUDENT_ICON"
                          class="text-primary-500"
                        />
                      </div>

                      <div>
                        <p class="text-[11px] text-gray-500">
                          Students
                        </p>

                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {{ value }}
                        </p>
                      </div>
                    </div>
                  </template>
                </FeeStructureCount>

                <span
                  class="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/10"
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
</template>