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

        <UButton icon="i-lucide-plus" to="/payroll/employees/add">
          Add Employee Salary
        </UButton>

        <UButton variant="soft" icon="i-lucide-download">
          Export
        </UButton>

      </div>

    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard v-for="stat in stats" :key="stat.label" class="rounded-3xl">
        <div class="flex items-center gap-4">

          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-2xl"
            :class="stat.iconBg"
          >
            <UIcon :name="stat.icon" class="size-5" :class="stat.iconColor" />
          </div>

          <div>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>

            <h2 class="text-2xl font-bold">
              {{ stat.value }}
            </h2>
          </div>

        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard class="rounded-3xl">

      <div class="grid gap-3 md:grid-cols-[1fr_220px_auto]">

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search employee..."
        />

        <USelect
          v-model="departmentFilter"
          :items="departmentOptions"
          placeholder="Department"
        />

        <UButton
          v-if="search || departmentFilter !== 'All Departments'"
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          @click="clearFilters"
        >
          Clear
        </UButton>

      </div>

    </UCard>

    <!-- Employees -->
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard v-for="employee in filteredEmployees" :key="employee.id" class="rounded-3xl">

        <div class="space-y-5">

          <!-- Header -->
          <div class="flex items-start justify-between gap-2">

            <div class="flex items-center gap-3">

              <UAvatar size="3xl" :alt="employee.name" />

              <div>

                <h3 class="font-semibold leading-tight">
                  {{ employee.name }}
                </h3>

                <p class="text-xs text-muted">
                  {{ employee.position }}
                </p>
              </div>

            </div>

            <UBadge color="success" variant="soft" class="shrink-0">
              Active
            </UBadge>

          </div>

          <!-- Salary breakdown -->
          <div class="space-y-2.5 rounded-2xl bg-elevated/50 p-4">

            <div class="flex justify-between text-sm">
              <span class="text-muted">Basic Salary</span>
              <span class="font-medium">{{ employee.basic }}</span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-muted">Allowances</span>
              <span class="font-medium text-green-600">+ {{ employee.allowance }}</span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-muted">Deductions</span>
              <span class="font-medium text-red-500">- {{ employee.deduction }}</span>
            </div>

          </div>

          <!-- Net salary, the focal point of the card -->
          <div class="rounded-2xl bg-primary-100 p-4 text-center text-black">
            <p class="text-xs opacity-80">Net Salary</p>
            <p class="text-2xl font-bold">{{ employee.net }}</p>
          </div>

          <UButton
            block
            variant="soft"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
            :to="`/payroll/employees/${employee.id}`"
          >
            View Salary Structure
          </UButton>

        </div>

      </UCard>

      <div
        v-if="filteredEmployees.length === 0"
        class="col-span-full flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-default py-16 text-center"
      >
        <UIcon name="i-lucide-search-x" class="size-8 text-muted" />
        <p class="font-medium">No employees match your filters</p>
        <UButton variant="soft" size="sm" @click="clearFilters">Clear filters</UButton>
      </div>

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

const departmentOptions = ["All Departments", ...departments]

const stats = [
  {
    label: "Employees",
    value: "90",
    icon: "i-lucide-users",
    iconBg: "bg-primary-50 dark:bg-primary-500/10",
    iconColor: "text-primary-500"
  },
  {
    label: "Average Salary",
    value: "Le 7,800",
    icon: "i-lucide-bar-chart-3",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-500"
  },
  {
    label: "Highest Salary",
    value: "Le 15,000",
    icon: "i-lucide-trending-up",
    iconBg: "bg-green-50 dark:bg-green-500/10",
    iconColor: "text-green-500"
  },
  {
    label: "Lowest Salary",
    value: "Le 3,500",
    icon: "i-lucide-trending-down",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-500"
  }
]

const employees = [
  {
    id: 1,
    name: "Mary Kamara",
    position: "Teacher",
    department: "Teaching",
    basic: "Le 7,000",
    allowance: "Le 1,500",
    deduction: "Le 300",
    net: "Le 8,200"
  },
  {
    id: 2,
    name: "John Doe",
    position: "Accountant",
    department: "Finance",
    basic: "Le 6,500",
    allowance: "Le 1,200",
    deduction: "Le 250",
    net: "Le 7,450"
  },
  {
    id: 3,
    name: "Peter Sesay",
    position: "ICT Officer",
    department: "ICT",
    basic: "Le 8,000",
    allowance: "Le 1,400",
    deduction: "Le 300",
    net: "Le 9,100"
  }
]

const search = ref("")
const departmentFilter = ref("All Departments")

const filteredEmployees = computed(() => {
  return employees.filter((employee) => {
    const matchesSearch = employee.name
      .toLowerCase()
      .includes(search.value.trim().toLowerCase())

    const matchesDepartment =
      departmentFilter.value === "All Departments" ||
      employee.department === departmentFilter.value

    return matchesSearch && matchesDepartment
  })
})

function clearFilters() {
  search.value = ""
  departmentFilter.value = "All Departments"
}
</script>