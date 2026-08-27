<script setup lang="ts">
const store = useLibraryStore()
const { books, categories } = storeToRefs(store)

const view = ref<'table' | 'card'>('table')
const search = ref('')
const categoryFilter = ref('')
const deleteModal = ref(false)
const selected = ref<Book>()

const categoryOptions = computed(() => [
  { label: 'All categories', value: '' },
  ...categories.value.map(e => ({ label: e.name, value: e.id }))
])

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return books.value.filter(book => {
    const matchesSearch = !q
      || book.title.toLowerCase().includes(q)
      || book.author.toLowerCase().includes(q)
      || book.isbn.toLowerCase().includes(q)

    const matchesCategory = !categoryFilter.value || book.category.id === categoryFilter.value

    return matchesSearch && matchesCategory
  })
})

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'category.name', header: 'Category' },
  { id: 'copies', header: 'Copies' },
  { accessorKey: 'shelf', header: 'Shelf' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function remove(book: Book) {
  selected.value = book
  deleteModal.value = true
}
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search title, author or ISBN..." class="w-full sm:w-72" />
            <USelectMenu v-model="categoryFilter" value-key="value" :items="categoryOptions" placeholder="All categories" class="w-full sm:w-56" />
          </div>
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BOOK_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No books found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Books added to the library will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #title-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BOOK_ICON" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-highlighted">
                {{ row.original.title }}
              </p>

              <p class="text-xs text-muted">
                {{ row.original.author }} · {{ row.original.isbn }}
              </p>
            </div>
          </div>
        </template>

        <template #copies-cell="{ row }">
          <UBadge :color="row.original.availableCopies > 0 ? 'success' : 'error'" variant="soft">
            {{ row.original.availableCopies }} / {{ row.original.totalCopies }} available
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              :to="`/library/books/${row.original.id}`"
              :icon="VIEW_ICON"
              size="xs"
              color="neutral"
              variant="ghost"
            />

            <LibraryBookAdd :book="row.original" />

            <UButton
              :icon="DELETE_ICON"
              size="xs"
              color="error"
              variant="ghost"
              @click="remove(row.original)"
            />
          </div>
        </template>
      </UTable>

      <!-- Mobile / Card -->
      <div class="p-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'">
      <template v-if="data.length">
        <UCard
          v-for="book in data"
          :key="book.id"
          class="overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="border-b border-default p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
                  <UIcon :name="BOOK_ICON" class="text-xl text-primary-500" />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ book.title }}
                  </h3>

                  <p class="truncate text-xs-base text-muted">
                    {{ book.author }} · {{ book.isbn }}
                  </p>
                </div>
              </div>

              <UBadge
                :label="book.availableCopies > 0 ? 'Available' : 'Out'"
                :color="book.availableCopies > 0 ? 'success' : 'error'"
                variant="soft"
              />
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Category -->
            <div class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-tag" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Category
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ book.category.name }}
              </p>
            </div>

            <!-- Shelf -->
            <div class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <UIcon name="i-lucide-bookmark" class="size-4 text-amber-600 dark:text-amber-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Shelf
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ book.shelf || 'N/A' }}
              </p>
            </div>

            <!-- Copies -->
            <div class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <UIcon name="i-lucide-copy" class="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Copies
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ book.availableCopies }} / {{ book.totalCopies }}
              </p>
            </div>

            <!-- Publisher -->
            <div class="min-w-0 rounded-2xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/20 dark:bg-sky-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/20">
                  <UIcon name="i-lucide-building-2" class="size-4 text-sky-600 dark:text-sky-400" />
                </div>

                <p class="text-[10px] font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
                  Publisher
                </p>
              </div>

              <p class="truncate text-sm font-medium text-highlighted">
                {{ book.publisher || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 border-t border-default p-4">
            <UButton
              :to="`/library/books/${book.id}`"
              label="View"
              trailing-icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              size="sm"
              class="rounded-xl"
            />

            <div class="flex items-center gap-1">
              <LibraryBookAdd :book="book" />

              <UButton
                :icon="DELETE_ICON"
                size="sm"
                color="error"
                variant="ghost"
                @click="remove(book)"
              />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full">
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BOOK_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No books found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Books added to the library will appear here.
              </p>
            </div>
          </div>
        </UCard>
      </template>
      </div>
    </UCard>

    <LibraryBookDeletePrompt
      v-model:open="deleteModal"
      :book-id="selected?.id || ''"
      :book-title="selected?.title || ''"
    />
  </div>
</template>
