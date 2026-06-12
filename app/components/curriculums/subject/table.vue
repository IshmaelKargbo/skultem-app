<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useSubjectStore()

const { records: data, meta, loading } = storeToRefs(store)

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'code',
    header: 'Code'
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
  get: () => Number(route.query.size ?? runtimeConf().limit),
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

  await store.fetchAll(page.value, size.value)

  loading.value = false
}

watch(
  () => page.value,
  () => {
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })

    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })

    fetchRecord()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-4">
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
              No subject found.
            </p>
          </div>
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
      <template v-if="loading">
        <UCard
          v-for="i in 4"
          :key="i"
          class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900"
        >
          <div class="space-y-4 p-4">
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-3 w-32" />
                <USkeleton class="h-2 w-20" />
              </div>
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
          class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-neutral-900"
          :ui="{
            body: 'p-0'
          }"
        >
          <!-- Header -->
          <div class="border-b border-gray-100 p-4 dark:border-gray-800">
            <div class="flex items-start gap-3">
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              >
                <UIcon
                  name="i-lucide-book-open"
                  class="size-6"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {{ item.name }}
                    </h3>
                    <p class="mt-1 text-xs text-gray-500">
                      {{ item.code || 'No code assigned' }}
                    </p>
                  </div>

                  <UBadge
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    {{ item.code || 'N/A' }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <div class="rounded-2xl bg-gray-50 p-4 dark:bg-neutral-800">
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  name="material-symbols:description-rounded"
                  class="size-4 text-gray-400"
                />

                <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </p>
              </div>

              <p class="text-sm leading-6 text-gray-700 dark:text-gray-300">
                {{ item.description || 'No description available for this subject.' }}
              </p>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-14">
          <div
            class="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
          >
            <UIcon
              name="ph:books-light"
              class="text-3xl text-gray-400"
            />
          </div>

          <p class="text-sm font-medium text-gray-900 dark:text-white">
            No subject found
          </p>

          <p class="mt-1 text-xs text-gray-500">
            Subjects will appear here once created.
          </p>
        </div>
      </template>

      <!-- Pagination -->
       <div class="flex justify-center flex-col items-center mt-5 md:hidden space-y-3">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>