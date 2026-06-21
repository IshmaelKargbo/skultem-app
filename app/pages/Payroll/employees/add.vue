<template>
  <div class="mx-auto max-w-7xl space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-2xl font-bold">
            Add Salary
          </h1>

          <p class="text-sm text-muted">
            Set up a compensation package for an employee.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">

        <UButton
          variant="soft"
          color="neutral"
          to="/salaries"
        >
          Cancel
        </UButton>

        <UButton
          icon="i-lucide-check"
          :loading="saving"
          @click="saveSalary"
        >
          Save Salary
        </UButton>

      </div>

    </div>

    <form class="grid gap-6 lg:grid-cols-3" @submit.prevent="saveSalary">

      <!-- Left -->
      <div class="space-y-6 lg:col-span-2">

        <!-- Employee -->
        <UCard class="rounded-3xl">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user" />
              <span class="font-semibold">
                Employee
              </span>
            </div>
          </template>

          <UFormField label="Select Employee" required>
            <USelectMenu
              v-model="form.employee"
              :items="employeeOptions"
              option-attribute="name"
              placeholder="Search employees…"
              icon="i-lucide-search"
              class="w-full"
            />
          </UFormField>

          <div
            v-if="form.employee"
            class="mt-4 flex items-center gap-4 rounded-2xl border border-default p-4"
          >
            <UAvatar size="lg" :alt="form.employee.name" />

            <div>
              <p class="font-semibold leading-tight">
                {{ form.employee.name }}
              </p>
              <p class="text-sm text-muted">
                {{ form.employee.position }} · {{ form.employee.department }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Compensation -->
        <UCard class="rounded-3xl">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-wallet" />
              <span class="font-semibold">
                Compensation
              </span>
            </div>
          </template>

          <div class="grid gap-4 md:grid-cols-2">

            <UFormField label="Basic Salary" required>
              <UInput
                v-model.number="form.basicSalary"
                type="number"
                min="0"
                placeholder="0"
                class="w-full"
              >
                <template #leading>
                  <span class="text-sm text-muted">Le</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Effective Date" required>
              <UInput
                v-model="form.effectiveDate"
                type="date"
                class="w-full"
              />
            </UFormField>

          </div>

        </UCard>

        <!-- Allowances -->
        <UCard class="rounded-3xl">

          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-circle-plus" class="text-green-500" />
                <span class="font-semibold">Allowances</span>
              </div>

              <span class="text-sm font-medium text-green-600">
                + {{ formatCurrency(totalAllowances) }}
              </span>
            </div>
          </template>

          <div class="space-y-3">

            <div
              v-for="(item, index) in form.allowances"
              :key="item.id"
              class="flex items-center gap-3 rounded-2xl bg-green-50 p-3 dark:bg-green-500/10"
            >
              <UInput
                v-model="item.name"
                placeholder="e.g. Housing Allowance"
                class="flex-1"
                variant="none"
              />

              <UInput
                v-model.number="item.amount"
                type="number"
                min="0"
                placeholder="0"
                class="w-32 shrink-0"
              >
                <template #leading>
                  <span class="text-xs text-muted">Le</span>
                </template>
              </UInput>

              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                square
                size="sm"
                @click="removeAllowance(index)"
              />
            </div>

            <UButton
              icon="i-lucide-plus"
              variant="soft"
              color="success"
              block
              @click="addAllowance"
            >
              Add Allowance
            </UButton>

          </div>

        </UCard>

        <!-- Deductions -->
        <UCard class="rounded-3xl">

          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-circle-minus" class="text-red-500" />
                <span class="font-semibold">Deductions</span>
              </div>

              <span class="text-sm font-medium text-red-500">
                - {{ formatCurrency(totalDeductions) }}
              </span>
            </div>
          </template>

          <div class="space-y-3">

            <div
              v-for="(item, index) in form.deductions"
              :key="item.id"
              class="flex items-center gap-3 rounded-2xl bg-red-50 p-3 dark:bg-red-500/10"
            >
              <UInput
                v-model="item.name"
                placeholder="e.g. Income Tax"
                class="flex-1"
                variant="none"
              />

              <UInput
                v-model.number="item.amount"
                type="number"
                min="0"
                placeholder="0"
                class="w-32 shrink-0"
              >
                <template #leading>
                  <span class="text-xs text-muted">Le</span>
                </template>
              </UInput>

              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                square
                size="sm"
                @click="removeDeduction(index)"
              />
            </div>

            <UButton
              icon="i-lucide-plus"
              variant="soft"
              color="error"
              block
              @click="addDeduction"
            >
              Add Deduction
            </UButton>

          </div>

        </UCard>

      </div>

      <!-- Right -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <!-- Live Net Salary preview -->
        <UCard class="overflow-hidden rounded-3xl">

          <div class="bg-primary-500 p-6 text-center text-white">

            <p class="text-sm opacity-80">
              Net Salary (preview)
            </p>

            <h1 class="mt-3 text-4xl font-bold">
              {{ formatCurrency(netSalary) }}
            </h1>

            <p class="mt-2 text-xs opacity-75">
              {{ formatCurrency(grossSalary) }} gross − {{ formatCurrency(totalDeductions) }} deductions
            </p>

          </div>

          <div class="space-y-2 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Basic Salary</span>
              <span class="font-medium">{{ formatCurrency(form.basicSalary || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Allowances</span>
              <span class="font-medium text-green-600">+ {{ formatCurrency(totalAllowances) }}</span>
            </div>
            <div class="flex justify-between border-t border-default pt-2">
              <span class="text-muted">Gross Salary</span>
              <span class="font-medium">{{ formatCurrency(grossSalary) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Deductions</span>
              <span class="font-medium text-red-500">- {{ formatCurrency(totalDeductions) }}</span>
            </div>
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

            <UFormField label="Bank">
              <USelectMenu
                v-model="form.bank"
                :items="bankOptions"
                placeholder="Select bank"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Account Number">
              <UInput
                v-model="form.accountNumber"
                placeholder="e.g. 0012344567"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Payment Frequency">
              <USelectMenu
                v-model="form.frequency"
                :items="['Monthly', 'Bi-weekly', 'Weekly']"
                class="w-full"
              />
            </UFormField>

          </div>

        </UCard>

        <!-- Notes -->
        <UCard class="rounded-3xl">

          <template #header>
            <span class="font-semibold">
              Notes
            </span>
          </template>

          <UTextarea
            v-model="form.notes"
            placeholder="Optional notes about this compensation package…"
            :rows="3"
            class="w-full"
          />

        </UCard>

      </div>

    </form>

  </div>
</template>

<script setup lang="ts">
let nextId = 1
function makeId() {
  return `row-${nextId++}`
}

const employeeOptions = ref([
  { id: 1, name: "Mary Kamara", position: "Senior Teacher", department: "Teaching" },
  { id: 2, name: "Ibrahim Kallon", position: "Backend Engineer", department: "Engineering" },
  { id: 3, name: "Zainab Dumbuya", position: "VP Sales", department: "Sales" },
  { id: 4, name: "Samuel Vandi", position: "Operations Officer", department: "Operations" }
])

const bankOptions = [
  "Rokel Commercial Bank",
  "Sierra Leone Commercial Bank",
  "Union Trust Bank",
  "Zenith Bank (SL)"
]

const form = reactive({
  employee: null as null | (typeof employeeOptions.value)[number],
  basicSalary: 0,
  effectiveDate: "",
  allowances: [
    { id: makeId(), name: "Housing Allowance", amount: 0 },
    { id: makeId(), name: "Transport Allowance", amount: 0 }
  ],
  deductions: [
    { id: makeId(), name: "Income Tax", amount: 0 }
  ],
  bank: "",
  accountNumber: "",
  frequency: "Monthly",
  notes: ""
})

const saving = ref(false)

const totalAllowances = computed(() =>
  form.allowances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
)

const totalDeductions = computed(() =>
  form.deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
)

const grossSalary = computed(() => (Number(form.basicSalary) || 0) + totalAllowances.value)

const netSalary = computed(() => grossSalary.value - totalDeductions.value)

function formatCurrency(value: number) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

function addAllowance() {
  form.allowances.push({ id: makeId(), name: "", amount: 0 })
}

function removeAllowance(index: number) {
  form.allowances.splice(index, 1)
}

function addDeduction() {
  form.deductions.push({ id: makeId(), name: "", amount: 0 })
}

function removeDeduction(index: number) {
  form.deductions.splice(index, 1)
}

async function saveSalary() {
  saving.value = true
  try {
    // Replace with a real API call, e.g.:
    // await $fetch('/api/salaries', { method: 'POST', body: form })
    await new Promise((resolve) => setTimeout(resolve, 600))
    await navigateTo(form.employee ? `/salaries/${form.employee.id}` : "/salaries")
  } finally {
    saving.value = false
  }
}
</script>