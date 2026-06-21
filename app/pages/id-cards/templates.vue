<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-3xl font-bold">
          ID Card Templates
        </h1>

        <p class="mt-2 text-sm text-muted">
          Create and manage ID card designs used throughout the school.
        </p>
      </div>

      <div class="flex gap-3">

        <UButton
          icon="i-lucide-plus"
          color="primary"
          to="/documents/ID Cards/create-template"
        >
          New Template
        </UButton>

      </div>

    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="flex gap-4 items-center">

          <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UIcon
              name="i-lucide-layout-template"
              class="text-primary text-xl"
            />
          </div>

          <div>
            <p class="text-xs text-muted">
              Templates
            </p>

            <h3 class="text-2xl font-bold">
              6
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex gap-4 items-center">

          <div class="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <UIcon
              name="i-lucide-check-circle"
              class="text-green-600 text-xl"
            />
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
        <div class="flex gap-4 items-center">

          <div class="size-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <UIcon
              name="i-lucide-star"
              class="text-yellow-600 text-xl"
            />
          </div>

          <div>
            <p class="text-xs text-muted">
              Default
            </p>

            <h3 class="font-semibold">
              Modern Blue
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex gap-4 items-center">

          <div class="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <UIcon
              name="i-lucide-copy"
              class="text-purple-600 text-xl"
            />
          </div>

          <div>
            <p class="text-xs text-muted">
              Copies
            </p>

            <h3 class="text-2xl font-bold">
              14
            </h3>
          </div>

        </div>
      </UCard>

    </div>

    <!-- Search -->
    <UCard>

      <div class="grid gap-4 lg:grid-cols-3">

        <UInput
          icon="i-lucide-search"
          placeholder="Search templates..."
        />

        <USelect
          :items="['All', 'Active', 'Draft']"
          placeholder="Status"
        />

        <USelect
          :items="['Recent', 'Oldest']"
          placeholder="Sort"
        />

      </div>

    </UCard>

    <!-- Templates -->
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard
        v-for="template in templates"
        :key="template.id"
        class="overflow-hidden rounded-3xl"
      >

        <!-- Preview -->
        <div
          class="h-56 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-default flex items-center justify-center"
        >

          <div class="w-44 h-28 bg-white rounded-2xl shadow-lg p-3">

            <div class="flex items-center gap-2">

              <div class="size-10 rounded-xl bg-primary/20"></div>

              <div class="space-y-1">

                <div class="w-20 h-2 bg-gray-200 rounded"></div>

                <div class="w-14 h-2 bg-gray-200 rounded"></div>

              </div>

            </div>

            <div class="mt-5 h-2 bg-gray-200 rounded"></div>

            <div class="mt-2 h-2 bg-gray-200 rounded"></div>

          </div>

        </div>

        <!-- Body -->
        <div class="mt-5">

          <div class="flex items-center justify-between">

            <h3 class="font-semibold">
              {{ template.name }}
            </h3>

            <UBadge
              :color="template.active ? 'success' : 'neutral'"
              variant="soft"
            >
              {{ template.active ? 'Active' : 'Draft' }}
            </UBadge>

          </div>

          <p class="text-sm text-muted mt-2">
            {{ template.description }}
          </p>

        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-wrap gap-2">

          <UButton
            size="sm"
            icon="i-lucide-eye"
            variant="soft"
            :to="`/id-cards/${template.id}`"
          >
            Preview
          </UButton>

          <UButton
            size="sm"
            icon="i-lucide-pencil"
            variant="outline"
            :to="`/id-cards/${template.id}`"
          >
            Edit
          </UButton>

          <UButton
            size="sm"
            icon="i-lucide-copy"
            variant="outline"
          >
            Duplicate
          </UButton>

          <UButton
            v-if="!template.active"
            size="sm"
            icon="i-lucide-check"
            color="success"
          >
            Set Default
          </UButton>

        </div>

      </UCard>

    </div>

  </div>
</template>

<script setup lang="ts">
const templates = ref([
  {
    id: 1,
    name: 'Modern Blue',
    description: 'Modern ID card with blue accents.',
    active: true
  },
  {
    id: 2,
    name: 'Classic Green',
    description: 'Simple traditional card design.',
    active: false
  },
  {
    id: 3,
    name: 'Minimal White',
    description: 'Clean and elegant layout.',
    active: false
  },
  {
    id: 4,
    name: 'International',
    description: 'Suitable for international schools.',
    active: false
  },
  {
    id: 5,
    name: 'Dark Theme',
    description: 'Modern dark card design.',
    active: false
  },
  {
    id: 6,
    name: 'Primary School',
    description: 'Colorful template for primary schools.',
    active: false
  }
])

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>