<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useFeeStore()
const { records, meta, loading } = storeToRefs(store)

const deleteModal = ref(false)
const selected = ref<FeeCategory>()

function remove(category: FeeCategory) {
  selected.value = category
  deleteModal.value = true
}

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

async function fetchRecord() {
  await store.fetchAll(page.value, size.value)
}

watch(
  () => [page.value],
  () => {
    fetchRecord()
  }
)

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }

  await fetchRecord()
  useAppStore().setTitle('Settings');
  document.title = 'Fee Categories | Fees Payment | Skultem';
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
  <div class="space-y-4 px-4 sm:px-6">
    <!-- Desktop -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-between space-x-3">
          <div class="space-x-3 flex flex-1">
            <UInput placeholder="Search by name . . ." />
            <FeeCategoryAdd />
          </div>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="records" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:wallet-cards" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                No fee categories found
              </h3>

              <p class="mt-1 text-sm text-gray-500">
                Fee categories and payment groups will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon name="lucide:receipt-text" class="text-primary-500" />
            </div>

            <div>
              <div class="flex items-center gap-1.5">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ row.original.name }}
                </p>
                <UBadge v-if="row.original.system" label="System" color="neutral" variant="subtle" size="xs" />
              </div>

              <p class="text-xs text-gray-500">
                {{ row.original.system ? 'Managed automatically - can\'t be edited or deleted' : 'Fee Category' }}
              </p>
            </div>
          </div>
        </template>

        <template #description-cell="{ row }">
          <p class="max-w-md text-sm leading-6 text-gray-500 line-clamp-2">
            {{
              row.original.description ||
              'No description available.'
            }}
          </p>
        </template>

        <template #actions-cell="{ row }">
          <div v-if="!row.original.system" class="flex justify-end gap-1">
            <FeeCategoryAdd :category="row.original" />

            <UButton
              :icon="DELETE_ICON"
              size="xs"
              color="error"
              variant="ghost"
              @click="remove(row.original)"
            />
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>
      <!-- Mobile -->
      <div class="space-y-3 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 4" :key="i" variant="outline">
            <div class="space-y-4 p-4">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <USkeleton class="size-12 rounded-2xl" />

                  <div class="space-y-2">
                    <USkeleton class="h-3 w-28" />
                    <USkeleton class="h-2 w-40" />
                  </div>
                </div>

                <USkeleton class="size-8 rounded-xl" />
              </div>

              <USkeleton class="h-16 rounded-2xl" />
            </div>
          </UCard>
        </template>
        <!-- Empty -->
        <UCard v-else-if="!records?.length" class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="lucide:wallet-cards" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

            <h3 class="text-sm font-semibold text-highlighted">
              No fee categories found
            </h3>

            <p class="mt-1 text-sm text-muted">
              Organize school fees into categories.
            </p>
          </div>
        </UCard>

        <!-- Cards -->
        <template v-else>
          <UCard v-for="item in records" :key="item.id"
            class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
            :ui="{ body: 'sm:p-0 p-0' }">

            <div class="border-b border-default p-3">
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 items-center gap-4">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-primary dark:bg-gray-800 dark:text-primary">
                    <UIcon name="i-lucide-book-open-text" class="size-5 text-primary group-hover:text-white" />
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <h3 class="truncate text-base font-semibold">{{ item.name }}</h3>
                      <UBadge v-if="item.system" label="System" color="neutral" variant="subtle" size="xs" />
                    </div>
                    <div class="flex items-center gap-2 text-xs-base text-muted">
                      {{ item.system ? "Managed automatically" : "Fee Category" }}
                    </div>
                  </div>
                </div>

                <div v-if="!item.system" class="flex shrink-0 gap-1">
                  <FeeCategoryAdd :category="item" />

                  <UButton
                    :icon="DELETE_ICON"
                    size="xs"
                    color="error"
                    variant="ghost"
                    @click="remove(item)"
                  />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="p-3">
              <div class="rounded-2xl border border-default bg-gray-50 p-3 dark:bg-neutral-800">
                <p class="text-xs leading-6 text-toned">
                  {{ item.description || "No description available." }}
                </p>
              </div>
            </div>
          </UCard>
        </template>
      </div>

      <FeeCategoryDeletePrompt
        v-if="selected"
        v-model:open="deleteModal"
        :category-id="selected.id"
        :category-name="selected.name"
      />

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

  </div>
</template>