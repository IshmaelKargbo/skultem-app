<template>
  <UCard>
    <div class="space-y-1">
      <p class="text-xs text-mute">Total Teachers</p>

      <div v-if="!isReady" class="animate-pulse space-y-2">
        <div class="h-7 w-24 bg-gray-200 rounded" />
        <div class="h-4 w-32 bg-gray-200 rounded" />
      </div>

      <template v-else>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-semibold">{{ totalTeachers }}</p>
          <UBadge :icon="TEACHER_ICON" variant="subtle" size="xl" class="p-1.5" color="neutral" />
        </div>
        <div class="text-xs text-muted">
          <p>Total active teachers</p>
        </div>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const store = useWidgetStore()

const isReady       = ref(false)
const totalTeachers = ref("0")

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "teachers",
    title: "Total Teachers",
    filters: [],
    metrics: [
      {
        name: "Total Teachers",
        aggregation: "count",
        field: "id"
      }
    ],
    chartType: "stat"
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    // Shape: [{ "Total Teachers": 45 }]
    const row = widget[0]
    totalTeachers.value = Number(row?.["Total Teachers"] ?? 0).toLocaleString()
  } else if (widget.datasets) {
    // Shape: { datasets: [{ label: "Total Teachers", data: [45] }] }
    const dataset = widget.datasets.find((d: any) => d.label === "Total Teachers")
    totalTeachers.value = Number(dataset?.data?.[0] ?? 0).toLocaleString()
  } else {
    // Shape: flat object { "Total Teachers": 45 }
    totalTeachers.value = Number(widget["Total Teachers"] ?? 0).toLocaleString()
  }

  isReady.value = true
})
</script>