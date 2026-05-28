<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()

const { classId } = defineProps<{
  classId: string
}>()
const store = useBehaviourStore()
const { records: data, meta, loading } = storeToRefs(store)

const editRcord = ref<Behaviour | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'kind',
    header: 'Type',
    cell: ({ row }: any) => parseBehaviourKind[row.original.kind]
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'note',
    header: 'Note'
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

function getRowItems(row: Row<Behaviour>) {
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
  get: () => Number(route.query.size ?? runtimeConf().limit),
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

async function fetchRecords() {
  if (classId == null) return
  loading.value = true
  await store.fetchAll(classId, page.value, size.value)
  loading.value = false
}

watch(() => page.value, () => {
  router.replace({
    query: {
      page: page.value
    }
  })

  fetchRecords()
}, { immediate: true })

watch(() => classId, () => fetchRecords(), { immediate: true })

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecords()
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <!-- Desktop -->
    <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />

          <p class="text-gray-500">
            No behaviour found.
          </p>
        </div>
      </template>

      <template #kind-cell="{ row }">
        <UBadge :label="parseBehaviourKind[row.original.kind]" :color="parseBehaviourKindColor[row.original.kind]"
          variant="outline" />
      </template>
      
      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>

    </UTable>
  </UCard>

  <!-- Mobile -->
  <div class="md:hidden bg-gray-50 dark:bg-neutral-950 min-h-[300px]">
    <!-- Loading -->
    <div v-if="loading" class="space-y-3 p-4">
      <div v-for="i in 4" :key="i" class="">
        <div class="flex items-center gap-3">
          <USkeleton class="h-12 w-12 rounded-2xl" />

          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-20" />
          </div>
        </div>

        <USkeleton class="mt-4 h-12 w-full rounded-2xl" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.length" class="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
      </div>

      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        No behaviour found
      </h3>

      <p class="mt-1 max-w-xs text-sm text-gray-500">
        Student behaviour records will appear here.
      </p>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-3 p-3">
      <UCard v-for="row in data" :key="row.id" class="overflow-hidden " :ui="{
        body: 'p-4'
      }">
        <div class="flex items-start justify-between gap-3">
          <!-- Left -->
          <div class="flex min-w-0 flex-1 gap-3">
            <!-- Avatar -->
            <div class="relative shrink-0">
              <UAvatar :alt="row.student" size="lg" class="ring-2 ring-white dark:ring-neutral-900" />

              <div
                class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-neutral-900"
                :class="[
                  row.kind === 'POSITIVE'
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                ]" />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ row.student }}
                </h3>

                <UBadge size="xs" variant="soft" :label="parseBehaviourKind[row.kind]"
                  :color="parseBehaviourKindColor[row.kind]" />
              </div>

              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ row.category }}
              </p>

              <!-- Note -->
              <div class="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60">
                <p class="line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-300">
                  {{ row.note || 'No note provided.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <UDropdownMenu :items="getRowItems({ original: row } as any)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" size="sm" variant="ghost" class="rounded-full" />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>
  </div>
</template>
