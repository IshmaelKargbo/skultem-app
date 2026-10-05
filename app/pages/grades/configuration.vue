<template>
  <div class="px-4 md:px-6 space-y-4">
    <GradesSectionNav />

    <UCard v-if="loading">
      <USkeleton class="h-40 w-full" />
    </UCard>

    <UCard v-else-if="!configurations.length">
      <p class="text-sm text-muted">There is nothing to configure yet.</p>
    </UCard>

    <!-- Every section, each folded into its own card; the first one starts open. -->
    <GradesConfigurationCard v-else v-for="config in ordered" :key="config.managementSectionId ?? 'school'"
      :config="config" :open="isOpen(config)" @update:open="(v: boolean) => openState[keyOf(config)] = v" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
const configurations = ref<AssessmentConfiguration[]>([])
const loading = ref(true)

// Which cards are unfolded, kept here so reloading the list (after a save) doesn't fold them again. Until you
// touch one, the first card - the school-wide setup - is the open one.
const openState = reactive<Record<string, boolean>>({})
const keyOf = (c: AssessmentConfiguration) => c.managementSectionId ?? 'school'
const isOpen = (c: AssessmentConfiguration) => openState[keyOf(c)] ?? (ordered.value[0] ? keyOf(ordered.value[0]) === keyOf(c) : false)

// The school-wide setup first, then each section.
const ordered = computed(() => [...configurations.value].sort((a, b) =>
  (a.managementSectionId === null ? 0 : 1) - (b.managementSectionId === null ? 0 : 1)))

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
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
