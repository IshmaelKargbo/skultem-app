<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useClassSubjectStore()
const { records: data, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns = [
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'subjectName',
    header: 'Subject'
  },
  {
    accessorKey: 'mandatory',
    header: 'Type'
  },
  {
    accessorKey: 'groupName',
    header: 'Group'
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

async function fetchRecord() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
}

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

watch(() => page.value, () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      page: page.value
    }
  })

  fetchRecord()
}, { immediate: true })

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
  <div>
    <!-- Desktop -->
    <UCard class="hidden md:block" :ui="{
      body: 'sm:p-0'
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

            <p class="text-gray-500">
              No class subject found.
            </p>
          </div>
        </template>

        <template #mandatory-cell="{ row }">
          <div class="flex items-center gap-2">
            <UBadge variant="soft" :color="row.original.mandatory ? 'success' : 'info'"
              :label="row.original.mandatory ? 'Core' : 'Optional'" />

            <UBadge v-if="row.original.locked" variant="soft" color="error" label="Locked" />
          </div>
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
    <div class="space-y-3 md:hidden">
      <template v-if="loading">
        <UCard v-for="i in 4" :key="i" class="rounded-2xl border border-default">
          <div class="space-y-4 p-4">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-20" />
            <USkeleton class="h-20 rounded-2xl" />
          </div>
        </UCard>
      </template>

      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id" class="rounded-2xl border border-default shadow-sm"
          :ui="{ body: 'p-4' }">
          <div class="space-y-4">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex gap-3 min-w-0">

                <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <UIcon name="i-lucide-book-open" class="size-5 text-primary" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-highlighted">
                    {{ item.subjectName }}
                  </h3>

                  <p class="mt-1 text-xs text-muted">
                    {{ item.className }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3">

              <div class="rounded-xl bg-muted p-3">
                <p class="text-[11px] text-muted">
                  Type
                </p>

                <UBadge class="mt-2" variant="soft" size="sm" :color="item.mandatory ? 'success' : 'info'"
                  :label="item.mandatory ? 'Core' : 'Optional'" />
              </div>

              <div class="rounded-xl bg-muted p-3">
                <p class="text-[11px] text-muted">
                  Group
                </p>

                <p class="mt-2 text-sm font-medium text-highlighted truncate">
                  {{ item.groupName || 'N/A' }}
                </p>
              </div>

            </div>

            <!-- Status Row -->
            <div class="flex items-center justify-between rounded-xl border border-default px-3 py-2">
              <div class="flex items-center gap-2">

                <div class="size-2 rounded-full" :class="item.locked ? 'bg-error' : 'bg-success'" />

                <span class="text-sm">
                  {{ item.locked ? 'Locked' : 'Active' }}
                </span>

              </div>

              <UBadge v-if="item.mandatory" variant="outline" color="success" label="Required" />
            </div>

          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="rounded-2xl">
          <div class="flex flex-col items-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-5xl text-gray-300" />

            <h3 class="text-sm font-medium">
              No subjects found
            </h3>

            <p class="mt-1 text-xs text-gray-500">
              It seems you haven't added any subjects yet.
            </p>
          </div>
        </UCard>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length && meta.total > meta.size" class="space-y-3 pt-2">
        <div class="flex justify-center">
          <Showing :meta="meta" />
        </div>

        <div class="flex justify-center">
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </div>
    </div>
  </div>
</template>