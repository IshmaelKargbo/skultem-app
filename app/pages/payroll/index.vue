<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Payroll Dashboard
        </h1>

        <p class="text-sm text-muted">
          Manage salaries, payments, and payroll activities.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">

        <UButton
          icon="i-lucide-play" to="/payroll/run"
        >
          Run Payroll
        </UButton>

        <UButton
          variant="soft"
          icon="i-lucide-file-text"
        >
          Payslips
        </UButton>

        <UButton
          variant="soft"
          icon="i-lucide-download"
        >
          Export
        </UButton>

      </div>

    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-3xl"
      >
        <div class="flex items-center justify-between">

          <div>

            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>

            <h2 class="mt-2 text-3xl font-bold">
              {{ stat.value }}
            </h2>

            <p class="mt-1 text-xs text-green-500">
              {{ stat.change }}
            </p>

          </div>

          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-500/10"
          >
            <UIcon
              :name="stat.icon"
              class="text-xl text-primary"
            />
          </div>

        </div>
      </UCard>

    </div>

    <!-- Recent Runs + Upcoming -->
    <div class="grid gap-6 lg:grid-cols-3">

      <UCard class="rounded-3xl lg:col-span-2">

        <template #header>
          <h2 class="font-semibold">
            Recent Payroll Runs
          </h2>
        </template>

        <div class="space-y-4">

          <div
            v-for="run in payrollRuns"
            :key="run.month"
            class="flex items-center justify-between rounded-2xl border border-default p-4"
          >

            <div>
              <h3 class="font-medium">
                {{ run.month }}
              </h3>

              <p class="text-xs text-muted">
                Processed {{ run.date }}
              </p>
            </div>

            <div class="text-right">

              <p class="font-semibold">
                {{ run.amount }}
              </p>

              <UBadge
                color="success"
                variant="soft"
              >
                {{ run.status }}
              </UBadge>

            </div>

          </div>

        </div>

      </UCard>

      <UCard class="rounded-3xl">

        <template #header>
          <h2 class="font-semibold">
            Upcoming Payroll
          </h2>
        </template>

        <div class="space-y-5">

          <div>
            <p class="text-xs text-muted">
              Payday
            </p>

            <p class="text-2xl font-bold">
              30 June 2026
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">
              Employees
            </p>

            <p class="font-semibold">
              90 Staff
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">
              Estimated Cost
            </p>

            <p class="text-xl font-bold text-primary">
              Le 338,000
            </p>
          </div>

        </div>

      </UCard>

    </div>

    <!-- Departments -->
    <UCard class="rounded-3xl">

      <template #header>
        <h2 class="font-semibold">
          Department Payroll Breakdown
        </h2>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div
          v-for="department in departments"
          :key="department.name"
          class="rounded-2xl bg-muted/40 p-5"
        >
          <p class="text-sm text-muted">
            {{ department.name }}
          </p>

          <h3 class="mt-2 text-xl font-bold">
            {{ department.amount }}
          </h3>
        </div>

      </div>

    </UCard>

    <!-- Recent Payslips -->
    <UCard class="rounded-3xl">

      <template #header>
        <h2 class="font-semibold">
          Recent Payslips
        </h2>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <div
          v-for="slip in payslips"
          :key="slip.employee"
          class="rounded-2xl border border-default p-5"
        >

          <div class="flex items-center gap-3">

            <UAvatar :alt="slip.employee" />

            <div>

              <h3 class="font-medium">
                {{ slip.employee }}
              </h3>

              <p class="text-xs text-muted">
                {{ slip.position }}
              </p>

            </div>

          </div>

          <div class="mt-4">

            <p class="text-xs text-muted">
              Net Salary
            </p>

            <h2 class="text-xl font-bold">
              {{ slip.salary }}
            </h2>

          </div>

          <UButton
            block
            variant="soft"
            class="mt-4"
            trailing-icon="i-lucide-arrow-right"
          >
            View Payslip
          </UButton>

        </div>

      </div>

    </UCard>

  </div>
</template>
<script setup lang="ts">
const stats = [
  {
    label: "Total Payroll",
    value: "Le 325,000",
    change: "+8.2%",
    icon: "i-lucide-wallet"
  },
  {
    label: "Employees Paid",
    value: "84",
    change: "90 total",
    icon: "i-lucide-users"
  },
  {
    label: "Pending Payments",
    value: "6",
    change: "Awaiting",
    icon: "i-lucide-clock-3"
  },
  {
    label: "Bonuses",
    value: "Le 12,500",
    change: "This month",
    icon: "i-lucide-gift"
  }
]

const payrollRuns = [
  {
    month: "May 2026",
    date: "31 May",
    amount: "Le 325,000",
    status: "Completed"
  },
  {
    month: "April 2026",
    date: "30 Apr",
    amount: "Le 320,000",
    status: "Completed"
  }
]

const departments = [
  {
    name: "Teaching",
    amount: "Le 150,000"
  },
  {
    name: "Administration",
    amount: "Le 80,000"
  },
  {
    name: "Finance",
    amount: "Le 45,000"
  },
  {
    name: "ICT",
    amount: "Le 50,000"
  }
]

const payslips = [
  {
    employee: "Mary Kamara",
    position: "Teacher",
    salary: "Le 8,200"
  },
  {
    employee: "John Doe",
    position: "Accountant",
    salary: "Le 7,600"
  },
  {
    employee: "Peter Sesay",
    position: "ICT Officer",
    salary: "Le 9,100"
  }
]
</script>