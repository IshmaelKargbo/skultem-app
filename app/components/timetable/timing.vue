<template>
  <div class="space-y-4">
    <UCard :ui="{
      body: 'p-0 sm:p-0'
    }">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-clock-3" class="size-6 text-primary" />
            <div>
              <h3 class="font-semibold">Timing Templates</h3>
              <p class="text-xs-base text-muted">
                Set up school-day schedules</p>
            </div>
          </div>
          <div>
            <UButton icon="i-lucide-plus" @click="store.addTiming()" class="hidden md:flex">Add Template</UButton>
            <UButton icon="i-lucide-plus" @click="store.addTiming()" class="md:hidden" />
          </div>
        </div>
      </template>

      <div>
        <USkeleton v-if="timingLoading" class="h-40 w-full bg-gray-200" />
        <template v-else>
          <TimetableTimingRow v-for="(record, index) in timings" :key="record.id || `new-${index}`" :record="record"
            :index="index" />
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
