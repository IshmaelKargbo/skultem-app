<script setup lang="ts">
const store = useLibraryStore()
const { categories } = storeToRefs(store)

const search = ref('')
const deleteModal = ref(false)
const selected = ref<BookCategory>()

const data = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return categories.value

  return categories.value.filter(e =>
    e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
  )
})

const bookCount = (categoryId: string) =>
  useLibraryStore().books.filter(b => b.category.id === categoryId).length

const columns = [
  { accessorKey: 'name', header: 'Category' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'books', header: 'Books' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function remove(category: BookCategory) {
  selected.value = category
  deleteModal.value = true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search categories..." class="w-full sm:w-72" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BOOK_CATEGORY_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No categories found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Create categories to organize the library's books.
              </p>
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BOOK_CATEGORY_ICON" class="text-primary-500" />
            </div>

            <p class="font-medium text-highlighted">
              {{ row.original.name }}
            </p>
          </div>
        </template>

        <template #description-cell="{ row }">
          <p class="max-w-md text-sm text-muted line-clamp-2">
            {{ row.original.description || 'No description available.' }}
          </p>
        </template>

        <template #books-cell="{ row }">
          <UBadge color="neutral" variant="subtle">
            {{ bookCount(row.original.id) }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <LibraryCategoryAdd :category="row.original" />

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

    <LibraryCategoryDeletePrompt
      v-model:open="deleteModal"
      :category-id="selected?.id || ''"
      :category-name="selected?.name || ''"
    />
  </div>
</template>
