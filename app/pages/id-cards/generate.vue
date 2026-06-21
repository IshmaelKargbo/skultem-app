<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-3xl font-bold">
          Generate ID Cards
        </h1>

        <p class="mt-2 text-sm text-muted">
          Generate printable student and staff identification cards.
        </p>
      </div>

      <UButton
        icon="i-lucide-arrow-left"
        variant="outline"
        to="/id-cards"
      >
        Back
      </UButton>

    </div>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Students
          </p>

          <h2 class="text-2xl font-bold">
            1,250
          </h2>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Teachers
          </p>

          <h2 class="text-2xl font-bold">
            65
          </h2>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Staff
          </p>

          <h2 class="text-2xl font-bold">
            22
          </h2>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Templates
          </p>

          <h2 class="text-2xl font-bold">
            4
          </h2>
        </div>
      </UCard>

    </div>

    <!-- Generator -->
    <UCard class="rounded-3xl">

      <template #header>
        <h2 class="font-semibold text-lg">
          Card Settings
        </h2>
      </template>

      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

        <UFormField label="Card Type">
          <USelect
            v-model="form.type"
            :items="types"
          />
        </UFormField>

        <UFormField label="Academic Year">
          <USelect
            v-model="form.year"
            :items="years"
          />
        </UFormField>

        <UFormField label="Class">
          <USelect
            v-model="form.class"
            :items="classes"
          />
        </UFormField>

        <UFormField label="Section">
          <USelect
            v-model="form.section"
            :items="sections"
          />
        </UFormField>

        <UFormField label="Template">
          <USelect
            v-model="form.template"
            :items="templates"
          />
        </UFormField>

        <UFormField label="Expiry Date">
          <UInput
            v-model="form.expiryDate"
            type="date"
          />
        </UFormField>

      </div>

    </UCard>

    <!-- Options -->
    <UCard>

      <template #header>
        <h2 class="font-semibold">
          Card Options
        </h2>
      </template>

      <div class="space-y-5">

        <UCheckbox
          v-model="form.includeQr"
          label="Include QR Code"
        />

        <UCheckbox
          v-model="form.includeBarcode"
          label="Include Barcode"
        />

        <UCheckbox
          v-model="form.includeSignature"
          label="Include Principal Signature"
        />

        <UCheckbox
          v-model="form.includeExpiry"
          label="Show Expiry Date"
        />

      </div>

    </UCard>

    <!-- Preview -->
    <UCard>

      <template #header>
        <h2 class="font-semibold">
          Summary
        </h2>
      </template>

      <div class="grid gap-4 md:grid-cols-3">

        <div class="rounded-2xl bg-primary/5 p-5">
          <p class="text-sm text-muted">
            Card Type
          </p>

          <h3 class="font-bold mt-2">
            {{ form.type }}
          </h3>
        </div>

        <div class="rounded-2xl bg-primary/5 p-5">
          <p class="text-sm text-muted">
            Template
          </p>

          <h3 class="font-bold mt-2">
            {{ form.template }}
          </h3>
        </div>

        <div class="rounded-2xl bg-primary/5 p-5">
          <p class="text-sm text-muted">
            Cards To Generate
          </p>

          <h3 class="font-bold mt-2">
            45
          </h3>
        </div>

      </div>

    </UCard>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">

      <UButton
        icon="i-lucide-id-card"
        color="primary"
        size="lg"
      >
        Generate Cards
      </UButton>

      <UButton
        icon="i-lucide-eye"
        variant="outline"
      >
        Preview
      </UButton>

      <UButton
        icon="i-lucide-download"
        variant="outline"
      >
        Download PDF
      </UButton>

      <UButton
        icon="i-lucide-printer"
        variant="outline"
      >
        Print
      </UButton>

    </div>

  </div>
</template>

<script setup lang="ts">
const form = reactive({
  type: 'Student',
  year: '2025/2026',
  class: 'JSS1',
  section: 'A',
  template: 'Standard Template',
  expiryDate: '',

  includeQr: true,
  includeBarcode: true,
  includeSignature: true,
  includeExpiry: true
})

const types = [
  'Student',
  'Teacher',
  'Staff'
]

const years = [
  '2025/2026',
  '2026/2027'
]

const classes = [
  'JSS1',
  'JSS2',
  'JSS3',
  'SSS1',
  'SSS2',
  'SSS3'
]

const sections = [
  'A',
  'B',
  'C'
]

const templates = [
  'Standard Template',
  'Modern Blue',
  'Classic Green',
  'International'
]

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>