<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useSectionStore()
const loading = ref(true)
const { records: data, meta } = storeToRefs(store)

const editRcord = ref<Section | null>(null)
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

  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
})
</script>
<template>
  <UCard class="hidden md:block" :ui="{
    body: 'sm:p-0'
  }">
    <!-- Desktop Table -->
    <div >
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">
              No sections found.
            </p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>
    </div>
    <template #footer>
      <!-- Footer -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Showing :meta="meta" />

        <div class="overflow-x-auto">
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </div>
    </template>
  </UCard>
<!-- Mobile -->
<div class="space-y-3 md:hidden">
  <!-- Loading -->
  <template v-if="loading">
    <UCard
      v-for="i in 4"
      :key="i"
      class="rounded-2xl border border-default"
      :ui="{ body: 'p-4' }"
    >
      <div class="space-y-3">
        <USkeleton class="h-4 w-28" />
        <USkeleton class="h-3 w-full" />
        <USkeleton class="h-3 w-2/3" />
      </div>
    </UCard>
  </template>

  <!-- Empty -->
  <template v-else-if="!data?.length">
    <UCard class="rounded-2xl">
      <div class="flex flex-col items-center py-14">
        <UIcon
          name="ph:books-light"
          class="mb-3 text-5xl text-gray-300"
        />

        <h3 class="text-sm font-medium">
          No sections found
        </h3>

        <p class="mt-1 text-xs text-gray-500 text-center">
          Create sections to organize your academic structure.
        </p>
      </div>
    </UCard>
  </template>

  <!-- Cards -->
  <template v-else>
    <UCard
      v-for="item in data"
      :key="item.id"
      class="rounded-2xl border border-default shadow-sm"
      :ui="{ body: 'p-4' }"
    >
      <div class="space-y-4">

        <!-- Header -->
        <div class="flex gap-3">
          <div
            class="flex size-11 items-center justify-center rounded-xl bg-primary/10"
          >
            <UIcon
              name="i-lucide-layout-template"
              class="size-5 text-primary"
            />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex justify-between items-center gap-2">
              <h3 class="truncate text-sm font-semibold text-highlighted">
                {{ item.name }}
              </h3>

            </div>

            <p class="mt-1 text-xs text-muted">
              Academic Section
            </p>
          </div>
        </div>

        <!-- Description -->
        <div class="rounded-xl bg-muted p-3">
          <p class="text-[11px] text-muted">
            Description
          </p>

          <p class="mt-2 text-sm text-highlighted line-clamp-2">
            {{
              item.description ||
              'No description available.'
            }}
          </p>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-default pt-3"
        >
          <UBadge
            label="Active"
            color="success"
            variant="soft"
          />

          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 text-muted"
          />
        </div>

      </div>
    </UCard>
  </template>

  <!-- Pagination -->
  <div
    v-if="!loading && data?.length && meta.total > meta.size"
    class="space-y-3 pt-2"
  >
    <div class="flex justify-center">
      <Showing :meta="meta" />
    </div>

    <div class="flex justify-center">
      <UPagination
        v-model:page="page"
        size="sm"
        :page-size="meta.size"
        :items-per-page="meta.size"
        :total="meta.total"
        show-edges
      />
    </div>
  </div>
</div>
</template>