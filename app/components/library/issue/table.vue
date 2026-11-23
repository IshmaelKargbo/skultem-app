<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { success: toastSuccess, error: toastError } = useNotify()

const value = ref('')
const search = ref('')
// Starts from ?status= so links like "View all overdue" open the right view.
const initialStatus = String(useRoute().query.status || '').toUpperCase()
const statusFilter = ref<'ALL' | LoanStatus>(
  loanStatusOptions.some(o => o.value === initialStatus) ? initialStatus as LoanStatus : 'ALL'
)
const returningId = ref('')

const columns = computed(() => [
  { id: 'book', header: 'Book' },
  { accessorKey: 'borrowerName', header: 'Borrower' },
  { accessorKey: 'issueDate', header: 'Issued' },
  { accessorKey: 'dueDate', header: 'Due' },
  { id: 'status', header: 'Status' },
  ...(canManage.value ? [{ id: 'actions', meta: { class: { td: 'text-right' } } }] : [])
])

// One scrolling list: the next loans load as the end comes into view. Return stays on the row - returning books is
// what this list is for; the rest of the row opens the book.
const { items: data, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<BookLoan>((page, size) =>
    LibraryApi().listLoans(page, size, { search: search.value, status: statusFilter.value }) as any)

function openBook(loan: BookLoan) {
  navigateTo(`/library/books/${loan.book.id}`)
}

// Our own return already updated the row; the change it adds to the store's counter shouldn't also reload the list.
let ownVersion = -1

async function returnBook(loan: BookLoan) {
  returningId.value = loan.id
  try {
    ownVersion = store.changeVersion + 1
    const returned = await store.returnBook(loan.id)
    toastSuccess(`"${loan.book.title}" marked as returned`)
    // A returned loan no longer belongs in the Issued / Overdue views; elsewhere it updates in place.
    if (statusFilter.value === 'ISSUED' || statusFilter.value === 'OVERDUE') {
      data.value = data.value.filter(l => l.id !== loan.id)
      if (meta.value) meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 1) - 1) }
    } else if (returned) {
      data.value = data.value.map(l => (l.id === loan.id ? returned : l))
    }
  } catch (err: any) {
    toastError(err?.message || 'Failed to return book')
  } finally {
    returningId.value = ''
  }
}

let timeout: ReturnType<typeof setTimeout>
watch(value, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => { search.value = val.trim() }, 400)
})

watch([search, statusFilter], () => reload())
// A book issued (or anything else changed) elsewhere on the page.
watch(() => store.changeVersion, (version) => {
  if (version === ownVersion) return
  reload()
})

onBeforeUnmount(() => clearTimeout(timeout))

onMounted(reload)
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UInput data-guide="adm-search" v-model="value" :icon="SEARCH_ICON" placeholder="Search by book or borrower" class="w-full sm:w-72" />
        <USelectMenu v-model="statusFilter" value-key="value" :items="loanStatusOptions" :search-input="false"
          class="w-full sm:w-44" />
        <div data-guide="lib-issue-btn"><LibraryIssueForm v-if="canManage" /></div>
      </div>
    </template>

    <!-- Desktop table -->
    <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading"
      :ui="{ loading: 'py-0', tr: 'cursor-pointer' }" @select="(_e: Event, row: any) => openBook(row.original)">
      <template #book-cell="{ row }">
        <div class="flex items-center gap-3">
          <div class="min-w-0">
            <p class="block max-w-xs truncate font-medium text-gray-900 dark:text-white">
              {{ row.original.book.title }}
            </p>
            <p class="max-w-xs truncate text-xs text-gray-500">{{ row.original.book.author }}</p>
          </div>
        </div>
      </template>

      <template #borrowerName-cell="{ row }">
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
        <p v-if="row.original.status === 'OVERDUE'" class="text-xs text-error">
          {{ row.original.daysOverdue }} {{ row.original.daysOverdue === 1 ? 'day' : 'days' }} late
        </p>
        <p v-else-if="row.original.returnDate" class="text-xs text-gray-500">
          Returned {{ formatDate(row.original.returnDate) }}
        </p>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="loanStatusStyle[row.original.status].color" variant="soft">
          {{ loanStatusStyle[row.original.status].label }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <!-- .stop: returning shouldn't also open the book -->
        <div class="flex justify-end" @click.stop>
          <UButton v-if="row.original.status !== 'RETURNED'" :icon="RETURN_BOOK_ICON" size="xs" color="success"
            variant="soft" label="Return" :loading="returningId === row.original.id" @click="returnBook(row.original)" />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="ISSUE_BOOK_ICON" class="text-4xl text-primary-500" />
          </div>

          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">No loans found</h3>
            <p class="mt-1 text-sm text-gray-500">Issued and returned books will appear here.</p>
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
              <USkeleton class="h-3 w-28" />
            </div>
            <USkeleton class="h-6 w-20 rounded-full" />
          </div>
        </div>
      </template>

      <template v-else-if="data.length">
        <div v-for="loan in data" :key="loan.id" role="button" tabindex="0" @click="openBook(loan)"
          @keydown.enter="openBook(loan)"
          class="cursor-pointer border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <h3 class="truncate text-sm font-semibold">{{ loan.book.title }}</h3>
              <p class="truncate text-xs text-muted">{{ loan.borrowerName }} · {{ borrowerLabel(loan) }}</p>
            </div>

            <UBadge class="shrink-0" size="sm" variant="soft" :color="loanStatusStyle[loan.status].color"
              :label="loanStatusStyle[loan.status].label" />
          </div>

          <div class="mt-2 flex items-center justify-between gap-3">
            <p class="text-xs" :class="loan.status === 'OVERDUE' ? 'text-error' : 'text-muted'">
              Due {{ formatDate(loan.dueDate) }}<template v-if="loan.status === 'OVERDUE'"> · {{ loan.daysOverdue }}d late</template>
            </p>

            <UButton v-if="canManage && loan.status !== 'RETURNED'" :icon="RETURN_BOOK_ICON" size="xs" color="success"
              variant="soft" label="Return" :loading="returningId === loan.id" @click.stop="returnBook(loan)" />
          </div>
        </div>
      </template>

      <div v-else-if="!failed" class="flex flex-col items-center py-16 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon :name="ISSUE_BOOK_ICON" class="size-10 text-muted" />
        </div>
        <h3 class="mt-4 text-sm font-semibold">No loans found</h3>
        <p class="mt-1 text-sm text-muted">Issued and returned books will appear here.</p>
      </div>
    </div>

    <div ref="sentinel">
      <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="data.length"
        :total="meta?.total" noun="loans" :error="listError" @retry="loadMore" />
    </div>
  </UCard>
</template>
