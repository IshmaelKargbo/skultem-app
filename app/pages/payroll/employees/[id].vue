<template>
  <div class="mx-auto max-w-7xl space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Salary Details
        </h1>

        <p class="text-sm text-muted">
          View employee compensation and payroll information.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/payroll/employees">
          Back
        </UButton>
        <UButton icon="i-lucide-pencil" variant="soft" :to="`/salaries/${employee.id}/edit`">
          Edit Salary
        </UButton>

        <UButton icon="i-lucide-file-text">
          Generate Payslip
        </UButton>

      </div>

    </div>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="space-y-6 lg:col-span-2">

        <!-- Employee -->
        <UCard class="rounded-3xl">

          <div class="flex items-center gap-4">

            <UAvatar size="3xl" :alt="employee.name" />

            <div class="flex justify-between w-full items-center">

              <div>
                <h2 class="text-xl font-bold">
                  {{ employee.name }}
                </h2>

                <p class="text-sm text-muted">
                  {{ employee.position }}
                </p>

              </div>

              <div class="flex flex-wrap gap-2">

                <UBadge variant="subtle" color="neutral">
                  {{ employee.department }}
                </UBadge>

                <UBadge variant="soft" color="success" icon="i-lucide-circle-check">
                  Active
                </UBadge>

              </div>

            </div>

          </div>

        </UCard>

        <!-- Compensation -->
        <UCard class="rounded-3xl">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-wallet" />
              <span class="font-semibold">
                Compensation Package
              </span>
            </div>
          </template>

          <div class="grid gap-4 md:grid-cols-2">

            <div class="rounded-2xl border border-default p-5">

              <p class="text-xs text-muted">
                Basic Salary
              </p>

              <h3 class="mt-2 text-2xl font-bold">
                {{ formatCurrency(employee.basicSalary) }}
              </h3>

            </div>

            <div class="rounded-2xl border border-default p-5">

              <p class="text-xs text-muted">
                Gross Salary
              </p>

              <h3 class="mt-2 text-2xl font-bold">
                {{ grossSalary }}
              </h3>

              <p class="mt-1 text-xs text-muted">
                Basic + allowances
              </p>

            </div>

          </div>

        </UCard>

        <!-- Allowances -->
        <UCard class="rounded-3xl">

          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-circle-plus" class="text-green-500" />
                <span class="font-semibold">
                  Allowances
                </span>
              </div>

              <span class="text-sm font-medium text-green-600">
                + {{ formatCurrency(totalAllowances) }}
              </span>
            </div>
          </template>

          <div class="space-y-3">

            <div v-for="item in allowances" :key="item.name"
              class="flex items-center justify-between rounded-2xl bg-green-50 p-4 dark:bg-green-500/10">

              <div>

                <p class="font-medium">
                  {{ item.name }}
                </p>

                <p class="text-xs text-muted">
                  Monthly
                </p>

              </div>

              <span class="font-semibold text-green-600">
                + {{ formatCurrency(item.amount) }}
              </span>

            </div>

          </div>

        </UCard>

        <!-- Deductions -->
        <UCard class="rounded-xl">

          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-circle-minus" class="text-red-500" />
                <span class="font-semibold">
                  Deductions
                </span>
              </div>

              <span class="text-sm font-medium text-red-500">
                - {{ formatCurrency(totalDeductions) }}
              </span>
            </div>
          </template>

          <div class="space-y-3">

            <div v-for="item in deductions" :key="item.name"
              class="flex items-center justify-between rounded-2xl bg-red-50 p-4 dark:bg-red-500/10">

              <div>

                <p class="font-medium">
                  {{ item.name }}
                </p>

                <p class="text-xs text-muted">
                  Monthly
                </p>

              </div>

              <span class="font-semibold text-red-500">
                - {{ formatCurrency(item.amount) }}
              </span>

            </div>

          </div>

        </UCard>

        <!-- Salary History -->
        <UCard class="rounded-xl">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-history" />
              <span class="font-semibold">
                Salary History
              </span>
            </div>
          </template>

          <div class="space-y-4">

            <div v-for="(history, i) in salaryHistory" :key="history.month"
              class="flex items-center justify-between rounded-2xl border border-default p-4">

              <div>

                <h3 class="font-medium">
                  {{ history.month }}
                </h3>

                <p class="text-xs text-muted">
                  Processed {{ history.date }}
                </p>

              </div>

              <div class="text-right">

                <div class="flex items-center justify-end gap-1.5">
                  <p class="font-semibold">
                    {{ history.amount }}
                  </p>

                  <UIcon v-if="historyDelta(i) > 0" name="i-lucide-arrow-up-right" class="size-3.5 text-green-500" />
                  <UIcon v-else-if="historyDelta(i) < 0" name="i-lucide-arrow-down-right"
                    class="size-3.5 text-red-500" />
                </div>

                <UBadge color="success" variant="soft">
                  Paid
                </UBadge>

              </div>

            </div>

          </div>

        </UCard>

      </div>

      <!-- Right -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <!-- Net Salary -->
        <UCard class="overflow-hidden rounded-xl">

          <div class="bg-primary-200 p-6 text-center text-black rounded-xl">

            <p class="text-sm opacity-80">
              Net Salary
            </p>

            <h1 class="mt-3 text-4xl font-bold">
              {{ netSalary }}
            </h1>

            <p class="mt-2 text-xs opacity-75">
              {{ formatCurrency(grossValue) }} gross − {{ formatCurrency(totalDeductions) }} deductions
            </p>

          </div>

        </UCard>

        <!-- Payment Info -->
        <UCard class="rounded-3xl">

          <template #header>
            <span class="font-semibold">
              Payment Information
            </span>
          </template>

          <div class="space-y-4">

            <div>
              <p class="text-xs text-muted">
                Bank
              </p>

              <p class="font-medium">
                Rokel Commercial Bank
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">
                Account Number
              </p>

              <p class="font-medium">
                ****4567
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">
                Payment Frequency
              </p>

              <p class="font-medium">
                Monthly
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">
                Pay Date
              </p>

              <p class="font-medium">
                30 June 2026
              </p>
            </div>

          </div>

        </UCard>

        <!-- Quick Actions -->
        <UCard class="rounded-3xl">

          <template #header>
            <span class="font-semibold">
              Quick Actions
            </span>
          </template>

          <div class="space-y-3">

            <UButton block icon="i-lucide-download">
              Download Payslip
            </UButton>

            <UButton block variant="soft" icon="i-lucide-file-text">
              View Payroll History
            </UButton>

            <UButton block variant="soft" color="neutral" icon="i-lucide-send">
              Send Payslip by Email
            </UButton>

          </div>

        </UCard>

      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
