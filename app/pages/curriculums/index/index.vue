<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Scheme of Work" subtitle="Manage subjects, weekly topics, lesson notes, and curriculum coverage.">
      <UButton v-if="isAdmin" icon="i-lucide-book-plus" label="Create Scheme" to="/curriculums/add" />
    </Heading>

    <!-- Main Grid -->
    <div class="grid gap-4 xl:grid-cols-3">
      <CurriculumSchemeOfWorkSchemes :mine="!isAdmin" />

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

  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()

const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

onMounted(async () => {
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

const quickActions = computed(() => {
  const actions = [
    { label: 'Subjects', icon: 'i-lucide-book-open', to: '/subjects', color: 'neutral' as const }
  ]

  if (isAdmin.value) {
    actions.unshift({ label: 'Create Scheme', icon: 'i-lucide-book-plus', to: '/curriculums/add', color: 'primary' as const })
  }

  return actions
})
</script>
