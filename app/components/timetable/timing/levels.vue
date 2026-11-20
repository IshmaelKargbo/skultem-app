<template>
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }">
    <template #header>
      <div class="flex items-center gap-3">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon name="i-lucide-layers" class="size-4" /></span>
        <div>
          <h3 class="text-sm font-semibold text-highlighted">Times for each level</h3>
          <p class="text-xs text-muted">
            Which timing template each level's classes follow
          </p>
        </div>
      </div>
    </template>

      <div v-for="level in levelOptions" :key="level.value"
        class="flex items-center justify-between gap-3 border-b last:border-0 border-default py-3 px-5">
        <p class="font-medium">{{ level.label }}</p>

        <USelectMenu class="w-48 sm:w-56" :model-value="assignedId(level.value as SchoolLevel)"
          @update:model-value="(id: string) => assign(level.value as SchoolLevel, id)" value-key="value" size="md"
          :items="templateOptions" :loading="loading"
          :placeholder="`Not set - uses ${defaultTiming?.name || 'Default'}`" />
      </div>
  </UCard>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
// Only the levels this school offers (Settings > School Structure).
const { levelOptions, load: loadStructure } = useSchoolStructure()
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
  loadStructure()
  try {
    await store.listTimingLevels()
  } catch (error: any) {
    useNotify().error(error?.message || error)
  } finally {
    loading.value = false
  }
})
</script>
