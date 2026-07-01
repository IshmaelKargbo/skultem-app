<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Hero -->
    <div class="rounded-3xl">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 class="mt-3 text-3xl font-bold">
            Report Cards
          </h1>

          <p class="mt-2 text-sm text-muted">
            Generate, preview and export student report cards.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-plus" label="Generate Report Cards" />

          <UButton icon="i-lucide-download" variant="outline" label="Bulk Export" />
        </div>

      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-file-text" class="text-xl text-primary" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Total Reports
            </p>

            <h3 class="text-2xl font-bold">
              {{ totalReports }}
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <UIcon name="i-lucide-check-circle" class="text-xl text-emerald-600" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Generated
            </p>

            <h3 class="text-2xl font-bold">
              {{ generatedReports }}
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10">
            <UIcon name="i-lucide-clock" class="text-xl text-amber-600" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Pending
            </p>

            <h3 class="text-2xl font-bold">
              {{ pendingReports }}
            </h3>
          </div>

        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">

          <div class="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
            <UIcon name="i-lucide-download" class="text-xl text-blue-600" />
          </div>

          <div>
            <p class="text-xs text-muted">
              Downloads
            </p>

            <h3 class="text-2xl font-bold">
              {{ downloads }}
            </h3>
          </div>

        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard>

      <div class="grid gap-4 lg:grid-cols-5">

        <UInput v-model="search" icon="i-lucide-search" placeholder="Search student..." />

        <USelect v-model="selectedTerm" :items="terms" placeholder="Term" />

        <USelect v-model="selectedClass" :items="classes" placeholder="Class" />

        <USelect v-model="selectedStatus" :items="statuses" placeholder="Status" />

        <UButton icon="i-lucide-filter" label="Apply Filters" />

      </div>

    </UCard>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="item in reports" :key="item.id"
        class="overflow-hidden rounded-3xl border border-default shadow hover:shadow-sm hover:ring-primary-300 transition">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <UAvatar :alt="item.student" size="lg" class="ring-2 ring-primary/20" />

            <div>
              <h3 class="font-semibold text-base">
                {{ item.student }}
              </h3>

              <div class="flex items-center gap-1 text-sm text-muted">
                <UIcon name="i-lucide-graduation-cap" />
                {{ item.class }}
              </div>
            </div>
          </div>

          <UBadge :label="item.status" :color="item.color" variant="soft" />
        </div>

        <!-- Highlight -->
        <div class="mt-5 rounded-2xl bg-primary/5 border border-primary/10 p-5 text-center">
          <p class="text-xs uppercase tracking-wide text-muted">
            Average Score
          </p>

          <h2 class="mt-2 text-3xl font-bold text-primary">
            {{ item.average }}%
          </h2>

          <p class="mt-1 text-sm text-muted">
            {{ item.term }}
          </p>
        </div>

        <!-- Stats -->
        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-default p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="text-primary" />

              <span class="text-xs text-muted">
                Term
              </span>
            </div>

            <p class="mt-2 font-semibold">
              {{ item.term }}
            </p>
          </div>

          <div class="rounded-2xl border border-default p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-trophy" class="text-amber-500" />

              <span class="text-xs text-muted">
                Position
              </span>
            </div>

            <p class="mt-2 font-semibold">
              {{ item.position }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex gap-3">
          <UButton block icon="i-lucide-eye" variant="soft" :to="{ path: `/report-cards/${item.id}` }">
            Preview
          </UButton>

          <UButton block icon="i-lucide-download">
            PDF
          </UButton>
        </div>
      </UCard>
    </div>

  </div>
</template>
<script setup lang="ts">
const search = ref('')

const selectedTerm = ref()
const selectedClass = ref()
const selectedStatus = ref()

const terms = [
  'Term 1',
  'Term 2',
  'Term 3'
]

const classes = [
  'JSS1',
  'JSS2',
  'SSS1'
]

const statuses = [
  'Generated',
  'Pending'
]

const totalReports = ref(1280)
const generatedReports = ref(1165)
const pendingReports = ref(115)
const downloads = ref(820)

const reports = ref([
  {
    id: 1,
    student: 'John Kamara',
    class: 'JSS1-A',
    term: 'Term 1',
    average: 82,
    position: '3rd',
    status: 'Generated',
    color: 'success'
  },
  {
    id: 2,
    student: 'Fatmata Sesay',
    class: 'SSS2-B',
    term: 'Term 1',
    average: 75,
    position: '8th',
    status: 'Pending',
    color: 'warning'
  },
  {
    id: 3,
    student: 'Ibrahim Koroma',
    class: 'JSS3-A',
    term: 'Term 1',
    average: 91,
    position: '1st',
    status: 'Generated',
    color: 'success'
  }
])
</script>