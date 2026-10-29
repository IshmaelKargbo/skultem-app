<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { categories, categoriesMeta: meta, categoriesLoading: loading } = storeToRefs(store)

const value = ref('')
const search = ref('')
const page = ref(1)
const size = runtimeConf().limit
const deleteModal = ref(false)
const selected = ref<BookCategory>()

const columns = computed(() => [
  { accessorKey: 'name', header: 'Category' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'books', header: 'Books' },
  ...(canManage.value ? [{ id: 'actions', meta: { class: { td: 'text-right' } } }] : [])
])

function remove(category: BookCategory) {
  selected.value = category
  deleteModal.value = true
}

function load() {
  return store.fetchCategories(page.value, size, search.value)
}

let timeout: ReturnType<typeof setTimeout>
watch(value, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => { search.value = val.trim() }, 400)
})

watch(search, () => {
  if (page.value === 1) load()
  else page.value = 1
})

watch(page, load)

onMounted(load)
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or description" class="w-full sm:w-72" />
        <LibraryCategoryAdd v-if="canManage" />
      </div>
    </template>

    <!-- Desktop table -->
    <UTable class="hidden md:block" :columns="columns" :data="categories" :loading="loading">
      <template #name-cell="{ row }">
        <div>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</p>
            <p class="text-xs text-gray-500">Book Category</p>
          </div>
        </div>
      </template>

      <template #description-cell="{ row }">
        <p class="max-w-md text-sm text-gray-500 line-clamp-2">
          {{ row.original.description || 'No description available.' }}
        </p>
      </template>

      <template #books-cell="{ row }">
        <UBadge color="neutral" variant="subtle" :icon="BOOK_ICON">
          {{ row.original.bookCount }} {{ row.original.bookCount === 1 ? 'book' : 'books' }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <LibraryCategoryAdd :category="row.original" />
          <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(row.original)" />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="lucide:folder-open" class="text-4xl text-primary-500" />
          </div>

          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">No categories found</h3>
            <p class="mt-1 text-sm text-gray-500">Create categories to organize the library's books.</p>
          </div>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>

    <!-- Mobile list -->
    <div class="md:hidden">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-40" />
            </div>
            <div class="flex gap-1">
              <USkeleton class="h-7 w-7 rounded-full" />
              <USkeleton class="h-7 w-7 rounded-full" />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="categories.length">
        <div v-for="item in categories" :key="item.id" class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-sm font-semibold">{{ item.name }}</h3>
                <UBadge size="sm" color="neutral" variant="subtle">{{ item.bookCount }}</UBadge>
              </div>
              <p class="truncate text-xs text-muted">{{ item.description || 'No description available.' }}</p>
            </div>

            <div v-if="canManage" class="flex shrink-0 items-center gap-1">
              <LibraryCategoryAdd :category="item" />
              <UButton :icon="DELETE_ICON" size="xs" color="error" variant="ghost" @click="remove(item)" />
            </div>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center py-16 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon name="lucide:folder-open" class="size-10 text-muted" />
        </div>
        <h3 class="mt-4 text-sm font-semibold">No categories found</h3>
        <p class="mt-1 text-sm text-muted">Create categories to organize the library's books.</p>
      </div>
    </div>

    <template v-if="meta.total" #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </template>

    <LibraryCategoryDeletePrompt v-model:open="deleteModal" :category-id="selected?.id || ''"
      :category-name="selected?.name || ''" />
  </UCard>
</template>
