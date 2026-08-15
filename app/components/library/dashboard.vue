<script setup lang="ts">
const store = useLibraryStore()
const { books, categories, loans } = storeToRefs(store)

const recentLoans = computed(() => loans.value.slice(0, 6))

const lowStock = computed(() =>
  books.value
    .filter(b => b.availableCopies === 0)
    .slice(0, 5)
)

onMounted(() => store.refreshOverdue())
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'primary',
        label: 'Total Titles',
        isReady: true,
        value: books.length,
        subtle: `${store.totalCopies} total copies`,
        icon: BOOK_ICON
      }" />

      <Metric :record="{
        color: 'success',
        label: 'Available Copies',
        isReady: true,
        value: store.availableCopies,
        subtle: `${store.issuedCopies} currently issued`,
        icon: 'i-lucide-package-check'
      }" />

      <Metric :record="{
        color: 'error',
        label: 'Overdue',
        isReady: true,
        value: store.overdueLoans.length,
        subtle: 'loans past due date',
        icon: OVERDUE_BOOK_ICON
      }" />

      <Metric :record="{
        color: 'info',
        label: 'Categories',
        isReady: true,
        value: categories.length,
        subtle: 'book categories',
        icon: BOOK_CATEGORY_ICON
      }" />
    </div>

    <LibraryOverdueAlerts />

    <div class="grid gap-4 xl:grid-cols-3">
      <UCard class="xl:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Recent Loan Activity</h3>
            <UButton to="/library/issue" label="View all" variant="link" size="sm" trailing-icon="i-lucide-arrow-right" />
          </div>
        </template>

        <div v-if="!recentLoans.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="ISSUE_BOOK_ICON" class="text-3xl text-primary-500" />
          </div>
          <p class="text-sm text-muted">No loan activity yet.</p>
        </div>

        <ul v-else class="divide-y divide-default">
          <li v-for="loan in recentLoans" :key="loan.id" class="flex items-center justify-between gap-3 p-4">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <UIcon :name="BOOK_ICON" class="size-4 text-primary" />
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ loan.book.title }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ loan.borrowerName }} · {{ loan.borrowerClass }}
                </p>
              </div>
            </div>

            <UBadge :color="loanStatusStyle[loan.status].color" variant="soft" class="shrink-0">
              {{ loanStatusStyle[loan.status].label }}
            </UBadge>
          </li>
        </ul>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Out of Stock</h3>
            <UButton to="/library/books" label="Manage" variant="link" size="sm" trailing-icon="i-lucide-arrow-right" />
          </div>
        </template>

        <div v-if="!lowStock.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-success-50 dark:bg-success-500/10">
            <UIcon name="i-lucide-check-circle" class="text-3xl text-success-500" />
          </div>
          <p class="text-sm text-muted">Every title has copies available.</p>
        </div>

        <ul v-else class="divide-y divide-default">
          <li v-for="book in lowStock" :key="book.id" class="flex items-center justify-between gap-3 p-4">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ book.title }}
              </p>
              <p class="truncate text-xs text-muted">
                {{ book.category.name }}
              </p>
            </div>

            <UBadge color="error" variant="soft" class="shrink-0">0 left</UBadge>
          </li>
        </ul>
      </UCard>
    </div>
  </div>
</template>
