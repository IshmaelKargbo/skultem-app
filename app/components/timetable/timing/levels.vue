<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-layers" class="size-5 text-primary" />
        <div>
          <h3 class="font-semibold">Level Assignments</h3>
          <p class="text-sm text-muted hidden md:block">
            Pick which timing template each level's classes follow
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <div v-for="level in SCHOOL_LEVEL_OPTIONS" :key="level.value"
        class="flex items-center justify-between gap-3 rounded-2xl border border-default px-4 py-3">
        <p class="font-medium">{{ level.label }}</p>

        <USelectMenu :model-value="assignedId(level.value)" @update:model-value="(id: string) => assign(level.value, id)"
          value-key="value" :items="templateOptions" :loading="loading" :placeholder="`Not set - uses ${defaultTiming?.name || 'Default'}`"
          class="w-56" />
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
const { timings, timingLevels, defaultTiming } = storeToRefs(store)

const loading = ref(true)

const templateOptions = computed(() =>
  timings.value.filter(t => t.id).map(t => ({ label: t.isDefault ? `${t.name} (Default)` : t.name, value: t.id }))
)

function assignedId(level: SchoolLevel) {
  return timingLevels.value.find(l => l.level === level)?.timingId
}

async function assign(level: SchoolLevel, timingId: string) {
  if (!timingId || timingId === assignedId(level)) return

  try {
    await store.assignTimingLevel(level, timingId)
  } catch (error: any) {
    useNotify().error(error?.message || error)
  }
}

onMounted(async () => {
  try {
    await store.listTimingLevels()
  } catch (error: any) {
    useNotify().error(error?.message || error)
  } finally {
    loading.value = false
  }
})
</script>
