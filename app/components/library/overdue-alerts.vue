<script setup lang="ts">
const store = useLibraryStore()
const { canManage } = useLibraryAccess()
const { overdueLoans, overdueMeta, overdueLoading } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const notifyingId = ref('')

// The total across every page, not just the loans listed here.
const overdueCount = computed(() => overdueMeta.value.total ?? overdueLoans.value.length)

async function notify(loan: BookLoan) {
  notifyingId.value = loan.id

  try {
    await store.remindBorrower(loan.id)
    toastSuccess(loan.borrowerType === 'TEACHER'
      ? `Reminder sent to ${loan.borrowerName}`
      : `Reminder sent to ${loan.borrowerName}'s parent`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to send reminder')
  } finally {
    notifyingId.value = ''
  }
}

// Reload after a book is issued, returned or reminded, so the list and count stay current.
watch(() => store.changeVersion, () => store.fetchOverdue())

onMounted(() => store.fetchOverdue())
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <UIcon :name="OVERDUE_BOOK_ICON" class="size-5 text-error" />
          <h3 class="font-semibold md:text-lg">Overdue Alerts</h3>
          <UBadge v-if="overdueCount" color="error" variant="subtle" size="sm">
            {{ overdueCount }}
          </UBadge>
        </div>
        <p class="text-xs-base text-muted">Books past their due date.<template v-if="canManage"> Send a reminder to the borrower or their parent.</template></p>
      </div>
    </template>

    <div v-if="overdueLoading && !overdueLoans.length && !overdueMeta.total">
      <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 last:border-0 dark:border-neutral-800">
        <div class="flex items-center gap-3">
          <div class="space-y-2">
            <USkeleton class="h-4 w-44" />
            <USkeleton class="h-3 w-32" />
          </div>
        </div>
        <USkeleton class="h-7 w-24 rounded-full" />
      </div>
    </div>

    <div v-else-if="!overdueLoans.length" class="flex flex-col items-center gap-3 py-16">
      <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-success-50 dark:bg-success-500/10">
        <UIcon name="i-lucide-check-circle" class="text-4xl text-success-500" />
      </div>
      <div class="text-center">
        <h3 class="font-semibold text-gray-900 dark:text-white">No overdue books</h3>
        <p class="mt-1 text-sm text-gray-500">Every book on loan is still within its due date.</p>
      </div>
    </div>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="loan in overdueLoans"
        :key="loan.id"
        class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ loan.borrowerName }}
              <span class="font-normal text-muted">
                · {{ borrowerLabel(loan) }}
              </span>
            </p>

            <p class="truncate text-xs text-muted">
              {{ loan.book.title }} · due {{ formatDate(loan.dueDate) }}
            </p>

            <p v-if="loan.notifiedAt" class="mt-0.5 flex items-center gap-1 text-xs text-success">
              <UIcon name="i-lucide-check" class="size-3" />
              Notified {{ formatDateTime(loan.notifiedAt) }}
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:justify-end">
          <UBadge color="error" variant="soft" size="sm">
            {{ loan.daysOverdue }} {{ loan.daysOverdue === 1 ? 'day' : 'days' }} overdue
          </UBadge>

          <UButton
            v-if="canManage"
            :icon="loan.notifiedAt ? 'i-lucide-bell-ring' : 'i-lucide-bell'"
            :label="loan.notifiedAt ? 'Resend' : 'Notify'"
            size="xs"
            :color="loan.notifiedAt ? 'neutral' : 'warning'"
            :variant="loan.notifiedAt ? 'subtle' : 'solid'"
            :loading="notifyingId === loan.id"
            @click="notify(loan)"
          />
        </div>
      </li>
    </ul>

    <template v-if="overdueCount > overdueLoans.length" #footer>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-muted">Showing {{ overdueLoans.length }} of {{ overdueCount }} overdue loans</p>
        <UButton to="/library/issue?status=OVERDUE" label="View all" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-chevron-right" />
      </div>
    </template>
  </UCard>
</template>
