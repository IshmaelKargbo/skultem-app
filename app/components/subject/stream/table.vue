<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useStreamStore()
const loading = ref(true)
const { records: data } = storeToRefs(store)

const editRcord = ref<Stream | null>(null)
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
    cell: ({ row }: any) => {
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

function getRowItems(row: Row<Stream>) {
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
    <UCard class="hidden md:block" :ui="{ body: 'sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No streams found.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>
      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="store.meta" />
          <UPagination size="sm" v-model:page="page" :page-size="store.meta.size" :items-per-page="store.meta.size"
            :total="store.meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <div class="space-y-3 md:hidden">
      <template v-if="loading">
        <UCard v-for="i in 4" :key="i" class="rounded-2xl border border-default" :ui="{ body: 'p-4' }">
          <div class="space-y-3">
            <div class="flex gap-3">
              <USkeleton class="size-11 rounded-xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-28" />
                <USkeleton class="h-3 w-20" />
              </div>
            </div>

            <USkeleton class="h-20 rounded-xl" />
          </div>
        </UCard>
      </template>

      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id" class="rounded-2xl border border-default shadow-sm"
          :ui="{ body: 'p-4' }">
          <div class="space-y-4">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">

              <div class="flex gap-3 min-w-0 flex-1">

                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <UIcon name="i-lucide-git-branch" class="size-5 text-primary" />
                </div>

                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-semibold text-highlighted">
                    {{ item.name }}
                  </h3>

                  <p class="mt-1 text-xs text-muted">
                    Academic Stream
                  </p>
                </div>

              </div>

              <UDropdownMenu :items="getRowItems({ original: item } as any)" :content="{ align: 'end' }">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="sm" variant="ghost"
                  class="rounded-xl" />
              </UDropdownMenu>

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
            <div class="flex items-center justify-between border-t border-default pt-3">
              <UBadge label="Active" color="success" variant="soft" />

              <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
            </div>

          </div>
        </UCard>
      </template>

      <template v-else>
        <UCard class="rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-4' }">
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No streams found.</p>
          </div>
        </UCard>
      </template>

      <div v-if="!loading && data?.length && store.meta.total > store.meta.size"
        class="flex flex-col items-center gap-3 pt-2">
        <Showing :meta="store.meta" />

        <UPagination v-model:page="page" size="sm" :page-size="store.meta.size" :items-per-page="store.meta.size"
          :total="store.meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
