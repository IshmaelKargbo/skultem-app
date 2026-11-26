<script setup lang="ts">
// The books a student has borrowed, newest first: what they still have out (and anything overdue) on top.
const props = defineProps<{ studentId: string }>()
const { format } = useMoney()

const { items: loans, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<BookLoan>((page, size) => LibraryApi().listStudentLoans(props.studentId, page, size) as any, { size: 10 })

const out = computed(() => loans.value.filter(l => l.status !== 'RETURNED'))
const overdue = computed(() => out.value.filter(l => l.status === 'OVERDUE'))
const fines = computed(() => loans.value.reduce((sum, l) => sum + loanFine(l), 0))

watch(() => props.studentId, () => reload(), { immediate: true })
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        Books borrowed ({{ meta?.total ?? 0 }})
      </p>
      <UBadge v-if="out.length" size="sm" variant="soft" color="info" :label="`${out.length} still out`" />
      <UBadge v-if="overdue.length" size="sm" variant="soft" color="error" :label="`${overdue.length} overdue`" />
      <UBadge v-if="fines > 0" size="sm" variant="soft" color="warning" :label="`Fines ${format(fines)}`" />
    </div>

    <div v-if="loading" class="space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
    </div>
    <p v-else-if="!loans.length && !failed" class="text-sm text-muted">No books borrowed.</p>
    <ul v-else-if="loans.length" class="divide-y divide-default rounded-xl border border-default">
      <li v-for="loan in loans" :key="loan.id" class="flex items-center justify-between gap-3 px-3 py-2.5">
        <div class="min-w-0">
          <ULink :to="`/library/books/${loan.book.id}`" class="block truncate text-sm font-medium hover:text-primary">
            {{ loan.book.title }}
          </ULink>
          <p class="truncate text-xs text-muted">
            Issued {{ formatDate(loan.issueDate) }} ·
            <template v-if="loan.status === 'RETURNED'">returned {{ loan.returnDate ? formatDate(loan.returnDate) : '' }}</template>
            <template v-else>due {{ formatDate(loan.dueDate) }}</template>
            <span v-if="loan.status === 'OVERDUE'" class="text-error"> · {{ loan.daysOverdue }}d late</span>
            <span v-if="loanFine(loan) > 0" class="text-warning"> · fine {{ format(loanFine(loan)) }}</span>
          </p>
        </div>
        <UBadge class="shrink-0" size="sm" variant="soft" :color="loanStatusStyle[loan.status].color"
          :label="loanStatusStyle[loan.status].label" />
      </li>
    </ul>

    <div ref="sentinel">
      <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="loans.length"
        :total="meta?.total" noun="loans" :error="listError" @retry="loadMore" />
    </div>
  </div>
</template>
