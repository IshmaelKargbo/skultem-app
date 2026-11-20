<template>
  <div class="space-y-4">
    <UCard :ui="{
      body: 'p-0 sm:p-0'
    }">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon name="i-lucide-clock-3" class="size-4" /></span>
            <div>
              <h3 class="text-sm font-semibold text-highlighted">Timing templates</h3>
              <p class="text-xs text-muted">
                When the day starts and ends, and how long periods, breaks and lunch are</p>
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
