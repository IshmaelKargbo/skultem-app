<script setup lang="ts">
const store = useLibraryStore()
const { books, categories } = storeToRefs(store)

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
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search title, author or ISBN..." class="w-full sm:w-72" />
      <USelectMenu v-model="categoryFilter" value-key="value" :items="categoryOptions" placeholder="All categories" class="w-full sm:w-56" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
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
    </UCard>

    <LibraryBookDeletePrompt
      v-model:open="deleteModal"
      :book-id="selected?.id || ''"
      :book-title="selected?.title || ''"
    />
  </div>
</template>
