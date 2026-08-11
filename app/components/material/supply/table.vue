<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useMaterialStore()

const { supplies: data, loading, meta } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const columns = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'material',
    header: 'Material'
  },
  {
    accessorKey: 'qty',
    header: 'Qty'
  },
  {
    accessorKey: 'collectedQty',
    header: 'Collected'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'collectedOn',
    header: 'Date'
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

  await store.fetchAllSupply(page.value, size.value)
})
</script>

<template>
  <div class="space-y-4">
    <TableViewToggle v-model="view" />

    <!-- Desktop -->
    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{
      body: 'sm:p-0'
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-14">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="ph:books-light" class="text-3xl text-gray-400" />
            </div>

            <div class="text-center">
              <p class="font-medium text-gray-900 dark:text-white">
                No supply found
              </p>

              <p class="text-sm text-gray-500">
                Material supply records will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #student-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar size="lg" :src="row.original.student.photo" />

            <div class="space-y-0.5">
              <p class="font-medium">
                {{ row.original.student.givenNames }}
                {{ row.original.student.familyName }}
              </p>

              <p class="text-xs text-muted">
                {{ row.original.student.admissionNumber }}
              </p>
            </div>
          </div>
        </template>

        <template #material-cell="{ row }">
          <div class="space-y-0.5">
            <p>{{ row.original.material.name }}</p>

            <p class="text-xs text-muted">
              {{ row.original.material.category.name }}
            </p>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'COLLECTED' ? 'success' : 'warning'" variant="soft">
            {{ clean(row.original.status) }}
          </UBadge>
        </template>

        <template #collectedOn-cell="{ row }">
          <p>
            {{
              row.original.collectedOn
                ? formatDateTime(row.original.collectedOn)
                : '-'
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

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <!-- Mobile -->
    <div class="space-y-4"
      :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i"
          class="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div class="flex gap-3">
            <USkeleton class="h-14 w-14 rounded-2xl" />

            <div class="flex-1 space-y-3">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-28" />
              <USkeleton class="h-3 w-full" />

              <div class="flex gap-2 pt-2">
                <USkeleton class="h-6 w-16 rounded-full" />
                <USkeleton class="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <UCard v-else-if="!loading && !data?.length" class="rounded-2xl border border-default shadow-sm col-span-full"
        :ui="{ body: 'p-4' }">
        <div class="flex flex-col items-center gap-3 py-14">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
            <UIcon name="ph:books-light" class="text-3xl text-gray-400" />
          </div>

          <div class="text-center">
            <p class="font-medium text-gray-900 dark:text-white">
              No supply found
            </p>

            <p class="text-sm text-gray-500">
              Material supply records will appear here.
            </p>
          </div>
        </div>
      </UCard>


      <!-- Cards -->
      <div v-else class="space-y-3">
        <UCard v-for="item in data" :key="item.id" class="rounded-2xl border border-default shadow-sm"
          :ui="{ body: 'p-4' }">
          <div class="space-y-4">

            <!-- Student Header -->
            <div
              class="flex items-center justify-between gap-3 border-b border-gray-200 p-3 md:p-0 md:pb-3  dark:border-gray-800">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="lg" :src="item.student.photo"
                  :alt="`${item.student.givenNames} ${item.student.familyName}`"
                  class="shrink-0 ring-2 ring-primary/10" />

                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-highlighted">
                    {{ item.student.givenNames }}
                    {{ item.student.familyName }}
                  </h3>

                  <div class="mt-1 flex items-center gap-1.5">
                    <UIcon name="i-lucide-id-card" class="size-3.5 text-muted" />

                    <span class="text-xs text-muted">
                      {{ item.student.admissionNumber }}
                    </span>
                  </div>
                </div>
              </div>

              <UBadge size="sm" variant="soft" :color="item.status === 'COLLECTED' ? 'success' : 'warning'" :icon="item.status === 'COLLECTED'
                ? 'i-lucide-check'
                : 'i-lucide-clock-3'
                ">
                {{ clean(item.status) }}
              </UBadge>
            </div>

            <div class="p-4">
              <!-- Material -->
              <div class="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary-50 dark:bg-primary-500/10 p-4">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/10">
                  <UIcon name="i-lucide-package" class="size-5 text-primary" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ item.material.name }}
                  </p>

                  <div class="mt-1 flex items-center gap-1.5">
                    <UIcon name="i-lucide-layers-2" class="size-3.5 text-muted" />

                    <p class="truncate text-xs text-muted">
                      {{ item.material.category.name }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quantity -->
              <div class="grid grid-cols-2 gap-3 mt-3">
                <!-- Requested -->
                <div class="rounded-2xl border border-default bg-gray-50 dark:bg-gray-600 p-3.5">
                  <div class="flex items-center gap-2">
                    <div class="flex size-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-600">
                      <UIcon name="i-lucide-package" class="size-4 text-muted" />
                    </div>

                    <p class="text-xs font-medium text-muted">
                      Requested
                    </p>
                  </div>

                  <p class="mt-3 text-xl font-bold text-highlighted">
                    {{ item.qty }}
                  </p>
                </div>

                <!-- Collected -->
                <div class="rounded-2xl border border-success/10 bg-success-50 dark:bg-success-500/10 p-3.5">
                  <div class="flex items-center gap-2">
                    <div class="flex size-8 items-center justify-center rounded-lg bg-success-100 ">
                      <UIcon name="i-lucide-package-check" class="size-4 text-success" />
                    </div>

                    <p class="text-xs font-medium text-muted">
                      Collected
                    </p>
                  </div>

                  <p class="mt-3 text-xl font-bold text-success">
                    {{ item.collectedQty }}
                  </p>
                </div>
              </div>

            </div>
            <!-- Collection Date -->
            <div class="mt-4 flex items-center justify-between border-t border-default pt-4">
              <div class="flex items-center gap-3">
                <div class="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <UIcon name="i-lucide-calendar-days" class="size-4 text-muted" />
                </div>

                <div>
                  <p class="text-[11px] text-muted">
                    Collection Date
                  </p>

                  <p class="mt-0.5 text-sm font-medium text-highlighted">
                    {{
                      item.collectedOn
                        ? formatDateTime(item.collectedOn)
                        : 'Not collected yet'
                    }}
                  </p>
                </div>
              </div>

              <UBadge v-if="item.collectedQty >= item.qty" color="success" variant="soft" size="xs">
                Complete
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>