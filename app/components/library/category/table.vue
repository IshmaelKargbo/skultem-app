<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()

const value = ref('')
const search = ref('')
const deleteModal = ref(false)
const selected = ref<BookCategory>()

const columns = computed(() => [
  { accessorKey: 'name', header: 'Category' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'books', header: 'Books' }
])

function remove(category: BookCategory) {
  selected.value = category
  deleteModal.value = true
}

// One scrolling list: the next categories load as the end comes into view.
const { items: categories, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<BookCategory>((page, size) => LibraryApi().listCategories(page, size, search.value) as any)

// A row opens the category's edit form (for those who can change them); Delete is in that form.
const editing = ref<BookCategory>()
const editOpen = ref(false)
function openCategory(category: BookCategory) {
  if (!canManage.value) return
  editing.value = category
  editOpen.value = true
}

let timeout: ReturnType<typeof setTimeout>
watch(value, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => { search.value = val.trim() }, 400)
})

watch(search, () => reload())
// A category added, edited or deleted (and book counts after books change).
watch(() => store.changeVersion, () => reload())

onBeforeUnmount(() => clearTimeout(timeout))

onMounted(reload)
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UInput data-guide="adm-search" v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or description" class="w-full sm:w-72" />
        <div data-guide="lib-cat-add"><LibraryCategoryAdd v-if="canManage" /></div>
      </div>
    </template>

    <!-- Desktop table -->
    <UTable class="hidden md:block" :columns="columns" :data="categories" :loading="loading"
      :ui="{ loading: 'py-0', tr: canManage ? 'cursor-pointer' : '' }"
      @select="(_e: Event, row: any) => openCategory(row.original)">
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
        <div v-for="item in categories" :key="item.id" @click="openCategory(item)"
          class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800"
          :class="{ 'cursor-pointer': canManage }">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-sm font-semibold">{{ item.name }}</h3>
                <UBadge size="sm" color="neutral" variant="subtle">{{ item.bookCount }}</UBadge>
              </div>
              <p class="truncate text-xs text-muted">{{ item.description || 'No description available.' }}</p>
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

    <div ref="sentinel">
      <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="categories.length"
        :total="meta?.total" noun="categories" :error="listError" @retry="loadMore" />
    </div>

    <!-- One edit form, opened by whichever row was clicked -->
    <LibraryCategoryAdd v-if="editing" :key="editing.id" v-model:open="editOpen" :category="editing" hide-trigger
      can-delete @delete="remove" />

    <LibraryCategoryDeletePrompt v-model:open="deleteModal" :category-id="selected?.id || ''"
      :category-name="selected?.name || ''" />
  </UCard>
</template>
