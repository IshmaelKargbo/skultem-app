<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const details = computed(() => book.value ? [
  { label: 'Author', value: book.value.author, icon: 'i-lucide-user-round' },
  { label: 'Category', value: book.value.category.name, icon: 'i-lucide-layers-2' },
  { label: 'Publisher', value: book.value.publisher, icon: 'i-lucide-building-2' },
  { label: 'ISBN', value: book.value.isbn, icon: 'i-lucide-barcode' },
  { label: 'Shelf', value: book.value.shelf, icon: 'i-lucide-map-pin' },
  { label: 'Added', value: formatDate(book.value.addedAt), icon: 'i-lucide-calendar-plus' }
] : [])
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { format } = useMoney()
const { book, bookLoading, bookLoans: history, bookLoansMeta: historyMeta, bookLoansLoading } = storeToRefs(store)

const bookId = computed(() => route.params.id as string)
const historyPage = ref(1)
const deleteModal = ref(false)
const editRef = ref()

const actionItems = computed(() => [
  [
    { label: 'Edit book', icon: EDIT_ICON, onSelect: () => editRef.value?.open() },
    { label: 'Delete book', icon: DELETE_ICON, color: 'error' as const, onSelect: () => { deleteModal.value = true } }
  ]
])
const returningId = ref('')
const { success: toastSuccess, error: toastError } = useNotify()

// Puts the copy back; the store updates this book's counts and the history row in place.
async function returnBook(loan: BookLoan) {
  returningId.value = loan.id
  try {
    await store.returnBook(loan.id)
    toastSuccess(`Returned by ${loan.borrowerName}`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to return book')
  } finally {
    returningId.value = ''
  }
}

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
  { id: 'status', header: 'Status' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]
// Teachers see the history but can't return books from it.
const visibleColumns = computed(() => canManage.value ? columns : columns.filter(c => c.id !== 'actions'))

watch(historyPage, (page) => store.fetchBookLoans(bookId.value, page))

onMounted(async () => {
  useAppStore().setTitle('Book Details')
  useAppStore().setBack('/library/books')
  document.title = 'Book Details | Skultem'
  store.book = null
  await Promise.all([store.fetchBook(bookId.value), store.fetchBookLoans(bookId.value, 1)])
})

definePageMeta({
  // Teachers can look things up; the manage actions are hidden for them (useLibraryAccess).
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN, Role.TEACHER]
})
</script>

