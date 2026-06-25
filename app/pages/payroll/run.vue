<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Payroll Run
        </h1>

        <p class="text-sm text-muted">
          Generate and manage payroll for June 2026.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">

        <UButton
          icon="i-lucide-eye"
          variant="soft"
        >
          Preview
        </UButton>

        <UButton
          icon="i-lucide-download"
          variant="soft"
        >
          Export
        </UButton>

      </div>

    </div>

    <!-- Payroll Period -->
    <UCard class="rounded-3xl">

      <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div class="grid grid-cols-2 gap-5 sm:grid-cols-3">

          <div>
            <p class="text-xs text-muted">
              Payroll Period
            </p>

            <p class="font-semibold">
              June 2026
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">
              Pay Date
            </p>

            <p class="font-semibold">
              30 June 2026
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">
              Status
            </p>

            <UBadge :color="statusColor" variant="soft">
              {{ status }}
            </UBadge>
          </div>

        </div>

        <UButton
          icon="i-lucide-play"
          size="lg"
          :loading="generating"
          :disabled="status !== 'Draft' || includedCount === 0"
          @click="generatePayroll"
        >
          {{ status === 'Draft' ? 'Generate Payroll' : 'Payroll Generated' }}
        </UButton>

      </div>

    </UCard>

    <!-- Summary — reflects only included employees -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard class="rounded-3xl">
        <div class="space-y-2">
          <p class="text-sm text-muted">Included Employees</p>
          <h2 class="text-3xl font-bold">{{ includedCount }} <span class="text-base font-normal text-muted">/ {{ employees.length }}</span></h2>
        </div>
      </UCard>

      <UCard class="rounded-3xl">
        <div class="space-y-2">
          <p class="text-sm text-muted">Gross Payroll</p>
          <h2 class="text-3xl font-bold">{{ formatCurrency(grossTotal) }}</h2>
        </div>
      </UCard>

      <UCard class="rounded-3xl">
        <div class="space-y-2">
          <p class="text-sm text-muted">Deductions</p>
          <h2 class="text-3xl font-bold text-red-500">{{ formatCurrency(deductionTotal) }}</h2>
        </div>
      </UCard>

      <UCard class="rounded-3xl">
        <div class="space-y-2">
          <p class="text-sm text-muted">Net Payroll</p>
          <h2 class="text-3xl font-bold text-primary">{{ formatCurrency(netTotal) }}</h2>
        </div>
      </UCard>

    </div>

    <!-- Employees -->
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">Employees in this run</h2>

      <div class="flex gap-2">
        <UButton variant="ghost" color="neutral" size="sm" @click="setAll(true)">Select all</UButton>
        <UButton variant="ghost" color="neutral" size="sm" @click="setAll(false)">Deselect all</UButton>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard
        v-for="employee in employees"
        :key="employee.id"
        class="rounded-3xl transition-opacity"
        :class="{ 'opacity-50': !employee.included }"
      >

        <div class="space-y-5">

          <!-- Employee -->
          <div class="flex items-start justify-between gap-2">

            <div class="flex items-center gap-3">

              <UAvatar
                size="lg"
                :alt="employee.name"
              />

              <div>

                <h3 class="font-semibold leading-tight">
                  {{ employee.name }}
                </h3>

                <p class="text-xs text-muted">
                  {{ employee.position }}
                </p>

              </div>

            </div>

            <USwitch
              v-model="employee.included"
              :disabled="status !== 'Draft'"
            />

          </div>

          <!-- Salary -->
          <div class="space-y-2.5 rounded-2xl bg-elevated/50 p-4">

            <div class="flex items-center justify-between text-sm">
              <span class="text-muted">Basic Salary</span>
              <span class="font-medium">{{ employee.basic }}</span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-muted">Allowances</span>
              <span class="font-medium text-green-600">+ {{ employee.allowance }}</span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-muted">Deductions</span>
              <span class="font-medium text-red-500">- {{ employee.deduction }}</span>
            </div>

          </div>

          <div class="flex items-center justify-between gap-3 rounded-2xl bg-primary-500 p-4 text-white">
            <div>
              <p class="text-xs opacity-80">Net Salary</p>
              <p class="text-xl font-bold">{{ employee.net }}</p>
            </div>

            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              trailing-icon="i-lucide-arrow-right"
              class="text-white hover:bg-white/10"
              :to="`/payroll/${employee.id}`"
            >
              Details
            </UButton>
          </div>

          <p v-if="!employee.included" class="flex items-center gap-1.5 text-xs text-muted">
            <UIcon name="i-lucide-circle-slash" class="size-3.5" />
            Excluded from this payroll run
          </p>

        </div>

      </UCard>

    </div>

    <!-- Bottom Actions -->
    <UCard class="rounded-3xl">

      <div class="flex flex-col gap-3 md:flex-row">

        <UButton
          block
          variant="soft"
          icon="i-lucide-send"
          :disabled="status === 'Draft'"
        >
          Publish Payslips
        </UButton>

        <UButton
          block
          variant="soft"
          icon="i-lucide-file-spreadsheet"
        >
          Export Excel
        </UButton>

      </div>

    </UCard>

  </div>
</template>

<script setup lang="ts">
const employees = reactive([
  {
    id: 1,
    name: "Mary Kamara",
    position: "Teacher",
    basic: "Le 7,000",
    allowance: "Le 1,500",
    deduction: "Le 300",
    net: "Le 8,200",
    included: true
  },
  {
    id: 2,
    name: "John Doe",
    position: "Accountant",
    basic: "Le 6,500",
    allowance: "Le 1,200",
    deduction: "Le 250",
    net: "Le 7,450",
    included: true
  },
  {
    id: 3,
    name: "Peter Sesay",
    position: "ICT Officer",
    basic: "Le 8,000",
    allowance: "Le 1,400",
    deduction: "Le 300",
    net: "Le 9,100",
    included: true
  }
])

const status = ref<"Draft" | "Generated">("Draft")
const generating = ref(false)

const statusColor = computed(() => (status.value === "Draft" ? "warning" : "success"))

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.-]/g, ""))
}

const includedCount = computed(() => employees.filter((e) => e.included).length)

const grossTotal = computed(() =>
  employees
    .filter((e) => e.included)
    .reduce((sum, e) => sum + parseAmount(e.basic) + parseAmount(e.allowance), 0)
)

const deductionTotal = computed(() =>
  employees
    .filter((e) => e.included)
    .reduce((sum, e) => sum + parseAmount(e.deduction), 0)
)

const netTotal = computed(() => grossTotal.value - deductionTotal.value)

function formatCurrency(value: number) {
  return `Le ${value.toLocaleString()}`
}

function setAll(value: boolean) {
  employees.forEach((e) => (e.included = value))
}

async function generatePayroll() {
  generating.value = true
  try {
    // Replace with a real API call, e.g.:
    // await $fetch('/api/payroll/run', { method: 'POST', body: { employees } })
    await new Promise((resolve) => setTimeout(resolve, 900))
    status.value = "Generated"
  } finally {
    generating.value = false
  }
}
</script>