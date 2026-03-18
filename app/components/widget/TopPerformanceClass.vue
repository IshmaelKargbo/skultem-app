<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Top Performing Class</p>

      <div v-if="!isReady" class="animate-pulse space-y-2">
        <div class="h-7 w-24 bg-gray-200 rounded" />
        <div class="h-4 w-16 bg-gray-200 rounded" />
      </div>

      <template v-else-if="topClass">
        <div class="flex justify-between items-center">
          <p class="text-2xl font-semibold">{{ topClass.label }}</p>
          <UBadge :icon="TOP_ICON" variant="subtle" size="xl" class="p-1.5" color="success" />
        </div>
        <div class="text-xs text-success">
          <p>Average: {{ topClass.avg }}%</p>
        </div>
      </template>

      <div v-else class="text-xs text-muted">No data available</div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useWidgetStore()

const isReady = ref(false)
const topClass = ref<{ label: string; avg: string } | null>(null)

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "assessments",
    title: "Class Performance",
    filters: [],
    metrics: [
      {
        name: "Average Score",
        aggregation: "avg",
        field: "weightScore",
        tags: { groupBy: "clazz" }
      }
    ],
    chartType: "bar"
  })

  const widget = res?.data ?? res
  if (!widget) return

  let pairs: { label: string; value: number }[] = []

  if (Array.isArray(widget)) {
    pairs = widget.map((r: any) => ({
      label: r.clazz ?? r.category ?? r.label ?? r.class,
      value: Number(r["Average Score"] ?? r.value ?? 0)
    }))
  } else if (widget.labels && widget.datasets) {
    const data = widget.datasets[0]?.data ?? []
    pairs = widget.labels.map((label: string, i: number) => ({
      label,
      value: Number(data[i] ?? 0)
    }))
  }

  if (!pairs.length) return

  const best: any = pairs.sort((a, b) => b.value - a.value)[0]

  topClass.value = {
    label: best.label,
    avg: best.value.toFixed(1)
  }

  isReady.value = true
})
</script>