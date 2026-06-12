<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const store = useClassSessionStore()
const { records: data, meta, loading } = storeToRefs(store)

const UButton = resolveComponent('UButton')

const columns = [
  {
    accessorKey: 'clazz',
    header: 'Name'
  },
  {
    accessorKey: 'classLevel',
    header: 'Level'
  },
  {
    accessorKey: 'sectionName',
    header: 'Section'
  },
  {
    accessorKey: 'streamName',
    header: 'Stream'
  },
  {
    accessorKey: 'totalStudent',
    header: 'Students'
  },
  {
    accessorKey: 'teacherName',
    header: 'Class Teacher'
  }
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (value) => updateQuery({ page: value })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (value) => updateQuery({ size: value })
})

function updateQuery(query: Record<string, any>) {
  router.replace({
    query: {
      ...route.query,
      ...query
    }
  })
}

async function fetchRecords() {
  try {
    loading.value = true

    await store.fetchAll(page.value, size.value)
  } finally {
    loading.value = false
  }
}

watch([page, size], fetchRecords, {
  immediate: true
})

onMounted(() => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value
    })
  }
})
</script>

<template>
  <!-- Desktop -->
  <UCard class="hidden md:block" :ui="{
    body: 'sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

          <p class="text-sm text-gray-500">
            No classes found
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #clazz-cell="{ row }">
        <div>
          <p>{{ row.original.clazz }}</p>
          <p class="text-xs text-muted">{{ row.original.grade }}</p>
        </div>
      </template>

      <template #classLevel-cell="{ row }">
        <p>{{ parseLevel[row.original.classLevel] }}</p>
      </template>

      <template #totalStudent-cell="{ row }">
        <UBadge variant="soft" :trailing-icon="STUDENT_ICON" :label="`${row.original.totalStudent} Students`" />
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
    <template v-if="loading">
      <UCard v-for="i in 4" :key="i" class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div class="space-y-5 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-xl" />

              <div class="space-y-2">
                <USkeleton class="h-3 w-28" />
                <USkeleton class="h-2 w-20" />
              </div>
            </div>

            <USkeleton class="h-6 w-16 rounded-full" />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
          </div>

          <div class="flex items-center gap-3">
            <USkeleton class="size-9 rounded-full" />

            <div class="space-y-2">
              <USkeleton class="h-3 w-24" />
              <USkeleton class="h-2 w-16" />
            </div>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Data -->
    <template v-else-if="data?.length">
      <UCard v-for="item in data" :key="item.id" class="overflow-hidden shadow-sm transition-all" :ui="{
        body: 'p-0'
      }">
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar size="lg" :alt="item.clazz" class="rounded-2xl" />

              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ item.clazz }}
                </h3>

                <div class="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <span>{{ item.grade }}</span>

                  <span>•</span>

                  <span>
                    {{ parseLevel[item.classLevel] }}
                  </span>
                </div>
              </div>
            </div>

            <UBadge variant="soft" color="primary" :leading-icon="STUDENT_ICON" :label="`${item.totalStudent}`" />

          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-2 p-4">
          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Section
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.sectionName || 'N/A' }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Stream
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.streamName || 'N/A' }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Level
            </p>

            <p class="truncate text-sm font-medium">
              {{ parseLevel[item.classLevel] }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar :alt="item.teacherName" size="sm" />

            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.teacherName }}
              </p>

              <p class="text-xs text-gray-500">
                Class Teacher
              </p>
            </div>
          </div>

          <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" class="rounded-xl" />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />

        <p class="text-sm text-gray-500">
          No classes found
        </p>
      </div>
    </template>

    <!-- Pagination -->
    <div v-if="!loading && data?.length" class="flex flex-col items-center gap-3 pt-2">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>