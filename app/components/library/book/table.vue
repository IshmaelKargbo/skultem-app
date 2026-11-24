<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { categoryOptions } = storeToRefs(store)

const value = ref('')
const search = ref('')
// No "All categories" entry - a Reka UI Combobox item's value can't be an empty string (it
// throws "A <ComboboxItem /> must have a value prop that is not an empty string" the moment the
// list renders, breaking every item in it). The placeholder covers "nothing selected", and the
// select's own :clear button gets back to it.
const categoryFilter = ref<string | undefined>()
// Same rule for the section filter. Only shown when the viewer has more than one section to choose from.
const sectionFilter = ref<string | undefined>()
const librarySections = useLibrarySections()
const { options: sectionOptions, showSections, nameOf: sectionName } = librarySections

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { id: 'category', header: 'Category' },
  { id: 'copies', header: 'Copies' },
  { accessorKey: 'shelf', header: 'Shelf' }
]


// One scrolling list: the next books load as the end comes into view. A row opens the book's page, where it is
// edited, issued or deleted.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<Book>((page, size) => LibraryApi().listBooks(page, size, {
    search: search.value,
    categoryId: categoryFilter.value || undefined,
    sectionId: sectionFilter.value || undefined
  }) as any)

function openBook(book: Book) {
  navigateTo(`/library/books/${book.id}`)
}

let timeout: ReturnType<typeof setTimeout>
watch(value, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => { search.value = val.trim() }, 400)
})

watch([search, categoryFilter, sectionFilter], () => reload())
// A book added, edited, issued or returned anywhere: copies and titles change.
watch(() => store.changeVersion, () => reload())

onBeforeUnmount(() => clearTimeout(timeout))

onMounted(() => {
  reload()
  store.fetchCategoryOptions()
  librarySections.load()
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <UInput data-guide="adm-search" v-model="value" :icon="SEARCH_ICON" placeholder="Search by title, author or ISBN" class="w-full sm:w-72" />
          <USelectMenu v-model="categoryFilter" value-key="value" :items="categoryOptions" placeholder="All categories"
            clear class="w-full sm:w-52" />
          <USelectMenu v-if="showSections" v-model="sectionFilter" value-key="value" :items="sectionOptions"
            placeholder="All sections" clear class="w-full sm:w-44" />
          <div data-guide="lib-book-add"><LibraryBookAdd v-if="canManage" /></div>
        </div>
      </div>
    </template>

    <!-- Desktop table -->
    <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading"
      :ui="{ loading: 'py-0', tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => openBook(row.original)">
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
        <div class="flex flex-wrap items-center gap-1">
          <UBadge color="neutral" variant="subtle">{{ row.original.category.name }}</UBadge>
          <UBadge v-if="showSections" :color="row.original.sectionId ? 'primary' : 'warning'" variant="subtle">
            {{ sectionName(row.original.sectionId) || 'No section' }}
          </UBadge>
        </div>
      </template>

      <template #copies-cell="{ row }">
        <UBadge :color="row.original.availableCopies > 0 ? 'success' : 'error'" variant="soft">
          {{ row.original.availableCopies }} / {{ row.original.totalCopies }} available
        </UBadge>
      </template>

      <template #shelf-cell="{ row }">
        <p class="text-sm text-gray-500">{{ row.original.shelf || '—' }}</p>
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
    <div class="md:hidden">
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
        <div v-for="book in data" :key="book.id" role="button" tabindex="0" @click="openBook(book)"
          @keydown.enter="openBook(book)"
          class="cursor-pointer border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
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

    <div ref="sentinel">
      <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
        :total="meta?.total" noun="books" :error="listError" @retry="loadMore" />
    </div>

  </UCard>
</template>
