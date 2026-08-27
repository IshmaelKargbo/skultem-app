<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useLibraryStore()
const { format } = useMoney()

const book = computed(() => store.getBook(route.params.id as string))
const history = computed(() => book.value ? store.loansByBook(book.value.id) : [])

const currentlyIssued = computed(() => book.value ? book.value.totalCopies - book.value.availableCopies : 0)
const availability = computed(() =>
  book.value && book.value.totalCopies > 0
    ? Math.round((book.value.availableCopies / book.value.totalCopies) * 100)
    : 0
)

const columns = [
  { id: 'member', header: 'Member' },
  { accessorKey: 'issueDate', header: 'Issued' },
  { accessorKey: 'dueDate', header: 'Due' },
  { id: 'returned', header: 'Returned' },
  { id: 'fine', header: 'Fine' },
  { id: 'status', header: 'Status' }
]

onMounted(() => {
  useAppStore().setTitle('Book Details')
  document.title = 'Book Details | Skultem'
  store.refreshOverdue()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
  <div v-if="!book" class="p-4 md:px-6">
    <UCard>
      <div class="flex flex-col items-center gap-3 py-16 text-center">
        <UIcon :name="BOOK_ICON" class="text-4xl text-muted" />
        <h3 class="font-semibold text-highlighted">Book not found</h3>
        <p class="text-sm text-muted">It may have been removed from the catalog.</p>
        <UButton to="/library/books" label="Back to Books" variant="soft" class="mt-2" />
      </div>
    </UCard>
  </div>

  <div v-else class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
    <Heading title="Book Details" :subtitle="book.title">
      <div class="flex items-center gap-2">
        <UButton :icon="BACK_ICON" label="Back" variant="outline" color="neutral" size="sm" @click="router.back()" />

        <LibraryBookAdd :book="book">
          <template #trigger="{ open }">
            <UButton :icon="EDIT_ICON" label="Edit" size="sm" @click="open" />
          </template>
        </LibraryBookAdd>
      </div>
    </Heading>

    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Left column -->
      <div class="space-y-4 lg:col-span-1">
        <UCard>
          <div class="flex flex-col items-center text-center">
            <div class="flex size-28 items-center justify-center rounded-2xl bg-primary text-4xl font-bold text-inverted">
              {{ book.title.charAt(0).toUpperCase() }}
            </div>

            <h2 class="mt-4 text-lg font-semibold text-highlighted">
              {{ book.title }}
            </h2>

            <p class="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <UIcon name="i-lucide-user-round" class="size-3.5" />
              {{ book.author }}
            </p>

            <UBadge
              :color="book.availableCopies > 0 ? 'success' : 'error'"
              variant="subtle"
              class="mt-4 w-full justify-center py-2"
              :icon="book.availableCopies > 0 ? 'i-lucide-check-circle' : 'i-lucide-circle-alert'"
            >
              {{ book.availableCopies }} of {{ book.totalCopies }} available
            </UBadge>

            <div class="mt-4 w-full space-y-2">
              <div class="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-neutral-800">
                <p class="text-sm text-muted">Publisher</p>
                <p class="font-medium">{{ book.publisher }}</p>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-neutral-800">
                <p class="text-sm text-muted">Category</p>
                <p class="font-medium">{{ book.category.name }}</p>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-neutral-800">
                <p class="text-sm text-muted">ISBN</p>
                <p class="font-medium">{{ book.isbn }}</p>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-neutral-800">
                <p class="text-sm text-muted">Shelf</p>
                <UBadge color="neutral" variant="subtle" :icon="'i-lucide-map-pin'">{{ book.shelf }}</UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-3" class="size-5 text-primary" />
              <h3 class="font-semibold">Statistics</h3>
            </div>
          </template>

          <div class="space-y-1">
            <div class="flex items-center justify-between rounded-lg p-2.5">
              <p class="text-sm text-muted">Total Copies</p>
              <p class="font-semibold text-highlighted">{{ book.totalCopies }}</p>
            </div>

            <div class="flex items-center justify-between rounded-lg p-2.5">
              <p class="text-sm text-muted">Available</p>
              <p class="font-semibold text-success">{{ book.availableCopies }}</p>
            </div>

            <div class="flex items-center justify-between rounded-lg p-2.5">
              <p class="text-sm text-muted">Currently Issued</p>
              <p class="font-semibold text-warning">{{ currentlyIssued }}</p>
            </div>

            <div class="flex items-center justify-between rounded-lg p-2.5">
              <p class="text-sm text-muted">Times Issued (All Time)</p>
              <p class="font-semibold text-highlighted">{{ history.length }}</p>
            </div>
          </div>

          <div class="mt-2 border-t border-default pt-4">
            <UProgress :model-value="availability" :color="availability > 0 ? 'success' : 'error'" size="sm" />
            <p class="mt-2 text-sm text-muted">{{ availability }}% availability</p>
          </div>
        </UCard>
      </div>

      <!-- Right column -->
      <div class="lg:col-span-2">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-history" class="size-5 text-primary" />
                <h3 class="font-semibold">Issue History</h3>
              </div>

              <UBadge color="neutral" variant="subtle" size="sm">{{ history.length }} total</UBadge>
            </div>
          </template>

          <UTable :columns="columns" :data="history">
            <template #empty-state>
              <div class="flex flex-col items-center gap-3 py-16">
                <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
                  <UIcon name="i-lucide-history" class="text-3xl text-primary-500" />
                </div>

                <div class="text-center">
                  <h3 class="font-semibold text-highlighted">Never issued</h3>
                  <p class="mt-1 text-sm text-muted">This book has not been checked out yet.</p>
                </div>
              </div>
            </template>

            <template #member-cell="{ row }">
              <p class="font-medium text-highlighted">{{ row.original.borrowerName }}</p>
              <p class="text-xs text-muted">
                {{ row.original.borrowerType === 'TEACHER' ? 'Teacher' : 'Student' }} · {{ row.original.borrowerClass }}
              </p>
            </template>

            <template #issueDate-cell="{ row }">
              <p class="text-sm text-muted">{{ formatDate(row.original.issueDate) }}</p>
            </template>

            <template #dueDate-cell="{ row }">
              <p class="text-sm text-muted">{{ formatDate(row.original.dueDate) }}</p>
            </template>

            <template #returned-cell="{ row }">
              <p class="text-sm text-muted">
                {{ row.original.returnDate ? formatDate(row.original.returnDate) : '—' }}
              </p>
            </template>

            <template #fine-cell="{ row }">
              <p class="text-sm" :class="loanFine(row.original) > 0 ? 'font-medium text-error' : 'text-muted'">
                {{ loanFine(row.original) > 0 ? format(loanFine(row.original)) : '—' }}
              </p>
            </template>

            <template #status-cell="{ row }">
              <UBadge :color="loanStatusStyle[row.original.status].color" variant="soft">
                {{ loanStatusStyle[row.original.status].label }}
              </UBadge>
            </template>
          </UTable>
        </UCard>
      </div>
    </div>
  </div>
</template>
