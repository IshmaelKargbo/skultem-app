<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { books: data, booksMeta: meta, booksLoading: loading, categoryOptions } = storeToRefs(store)

const view = ref<'table' | 'card'>('table')
const value = ref('')
const search = ref('')
// No "All categories" entry - a Reka UI Combobox item's value can't be an empty string (it
// throws "A <ComboboxItem /> must have a value prop that is not an empty string" the moment the
// list renders, breaking every item in it). The placeholder covers "nothing selected", and the
// select's own :clear button gets back to it.
const categoryFilter = ref<string | undefined>()
const page = ref(1)
const size = runtimeConf().limit

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { id: 'category', header: 'Category' },
  { id: 'copies', header: 'Copies' },
  { accessorKey: 'shelf', header: 'Shelf' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]


function load() {
  return store.fetchBooks(page.value, size, { search: search.value, categoryId: categoryFilter.value || undefined })
}

let timeout: ReturnType<typeof setTimeout>
watch(value, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => { search.value = val.trim() }, 400)
})

watch([search, categoryFilter], () => {
  if (page.value === 1) load()
  else page.value = 1
})

watch(page, load)

onMounted(() => {
  load()
  store.fetchCategoryOptions()
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by title, author or ISBN" class="w-full sm:w-72" />
          <USelectMenu v-model="categoryFilter" value-key="value" :items="categoryOptions" placeholder="All categories"
            clear class="w-full sm:w-52" />
          <LibraryBookAdd v-if="canManage" />
        </div>
        <TableViewToggle v-model="view" />
      </div>
    </template>

    <!-- Desktop table -->
    <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #title-cell="{ row }">
        <div class="min-w-0">
          <div>
            <ULink :to="`/library/books/${row.original.id}`" class="block max-w-xs truncate font-medium text-gray-900 hover:text-primary dark:text-white">
              {{ row.original.title }}
            </ULink>
            <p class="max-w-xs truncate text-xs text-gray-500">
              {{ row.original.author }}<template v-if="row.original.isbn"> · {{ row.original.isbn }}</template>
            </p>
          </div>
        </div>
      </template>

      <template #category-cell="{ row }">
        <UBadge color="neutral" variant="subtle">{{ row.original.category.name }}</UBadge>
      </template>

      <template #copies-cell="{ row }">
        <UBadge :color="row.original.availableCopies > 0 ? 'success' : 'error'" variant="soft">
          {{ row.original.availableCopies }} / {{ row.original.totalCopies }} available
        </UBadge>
      </template>

      <template #shelf-cell="{ row }">
        <p class="text-sm text-gray-500">{{ row.original.shelf || '—' }}</p>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UButton :to="`/library/books/${row.original.id}`" :icon="VIEW_ICON" size="xs" color="neutral" variant="ghost" />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="BOOK_ICON" class="text-4xl text-primary-500" />
          </div>

          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">No books found</h3>
            <p class="mt-1 text-sm text-gray-500">Books added to the library will appear here.</p>
          </div>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>

    <!-- Mobile list -->
    <div v-if="view === 'table'" class="md:hidden">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-2">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-3 w-24" />
            </div>
            <USkeleton class="h-6 w-20 rounded-full" />
          </div>
        </div>
      </template>

      <template v-else-if="data.length">
        <div v-for="book in data" :key="book.id" class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
          <div class="flex items-center justify-between gap-3">
            <NuxtLink :to="`/library/books/${book.id}`" class="min-w-0 space-y-1">
              <h3 class="truncate text-sm font-semibold">{{ book.title }}</h3>
              <div class="flex items-center gap-2 text-xs text-muted">
                <p class="truncate">{{ book.author }}</p>
                <p>·</p>
                <p class="truncate">{{ book.category.name }}</p>
              </div>
            </NuxtLink>

            <UBadge class="shrink-0" size="sm" variant="soft" :color="book.availableCopies > 0 ? 'success' : 'error'"
              :label="`${book.availableCopies} / ${book.totalCopies}`" />
          </div>

          <div class="mt-2 flex items-center justify-between">
            <p class="text-xs text-muted">{{ book.shelf ? `Shelf ${book.shelf}` : 'No shelf set' }}</p>

            <UButton :to="`/library/books/${book.id}`" :icon="VIEW_ICON" size="xs" color="neutral" variant="ghost" />
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center py-16 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon :name="BOOK_ICON" class="size-10 text-muted" />
        </div>
        <h3 class="mt-4 text-sm font-semibold">No books found</h3>
        <p class="mt-1 text-sm text-muted">Books added to the library will appear here.</p>
      </div>
    </div>

    <!-- Card view -->
    <div v-else class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div class="flex gap-3">
            <div class="flex-1 space-y-3">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-3 w-24" />
              <div class="grid grid-cols-2 gap-2 pt-2">
                <USkeleton class="h-14 rounded-2xl" />
                <USkeleton class="h-14 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!data.length"
        class="col-span-full flex min-h-[50vh] flex-col items-center justify-center rounded-4xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div class="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary-50 dark:bg-primary-500/10">
          <UIcon :name="BOOK_ICON" class="text-5xl text-primary-500" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">No books found</h3>
        <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">Books added to the library will appear here.</p>
      </div>

      <template v-else>
        <UCard v-for="book in data" :key="book.id" :ui="{ body: 'p-0 sm:p-0' }">
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 border-b border-gray-200 p-3 dark:border-gray-800">
            <NuxtLink :to="`/library/books/${book.id}`" class="flex min-w-0 items-center gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">{{ book.title }}</h3>
                <div class="mt-1 flex items-center gap-1.5">
                  <UIcon name="i-lucide-user-round" class="size-3.5 shrink-0 text-muted" />
                  <p class="truncate text-xs text-muted">{{ book.author }}</p>
                </div>
              </div>
            </NuxtLink>

            <div class="flex shrink-0 flex-col items-end gap-2">
              <UBadge :color="book.availableCopies > 0 ? 'success' : 'error'" variant="soft" size="sm"
                :icon="book.availableCopies > 0 ? 'i-lucide-check-circle' : 'i-lucide-circle-alert'">
                {{ book.availableCopies > 0 ? 'Available' : 'All on loan' }}
              </UBadge>

            </div>
          </div>

          <div class="p-4">
            <!-- Copies overview -->
            <div class="flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
              <div>
                <p class="text-xs text-muted">Available Copies</p>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="text-3xl font-bold tracking-tight text-highlighted">{{ book.availableCopies }}</span>
                  <span class="text-sm text-muted">of {{ book.totalCopies }}</span>
                </div>
              </div>

              <div class="text-right">
                <p class="text-xs text-muted">On Loan</p>
                <p class="mt-1 text-lg font-semibold text-highlighted">{{ book.totalCopies - book.availableCopies }}</p>
              </div>
            </div>

            <!-- Details -->
            <div class="mt-3 grid grid-cols-2 gap-3">
              <div class="min-w-0 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                    <UIcon name="i-lucide-layers-2" class="size-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Category</p>
                </div>
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ book.category.name }}</p>
              </div>

              <div class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <UIcon name="i-lucide-map-pin" class="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">Shelf</p>
                </div>
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ book.shelf || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between border-t border-default p-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="min-w-0">
                <p class="text-[11px] text-muted">Publisher</p>
                <p class="mt-0.5 truncate text-sm font-medium text-highlighted">{{ book.publisher || '—' }}</p>
              </div>
            </div>

            <UButton :to="`/library/books/${book.id}`" label="View" trailing-icon="i-lucide-chevron-right"
              color="neutral" variant="ghost" size="sm" />
          </div>
        </UCard>
      </template>
    </div>

    <template v-if="meta.total" #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </template>

  </UCard>
</template>
