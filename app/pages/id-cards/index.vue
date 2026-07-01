<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-3xl font-bold">
          ID Cards
        </h1>

        <p class="mt-2 text-sm text-muted">
          Generate and manage student and staff identification cards.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">

        <UButton icon="i-lucide-plus" color="primary" to="/id-cards/generate">
          Generate ID Cards
        </UButton>

        <UButton icon="i-lucide-printer" variant="outline">
          Print All
        </UButton>

        <UButton icon="i-lucide-download" variant="outline">
          Export PDF
        </UButton>

      </div>

    </div>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-id-card" class="text-primary text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Total Cards
            </p>

            <h3 class="text-2xl font-bold">
              1,250
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
              Printed
            </p>

            <h3 class="text-2xl font-bold">
              1,100
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-yellow-500/10">
            <UIcon name="i-lucide-clock" class="text-yellow-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Pending
            </p>

            <h3 class="text-2xl font-bold">
              150
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
            <UIcon name="i-lucide-users" class="text-purple-600 text-xl" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Active Students
            </p>

            <h3 class="text-2xl font-bold">
              1,250
            </h3>
          </div>

        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard>

      <div class="grid gap-4 lg:grid-cols-5">

        <UInput icon="i-lucide-search" placeholder="Search student..." />

        <USelect :items="['All Classes', 'JSS1', 'JSS2', 'JSS3', 'SSS1']" placeholder="Class" />

        <USelect :items="['Student', 'Teacher', 'Staff']" placeholder="Type" />

        <USelect :items="['Generated', 'Pending']" placeholder="Status" />

        <UButton icon="i-lucide-filter" label="Apply" />

      </div>

    </UCard>

    <!-- Cards -->
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <UCard v-for="student in students" :key="student.id" class="rounded-3xl overflow-hidden">

        <div class="flex gap-4">

          <UAvatar size="3xl" :alt="student.name" />

          <div>

            <h3 class="font-semibold">
              {{ student.name }}
            </h3>

            <p class="text-sm text-muted">
              {{ student.class }}
            </p>

            <UBadge color="primary" variant="soft" class="mt-2">
              {{ student.admissionNo }}
            </UBadge>

          </div>

        </div>

        <div class="mt-6 flex gap-2">
          <UButton block icon="i-lucide-eye" variant="soft" :to="`/id-cards/${student.id}`">
            Preview
          </UButton>

          <UButton block icon="i-lucide-printer" variant="outline">
            Print
          </UButton>

          <UButton block icon="i-lucide-download" variant="outline">
            PDF
          </UButton>

        </div>

      </UCard>

    </div>

  </div>
</template>

<script setup lang="ts">
const students = ref([
  {
    id: 1,
    name: 'John Kamara',
    class: 'JSS1-A',
    admissionNo: 'KWIS001'
  },
  {
    id: 2,
    name: 'Fatmata Sesay',
    class: 'JSS2-B',
    admissionNo: 'KWIS002'
  },
  {
    id: 3,
    name: 'Mohamed Koroma',
    class: 'SSS1-A',
    admissionNo: 'KWIS003'
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