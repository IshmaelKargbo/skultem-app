<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-clock-3" class="size-5 text-primary" />
            <div>
              <h3 class="font-semibold">Timing Templates</h3>
              <p class="text-sm text-muted hidden md:block">
                Set up school-day schedules - one Default, plus one per Level if they differ (e.g. Primary vs JSS/SSS)
              </p>
            </div>
          </div>

          <UButton size="sm" icon="i-lucide-plus" @click="store.addTiming()">
            Add Template
          </UButton>
        </div>
      </template>

      <div class="space-y-3">
        <USkeleton v-if="timingLoading" class="h-40 w-full bg-gray-200" />
        <template v-else>
          <TimetableTimingRow v-for="(record, index) in timings" :key="record.id || `new-${index}`" :record="record" :index="index" />
        </template>
      </div>
    </UCard>

    <TimetableTimingLevels />
  </div>
</template>

<script lang="ts" setup>
const store = useTimetableStore()
const { timings, timingLoading } = storeToRefs(store)

onMounted(async () => {
  try {
    await store.listTimings()
  } catch (error: any) {
    useNotify().error(error?.message || error)
  }
})
</script>
