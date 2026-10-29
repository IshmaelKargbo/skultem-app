<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { loans: data, loansMeta: meta, loansLoading: loading } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const value = ref('')
const search = ref('')
// Starts from ?status= so links like "View all overdue" open the right view.
const initialStatus = String(useRoute().query.status || '').toUpperCase()
const statusFilter = ref<'ALL' | LoanStatus>(
  loanStatusOptions.some(o => o.value === initialStatus) ? initialStatus as LoanStatus : 'ALL'
)
const page = ref(1)
const size = runtimeConf().limit
const returningId = ref('')

const columns = computed(() => [
  { id: 'book', header: 'Book' },
  { accessorKey: 'borrowerName', header: 'Borrower' },
  { accessorKey: 'issueDate', header: 'Issued' },
  { accessorKey: 'dueDate', header: 'Due' },
  { id: 'status', header: 'Status' },
  ...(canManage.value ? [{ id: 'actions', meta: { class: { td: 'text-right' } } }] : [])
])

function load() {
  return store.fetchLoans(page.value, size, { search: search.value, status: statusFilter.value })
}

async function returnBook(loan: BookLoan) {
  returningId.value = loan.id
  try {
    await store.returnBook(loan.id)
    toastSuccess(`"${loan.book.title}" marked as returned`)
    // A returned loan no longer belongs in the Issued / Overdue views.
    if (statusFilter.value === 'ISSUED' || statusFilter.value === 'OVERDUE') await load()
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

watch([search, statusFilter], () => {
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
        <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by book or borrower" class="w-full sm:w-72" />
        <USelectMenu v-model="statusFilter" value-key="value" :items="loanStatusOptions" :search-input="false"
          class="w-full sm:w-44" />
        <LibraryIssueForm v-if="canManage" />
      </div>
    </template>

    <!-- Desktop table -->
    <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #book-cell="{ row }">
        <div class="flex items-center gap-3">
          <div class="min-w-0">
            <ULink :to="`/library/books/${row.original.book.id}`" class="block max-w-xs truncate font-medium text-gray-900 hover:text-primary dark:text-white">
              {{ row.original.book.title }}
            </ULink>
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
        <div class="flex justify-end">
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
        <div v-for="loan in data" :key="loan.id" class="border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
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
              variant="soft" label="Return" :loading="returningId === loan.id" @click="returnBook(loan)" />
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center py-16 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon :name="ISSUE_BOOK_ICON" class="size-10 text-muted" />
        </div>
        <h3 class="mt-4 text-sm font-semibold">No loans found</h3>
        <p class="mt-1 text-sm text-muted">Issued and returned books will appear here.</p>
      </div>
    </div>

    <template v-if="meta.total" #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
