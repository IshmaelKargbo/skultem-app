<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useStreamSubjectStore()
const { records: data, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'streamName',
    header: 'Stream'
  },
  {
    accessorKey: 'subjectName',
    header: 'Subject'
  },
  {
    accessorKey: 'groupName',
    header: 'Group'
  },
  {
    accessorKey: 'mandatory',
    header: 'Mandatory'
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
      page: page.value,
      size: size.value
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
  <div class="space-y-4">
    <UCard class="hidden md:block" :ui="{
      body: 'sm:p-0'
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No stream subject found.</p>
          </div>
        </template>
        <template #mandatory-cell="{ row }">
          <div class="flex items-center gap-2">
            <USwitch v-model="row.original.mandatory" disabled />
            <UBadge v-if="row.original.locked" variant="outline" color="error" label="Locked" />
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>
      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
    <div class="space-y-4 md:hidden">
      <template v-if="loading">
        <UCard v-for="i in 4" :key="i" class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm">
          <div class="space-y-4 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <USkeleton class="size-12 rounded-2xl" />
                <div class="space-y-2">
                  <USkeleton class="h-3 w-28" />
                  <USkeleton class="h-2 w-20" />
                </div>
              </div>
              <USkeleton class="size-8 rounded-xl" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
            </div>
          </div>
        </UCard>
      </template>

      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm" :ui="{
            body: 'p-0'
          }">
          <div class="border-b border-default p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UIcon name="i-lucide-book-open" class="size-6" />
                </div>

                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ item.subjectName }}
                  </p>

                  <p class="truncate text-xs text-muted">
                    {{ item.streamName || 'No stream' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 p-4">
            <div class="rounded-2xl bg-muted p-3">
              <p class="mb-1 text-[10px] uppercase tracking-wide text-muted">Subject Type</p>
              <UBadge variant="soft" size="sm" :color="item.mandatory ? 'success' : 'info'"
                :label="item.mandatory ? 'Core' : 'Optional'" />
            </div>

            <div class="rounded-2xl bg-muted p-3">
              <p class="mb-1 text-[10px] uppercase tracking-wide text-muted">Group</p>
              <p class="truncate text-sm font-medium text-highlighted">{{ item.groupName || 'N/A' }}</p>
            </div>

            <div class="rounded-2xl bg-muted p-3 col-span-2">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <p class="mb-1 text-[10px] uppercase tracking-wide text-muted">Status</p>
                  <div class="flex items-center gap-2">
                    <UBadge variant="soft" :color="item.locked ? 'error' : 'success'"
                      :label="item.locked ? 'Locked' : 'Active'" />
                    <UBadge v-if="item.mandatory" variant="outline" color="success" label="Required" />
                  </div>
                </div>

                <UIcon :name="item.locked ? 'i-lucide-lock' : 'i-lucide-lock-open'"
                  :class="['size-5', item.locked ? 'text-error' : 'text-success']" />
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <template v-else>
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">No stream subject found.</p>
        </div>
      </template>

      <div class="flex flex-col items-center justify-center gap-2">
        <Showing :meta="meta" />
        <div class="w-full overflow-x-auto pb-1">
          <div class="flex min-w-max justify-center px-1">
            <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
              :total="meta.total" show-edges />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
