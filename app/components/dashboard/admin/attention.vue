<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex size-8 items-center justify-center rounded-lg bg-warning/10">
          <UIcon name="i-lucide-alert-triangle" class="size-4 text-warning" />
        </div>
        <h3 class="text-sm font-semibold text-highlighted">Needs Attention</h3>
      </div>

      <UBadge v-if="summary" :label="`${summary.flaggedClasses} class${summary.flaggedClasses === 1 ? '' : 'es'}`"
        color="warning" variant="subtle" size="sm" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="flex items-center justify-between rounded-xl border border-default p-3">
        <div class="space-y-2">
          <USkeleton class="h-3.5 w-32" />
          <USkeleton class="h-3 w-20" />
        </div>
        <USkeleton class="h-6 w-14 rounded-full" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!summary || summary.flaggedClasses === 0"
      class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-default py-10 text-center">
      <UIcon name="i-lucide-circle-check-big" class="size-8 text-success" />
      <p class="text-sm font-medium text-highlighted">Nothing needs attention</p>
      <p class="text-xs text-muted">Every class is within attendance and academic thresholds.</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <NuxtLink v-for="item in summary.classes" :key="item.classId" :to="`/classes/${item.classId}`"
        class="flex items-center justify-between gap-3 rounded-xl border border-default p-3 transition-colors hover:border-warning/40 hover:bg-warning/5">
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ item.className }}
            <span v-if="item.streamName && item.streamName !== 'N/A'" class="text-muted"> - {{ item.streamName
              }}</span>
          </p>
          <p class="text-xs text-muted">{{ item.flaggedCount }} of {{ item.totalStudents }} students flagged</p>
        </div>

        <UBadge :label="`${item.flaggedCount}`" color="warning" variant="soft" size="sm" />
      </NuxtLink>

      <p v-if="summary.flaggedClasses > summary.classes.length" class="pt-1 text-center text-xs text-muted">
        +{{ summary.flaggedClasses - summary.classes.length }} more class{{
          summary.flaggedClasses - summary.classes.length === 1 ? '' : 'es' }} flagged
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const summary = ref<ClassAttentionSummary | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    summary.value = await ClassApi().getAttentionSummary() ?? null
  } finally {
    loading.value = false
  }
})
</script>
