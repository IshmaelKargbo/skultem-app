<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-3xl font-bold">
          Report Card Templates
        </h1>

        <p class="mt-2 text-sm text-muted">
          Create and manage report card layouts used throughout the school.
        </p>
      </div>

      <div class="flex gap-3">
        <UButton icon="i-lucide-plus" color="primary" to="/report-cards/templates/add">
          New Template
        </UButton>
      </div>

    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-files" class="text-primary text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Total Templates
            </p>

            <h3 class="text-2xl font-bold">
              6
            </h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-green-500/10">
            <UIcon name="i-lucide-check-circle" class="text-green-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Active
            </p>

            <h3 class="text-2xl font-bold">
              1
            </h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-yellow-500/10">
            <UIcon name="i-lucide-star" class="text-yellow-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Default
            </p>

            <h3 class="text-lg font-semibold">
              Primary
            </h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
            <UIcon name="i-lucide-file-pen-line" class="text-purple-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Draft
            </p>

            <h3 class="text-2xl font-bold">
              2
            </h3>
          </div>
        </div>
      </UCard>

    </div>

    <!-- Search -->
    <UCard>

      <div class="grid gap-4 lg:grid-cols-3">

        <UInput icon="i-lucide-search" placeholder="Search templates..." />

        <USelect :items="['All Status', 'Active', 'Draft']" placeholder="Status" />

        <USelect :items="['Recent', 'Oldest']" placeholder="Sort By" />

      </div>

    </UCard>

    <!-- Templates -->
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard v-for="template in templates" :key="template.id" class="rounded-3xl overflow-hidden hover:ring-primary-300">

        <!-- Preview -->
        <div
          class="h-56 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
          <UIcon name="i-lucide-file-text" class="text-7xl text-primary" />
        </div>

        <div class="mt-5">

          <div class="flex items-center justify-between">

            <h3 class="font-semibold">
              {{ template.name }}
            </h3>

            <UBadge :color="template.active ? 'success' : 'neutral'" variant="soft">
              {{ template.active ? 'Active' : 'Draft' }}
            </UBadge>

          </div>

          <p class="mt-2 text-sm text-muted">
            {{ template.description }}
          </p>
          <div class="mt-6 flex flex-wrap gap-2">

            <!-- Preview -->
            <UButton size="sm" icon="i-lucide-eye" variant="soft" color="primary"
              :to="`/report-cards/templates/${template.id}`">
              Preview
            </UButton>

            <!-- Edit -->
            <UButton size="sm" icon="i-lucide-pencil" variant="outline"
              :to="`/report-cards/templates/${template.id}/edit`">
              Edit
            </UButton>

            <!-- Duplicate -->
            <!-- <UButton size="sm" icon="i-lucide-copy" variant="outline" @click="duplicateTemplate(template)">
              Duplicate
            </UButton> -->

            <!-- Set Default -->
            <UButton v-if="!template.active" size="sm" color="success" icon="i-lucide-check"
              @click="setDefault(template)">
              Set Default
            </UButton>

          </div>
        </div>

      </UCard>

    </div>

  </div>
</template>

<script setup lang="ts">
const templates = ref([
  {
    id: 1,
    name: 'Primary School Template',
    description: 'Designed for lower primary classes.',
    active: true
  },
  {
    id: 2,
    name: 'Secondary School Template',
    description: 'Standard report card for JSS and SSS.',
    active: false
  },
  {
    id: 3,
    name: 'WAEC Style Template',
    description: 'WAEC-inspired grading layout.',
    active: false
  },
  {
    id: 4,
    name: 'International Template',
    description: 'Cambridge and international schools.',
    active: false
  },
  {
    id: 5,
    name: 'Montessori Template',
    description: 'Designed for Montessori schools.',
    active: false
  },
  {
    id: 6,
    name: 'Classic Blue Template',
    description: 'Traditional report card design.',
    active: false
  }
])
</script>