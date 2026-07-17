<template>
  <div class="space-y-5 p-4">
    <Heading title="Scheme of Work" subtitle="Manage subjects, weekly topics, lesson plans, and curriculum coverage.">
      <UButton icon="i-lucide-book-plus" label="Create Scheme" to="/curriculums/add" />
    </Heading>
    <!-- Statistics -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl" :class="stat.bg">
            <UIcon :name="stat.icon" class="size-6" :class="stat.color" />
          </div>

          <div>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>

            <h3 class="text-2xl font-bold">
              {{ stat.value }}
            </h3>
          </div>
        </div>
      </UCard>

    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 xl:grid-cols-3">

      <!-- Recent Schemes -->
      <CurriculumSchemeOfWorkSchemes />

      <!-- Quick Actions -->
      <div>
        <UCard :ui="{ body: 'space-y-2' }">

          <template #header>
            <div>
              <h3 class="font-semibold">
                Quick Actions
              </h3>

              <p class="text-sm text-muted">
                Frequently used actions.
              </p>
            </div>
          </template>

          <UButton v-for="action in quickActions" :key="action.label" block variant="soft" :color="action.color"
            :icon="action.icon" :label="action.label" :to="action.to" class="justify-start" />

        </UCard>
      </div>

    </div>

    <!-- Coverage Progress -->
    <UCard :ui="{ body: 'space-y-5' }">

      <template #header>
        <div>
          <h3 class="font-semibold">
            Curriculum Coverage
          </h3>

          <p class="text-sm text-muted">
            Monitor teaching progress across subjects.
          </p>
        </div>
      </template>

      <div v-for="subject in coverage" :key="subject.name">
        <div class="mb-2 flex items-center justify-between text-sm">
          <span class="font-medium">{{ subject.name }}</span>
          <span class="text-muted">{{ subject.progress }}%</span>
        </div>

        <UProgress :model-value="subject.progress" :color="coverageColor(subject.progress)" />
      </div>

    </UCard>

  </div>
</template>

<script setup lang="ts">

onMounted(async () => {
  document.title = 'Scheme of Work | Skultem'
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})

const stats = [
  { label: 'Subjects', value: 12, icon: 'i-lucide-book-open', bg: 'bg-primary/10', color: 'text-primary' },
  { label: 'Schemes', value: 34, icon: 'i-lucide-notebook-pen', bg: 'bg-success/10', color: 'text-success' },
  { label: 'Topics', value: 156, icon: 'i-lucide-list-todo', bg: 'bg-warning/10', color: 'text-warning' },
  { label: 'Lesson Plans', value: 84, icon: 'i-lucide-clipboard-check', bg: 'bg-info/10', color: 'text-info' }
]

const recentSchemes = [
  { title: 'Mathematics - JSS 1', term: 'Term 1', year: '2026/2027', status: 'Active', to: '/scheme-of-work/1' },
  { title: 'English Language - JSS 2', term: 'Term 2', year: '2026/2027', status: 'Draft', to: '/scheme-of-work/2' },
  { title: 'Biology - SSS 1', term: 'Term 1', year: '2026/2027', status: 'Active', to: '/scheme-of-work/3' }
]

const quickActions = [
  { label: 'Create Scheme', icon: 'i-lucide-book-plus', to: '/scheme-of-work/create', color: 'primary' },
  { label: 'Subjects', icon: 'i-lucide-book-open', to: '/subjects', color: 'neutral' },
  { label: 'Topics', icon: 'i-lucide-list', to: '/topics', color: 'neutral' },
  { label: 'Lesson Plans', icon: 'i-lucide-notebook-tabs', to: '/lesson-plans', color: 'neutral' }
]

const coverage = [
  { name: 'Mathematics', progress: 78 },
  { name: 'English Language', progress: 65 },
  { name: 'Biology', progress: 92 }
]

function coverageColor(progress: number) {
  if (progress >= 85) return 'success'
  if (progress >= 60) return 'primary'
  return 'warning'
}
</script>