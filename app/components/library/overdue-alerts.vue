<script setup lang="ts">
const store = useLibraryStore()
const { overdueLoans } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const notifyingId = ref('')

async function notify(loan: BookLoan) {
  notifyingId.value = loan.id

  try {
    store.notifyBorrower(loan.id)
    toastSuccess(`Reminder sent to ${loan.borrowerName}`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to send reminder')
  } finally {
    notifyingId.value = ''
  }
}

onMounted(() => store.refreshOverdue())
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon :name="OVERDUE_BOOK_ICON" class="size-5 text-error" />
        <h3 class="font-semibold">Overdue Alerts</h3>
        <UBadge v-if="overdueLoans.length" color="error" variant="subtle" size="sm">
          {{ overdueLoans.length }}
        </UBadge>
      </div>
    </template>

    <div v-if="!overdueLoans.length" class="flex flex-col items-center gap-3 py-16">
      <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-success-50 dark:bg-success-500/10">
        <UIcon name="i-lucide-check-circle" class="text-3xl text-success-500" />
      </div>
      <p class="text-sm text-muted">No overdue books right now.</p>
    </div>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="loan in overdueLoans"
        :key="loan.id"
        class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-error-50 dark:bg-error-500/10">
            <UIcon name="i-lucide-user-round" class="size-5 text-error-500" />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ loan.borrowerName }}
              <span class="font-normal text-muted">
                · {{ loan.borrowerType === 'TEACHER' ? 'Teacher' : 'Student' }}, {{ loan.borrowerClass }}
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
            {{ daysOverdue(loan.dueDate) }} {{ daysOverdue(loan.dueDate) === 1 ? 'day' : 'days' }} overdue
          </UBadge>

          <UButton
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
  </UCard>
</template>