const employee = reactive({
  id: 1,
  name: "Mary Kamara",
  position: "Senior Teacher",
  department: "Teaching",
  basicSalary: 7000
})

const allowances = ref([
  {
    name: "Housing Allowance",
    amount: 800
  },
  {
    name: "Transport Allowance",
    amount: 500
  },
  {
    name: "Medical Allowance",
    amount: 200
  }
])

const deductions = ref([
  {
    name: "Income Tax",
    amount: 200
  },
  {
    name: "Pension Contribution",
    amount: 100
  }
])

const salaryHistory = ref([
  {
    month: "May 2026",
    date: "31 May 2026",
    amount: "Le 8,200"
  },
  {
    month: "April 2026",
    date: "30 Apr 2026",
    amount: "Le 8,200"
  },
  {
    month: "March 2026",
    date: "31 Mar 2026",
    amount: "Le 8,100"
  },
  {
    month: "February 2026",
    date: "28 Feb 2026",
    amount: "Le 8,100"
  }
])

const totalAllowances = computed(() => {
  return allowances.value.reduce(
    (sum, item) => sum + item.amount,
    0
  )
})

const totalDeductions = computed(() => {
  return deductions.value.reduce(
    (sum, item) => sum + item.amount,
    0
  )
})

const grossValue = computed(() => {
  return employee.basicSalary + totalAllowances.value
})

const grossSalary = computed(() => {
  return formatCurrency(grossValue.value)
})

const netSalary = computed(() => {
  return formatCurrency(grossValue.value - totalDeductions.value)
})

function formatCurrency(value: number) {
  return `Le ${value.toLocaleString()}`
}

// Parses "Le 8,200" style strings back to a number for the up/down trend arrow.
function parseHistoryAmount(amount: string) {
  return Number(amount.replace(/[^0-9.-]/g, ""))
}

function historyDelta(index: number) {
  const current = salaryHistory.value[index]
  const previous = salaryHistory.value[index + 1]
  if (!previous) return 0
  return parseHistoryAmount(current.amount) - parseHistoryAmount(previous.amount)
}
</script>