<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Scheme of Work
        </h1>

        <p class="mt-1 text-sm text-muted">
          Manage subjects, weekly topics, lesson plans, and curriculum coverage.
        </p>
      </div>

      <div class="flex gap-3">
        <UButton
          icon="i-lucide-book-plus"
          label="Create Scheme"
          to="/scheme-of-work/add"
        />
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl"
            :class="stat.bg">
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
      <div class="xl:col-span-2">
        <UCard :ui="{ body: 'space-y-3' }">

          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">
                  Recent Schemes
                </h3>

                <p class="text-sm text-muted">
                  Recently created schemes of work.
                </p>
              </div>

              <UButton
                variant="ghost"
                color="neutral"
                label="View All"
                trailing-icon="i-lucide-arrow-right"
                to="/scheme-of-work/list"
              />
            </div>
          </template>

          <NuxtLink
            v-for="scheme in recentSchemes"
            :key="scheme.title"
            :to="scheme.to"
            class="flex items-center justify-between gap-4 rounded-xl border border-default p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted">
                <UIcon name="i-lucide-book-open" class="size-5" />
              </div>

              <div>
                <h4 class="font-medium">
                  {{ scheme.title }}
                </h4>

                <p class="mt-0.5 text-sm text-muted">
                  {{ scheme.term }} • {{ scheme.year }}
                </p>
              </div>
            </div>

            <UBadge
              :color="scheme.status === 'Active' ? 'success' : 'warning'"
              variant="subtle"
            >
              {{ scheme.status }}
            </UBadge>
          </NuxtLink>

          <div v-if="!recentSchemes.length" class="flex flex-col items-center gap-3 py-10 text-center">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-muted/40 text-muted">
              <UIcon name="i-lucide-book-open" class="size-6" />
            </div>

            <div>
              <h4 class="font-semibold">
                No schemes yet
              </h4>

              <p class="mt-1 text-sm text-muted">
                Create your first scheme of work to get started.
              </p>
            </div>
          </div>

        </UCard>
      </div>

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

          <UButton
            v-for="action in quickActions"
            :key="action.label"
            block
            variant="soft"
            :color="action.color"
            :icon="action.icon"
            :label="action.label"
            :to="action.to"
            class="justify-start"
          />

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
onMounted(() => {
  useAppStore().setTitle('Scheme of Work')

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