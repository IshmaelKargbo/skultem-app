<script setup lang="ts">
const store = useLibraryStore()
const { loans } = storeToRefs(store)

const search = ref('')
const statusFilter = ref<'ALL' | LoanStatus>('ALL')
const { success: toastSuccess, error: toastError } = useNotify()

const statusOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Issued', value: 'ISSUED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Returned', value: 'RETURNED' }
]

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return loans.value.filter(loan => {
    const matchesSearch = !q
      || loan.book.title.toLowerCase().includes(q)
      || loan.borrowerName.toLowerCase().includes(q)

    const matchesStatus = statusFilter.value === 'ALL' || loan.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const columns = [
  { id: 'book', header: 'Book' },
  { accessorKey: 'borrowerName', header: 'Borrower' },
  { accessorKey: 'issueDate', header: 'Issued' },
  { accessorKey: 'dueDate', header: 'Due' },
  { id: 'status', header: 'Status' },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

function returnBook(loan: BookLoan) {
  try {
    store.returnBook(loan.id)
    toastSuccess(`"${loan.book.title}" marked as returned`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to return book')
  }
}

onMounted(() => store.refreshOverdue())
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search book or borrower..." class="w-full sm:w-72" />
      <USelectMenu v-model="statusFilter" value-key="value" :items="statusOptions" class="w-full sm:w-48" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="ISSUE_BOOK_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">
                No loans found
              </h3>

              <p class="mt-1 text-sm text-muted">
                Issued and returned books will appear here.
              </p>
            </div>
          </div>
        </template>

        <template #book-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BOOK_ICON" class="text-primary-500" />
            </div>

            <div>
              <p class="font-medium text-highlighted">
                {{ row.original.book.title }}
              </p>

              <p class="text-xs text-muted">
                {{ row.original.book.author }}
              </p>
            </div>
          </div>
        </template>

        <template #borrowerName-cell="{ row }">
          <p class="font-medium text-highlighted">
            {{ row.original.borrowerName }}
          </p>

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

        <template #status-cell="{ row }">
          <UBadge :color="loanStatusStyle[row.original.status].color" variant="soft">
            {{ loanStatusStyle[row.original.status].label }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              v-if="row.original.status !== 'RETURNED'"
              :icon="RETURN_BOOK_ICON"
              size="xs"
              color="success"
              variant="soft"
              label="Return"
              @click="returnBook(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
