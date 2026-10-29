<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { summary } = storeToRefs(store)

const recentLoans = ref<BookLoan[]>([])
const outOfStock = ref<Book[]>([])
const listsLoading = ref(true)

// Only the first load shows skeletons; a refresh after an action keeps the current values on
// screen until the new ones arrive.
const ready = computed(() => !!summary.value)

// Each card loads on its own, so one failing request doesn't blank the whole dashboard.
async function load() {
  store.fetchSummary().catch(() => {})
  await Promise.allSettled([
    LibraryApi().listLoans(1, 6).then(res => { recentLoans.value = res?.data || [] }),
    LibraryApi().listBooks(1, 5, { outOfStock: true }).then(res => { outOfStock.value = res?.data || [] })
  ])
  listsLoading.value = false
}

const { success: toastSuccess, error: toastError } = useNotify()
const returningId = ref('')

// The store bumps changeVersion on success, so the whole dashboard reloads after this.
async function returnBook(loan: BookLoan) {
  returningId.value = loan.id
  try {
    await store.returnBook(loan.id)
    toastSuccess(`"${loan.book.title}" marked as returned`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to return book')
  } finally {
    returningId.value = ''
  }
}

// Reload after a book is issued, returned or reminded, or the catalog changes.
watch(() => store.changeVersion, load)

onMounted(load)
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'primary',
        label: 'Total Titles',
        isReady: ready,
        value: summary?.titles ?? 0,
        subtle: `${summary?.totalCopies ?? 0} copies in the library`,
        icon: BOOK_ICON
      }" />

      <Metric :record="{
        color: 'success',
        label: 'Available Copies',
        isReady: ready,
        value: summary?.availableCopies ?? 0,
        subtle: `${summary?.issuedCopies ?? 0} copies currently on loan`,
        icon: 'i-lucide-package-check'
      }" />

      <Metric :record="{
        color: 'error',
        label: 'Overdue Loans',
        isReady: ready,
        value: summary?.overdueLoans ?? 0,
        subtle: 'Books past their due date',
        icon: OVERDUE_BOOK_ICON
      }" />

      <Metric :record="{
        color: 'neutral',
        label: 'Categories',
        isReady: ready,
        value: summary?.categories ?? 0,
        subtle: 'Ways the catalog is organized',
        icon: BOOK_CATEGORY_ICON
      }" />
    </div>

    <LibraryOverdueAlerts />

    <div class="grid gap-3 xl:grid-cols-3">
      <!-- Recent loans -->
      <UCard class="xl:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-history" class="size-5 text-primary" />
                <h3 class="font-semibold md:text-lg">Recent Loan Activity</h3>
              </div>
              <p class="text-xs-base text-muted">The latest books issued and returned.</p>
            </div>

            <div class="flex items-center gap-2">
              <LibraryIssueForm v-if="canManage" />
              <UButton to="/library/issue" label="View all" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-chevron-right" />
            </div>
          </div>
        </template>

        <div v-if="listsLoading">
          <div v-for="i in 4" :key="i" class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
            <div class="flex items-center gap-3">
              <div class="space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-28" />
              </div>
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div v-else-if="!recentLoans.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="ISSUE_BOOK_ICON" class="text-4xl text-primary-500" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">No loan activity yet</h3>
            <p class="mt-1 text-sm text-gray-500">Books you issue will show up here.</p>
          </div>
        </div>

        <ul v-else class="divide-y divide-default">
          <li v-for="loan in recentLoans" :key="loan.id" class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ loan.book.title }}</p>
                <p class="truncate text-xs text-muted">
                  {{ loan.borrowerName }} · {{ borrowerLabel(loan) }} · {{ formatDate(loan.issueDate) }}
                </p>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <UBadge :color="loanStatusStyle[loan.status].color" variant="soft">
                {{ loanStatusStyle[loan.status].label }}
              </UBadge>

              <UButton v-if="canManage && loan.status !== 'RETURNED'" :icon="RETURN_BOOK_ICON" size="xs" color="success"
                variant="soft" label="Return" :loading="returningId === loan.id" @click="returnBook(loan)" />
            </div>
          </li>
        </ul>
      </UCard>

      <!-- Out of stock -->
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-package-x" class="size-5 text-primary" />
                <h3 class="font-semibold md:text-lg">All Copies on Loan</h3>
              </div>
              <p class="text-xs-base text-muted">Titles with no copy left on the shelf.</p>
            </div>

            <UButton to="/library/books" label="Books" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-chevron-right" />
          </div>
        </template>

        <div v-if="listsLoading">
          <div v-for="i in 3" :key="i" class="space-y-2 border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
            <USkeleton class="h-4 w-36" />
            <USkeleton class="h-3 w-24" />
          </div>
        </div>

        <div v-else-if="!outOfStock.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-success-50 dark:bg-success-500/10">
            <UIcon name="i-lucide-check-circle" class="text-4xl text-success-500" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">Everything is on the shelf</h3>
            <p class="mt-1 text-sm text-gray-500">Every title has at least one copy available.</p>
          </div>
        </div>

        <ul v-else class="divide-y divide-default">
          <li v-for="book in outOfStock" :key="book.id">
            <NuxtLink :to="`/library/books/${book.id}`" class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-elevated/50">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ book.title }}</p>
                <p class="truncate text-xs text-muted">{{ book.category.name }}</p>
              </div>

              <UBadge color="error" variant="soft" class="shrink-0">0 / {{ book.totalCopies }}</UBadge>
            </NuxtLink>
          </li>
        </ul>
      </UCard>
    </div>
  </div>
</template>
