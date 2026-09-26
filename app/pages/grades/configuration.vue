<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading title="Assessment Setup"
      subtitle="Choose how each section assesses its students - one score per test, or continuous assessment plus a formal test" />

    <GradesSectionNav />

    <UAlert color="info" variant="subtle" icon="lucide:info" title="Changes apply to new assessments"
      description="A test that is already open or recorded keeps the setup it started with. What you save here is used by tests opened from now on." />

    <UCard v-if="loading">
      <USkeleton class="h-40 w-full" />
    </UCard>

    <UCard v-else-if="!configurations.length">
      <p class="text-sm text-muted">There is nothing to configure yet.</p>
    </UCard>

    <GradesConfigurationCard v-for="config in configurations" :key="config.managementSectionId ?? 'school'"
      :config="config" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
const configurations = ref<AssessmentConfiguration[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    configurations.value = (await AssessmentApi().getConfigurations()) || []
  } catch {
    configurations.value = []
  } finally {
    loading.value = false
  }
}

function onSaved(saved: AssessmentConfiguration) {
  // A section that only inherited the school-wide setup now has its own - reload so every row is accurate.
  const idx = configurations.value.findIndex(c => c.managementSectionId === saved.managementSectionId)
  if (idx >= 0) configurations.value[idx] = saved
  else load()
}

onMounted(() => {
  useAppStore().setTitle('Assessment Setup')
  document.title = 'Assessment Setup | Grades | Skultem'
  load()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
