<template>
  <UCard :ui="{
    body: 'p-0 sm:p-0'
  }">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-layers" class="size-6 text-primary" />
        <div>
          <h3 class="font-semibold">Level Assignments</h3>
          <p class="text-xs-base text-muted hidden md:block">
            Pick which timing template each level's classes follow
          </p>
        </div>
      </div>
    </template>

      <div v-for="level in SCHOOL_LEVEL_OPTIONS" :key="level.value"
        class="flex items-center justify-between gap-3 border-b last:border-0 border-default py-3 px-5">
        <p class="font-medium">{{ level.label }}</p>

        <USelectMenu :model-value="assignedId(level.value)"
          @update:model-value="(id: string) => assign(level.value, id)" value-key="value" size="md"
          :items="templateOptions" :loading="loading"
          :placeholder="`Not set - uses ${defaultTiming?.name || 'Default'}`" class="w-56" />
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
