<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Salary Structure
        </h1>

        <p class="text-sm text-muted">
          Manage employee salary information and compensation packages.
        </p>
      </div>

      <div class="flex gap-2">

        <UButton
          icon="i-lucide-plus"
        >
          Add Employee Salary
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
        <div class="space-y-2">

          <p class="text-sm text-muted">
            {{ stat.label }}
          </p>

          <h2 class="text-3xl font-bold">
            {{ stat.value }}
          </h2>

        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard class="rounded-3xl">

      <div class="grid gap-3 md:grid-cols-3">

        <UInput
          icon="i-lucide-search"
          placeholder="Search employee..."
        />

        <USelect
          :items="departments"
          placeholder="Department"
        />

        <UButton
          block
          icon="i-lucide-filter"
          variant="soft"
        >
          Apply Filters
        </UButton>

      </div>

    </UCard>

    <!-- Employees -->
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard
        v-for="employee in employees"
        :key="employee.id"
        class="rounded-3xl"
      >

        <div class="space-y-5">

          <!-- Header -->
          <div class="flex items-start justify-between">

            <div class="flex items-center gap-3">

              <UAvatar
                size="lg"
                :alt="employee.name"
              />

              <div>

                <h3 class="font-semibold">
                  {{ employee.name }}
                </h3>

                <p class="text-xs text-muted">
                  {{ employee.position }}
                </p>

              </div>

            </div>

            <UBadge
              color="success"
              variant="soft"
            >
              Active
            </UBadge>

          </div>

          <!-- Salary -->
          <div class="space-y-3">

            <div class="flex justify-between">
              <span class="text-sm text-muted">
                Basic Salary
              </span>

              <span class="font-medium">
                {{ employee.basic }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-sm text-muted">
                Allowances
              </span>

              <span class="font-medium">
                {{ employee.allowance }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-sm text-muted">
                Deductions
              </span>

              <span class="font-medium text-red-500">
                {{ employee.deduction }}
              </span>
            </div>

          </div>

          <UDivider />

          <div class="flex items-center justify-between">

            <div>

              <p class="text-xs text-muted">
                Net Salary
              </p>

              <h2 class="text-xl font-bold text-primary">
                {{ employee.net }}
              </h2>

            </div>

            <UButton
              size="sm"
              trailing-icon="i-lucide-arrow-right"
            >
              View
            </UButton>

          </div>

        </div>

      </UCard>

    </div>

  </div>
</template>
<script setup lang="ts">
const departments = [
  "Teaching",
  "Finance",
  "ICT",
  "Administration"
]

const stats = [
  {
    label: "Employees",
    value: "90"
  },
  {
    label: "Average Salary",
    value: "Le 7,800"
  },
  {
    label: "Highest Salary",
    value: "Le 15,000"
  },
  {
    label: "Lowest Salary",
    value: "Le 3,500"
  }
]

const employees = [
  {
    id: 1,
    name: "Mary Kamara",
    position: "Teacher",
    basic: "Le 7,000",
    allowance: "Le 1,500",
    deduction: "Le 300",
    net: "Le 8,200"
  },
  {
    id: 2,
    name: "John Doe",
    position: "Accountant",
    basic: "Le 6,500",
    allowance: "Le 1,200",
    deduction: "Le 250",
    net: "Le 7,450"
  },
  {
    id: 3,
    name: "Peter Sesay",
    position: "ICT Officer",
    basic: "Le 8,000",
    allowance: "Le 1,400",
    deduction: "Le 300",
    net: "Le 9,100"
  }
]
</script>