<template>
  <div class="px-4 md:px-6 space-y-3">
    <LibrarySectionNav />

    <!-- Loading -->
    <template v-if="bookLoading && !book">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="space-y-2">
            <USkeleton class="h-5 w-48" />
            <USkeleton class="h-3 w-32" />
          </div>
        </div>
      </UCard>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-20 rounded-2xl" />
      </div>
    </template>

    <!-- Not found -->
    <UCard v-else-if="!book">
      <div class="flex flex-col items-center gap-3 py-16">
        <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
          <UIcon :name="BOOK_ICON" class="text-4xl text-primary-500" />
        </div>
        <div class="text-center">
          <h3 class="font-semibold text-gray-900 dark:text-white">Book not found</h3>
          <p class="mt-1 text-sm text-gray-500">It may have been removed from the catalog.</p>
        </div>
        <UButton to="/library/books" label="Back to Books" color="neutral" variant="outline" size="sm" :icon="BACK_ICON" />
      </div>
    </UCard>

    <template v-else>
      <!-- Book overview -->
      <UCard class="overflow-hidden">
        <template #header>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-4">
              <div class="min-w-0">
                <h2 class="truncate text-lg font-semibold text-highlighted md:text-xl">{{ book.title }}</h2>
                <p class="truncate text-xs-base text-muted">{{ book.author }} · {{ book.category.name }}</p>
              </div>
            </div>

            <!-- Edit and delete are for the people who run the library, not teachers. -->
            <div v-if="canManage" class="flex shrink-0 items-center gap-2">
              <UDropdownMenu :items="actionItems" :content="{ align: 'end' }">
                <UButton size="sm" color="neutral" variant="outline" label="Actions" trailing-icon="i-lucide-settings-2" />
              </UDropdownMenu>

              <LibraryBookAdd ref="editRef" :book="book">
                <template #trigger />
              </LibraryBookAdd>
            </div>
          </div>
        </template>

        <div class="grid gap-4 lg:grid-cols-3">
          <!-- Details -->
          <div class="grid gap-3 sm:grid-cols-2 lg:col-span-2">
            <div v-for="item in details" :key="item.label"
              class="rounded-2xl border border-default bg-gray-100 p-4 transition hover:border-primary/40 dark:bg-neutral-800">
              <div class="flex items-center gap-2 text-muted">
                <UIcon :name="item.icon" class="size-4" />
                <p class="text-xs uppercase tracking-wide">{{ item.label }}</p>
              </div>
              <p class="mt-2 truncate font-semibold">{{ item.value || '—' }}</p>
            </div>
          </div>

          <!-- Copies -->
          <div class="flex flex-col justify-between rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs text-muted">Available Copies</p>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="text-4xl font-bold tracking-tight text-highlighted">{{ book.availableCopies }}</span>
                  <span class="text-sm text-muted">of {{ book.totalCopies }}</span>
                </div>
              </div>

              <UBadge :color="book.availableCopies > 0 ? 'success' : 'error'" variant="soft"
                :icon="book.availableCopies > 0 ? 'i-lucide-check-circle' : 'i-lucide-circle-alert'">
                {{ book.availableCopies > 0 ? 'Available' : 'All on loan' }}
              </UBadge>
            </div>

            <div class="mt-4">
              <UProgress :model-value="availability" :color="availability > 0 ? 'success' : 'error'" size="sm" />
              <p class="mt-2 text-xs text-muted">{{ availability }}% of copies on the shelf</p>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3 border-t border-default pt-4">
              <div>
                <p class="text-xs text-muted">On Loan</p>
                <p class="mt-0.5 text-lg font-semibold text-warning">{{ currentlyIssued }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Times Issued</p>
                <p class="mt-0.5 text-lg font-semibold text-highlighted">{{ historyMeta.total ?? 0 }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Issue history -->
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-history" class="size-5 text-primary" />
                <h3 class="font-semibold md:text-lg">Issue History</h3>
              </div>
              <p class="text-xs-base text-muted">Everyone who has borrowed this book.</p>
            </div>

            <UBadge color="neutral" variant="subtle">{{ historyMeta.total ?? 0 }} total</UBadge>
          </div>
        </template>

        <UTable class="hidden md:block" :columns="visibleColumns" :data="history" :loading="bookLoansLoading">
          <template #member-cell="{ row }">
            <p class="font-medium text-gray-900 dark:text-white">{{ row.original.borrowerName }}</p>
            <p class="text-xs text-gray-500">{{ borrowerLabel(row.original) }}</p>
          </template>

          <template #issueDate-cell="{ row }">
            <p class="text-sm text-gray-500">{{ formatDate(row.original.issueDate) }}</p>
          </template>

          <template #dueDate-cell="{ row }">
            <p class="text-sm" :class="row.original.status === 'OVERDUE' ? 'font-medium text-error' : 'text-gray-500'">
              {{ formatDate(row.original.dueDate) }}
            </p>
          </template>

          <template #returned-cell="{ row }">
            <p class="text-sm text-gray-500">{{ row.original.returnDate ? formatDate(row.original.returnDate) : '—' }}</p>
          </template>

          <template #fine-cell="{ row }">
            <p class="text-sm" :class="loanFine(row.original) > 0 ? 'font-medium text-error' : 'text-gray-500'">
              {{ loanFine(row.original) > 0 ? format(loanFine(row.original)) : '—' }}
            </p>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="loanStatusStyle[row.original.status].color" variant="soft">
              {{ loanStatusStyle[row.original.status].label }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UButton v-if="row.original.status !== 'RETURNED'" :icon="RETURN_BOOK_ICON" size="xs" color="success"
                variant="soft" label="Return" :loading="returningId === row.original.id" @click="returnBook(row.original)" />
            </div>
          </template>

          <template #empty>
            <div class="flex flex-col items-center gap-3 py-16">
              <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
                <UIcon name="i-lucide-history" class="text-4xl text-primary-500" />
              </div>
              <div class="text-center">
                <h3 class="font-semibold text-gray-900 dark:text-white">Never issued</h3>
                <p class="mt-1 text-sm text-gray-500">This book hasn't been checked out yet.</p>
              </div>
            </div>
          </template>

          <template #loading>
            <TableLoading :size="visibleColumns.length" />
          </template>
        </UTable>

        <!-- Mobile list -->
        <div class="md:hidden">
          <template v-if="bookLoansLoading">
            <div v-for="i in 3" :key="i" class="space-y-2 border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-3 w-28" />
            </div>
          </template>

          <template v-else-if="history.length">
            <div v-for="loan in history" :key="loan.id" class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0 space-y-1">
                  <h3 class="truncate text-sm font-semibold">{{ loan.borrowerName }}</h3>
                  <p class="truncate text-xs text-muted">{{ borrowerLabel(loan) }}</p>
                </div>
                <UBadge class="shrink-0" size="sm" variant="soft" :color="loanStatusStyle[loan.status].color"
                  :label="loanStatusStyle[loan.status].label" />
              </div>
              <div class="mt-2 flex items-center justify-between gap-3">
                <p class="text-xs text-muted">
                  {{ formatDate(loan.issueDate) }} → due {{ formatDate(loan.dueDate) }}
                  <template v-if="loanFine(loan) > 0"> · <span class="text-error">{{ format(loanFine(loan)) }} fine</span></template>
                </p>

                <UButton v-if="canManage && loan.status !== 'RETURNED'" :icon="RETURN_BOOK_ICON" size="xs" color="success"
                  variant="soft" label="Return" :loading="returningId === loan.id" @click="returnBook(loan)" />
              </div>
            </div>
          </template>

          <div v-else class="flex flex-col items-center py-16 text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <UIcon name="i-lucide-history" class="size-10 text-muted" />
            </div>
            <h3 class="mt-4 text-sm font-semibold">Never issued</h3>
            <p class="mt-1 text-sm text-muted">This book hasn't been checked out yet.</p>
          </div>
        </div>

        <template v-if="(historyMeta.total ?? 0) > (historyMeta.size ?? 0)" #footer>
          <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
            <Showing :meta="historyMeta" />
            <UPagination v-model:page="historyPage" size="sm" :items-per-page="historyMeta.size" :total="historyMeta.total" show-edges />
          </div>
        </template>
      </UCard>

      <LibraryBookDeletePrompt v-if="canManage" v-model:open="deleteModal" :book-id="book.id" :book-title="book.title"
        @deleted="router.push('/library/books')" />
    </template>
  </div>
</template>
