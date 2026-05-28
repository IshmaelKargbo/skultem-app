<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useMaterialStore()

const { supplies: data, loading, meta } = storeToRefs(store)

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
    <!-- Desktop -->
    <UCard class="hidden md:block" :ui="{
      body: 'p-0'
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
    <div class="space-y-4 md:hidden">
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
      <div v-else-if="!data?.length"
        class="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div
          class="mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
          <UIcon name="ph:books-light" class="text-5xl text-primary-500" />
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          No supply found
        </h3>

        <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">
          Supply collection records and student materials will appear here.
        </p>
      </div>

      <!-- Cards -->
      <div v-else class="space-y-4">
        <div v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900">

          <div class="p-4">
            <!-- Student -->
            <div class="flex items-start gap-3">
              <UAvatar size="lg" :src="item.student.photo" class="shrink-0" />

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {{ item.student.givenNames }}
                      {{ item.student.familyName }}
                    </h3>

                    <p class="mt-1 text-xs text-gray-400">
                      {{ item.student.admissionNumber }}
                    </p>
                  </div>

                  <UBadge :color="item.status === 'COLLECTED' ? 'success' : 'warning'" variant="soft" size="sm">
                    {{ clean(item.status) }}
                  </UBadge>
                </div>

                <!-- Material -->
                <div class="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60">
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {{ item.material.name }}
                      </p>

                      <p class="mt-1 text-xs text-gray-500">
                        {{ item.material.category.name }}
                      </p>
                    </div>

                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                      <UIcon name="lucide:package" class="text-primary-500" />
                    </div>
                  </div>
                </div>

                <!-- Stats -->
                <div class="mt-4 grid grid-cols-3 gap-2">
                  <div class="rounded-2xl bg-gray-50 p-3 text-center dark:bg-neutral-800/60">
                    <p class="text-[11px] text-gray-500">
                      Qty
                    </p>

                    <p class="mt-1 text-sm font-semibold">
                      {{ item.qty }}
                    </p>
                  </div>

                  <div class="rounded-2xl bg-gray-50 p-3 text-center dark:bg-neutral-800/60">
                    <p class="text-[11px] text-gray-500">
                      Collected
                    </p>

                    <p class="mt-1 text-sm font-semibold">
                      {{ item.collectedQty }}
                    </p>
                  </div>

                  <div class="rounded-2xl bg-gray-50 p-3 text-center dark:bg-neutral-800/60">
                    <p class="text-[11px] text-gray-500">
                      Date
                    </p>

                    <p class="mt-1 truncate text-xs font-medium">
                      {{
                        item.collectedOn
                          ? formatDateTime(item.collectedOn)
                          : '-'
                      }}
                    </p>
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